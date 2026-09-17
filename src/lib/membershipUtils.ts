/**
 * Membership Duration & Pass Utility Helpers
 */

export interface MembershipDateRange {
  startDate: Date;
  endDate: Date;
  durationLabel: string;
  durationMonths: number;
}

/**
 * Calculates membership validity dates based on admin activation date.
 * - Monthly: 1 month from start date (start + 1 month - 1 day)
 * - 6 Months: 6 months from start date (start + 6 months - 1 day)
 * - Yearly: 12 months from start date (start + 12 months - 1 day)
 * 
 * Example:
 * Monthly: 01-10-2026 -> 31-10-2026
 * 6 Months: 01-10-2026 -> 31-03-2027
 * Yearly: 01-10-2026 -> 30-09-2027
 */
export function calculateMembershipDates(
  startDateInput: Date = new Date(),
  billingCycle: string = "MONTHLY"
): MembershipDateRange {
  const startDate = new Date(startDateInput);
  // Ensure start date starts at 00:00:00
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  let months = 1;
  let durationLabel = "1 Month";

  if (billingCycle === "SIX_MONTHS") {
    months = 6;
    durationLabel = "6 Months";
  } else if (billingCycle === "YEARLY") {
    months = 12;
    durationLabel = "12 Months (Yearly)";
  }

  // Proper date arithmetic adding months
  endDate.setMonth(endDate.getMonth() + months);
  // Subtract 1 day for inclusive end date
  endDate.setDate(endDate.getDate() - 1);
  // Set to 23:59:59.999
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate,
    endDate,
    durationLabel,
    durationMonths: months,
  };
}

/**
 * Generates a clean, unique Membership Pass Number
 * Format: PASS-YYYY-XXXXX
 */
export function generatePassNumber(): string {
  const year = new Date().getFullYear();
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `PASS-${year}-${randomHex}`;
}

/**
 * Formats date into DD-MM-YYYY display string
 */
export function formatDateDDMMYYYY(dateInput: Date | string): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "N/A";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}
