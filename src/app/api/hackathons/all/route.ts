import { type NextRequest, NextResponse } from "next/server";
import { getAllHackathons } from "@/lib/server/database/hackathons";

// GET /api/hackathons/all - Get all hackathons (for explore page) with pagination
export async function GET(request: NextRequest) {
  try {
    // Extract pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
    ); // Max 50 per page

    // Get all hackathons - no authentication required for public explore page
    const result = await getAllHackathons(page, limit);

    if (!result.success) {
      console.error("getAllHackathons failed:", result.error);
      return NextResponse.json(
        { error: "Failed to fetch hackathons" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: result.data,
    });
  } catch (error) {
    console.error("API Error - GET /api/hackathons/all:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
