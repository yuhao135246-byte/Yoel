export type ArchiveStatus = "AVAILABLE" | "COMING_SOON";

export type ArchiveInfoRow = {
  label: string;
  value: string;
};

export type ArchiveEntry = {
  slug: string;
  issueNumber: string;
  unitLabel: string;
  englishTitle: string;
  workTitle: string;
  objectType: string;
  editionLabel: string;
  publicationYear: string;
  phaseLabel: string;
  publicationLabel: string;
  title: string;
  subtitle: string;
  intro: string;
  status: ArchiveStatus;
  archiveDescription: string;
  ctaLabel?: string;
  productSlug?: string;
  openingQuote: string[];
  objectInfoRows: ArchiveInfoRow[];
  designStatement: string[];
  plannedChapters: string[];
};

export const archiveEntries: ArchiveEntry[] = [
  {
    slug: "unit-01",
    issueNumber: "01",
    unitLabel: "UNIT 01",
    englishTitle: "Ripple",
    workTitle: "《涟漪》",
    objectType: "户外照明装置",
    editionLabel: "Edition 01",
    publicationYear: "2026",
    phaseLabel: "已发布",
    publicationLabel: "设计档案",
    title: "设计档案",
    subtitle: "一本持续记录设计研究、创作过程与最终作品。",
    intro: "设计档案是 Cadence 的常设出版库，记录每个 Unit 从构想到完成的完整演变。",
    status: "AVAILABLE",
    archiveDescription:
      "完整记录 UNIT 01 从概念、研究、推演、原型到最终作品的全过程。",
    ctaLabel: "进入 ->",
    productSlug: "unit-01",
    openingQuote: [
      "水波并非一种形态，",
      "而是一种不断扩散的关系。"
    ],
    objectInfoRows: [
      { label: "发布时间", value: "2026" },
      { label: "地点", value: "郑州" },
      { label: "材质", value: "树脂 / 矿物复合基座" },
      { label: "工艺", value: "参数化建模 / 数字制造" },
      { label: "光源", value: "暖白 LED" },
      { label: "版本", value: "Edition 01" }
    ],
    designStatement: [
      "UNIT 01 源于水面被轻触时产生的涟漪。",
      "它不再直接描摹水的形态，而是将自然生长规律转译为参数化几何与光。",
      "光线如涟漪般缓慢扩散，在自然、计算与空间之间形成安静的对话。"
    ],
    plannedChapters: [
      "封面",
      "前言",
      "设计概念",
      "研究",
      "草图",
      "推演",
      "原型",
      "材料",
      "灯光实验",
      "摄影",
      "规格",
      "作品"
    ]
  },
  {
    slug: "unit-02",
    issueNumber: "02",
    unitLabel: "UNIT 02",
    englishTitle: "Untitled",
    workTitle: "《......》",
    objectType: "待发布",
    editionLabel: "Edition --",
    publicationYear: "TBD",
    phaseLabel: "即将发布",
    publicationLabel: "设计档案",
    title: "设计档案",
    subtitle: "一本持续记录设计研究、创作过程与最终作品。",
    intro: "设计档案是 Cadence 的常设出版库，记录每个 Unit 从构想到完成的完整演变。",
    status: "COMING_SOON",
    archiveDescription: "档案整理中。",
    openingQuote: [
      "形态来自关系，",
      "关系来自持续的研究。"
    ],
    objectInfoRows: [
      { label: "发布日期", value: "待更新" },
      { label: "设计地点", value: "待更新" },
      { label: "材质", value: "待更新" },
      { label: "工艺", value: "待更新" },
      { label: "光源", value: "待更新" },
      { label: "Edition", value: "待更新" }
    ],
    designStatement: [
      "该作品正在研究与开发阶段。",
      "完整档案将在发布后逐步呈现。"
    ],
    plannedChapters: [
      "封面",
      "前言",
      "设计概念",
      "研究",
      "草图",
      "推演",
      "原型",
      "材料",
      "灯光实验",
      "摄影",
      "规格",
      "作品"
    ]
  },
  {
    slug: "unit-03",
    issueNumber: "03",
    unitLabel: "UNIT 03",
    englishTitle: "Untitled",
    workTitle: "《......》",
    objectType: "待发布",
    editionLabel: "Edition --",
    publicationYear: "TBD",
    phaseLabel: "未来",
    publicationLabel: "设计档案",
    title: "设计档案",
    subtitle: "一本持续记录设计研究、创作过程与最终作品。",
    intro: "设计档案是 Cadence 的常设出版库，记录每个 Unit 从构想到完成的完整演变。",
    status: "COMING_SOON",
    archiveDescription: "即将开启。",
    openingQuote: [
      "每一次推演，",
      "都是下一次作品的起点。"
    ],
    objectInfoRows: [
      { label: "发布日期", value: "待更新" },
      { label: "设计地点", value: "待更新" },
      { label: "材质", value: "待更新" },
      { label: "工艺", value: "待更新" },
      { label: "光源", value: "待更新" },
      { label: "Edition", value: "待更新" }
    ],
    designStatement: [
      "该作品仍处于概念预研阶段。",
      "档案结构已就绪，内容将随进度更新。"
    ],
    plannedChapters: [
      "封面",
      "前言",
      "设计概念",
      "研究",
      "草图",
      "推演",
      "原型",
      "材料",
      "灯光实验",
      "摄影",
      "规格",
      "作品"
    ]
  }
];

export const archiveBySlug = new Map(archiveEntries.map((entry) => [entry.slug, entry]));
