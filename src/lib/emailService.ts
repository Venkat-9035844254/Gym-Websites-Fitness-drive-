import { DeliveryStatus } from "@/types";

export interface SendEmailPayload {
  toEmail: string;
  memberName: string;
  planName: string;
  expiryDate: string;
  daysRemaining: number;
  renewalAmount?: number;
  renewalUrl: string;
  gymName?: string;
  gymPhone?: string;
  gymEmail?: string;
  simulateFailure?: boolean;
}

export interface SendEmailResult {
  status: DeliveryStatus;
  sentDate?: string;
  errorLog?: string;
  htmlContent: string;
}

export function generateExpiryEmailHTML(payload: SendEmailPayload): string {
  const {
    memberName,
    planName,
    expiryDate,
    daysRemaining,
    renewalAmount = 4499,
    renewalUrl,
    gymName = "Apex Athletics",
    gymPhone = "+91 98765 43210",
    gymEmail = "support@apexfitness.com",
  } = payload;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Membership Renewal Reminder - ${gymName}</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #090d16; color: #f8fafc; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #121826; border: 1px solid #232e42; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    
    <!-- Gym Header -->
    <div style="border-b: 1px solid #232e42; padding-bottom: 20px; margin-bottom: 24px; text-align: center;">
      <h1 style="color: #00f0ff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">APEX ATHLETICS</h1>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">High Performance Commercial Fitness Club</p>
    </div>

    <!-- Greeting & Urgent Reminder Banner -->
    <div style="background-color: rgba(255, 0, 85, 0.1); border: 1px solid rgba(255, 0, 85, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
      <span style="color: #ff0055; font-size: 14px; font-weight: bold; text-transform: uppercase;">⚠️ Renewal Due in ${daysRemaining} Days</span>
    </div>

    <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Membership Renewal Reminder</h2>

    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
      Hi <strong>${memberName}</strong>,
    </p>

    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
      Your <strong>${planName}</strong> membership expires in <strong>${daysRemaining} days</strong> on <strong>${expiryDate}</strong>. Please renew your membership to continue accessing gym services, group classes, and personal coaching without interruption.
    </p>

    <!-- Details Box -->
    <div style="background-color: #090d16; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="color: #94a3b8; padding: 6px 0;">Member Name:</td>
          <td style="color: #ffffff; font-weight: bold; text-align: right; padding: 6px 0;">${memberName}</td>
        </tr>
        <tr>
          <td style="color: #94a3b8; padding: 6px 0;">Current Plan:</td>
          <td style="color: #00f0ff; font-weight: bold; text-align: right; padding: 6px 0;">${planName}</td>
        </tr>
        <tr>
          <td style="color: #94a3b8; padding: 6px 0;">Expiry Date:</td>
          <td style="color: #ffffff; font-weight: bold; text-align: right; padding: 6px 0;">${expiryDate}</td>
        </tr>
        <tr>
          <td style="color: #94a3b8; padding: 6px 0;">Renewal Fee:</td>
          <td style="color: #34d399; font-weight: bold; text-align: right; padding: 6px 0;">₹${renewalAmount}</td>
        </tr>
      </table>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${renewalUrl}" style="background-color: #00f0ff; color: #090d16; font-weight: bold; padding: 14px 32px; border-radius: 12px; text-decoration: none; display: inline-block; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 15px rgba(0, 240, 255, 0.4);">
        Renew Membership Now
      </a>
    </div>

    <!-- Gym Contact Footer -->
    <div style="border-t: 1px solid #232e42; padding-top: 20px; margin-top: 32px; text-align: center; font-size: 12px; color: #64748b;">
      <p style="margin: 4px 0;"><strong>${gymName} Desk Support</strong></p>
      <p style="margin: 4px 0;">Phone: ${gymPhone} | Email: ${gymEmail}</p>
      <p style="margin: 4px 0;">108 Elite Towers, Outer Ring Road, Bengaluru, KA</p>
    </div>

  </div>
</body>
</html>
  `;
}

export async function sendMembershipExpiryEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const htmlContent = generateExpiryEmailHTML(payload);

  if (payload.simulateFailure) {
    return {
      status: "FAILED",
      errorLog: `SMTP Transport Error: Failed connecting to ${payload.toEmail}. Connection timed out.`,
      htmlContent,
    };
  }

  // Simulated successful SMTP dispatch
  return {
    status: "SENT",
    sentDate: new Date().toISOString(),
    htmlContent,
  };
}
