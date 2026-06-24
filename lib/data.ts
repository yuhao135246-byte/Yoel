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
    layer: "冷萃系列",
    price: 55,
    unit: "杯",
    availability: "周一至周日上午配送",
    description: "哥伦比亚 El Encanto 魅惑庄园，Caturra + Chiroso，酵母接种日晒。",
    details: ["巧克力牛奶", "樱桃酱", "红苹果"],
    image: "/assets/stitch.jpg",
    tags: ["冷萃", "冰滴", "哥伦比亚"]
  },
  {
    slug: "tanat-peach",
    name: "TANAT 桃子联合发酵冷萃",
    category: "COFFEE",
    layer: "冷萃系列",
    price: 55,
    unit: "杯",
    availability: "周一至周日上午配送",
    description: "法国 TANAT × Los Patios 实验发酵站。",
    details: ["桃子", "菠萝", "木瓜"],
    image: "/assets/tanat-peach.png",
    tags: ["冷萃", "发酵", "水果"]
  },
  {
    slug: "tanat-ombligon",
    name: "TANAT Ombligon 冰手冲",
    category: "COFFEE",
    layer: "冷萃系列",
    price: 43,
    unit: "杯",
    availability: "周一至周日上午配送",
    description: "哥伦比亚 El Diviso，Ombligon 稀有品种。",
    details: ["草莓", "覆盆子", "桃子果酱"],
    image: "/assets/tanat-ombligon.jpg",
    tags: ["冷萃", "Ombligon", "日晒"]
  },
  {
    slug: "fruit-lemon-tea",
    name: "季节水果柠檬茶",
    category: "COFFEE",
    layer: "季节饮品",
    price: 18,
    unit: "杯",
    availability: "周一至周日上午配送",
    description: "季节水果与手工冷泡茶。",
    details: ["柠檬", "热带水果", "清爽茶感"],
    image: "/assets/季节水果柠檬茶.png",
    tags: ["水果茶", "柠檬", "季节饮品"]
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
