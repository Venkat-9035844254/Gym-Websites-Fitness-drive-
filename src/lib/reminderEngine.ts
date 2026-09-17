import {
  getStoredMembers,
  getStoredUsers,
  getStoredMembershipRecords,
  getStoredPlans,
  getStoredNotificationLogs,
  getStoredSettings,
  saveNotificationLogs,
} from "./storage";

import { sendMembershipExpiryEmail } from "./emailService";
import { NotificationLog, ExpiringMembershipReport, GymSettings, MembershipPlan } from "@/types";

export interface ReminderCheckOptions {
  todayOverride?: string; // Format: YYYY-MM-DD
  simulateEmailFailure?: boolean;
  forceSend?: boolean;
  baseUrl?: string;
}

export interface ReminderCheckResult {
  processedCount: number;
  sentCount: number;
  skippedCount: number;
  failedCount: number;
  logsCreated: NotificationLog[];
  details: string[];
}

/**
 * Timezone-aware helper to get today's date in YYYY-MM-DD format
 */
export function getTodayFormatted(timezone: string = "Asia/Kolkata"): string {
  const date = new Date();
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date); // YYYY-MM-DD
  } catch (err) {
    return date.toISOString().split("T")[0];
  }
}

/**
 * Helper to compute difference in calendar days between two YYYY-MM-DD strings
 */
