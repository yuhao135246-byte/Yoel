export type ProductCategory = "COFFEE" | "OBJECT" | "RESEARCH";

export type Product = {
  slug: string;
  name: string;
  category: ProductCategory;
  layer: string;
  subtitle?: string;
  score?: number;
  price: number;
  currency?: string;
  available?: boolean;
  unit: string;
  availability: string;
  description: string;
  details: string[];
  image: string;
  tags: string[];
};

export const products: Product[] = [
  {
    slug: "HYDRANGEA-cold-brew",
    name: "EL Sendero 黑莓冷萃",
    category: "COFFEE",
    layer: "冷萃系列",
    price: 53,
    unit: "杯",
    availability: "周一至周日上午配送",
    description: "哥伦比亚 艾尔森德罗 庄园，Caturra ，黑莓发酵蜜处理。",
    details: ["黑莓酱", "青柠", "红茶"],
    image: "/assets/HYDRANGEA-cold-brew.png",
    tags: ["冷萃", "冰滴", "哥伦比亚"]
  },
  {
    slug: "tanat-peach",
    name: "TANAT 桃子联合发酵冰滴",
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
    name: "TANAT Ombligon 冷萃",
    category: "COFFEE",
    layer: "冷萃系列",
    price: 43,
    unit: "杯",
    availability: "周一至周日上午配送",
    description: "哥伦比亚 El Diviso，（大肚脐）稀有品种。",
    details: ["草莓", "覆盆子", "桃子果酱"],
    image: "/assets/tanat-ombligon.jpg",
    tags: ["冷萃", "Ombligon", "日晒"]
  },
  {
    slug: "tanat-sidra",
    name: "TANAT Sidra 希爪 厌氧日晒",
    category: "COFFEE",
    layer: "冷萃系列",
    subtitle: "哥伦比亚｜皮塔利托｜Nestor Lasso 89分",
    price: 48,
    currency: "RMB",
    available: true,
    unit: "杯",
    availability: "周一至周日上午配送",
    description: "杏子｜草莓｜樱桃",
    details: ["杏子", "草莓", "樱桃"],
    image: "/assets/tanat-Sidra.jpg",
    tags: ["冷萃", "Sidra", "厌氧日晒"]
  },
  {
    slug: "yunnan-lincang-cold-brew",
    name: "云南临沧",
    category: "COFFEE",
    layer: "Cold Brew（冷萃）",
    subtitle: "浅烘｜白桃荔枝浸渍处理",
    price: 45,
    currency: "¥",
    available: true,
    unit: "杯",
    availability: "Available",
    description: "荔枝｜桃子｜白茶｜野花蜜",
    details: ["荔枝", "桃子", "白茶", "野花蜜"],
    image: "/assets/云南临沧.png",
    tags: ["冷萃", "云南", "浸渍处理"]
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
    details: ["柠檬", "西瓜 & 甜橙", "茉莉花茶"],
    image: "/assets/季节水果柠檬茶.png",
    tags: ["水果茶", "柠檬", "季节饮品"]
  },
  {
    slug: "sweet-pepper-chicken-wrap",
    name: "甜椒鸡肉卷",
    category: "COFFEE",
    layer: "Chicken Wrap（鸡肉卷）",
    price: 22,
    currency: "¥",
    available: true,
    unit: "份",
    availability: "Available（可售）",
    description: "手作甜椒酱、生菜、鸡腿肉、坚果、芝士片、黄油炒蛋",
    details: ["手作甜椒酱", "生菜", "鸡腿肉", "坚果", "芝士片", "黄油炒蛋"],
    image: "/assets/鸡肉卷.png",
    tags: ["冷萃", "轻食", "鸡肉卷"]
  },
  {
    slug: "mustard-chicken-wrap",
    name: "芥酱鸡肉卷",
    category: "COFFEE",
    layer: "Chicken Wrap（鸡肉卷）",
    price: 22,
    currency: "¥",
    available: true,
    unit: "份",
    availability: "Available（可售）",
    description: "芥末酸奶蜂蜜蛋黄酱（Mustard）｜生菜｜鸡腿肉｜坚果",
    details: ["芥末酸奶蜂蜜蛋黄酱（Mustard）", "生菜", "鸡腿肉","黄油炒蛋", "坚果"],
    image: "/assets/芥末蛋黄酱鸡肉卷.png",
    tags: ["冷萃", "轻食", "鸡肉卷"]
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
