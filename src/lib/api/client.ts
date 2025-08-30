import { HackathonFormData } from '@/lib/schemas/hackathon-schema'

// API Response types
interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
}

interface CreateHackathonResponse {
  message: string
  data: any
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiClient {
  private baseUrl = '/api'

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData.details
      )
    }

    return await response.json()
  }

  // Hackathon endpoints
  async createHackathon(data: HackathonFormData): Promise<CreateHackathonResponse> {
    return this.request<CreateHackathonResponse>('/hackathons', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getHackathons(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/hackathons')
  }

  async getHackathon(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/hackathons/${id}`)
  }

  async updateHackathon(id: string, data: HackathonFormData): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/hackathons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteHackathon(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/hackathons/${id}`, {
      method: 'DELETE',
    })
  }
}

// Export a singleton instance
export const apiClient = new ApiClient()
export { ApiError }