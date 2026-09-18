import { NextResponse } from "next/server";
import { getStoredNotificationLogs, saveNotificationLogs } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const logs = getStoredNotificationLogs();
  const index = logs.findIndex((l) => l.id === id);

  if (index === -1) {
    return NextResponse.json({ success: false, error: "Notification not found" }, { status: 404 });
  }

  logs[index].readStatus = true;
  logs[index].updatedAt = new Date().toISOString();
  saveNotificationLogs(logs);

  return NextResponse.json({
    success: true,
    notification: logs[index],
  });
}