export function calculateDaysRemaining(expiryDateStr: string, todayStr: string): number {
  const expiry = new Date(expiryDateStr + "T00:00:00Z");
  const today = new Date(todayStr + "T00:00:00Z");
  const diffTime = expiry.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Core Automated Scheduler Function
 * Evaluates active memberships, applies timezone-aware date arithmetic, enforces idempotency,
 * dispatches notifications, handles failed emails, and records notification logs.
 */
export async function runMembershipExpiryCheck(
  options: ReminderCheckOptions = {}
): Promise<ReminderCheckResult> {
  const settings: GymSettings = getStoredSettings();
  if (!settings.enableExpiryReminders && !options.forceSend) {
    return {
      processedCount: 0,
      sentCount: 0,
      skippedCount: 0,
      failedCount: 0,
      logsCreated: [],
      details: ["Membership expiry reminders are currently disabled in Gym Settings."],
    };
  }

  const todayStr = options.todayOverride || getTodayFormatted(settings.timezone);
  const targetDaysBefore = settings.reminderDaysBefore || 5;

  const members = getStoredMembers();
  const users = getStoredUsers();
  const membershipRecords = getStoredMembershipRecords();
  const plans = getStoredPlans();
  const existingLogs = getStoredNotificationLogs();

  let processedCount = 0;
  let sentCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const newLogsToSave: NotificationLog[] = [];
  const details: string[] = [];

  const baseUrl = options.baseUrl || "http://localhost:3000";

  for (const member of members) {
    processedCount++;
    const userObj = users.find((u) => u.id === member.userId);
    if (!userObj) {
      skippedCount++;
      details.push(`Skipped member ${member.id}: User record not found.`);
      continue;
    }

    // Edge Case 1: Cancelled or Inactive Memberships
    if (member.membershipStatus === "CANCELLED" || member.membershipStatus === "PENDING") {
      skippedCount++;
      details.push(`Skipped member ${userObj.name}: Status is ${member.membershipStatus}.`);
      continue;
    }

    // Active membership record or current member profile expiry
    const expiryDateStr = member.expiryDate || "2026-12-31";
    const daysRemaining = calculateDaysRemaining(expiryDateStr, todayStr);

    // Edge Case 2: Already Expired (daysRemaining < 0)
    if (daysRemaining < 0 && !options.forceSend) {
      skippedCount++;
      details.push(`Skipped member ${userObj.name}: Membership expired on ${expiryDateStr} (${Math.abs(daysRemaining)} days ago).`);
      continue;
    }

    // Threshold Check: Must match exact target (e.g. 5 days remaining) unless forced
    if (daysRemaining !== targetDaysBefore && !options.forceSend) {
      skippedCount++;
      details.push(`Skipped member ${userObj.name}: Expires in ${daysRemaining} days (Threshold is ${targetDaysBefore} days).`);
      continue;
    }

    const planObj = plans.find((p: MembershipPlan) => p.id === member.currentPlanId) || plans[0];
    const planName = planObj.name;
    const membershipId = member.id; // Active membership ID

    // Edge Case 3: Idempotent Duplicate Prevention
    // Check if 5-day reminder was already sent for this specific membershipId and expiryDate
    const alreadySent = existingLogs.some(
      (l) =>
        l.membershipId === membershipId &&
        l.expiryDate === expiryDateStr &&
        l.type === "MEMBERSHIP_EXPIRY_5_DAY" &&
        l.status === "SENT"
    );

    if (alreadySent && !options.forceSend) {
      skippedCount++;
      details.push(`Skipped member ${userObj.name}: 5-day reminder already dispatched for expiry ${expiryDateStr}.`);
      continue;
    }

    // Construct Notification Message & Title
    const title = "Membership Renewal Reminder";
    const message = `Hi ${userObj.name}, your ${planName} membership expires in ${daysRemaining} days on ${expiryDateStr}. Please renew your membership to continue accessing gym services without interruption.`;
    const renewalUrl = `${baseUrl}/membership`;

    // 1. In-App Notification Log
    const inAppLogId = `log-inapp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const inAppLog: NotificationLog = {
      id: inAppLogId,
      userId: userObj.id,
      memberId: member.id,
      membershipId: membershipId,
      type: "MEMBERSHIP_EXPIRY_5_DAY",
      title: title,
      message: message,
      expiryDate: expiryDateStr,
      scheduledDate: todayStr,
      sentDate: new Date().toISOString(),
      channel: "IN_APP",
      status: "SENT",
      readStatus: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newLogsToSave.push(inAppLog);

    // 2. Email Notification Dispatch
    let emailStatus: "SENT" | "FAILED" = "SENT";
    let emailErrorLog: string | undefined;
    let emailSentDate: string | undefined;

    if (settings.channels.email) {
      const emailResult = await sendMembershipExpiryEmail({
        toEmail: userObj.email,
        memberName: userObj.name,
        planName: planName,
        expiryDate: expiryDateStr,
        daysRemaining: daysRemaining,
        renewalAmount: planObj.priceMonthly,
        renewalUrl: renewalUrl,
        gymName: settings.gymName,
        gymPhone: settings.gymPhone,
        gymEmail: settings.gymEmail,
        simulateFailure: options.simulateEmailFailure,
      });

      emailStatus = emailResult.status === "SENT" ? "SENT" : "FAILED";
      emailErrorLog = emailResult.errorLog;
      emailSentDate = emailResult.sentDate;

      const emailLogId = `log-email-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const emailLog: NotificationLog = {
        id: emailLogId,
        userId: userObj.id,
        memberId: member.id,
        membershipId: membershipId,
        type: "MEMBERSHIP_EXPIRY_5_DAY",
        title: title,
        message: message,
        expiryDate: expiryDateStr,
        scheduledDate: todayStr,
        sentDate: emailSentDate,
        channel: "EMAIL",
        status: emailStatus,
        readStatus: false,
        errorLog: emailErrorLog,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newLogsToSave.push(emailLog);

      if (emailStatus === "FAILED") {
        failedCount++;
        details.push(`Failed sending email to ${userObj.name} (${userObj.email}): ${emailErrorLog}`);
      } else {
        sentCount++;
        details.push(`Sent 5-day reminder email to ${userObj.name} (${userObj.email}). Expiry: ${expiryDateStr}.`);
      }
    } else {
      sentCount++;
      details.push(`Generated in-app reminder for ${userObj.name}. (Email channel disabled in settings).`);
    }
  }

  if (newLogsToSave.length > 0) {
    const allLogs = [...newLogsToSave, ...existingLogs];
    saveNotificationLogs(allLogs);
  }

  return {
    processedCount,
    sentCount,
    skippedCount,
    failedCount,
    logsCreated: newLogsToSave,
    details,
  };
}

/**
 * Generates Expiring Memberships Report for Admin Dashboard
 */
export function getExpiringMembershipsReport(rangeDays?: number): ExpiringMembershipReport[] {
  const settings = getStoredSettings();
  const todayStr = getTodayFormatted(settings.timezone);

  const members = getStoredMembers();
  const users = getStoredUsers();
  const plans = getStoredPlans();
  const logs = getStoredNotificationLogs();

  const reports: ExpiringMembershipReport[] = [];

  for (const member of members) {
    const userObj = users.find((u) => u.id === member.userId);
    if (!userObj) continue;

    const daysRemaining = calculateDaysRemaining(member.expiryDate || "2026-12-31", todayStr);
    const planObj = plans.find((p: MembershipPlan) => p.id === member.currentPlanId) || plans[0];

    // Filter by rangeDays if provided
    if (rangeDays !== undefined) {
      if (rangeDays === 0 && daysRemaining !== 0) continue;
      if (rangeDays === 5 && (daysRemaining < 0 || daysRemaining > 5)) continue;
      if (rangeDays === 7 && (daysRemaining < 0 || daysRemaining > 7)) continue;
      if (rangeDays === 30 && (daysRemaining < 0 || daysRemaining > 30)) continue;
      if (rangeDays === -1 && daysRemaining >= 0) continue; // Expired filter
    }

    // Find latest logs for this member
    const memberLogs = logs.filter((l) => l.memberId === member.id && l.expiryDate === (member.expiryDate || ""));
    const emailLog = memberLogs.find((l) => l.channel === "EMAIL");
    const inAppLog = memberLogs.find((l) => l.channel === "IN_APP");

    const emailStatus = emailLog ? emailLog.status : "NOT_SENT";
    const inAppStatus = inAppLog ? inAppLog.status : "NOT_SENT";
    const reminderStatus = emailLog ? emailLog.status : inAppLog ? inAppLog.status : "NOT_SCHEDULED";

    reports.push({
      memberId: member.id,
      memberName: userObj.name,
      memberEmail: userObj.email,
      membershipId: member.id,
      planName: planObj.name,
      expiryDate: member.expiryDate || "2026-12-31",
      daysRemaining: daysRemaining,
      membershipStatus: member.membershipStatus as any,
      reminderStatus: reminderStatus as any,
      emailStatus: emailStatus as any,
      inAppStatus: inAppStatus as any,
      lastSentDate: emailLog?.sentDate || inAppLog?.sentDate,
    });
  }

  return reports.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
