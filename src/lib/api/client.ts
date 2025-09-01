import { HackathonFormData } from "@/lib/schemas/hackathon-schema";

// API Response types
interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

interface CreateHackathonResponse {
  message: string;
  data: any;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private baseUrl = "/api";

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // Handle 204 No Content or empty responses
      if (response.status === 204) {
        throw new ApiError(`HTTP ${response.status}`, response.status);
      }

      let errorData: any = {};
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        try {
          errorData = await response.json();
        } catch {
          // If JSON parsing fails, try text fallback
          const text = await response.text();
          errorData = { message: text || `HTTP ${response.status}` };
        }
      } else {
        // Non-JSON response
        const text = await response.text();
        errorData = { message: text || `HTTP ${response.status}` };
      }

      throw new ApiError(
        errorData.error || errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData.details,
      );
    }

    // Handle successful 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    // Check content type before parsing JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    // Non-JSON response - return as text
    const text = await response.text();
    return text as T;
  }

  // Hackathon endpoints
  async createHackathon(
    data: HackathonFormData,
  ): Promise<CreateHackathonResponse> {
    return this.request<CreateHackathonResponse>("/hackathons", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getHackathons(): Promise<ApiResponse> {
    return this.request<ApiResponse>("/hackathons");
  }

  async getHackathon(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/hackathons/${id}`);
  }

  async updateHackathon(
    id: string,
    data: HackathonFormData,
  ): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/hackathons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteHackathon(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/hackathons/${id}`, {
      method: "DELETE",
    });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
export { ApiError };
