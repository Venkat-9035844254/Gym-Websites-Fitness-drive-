import { NextRequest, NextResponse } from "next/server";
import { getExerciseById, normalizeCategoryParam } from "@/lib/cloudinaryService";

export async function GET(
  _request: NextRequest,
  { params }: { params: { category: string; exerciseId: string } }
) {
  try {
    const { category, exerciseId } = params;
    const normalized = normalizeCategoryParam(category);

    if (!normalized) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid exercise category '${category}'`,
        },
        { status: 400 }
      );
    }

    const exercise = await getExerciseById(normalized, exerciseId);

    if (!exercise) {
      return NextResponse.json(
        {
          success: false,
          message: `Exercise '${exerciseId}' not found in category '${normalized}'`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        exercise,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    console.error(`Error in GET /api/exercises/${params?.category}/${params?.exerciseId}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to retrieve exercise image",
      },
      { status: 500 }
    );
  }
}
