import { POST as verifyPaymentHandler } from "@/app/api/payments/verify/route";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return verifyPaymentHandler(req);
}
