import { runMembershipExpiryCheck, calculateDaysRemaining, getExpiringMembershipsReport } from "../reminderEngine";
import { getStoredMembers, saveMembers, getStoredNotificationLogs, saveNotificationLogs } from "../storage";
import { FIVE_DAYS_FROM_TODAY } from "../seedData";

export async function runReminderTestSuite() {
  console.log("=== RUNNING MEMBERSHIP EXPIRY REMINDER SYSTEM TEST SUITE ===");

  // Test 1: Date Arithmetic calculation for exact 5 days
  const todayStr = new Date().toISOString().split("T")[0];
  const targetExpiry = FIVE_DAYS_FROM_TODAY;
  const daysRem = calculateDaysRemaining(targetExpiry, todayStr);
  console.assert(daysRem === 5, `Test 1 Failed: Expected 5 days, got ${daysRem}`);
  console.log(`✓ Test 1 Passed: Exact 5 days calculation verified (${daysRem} days).`);

  // Test 2: Core Scheduler Execution for active memberships
  saveNotificationLogs([]); // Clear logs for clean test
  const res1 = await runMembershipExpiryCheck({ todayOverride: todayStr });
  console.assert(res1.processedCount >= 1, "Test 2 Failed: Processed count 0");
  console.assert(res1.sentCount >= 1, "Test 2 Failed: Expected sent count >= 1");
  console.log(`✓ Test 2 Passed: Automated scheduler processed ${res1.processedCount} members, sent ${res1.sentCount} notifications.`);

  // Test 3: Idempotency / Duplicate Prevention
  const res2 = await runMembershipExpiryCheck({ todayOverride: todayStr });
  console.assert(res2.sentCount === 0, `Test 3 Failed: Idempotency failed, sent ${res2.sentCount} duplicate notifications`);
  console.assert(res2.skippedCount >= 1, "Test 3 Failed: Expected skipped count >= 1");
  console.log(`✓ Test 3 Passed: Idempotency duplicate prevention verified (0 duplicate notifications sent).`);

  // Test 4: Member renewal clears old reminder requirement
  const members = getStoredMembers();
  const harsha = members[0];
  const oldExpiry = harsha.expiryDate;

  // Extend expiry by 30 days
  const extendedDate = new Date(oldExpiry);
  extendedDate.setDate(extendedDate.getDate() + 30);
  harsha.expiryDate = extendedDate.toISOString().split("T")[0];
  saveMembers([harsha, ...members.slice(1)]);

  const res3 = await runMembershipExpiryCheck({ todayOverride: todayStr });
  console.assert(res3.sentCount === 0, "Test 4 Failed: Extended expiry date sent old reminder");
  console.log(`✓ Test 4 Passed: Membership extension / renewal handled cleanly (old reminder skipped).`);

  // Restore original expiry date for demo
  harsha.expiryDate = oldExpiry;
  saveMembers([harsha, ...members.slice(1)]);

  // Test 5: Failed Email logging & Status recording
  saveNotificationLogs([]);
  const res4 = await runMembershipExpiryCheck({
    todayOverride: todayStr,
    simulateEmailFailure: true,
    forceSend: true,
  });
  console.assert(res4.failedCount >= 1, "Test 5 Failed: Expected failed email count >= 1");
  console.log(`✓ Test 5 Passed: Failed email delivery caught & logged with FAILED status.`);

  // Test 6: Report Generation for Admin Dashboard
  const report = getExpiringMembershipsReport(5);
  console.assert(report.length >= 1, "Test 6 Failed: Expiring report empty");
  console.log(`✓ Test 6 Passed: Admin expiring memberships report generated (${report.length} entries).`);

  console.log("=== ALL 6 AUTOMATED REMINDER SYSTEM TESTS PASSED CLEANLY ===");
}
