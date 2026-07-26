export type ArchiveStatus = "AVAILABLE" | "COMING_SOON";

export type ArchiveInfoRow = {
  label: string;
  value: string;
};

export type ArchiveEditorialImageLayout = "full" | "pair" | "detail";

export type ArchiveEditorialImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  layout?: ArchiveEditorialImageLayout;
  caption?: string;
};

export type ArchiveEditorialSection = {
  id: string;
  sectionLabel: string;
  heading: string;
  paragraphs: string[];
  images: ArchiveEditorialImage[];
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
  coverImage?: ArchiveEditorialImage;
  editorialSections?: ArchiveEditorialSection[];
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
      { label: "材质", value: "树脂 / PETG" },
      { label: "工艺", value: "参数化建模 / 数字制造" },
      { label: "光源", value: "暖白 LED" },
      { label: "版本", value: "Edition 01" }
    ],
    designStatement: [
      "UNIT 01 源于水面被轻触时产生的涟漪。",
      "它不再直接描摹水的形态，而是将自然生长规律转译为参数化几何与光。",
      "光线如涟漪般缓慢扩散，在自然、计算与空间之间形成安静的对话。"
    ],
    coverImage: {
      src: "/assets/Unit%2001%20cover.png",
      alt: "UNIT 01 封面主视觉",
      width: 1800,
      height: 1400,
      layout: "full",
      caption: "Cover"
    },
    editorialSections: [
      {
        id: "prototype",
        sectionLabel: "Prototype",
        heading: "原型",
        paragraphs: [
          "经过两周的真实使用与场景测试，UNIT 01 不断调整比例、光线与材质之间的关系。",
          "最终验证了作品在不同空间中的稳定表现，也为后续制作建立了可靠的基础。"
        ],
        images: [
          {
            src: "/assets/Unit%2001%20(5).png",
            alt: "UNIT 01 Studio photograph with Safari Chair and brown backdrop",
            width: 1800,
            height: 1200,
            layout: "full"
          }
        ]
      },
      {
        id: "space",
        sectionLabel: "Space",
        heading: "空间",
        paragraphs: [
          "作品并非独立存在，而是在空间中建立尺度、光影与日常生活之间的关系。",
          "不同材质、光线与环境的变化，让同一件作品呈现出不同的空间体验。"
        ],
        images: [
          {
            src: "/assets/Unit%2001%20(7).png",
            alt: "UNIT 01 interior photograph with grey wall, perforated cabinet, and flowers",
            width: 1800,
            height: 1200,
            layout: "full"
          }
        ]
      },
      {
        id: "final-work",
        sectionLabel: "Work",
        heading: "作品",
        paragraphs: [
          "UNIT 01 采用 PETG 灯罩与矿物复合基座制作，经过两周持续测试，具备良好的耐磨性与稳定性，适合长期日常使用。",
          "内置电池可连续续航约 18 小时；PETG 材料可耐约 70°C 高温，属于食品接触级材料，对人体无害，在兼顾安全性的同时保留温润的光线质感。"
        ],
        images: [
          {
            src: "/assets/Unit%2001%20(2).jpg",
            alt: "UNIT 01 final work red background product photograph",
            width: 1800,
            height: 1200,
            layout: "full"
          }
        ]
      }
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
      "空间",
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
