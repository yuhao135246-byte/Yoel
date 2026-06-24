import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    slug: "weekly-cold-brew",
    name: "Weekly Cold Brew",
    category: "COFFEE" as const,
    series: "Coffee / Weekly Drop",
    description: "A calibrated cold brew release for WeChat group ordering and weekly cashflow.",
    price: "98",
    unit: "2 bottles",
    imageUrl: "/assets/cold-brew-hero.png",
    tags: ["cold brew", "weekly drop", "wechat order"],
    inventory: 80
  },
  {
    slug: "weekly-drop-membership",
    name: "Weekly Drop Membership",
    category: "COFFEE" as const,
    series: "Coffee / Subscription",
    description: "A four-week recurring coffee program for architects, designers, and studios.",
    price: "368",
    unit: "4 weeks",
    imageUrl: "/assets/cold-brew-study.jpg",
    tags: ["subscription", "member", "recurring"],
    inventory: 24
  },
  {
    slug: "single-origin-hand-brew",
    name: "Single Origin Hand Brew",
    category: "COFFEE" as const,
    series: "Coffee / Hand Brew",
    description: "Small-format hand brewed coffee calibrated by origin, roast, grind, and water.",
    price: "68",
    unit: "cup",
    imageUrl: null,
    tags: ["hand brew", "single origin", "studio ritual"],
    inventory: 20
  },
  {
    slug: "lamp-unit-series",
    name: "Parametric Lamp Unit 01",
    category: "OBJECT" as const,
    series: "Parametric Lamp Unit Series",
    description:
      "A numbered parametric lamp with frosted amber resin upper body and white terrazzo printed base.",
    price: "1280",
    unit: "unit",
    imageUrl: "/assets/unit01-hero.png",
    tags: ["parametric", "lamp", "unit series"],
    inventory: 8
  },
  {
    slug: "small-furniture-unit-01",
    name: "Small Furniture Unit 01",
    category: "OBJECT" as const,
    series: "Parametric Furniture Unit Series",
    description: "A compact parametric furniture unit for studio display and domestic interiors.",
    price: "2600",
    unit: "unit",
    imageUrl: "/assets/unit01-context.png",
    tags: ["furniture", "unit object", "prototype"],
    inventory: 4
  }
];

const customers = [
  {
    name: "Studio A",
    phone: "13800009201",
    wechatId: "studio_a",
    note: "门铃坏了，放门口",
    tags: ["architect", "weekly drop", "studio"]
  },
  {
    name: "Lin Chen",
    phone: "13600001028",
    wechatId: "lin_design",
    note: "咖啡不要太晚送",
    tags: ["designer", "member"]
  },
  {
    name: "Atelier North",
    phone: "13900007781",
    wechatId: "atelier_north",
    note: "前台代收",
    tags: ["creative studio", "unit prospect"]
  },
  {
    name: "Mori Studio",
    phone: "13700008820",
    wechatId: "mori_studio",
    note: "放门口",
    tags: ["artist", "hand brew"]
  },
  {
    name: "Gallery South",
    phone: "13500006018",
    wechatId: "gallery_south",
    note: "送到二楼展厅",
    tags: ["gallery", "object buyer"]
  }
];

const deliveryDates = [
  { date: new Date("2026-06-24T00:00:00.000Z"), capacity: 18, booked: 2, status: "AVAILABLE" as const },
  { date: new Date("2026-06-25T00:00:00.000Z"), capacity: 18, booked: 18, status: "FULL" as const },
  { date: new Date("2026-06-26T00:00:00.000Z"), capacity: 20, booked: 2, status: "AVAILABLE" as const }
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.deliveryDate.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();

  const createdProducts = new Map<string, { id: string; price: Prisma.Decimal }>();
  for (const product of products) {
    const created = await prisma.product.create({ data: product });
    createdProducts.set(product.slug, created);
  }

  const createdCustomers = new Map<string, string>();
  const createdAddresses = new Map<string, string>();
  for (const customer of customers) {
    const created = await prisma.customer.create({ data: customer });
    createdCustomers.set(customer.name, created.id);
    const address = await prisma.address.create({
      data: {
        customerId: created.id,
        contactName: created.name,
        phone: created.phone,
        city: "Shanghai",
        district: "Xuhui",
        line1: "CADENCE sample delivery address",
        isDefault: true
      }
    });
    createdAddresses.set(customer.name, address.id);
  }

  const createdDeliveryDates = [];
  for (const deliveryDate of deliveryDates) {
    createdDeliveryDates.push(await prisma.deliveryDate.create({ data: deliveryDate }));
  }

  const orderDrafts = [
    ["CD-20260622-001", "Studio A", "weekly-cold-brew", 1, "98", "PAID", "PAID", 0, "08:30"],
    ["CD-20260622-002", "Lin Chen", "weekly-drop-membership", 1, "368", "RESERVED", "WECHAT_RESERVED", 2, "09:30"],
    ["CD-20260622-003", "Atelier North", "lamp-unit-series", 1, "1280", "PENDING", "UNPAID", null, null],
    ["CD-20260622-004", "Mori Studio", "single-origin-hand-brew", 2, "136", "PAID", "PAID", 0, "10:00"],
    ["CD-20260622-005", "Gallery South", "small-furniture-unit-01", 1, "2600", "RESERVED", "WECHAT_RESERVED", null, null]
  ] as const;

  for (const draft of orderDrafts) {
    const [orderNumber, customerName, productSlug, quantity, total, status, paymentStatus, dateIndex, deliverySlot] =
      draft;
    const product = createdProducts.get(productSlug);
    const customerId = createdCustomers.get(customerName);
    if (!product || !customerId) {
      throw new Error(`Missing seed relation for ${orderNumber}`);
    }

    const deliveryDay = typeof dateIndex === "number" ? createdDeliveryDates[dateIndex] : null;

    await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        addressId: createdAddresses.get(customerName),
        deliveryDateId: deliveryDay?.id,
        status,
        paymentStatus,
        subtotal: total,
        total,
        deliveryDate: deliveryDay?.date,
        deliverySlot,
        items: {
          create: {
            productId: product.id,
            quantity,
            price: product.price
          }
        }
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
