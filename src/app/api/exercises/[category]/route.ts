import { NextRequest, NextResponse } from "next/server";
import { getExercisesByCategory, normalizeCategoryParam } from "@/lib/cloudinaryService";

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const rawCategory = params.category;
    const normalized = normalizeCategoryParam(rawCategory);

    if (!normalized) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid exercise category '${rawCategory}'. Supported categories are: chest, back, shoulders, biceps, triceps, core, quads, hamstrings, calves, hips, full-body`,
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const validPage = isNaN(page) || page < 1 ? 1 : page;
    const validLimit = isNaN(limit) || limit < 1 ? 20 : limit;

    const result = await getExercisesByCategory(normalized, validPage, validLimit);

    if (result.exercises.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: `No exercises found in folder 'gym-exercises/${normalized}'`,
          category: normalized,
          count: 0,
          exercises: [],
        },
        { status: 404 }
      );
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    console.error(`Error in GET /api/exercises/${params?.category}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to retrieve category exercise images from Cloudinary",
      },
      { status: 500 }
    );
  }
}
