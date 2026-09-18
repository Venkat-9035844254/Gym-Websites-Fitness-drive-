import { POST as createOrderHandler } from "@/app/api/payments/create-order/route";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return createOrderHandler(req);
}
