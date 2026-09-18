import { NextResponse } from "next/server";
import { getAllExercises } from "@/lib/cloudinaryService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAllExercises();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/exercises:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to retrieve exercise categories from Cloudinary",
      },
      { status: 500 }
    );
  }
}
