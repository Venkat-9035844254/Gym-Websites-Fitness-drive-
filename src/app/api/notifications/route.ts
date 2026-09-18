import { NextResponse } from "next/server";
import { getStoredNotificationLogs } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  const logs = getStoredNotificationLogs();
  const filtered = userId ? logs.filter((l) => l.userId === userId) : logs;

  return NextResponse.json({
    success: true,
    notifications: filtered,
    unreadCount: filtered.filter((l) => !l.readStatus).length,
  });
}
