import { createOrderNumber } from "@/lib/order-number";
import { saveRuntimeOrder } from "@/lib/order-store";
import { prisma } from "@/lib/prisma";
import { createWeChatPayPrepay } from "@/lib/wechat-pay";

export async function POST(request: Request) {
  const body = await request.json();
  const orderNumber = createOrderNumber();
  const amount = Number(body.amount ?? 0);
  let saved = false;

  if (process.env.DATABASE_URL) {
    try {
      const firstItem = body.items?.[0];
      const product = firstItem?.slug
        ? await prisma.product.findUnique({ where: { slug: firstItem.slug } })
        : null;
      const customer = await prisma.customer.upsert({
        where: { phone: body.customer?.phone ?? "unknown" },
        update: {
          name: body.customer?.name ?? "CADENCE Customer",
          wechatId: body.wechat,
          note: body.notes
        },
        create: {
          name: body.customer?.name ?? "CADENCE Customer",
          phone: body.customer?.phone ?? "unknown",
          wechatId: body.wechat,
          note: body.notes,
          tags: ["wechat order"]
        }
      });
      const address = await prisma.address.create({
        data: {
          customerId: customer.id,
          contactName: customer.name,
          phone: customer.phone,
          city: "Shanghai",
          line1: body.address ?? "No address provided",
          isDefault: false
        }
      });
      const deliveryDay = body.deliveryDate
        ? await prisma.deliveryDate.findUnique({
            where: { date: new Date(`${body.deliveryDate}T00:00:00.000Z`) }
          })
        : null;

      await prisma.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          addressId: address.id,
          deliveryDateId: deliveryDay?.id,
          status: "PENDING",
          paymentStatus: "WECHAT_RESERVED",
          subtotal: amount,
          total: amount,
          deliveryDate: body.deliveryDate ? new Date(`${body.deliveryDate}T00:00:00.000Z`) : null,
          deliverySlot: body.deliverySlot,
          deliveryNote: body.notes,
          items: product
            ? {
                create: {
                  productId: product.id,
                  quantity: Number(firstItem.quantity ?? 1),
                  price: product.price
                }
              }
            : undefined
        }
      });
      saved = true;
    } catch (error) {
      console.error("Order persistence failed", error);
    }
  }
  saveRuntimeOrder({
    number: orderNumber,
    customer: body.customer?.name ?? "CADENCE Customer",
    phone: body.customer?.phone ?? "",
    wechat: body.wechat,
    address: body.address ?? "",
    notes: body.notes,
    item: body.description ?? "CADENCE order",
    total: amount,
    status: "Submitted",
    paymentStatus: "Pending",
    delivery: `${body.deliveryDate ?? "No date"} / ${body.deliverySlot ?? "No slot"}`
  });

  const prepay = await createWeChatPayPrepay({
    orderNumber,
    amount,
    description: body.description ?? "CADENCE order",
    openid: body.openid
  });

  return Response.json({
    orderNumber,
    saved,
    deliveryWindow: "07:30 - 11:00",
    deliverySlot: body.deliverySlot,
    payment: prepay
  });
}
