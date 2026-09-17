import { POST as verifyPaymentHandler } from "@/app/api/payments/verify/route";

export async function POST(req: Request) {
  return verifyPaymentHandler(req);
}
