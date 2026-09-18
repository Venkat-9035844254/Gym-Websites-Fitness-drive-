import { NextResponse } from "next/server";
import { runMembershipExpiryCheck } from "@/lib/reminderEngine";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const result = await runMembershipExpiryCheck();

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    result,
  });
}

export async function GET(request: Request) {
  const result = await runMembershipExpiryCheck();

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    result,
  });
}
