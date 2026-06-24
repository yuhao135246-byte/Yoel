export type ProductCategory = "COFFEE" | "OBJECT" | "RESEARCH";

export type Product = {
  slug: string;
  name: string;
  category: ProductCategory;
  layer: string;
  price: number;
  unit: string;
  availability: string;
  description: string;
  details: string[];
  image: string;
  tags: string[];
};

export const products: Product[] = [
  {
    slug: "stitch-cold-brew",
    name: "Stitch 冷萃冰滴",
    category: "COFFEE",
    layer: "Layer 01 / Cashflow",
    price: 55,
    unit: "杯",
    availability: "周一至周日上午配送",
    description:
      "哥伦比亚 El Encanto 魅惑庄园，Caturra + Chiroso，酵母接种日晒。",
    details: ["巧克力牛奶", "樱桃酱", "红苹果", "冰滴55"],
    image: "/assets/stitch.jpg",
    tags: ["冷萃", "Stitch", "冰滴"]
  },
  {
    slug: "tanat-peach",
    name: "TANAT 桃子联合发酵冷萃",
    category: "COFFEE",
    layer: "Layer 01 / Cashflow",
    price: 55,
    unit: "杯",
    availability: "周一至周日上午配送",
    description:
      "法国 TANAT，Los Patios 实验发酵站。",
    details: ["桃子", "菠萝", "木瓜", "冰滴55"],
    image: "/assets/tanat-peach.png",
    tags: ["冷萃", "TANAT", "桃子发酵"]
  },
  {
    slug: "tanat-ombligon",
    name: "TANAT Ombligon 冷萃",
    category: "COFFEE",
    layer: "Layer 01 / Cashflow",
    price: 43,
    unit: "杯",
    availability: "周一至周日上午配送",
    description:
      "哥伦比亚 El Diviso，Ombligon 品种，厌氧日晒。",
    details: ["草莓", "覆盆子", "桃子果酱", "冰滴43"],
    image: "/assets/tanat-peach.png",
    tags: ["冷萃", "Ombligon"]
  },
  {
    slug: "fruit-lemon-tea",
    name: "季节水果柠檬茶",
    category: "COFFEE",
    layer: "Layer 01 / Cashflow",
    price: 18,
    unit: "杯",
    availability: "周一至周日上午配送",
    description:
      "每日水果组合与新鲜柠檬。",
    details: ["柠檬", "季节水果", "冰饮"],
    image: "/assets/10.jpg",
    tags: ["水果茶", "柠檬茶"]
  },
  {
    slug: "lamp-unit-series",
    name: "参数化台灯 Unit 01",
    category: "OBJECT",
    layer: "Layer 03 / High AOV",
    price: 1280,
    unit: "unit",
    availability: "Made to order",
    description:
      "A numbered parametric lamp unit with a frosted amber resin upper body and a white terrazzo printed lower body.",
    details: [
      "Frosted amber resin upper body",
      "White terrazzo printed lower body",
      "Made to order / numbered unit"
    ],
    image: "/assets/unit01-hero.png",
    tags: ["parametric", "lamp", "unit series"]
  },
  {
    slug: "small-furniture-unit-01",
    name: "小型家具 Unit 01",
    category: "OBJECT",
    layer: "Layer 03 / High AOV",
    price: 2600,
    unit: "unit",
    availability: "Prototype preorder",
    description:
      "A compact parametric object for studio storage, display, or domestic side-table use.",
    details: ["Printed connector system", "Warm white surface", "Made to order"],
    image: "/assets/unit01-context.png",
    tags: ["furniture", "unit object", "prototype"]
  },
  {
    slug: "furniture-unit-series",
    name: "参数化家具 Unit 系列",
    category: "OBJECT",
    layer: "Layer 03 / High AOV",
    price: 3200,
    unit: "unit",
    availability: "Prototype preorder",
    description:
      "Furniture-scale Unit objects for studios and domestic interiors, balancing utility, repetition, and sculptural restraint.",
    details: ["Birch plywood / printed connector", "Custom dimensions", "21 day lead time"],
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85",
    tags: ["furniture", "prototype", "unit system"]
  }
];

export const journalNotes = [
  {
    title: "Coffee Studies",
    code: "J-001",
    summary: "Extraction time, dilution, water composition, roast profile, and weekly production logs."
  },
  {
    title: "Object Studies",
    code: "J-002",
    summary: "Parametric forms, material tolerances, fabrication constraints, and small-batch assembly notes."
  },
  {
    title: "Tokyo Notes",
    code: "J-003",
    summary: "Observations on retail quietness, product rituals, hospitality, and spatial discipline."
  }
];

export const orders = [
  {
    number: "CD-20260622-001",
    customer: "Studio A",
    item: "Stitch 冷萃冰滴",
    total: 55,
    status: "Paid",
    delivery: "2026-06-24 / 08:30"
  },
  {
    number: "CD-20260622-002",
    customer: "Lin Chen",
    item: "TANAT 桃子联合发酵冷萃",
    total: 55,
    status: "Reserved",
    delivery: "2026-06-26 / 09:30"
  },
  {
    number: "CD-20260622-003",
    customer: "Atelier North",
    item: "参数化家具 Unit 系列",
    total: 3200,
    status: "Pending",
    delivery: "Made to order"
  },
  {
    number: "CD-20260622-004",
    customer: "Mori Studio",
    item: "TANAT Ombligon 冷萃",
    total: 43,
    status: "Paid",
    delivery: "2026-06-24 / 10:00"
  },
  {
    number: "CD-20260622-005",
    customer: "Gallery South",
    item: "小型家具 Unit 01",
    total: 2600,
    status: "Reserved",
    delivery: "Made to order"
  }
];

export const customers = [
  {
    name: "Studio A",
    phone: "138****9201",
    tags: ["architect", "weekly drop", "studio"],
    spend: 1460,
    orders: 8
  },
  {
    name: "Lin Chen",
    phone: "136****1028",
    tags: ["designer", "member"],
    spend: 736,
    orders: 2
  },
  {
    name: "Atelier North",
    phone: "139****7781",
    tags: ["creative studio", "unit prospect"],
    spend: 2208,
    orders: 6
  }
];
