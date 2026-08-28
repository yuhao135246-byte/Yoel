export type ProductCategory = "COFFEE" | "OBJECT" | "RESEARCH";

export type ProductInventoryItem = {
  slug: string;
  quantity: number;
};

export type ProductOption = {
  value: string;
  label: string;
  image?: string;
  inventoryItems?: ProductInventoryItem[];
};

export type ProductOptionGroup = {
  key: string;
  label: string;
  required?: boolean;
  options: ProductOption[];
};

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
  inventoryItems?: ProductInventoryItem[];
  optionGroups?: ProductOptionGroup[];
};

export const products: Product[] = [
  {
    slug: "the-naughty-dog-special-edition-cold-batch-brew",
    name: "哥伦比亚 Finca Las Flores Cold Batch Brew",
    category: "COFFEE",
    layer: "限时供应",
    price: 53,
    currency: "¥",
    unit: "400 ml",
    availability: "周一至周日上午配送",
    description:
      "来自捷克 The Naughty Dog 的特别批次 Cold Batch Brew。选用哥伦比亚 Finca Las Flores 厌氧水洗咖啡豆，呈现橙子与柠檬的明亮果香，伴随 PEZ 糖般的甜感，以及牛奶巧克力和香料茶尾韵，层次丰富，风味鲜明。400 ml 规格，更适合细致体验不同温度下的风味变化。",
    details: [
      "规格：400 ml",
      "烘焙：The Naughty Dog（捷克）",
      "产地：哥伦比亚",
      "庄园：Finca Las Flores",
      "处理法：厌氧水洗",
      "风味：橙子、柠檬、PEZ 糖、牛奶巧克力、香料茶"
    ],
    image: "/assets/TND.png",
    tags: ["Cold Batch Brew", "限时供应", "The Naughty Dog", "哥伦比亚"]
  },
  {
    slug: "拉索一号",
    name: "哥伦比亚 拉索一号#热门回归",
    category: "COFFEE",
    layer: "冷萃系列",
    subtitle: "品种：Caturra（卡杜拉）与 Castillo（卡斯蒂略） → 产区：哥伦比亚 Huila（惠兰省） 海拔：1750 米以上",
    price: 46,
    currency: "¥",
    available: true,
    unit: "杯",
    availability: "周一至周日上午配送",
    description: "榛子、杏干、桃子 （中烘）",
    details: ["榛子、杏干、桃子 （中烘）"],
    image: "/assets/拉索一号.png",
    tags: ["冷萃", "哥伦比亚", "拉索一号"]
  },
  {
    slug: "panama-elida-falda",
    name: "Panama Elida Falda CRD GW0403",
    category: "COFFEE",
    layer: "冷萃系列",
    subtitle: "巴拿马·波奎特｜艾力达 Falda｜瑰夏｜CRD 水洗｜92分",
    price: 102,
    unit: "杯",
    currency: "¥",
    availability: "周一至周日上午配送",
    description: "Lamastus 家族艾力达庄园 Falda 微地块，1800m+。",
    details: ["茉莉花", "白葡萄干", "香橼", "蔓越莓"],
    image: "/assets/艾力达瑰夏.png",
    tags: ["冰滴", "瑰夏", "巴拿马"]
  },
  {
    slug: "tanat-ombligon",
    name: "TANAT Ombligon 冷萃",
    category: "COFFEE",
    layer: "冷萃系列",
    price: 43,
    unit: "杯",
    currency: "¥",
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
    currency: "¥",
    available: true,
    unit: "杯",
    availability: "周一至周日上午配送",
    description: "杏子｜草莓｜樱桃",
    details: ["杏子", "草莓", "樱桃"],
    image: "/assets/tanat-Sidra.jpg",
    tags: ["冷萃", "Sidra", "厌氧日晒"]
  },
  {
    slug: "fruit-lemon-tea",
    name: "季节水果柠檬茶",
    category: "COFFEE",
    layer: "季节饮品",
    price: 18,
    currency: "¥",
    unit: "杯",
    availability: "周一至周日上午配送",
    description: "季节水果与手工冷泡茶。",
    details: ["柠檬", "西瓜 & 甜橙", "茉莉花茶"],
    image: "/assets/季节水果柠檬茶.png",
    tags: ["水果茶", "柠檬", "季节饮品"]
  },
  {
    slug: "latte",
    name: "Latte / 拿铁",
    category: "COFFEE",
    layer: "奶咖系列",
    price: 18,
    currency: "¥",
    available: true,
    unit: "杯",
    availability: "Available（可售）",
    description: "丝滑奶泡与浓郁咖啡的经典组合，热或冰两种口感可选。",
    details: ["温度可选：热拿铁 / 冰拿铁", "热拿铁：/assets/latte.jpg", "冰拿铁：/assets/Ice latte.png"],
    image: "/assets/latte.jpg",
    tags: ["拿铁", "Latte", "奶咖"],
    optionGroups: [
      {
        key: "temperature",
        label: "温度 / Temperature",
        required: true,
        options: [
          {
            value: "hot-latte",
            label: "热拿铁 / Hot Latte · ¥18",
            image: "/assets/latte.jpg"
          },
          {
            value: "ice-latte",
            label: "冰拿铁 / Ice Latte · ¥18",
            image: "/assets/Ice latte.png"
          }
        ]
      }
    ]
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
    slug: "tomato-curry-chicken-wrap",
    name: "番茄咖喱鸡肉卷",
    category: "COFFEE",
    layer: "Chicken Wrap（鸡肉卷）",
    price: 22,
    currency: "¥",
    available: true,
    unit: "份",
    availability: "Available（可售）",
    description: "番茄｜咖喱｜生菜｜黄油炒蛋",
    details: ["番茄", "咖喱", "生菜", "黄油炒蛋"],
    image: "/assets/番茄鸡肉卷.png",
    tags: ["轻食", "鸡肉卷", "番茄咖喱"]
  },
  {
    slug: "low-cal-wrap-fruit-tea-lunch-combo",
    name: "低卡鸡肉卷水果茶午餐",
    category: "COFFEE",
    layer: "Lunch Combo（午餐套餐）",
    price: 35,
    currency: "¥",
    available: true,
    unit: "份",
    availability: "Available（可售）",
    description: "鸡肉卷二选一｜水果茶",
    details: ["鸡肉卷选择（必选）：甜椒鸡肉卷 / 番茄咖喱鸡肉卷", "水果茶"],
    image: "/assets/Combo.png",
    tags: ["午餐套餐", "鸡肉卷", "水果茶"],
    inventoryItems: [
      {
        slug: "fruit-lemon-tea",
        quantity: 1
      }
    ],
    optionGroups: [
      {
        key: "wrapChoice",
        label: "鸡肉卷选择",
        required: true,
        options: [
          {
            value: "sweet-pepper-chicken-wrap",
            label: "甜椒鸡肉卷",
            inventoryItems: [
              {
                slug: "sweet-pepper-chicken-wrap",
                quantity: 1
              }
            ]
          },
          {
            value: "tomato-curry-chicken-wrap",
            label: "番茄咖喱鸡肉卷",
            inventoryItems: [
              {
                slug: "tomato-curry-chicken-wrap",
                quantity: 1
              }
            ]
          }
        ]
      }
    ]
  },
  {
    slug: "unit-01",
    name: "Unit 01",
    category: "OBJECT",
    layer: "预售",
    subtitle: "参数化环境灯",
    price: 330,
    currency: "¥",
    available: true,
    unit: "件",
    availability: "预售中",
    description: "Cadence 首件参数化环境灯作品。",
    details: ["底座颜色可选", "支持预售", "沿用现有配送与库存体系"],
    image: "/assets/Unit0100.png",
    tags: ["Unit 01", "Object", "Preorder"],
    optionGroups: [
      {
        key: "baseColor",
        label: "底座颜色",
        required: true,
        options: [
          {
            value: "yellow",
            label: "明黄"
          },
          {
            value: "bordeaux",
            label: "波尔多红"
          },
          {
            value: "crimson",
            label: "绯红"
          },
          {
            value: "sand",
            label: "哑光沙黄"
          },
          {
            value: "white",
            label: "沙白"
          }
        ]
      }
    ]
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
    title: "Notes",
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
    item: "Panama Elida Falda CRD GW0403",
    total: 102,
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
