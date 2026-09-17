import { NextResponse } from "next/server";
import { getStoredMembers, saveMembers, getStoredInvoices, saveInvoices } from "@/lib/storage";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json().catch(() => ({}));
  const billingCycle = body.billingCycle || "MONTHLY";
  const planName = body.planName || "Pro Performance Pass";

  const members = getStoredMembers();
  const mIdx = members.findIndex((m) => m.id === id || m.userId === id);

  if (mIdx === -1) {
    return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
  }

  const member = members[mIdx];
  const currentExpiry = new Date(member.expiryDate || Date.now());
  const now = new Date();
  const baseDate = currentExpiry > now ? currentExpiry : now;

  // Add 30 days or 365 days
  const daysToAdd = billingCycle === "YEARLY" ? 365 : 30;
  baseDate.setDate(baseDate.getDate() + daysToAdd);
  const newExpiryStr = baseDate.toISOString().split("T")[0];

  member.expiryDate = newExpiryStr;
  member.membershipStatus = "ACTIVE";
  members[mIdx] = member;
  saveMembers(members);

  // Generate invoice
  const invNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newInvoice = {
    id: `inv-${Date.now()}`,
    invoiceNumber: invNumber,
    userId: member.userId,
    userName: "Member",
    userEmail: "member@apexfitness.com",
    planName: `${planName} (Renewal)`,
    amount: billingCycle === "YEARLY" ? 42990 : 4499,
    taxAmount: billingCycle === "YEARLY" ? 7738 : 810,
    totalAmount: billingCycle === "YEARLY" ? 50728 : 5309,
    status: "PAID" as const,
    issuedDate: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
    paymentMethod: "RAZORPAY / RENEWAL",
  };

  const invoices = getStoredInvoices();
  saveInvoices([newInvoice, ...invoices]);

  return NextResponse.json({
    success: true,
    message: `Membership renewed successfully. New expiry date: ${newExpiryStr}`,
    member: member,
    invoice: newInvoice,
  });
}
