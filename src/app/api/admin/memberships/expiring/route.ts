import { NextResponse } from "next/server";
import { getExpiringMembershipsReport } from "@/lib/reminderEngine";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rangeParam = searchParams.get("rangeDays");
  const rangeDays = rangeParam ? parseInt(rangeParam, 10) : undefined;

  const report = getExpiringMembershipsReport(rangeDays);

  return NextResponse.json({
    success: true,
    count: report.length,
    report,
  });
}
