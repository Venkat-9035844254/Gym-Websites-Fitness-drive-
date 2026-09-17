import { NextResponse } from "next/server";
import { runMembershipExpiryCheck } from "@/lib/reminderEngine";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json().catch(() => ({}));

  const result = await runMembershipExpiryCheck({
    forceSend: true,
    simulateEmailFailure: body.simulateEmailFailure || false,
  });

  return NextResponse.json({
    success: true,
    message: `Manual reminder triggered for member ${id}.`,
    result,
  });
}
