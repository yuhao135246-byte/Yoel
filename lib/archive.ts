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

export type ArchiveHeroVideo = {
  src: string;
  poster?: string;
  alt: string;
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
  heroVideo?: ArchiveHeroVideo;
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
      src: "/assets/Unit0100.png",
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
            src: "/assets/Unit0106.png",
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
            src: "/assets/Unit0108.png",
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
            src: "/assets/Unit0110.png",
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
    englishTitle: "Slow Feeder",
    workTitle: "《慢食碗》",
    objectType: "宠物慢食碗",
    editionLabel: "Edition 01",
    publicationYear: "待更新",
    phaseLabel: "设计档案",
    publicationLabel: "设计档案",
    title: "设计档案",
    subtitle: "记录外形、内部曲面组织与参数化设计研究。",
    intro: "UNIT 02 以宠物慢食碗为核心对象，关注用餐体验与器皿表面组织之间的关系。",
    status: "AVAILABLE",
    archiveDescription: "记录 UNIT 02 的外形研究、内部曲面组织与参数化设计方向。",
    ctaLabel: "进入 ->",
    openingQuote: [
      "慢食不是速度的延迟，",
      "而是体验的组织。"
    ],
    objectInfoRows: [
      { label: "产品类型", value: "宠物慢食碗" },
      { label: "设计阶段", value: "档案整理中" },
      { label: "发布日期", value: "待更新" },
      { label: "材质", value: "待补充" },
      { label: "工艺", value: "参数化设计 / 数字制造" },
      { label: "Edition", value: "待更新" }
    ],
    designStatement: [
      "UNIT 02 聚焦宠物慢食碗的形体逻辑：如何通过外轮廓与内部曲面之间的组织，形成稳定的进食节奏与更清晰的使用体验。",
      "产品的设计重点不在于追求复杂装饰，而在于让托盘形态、入口边界与内部流线彼此协调，以支持更自然的动作路径。",
      "在参数化建模的研究过程中，设计会反复调整弧线、坡度与腔体之间的关系，以让最终形态在功能和材料表达之间保持克制、稳重的节奏。"
    ],
    coverImage: {
      src: "/assets/Unit2- (1).jpg",
      alt: "UNIT 02 hero product photograph",
      width: 4032,
      height: 3024,
      layout: "full",
      caption: "Cover"
    },
    heroVideo: {
      src: "/assets/Unit2Mp4.mp4",
      poster: "/assets/Unit2- (1).jpg",
      alt: "UNIT 02 hero video"
    },
    editorialSections: [
      {
        id: "form-studies",
        sectionLabel: "Form",
        heading: "外形研究",
        paragraphs: [
          "这项研究从器皿的整体体量和边缘轮廓出发，观察它在宠物使用场景中的可读性与稳定性。",
          "设计会进一步调整喂食区域与边缘落点之间的关系，让产品在日常使用中保持稳态并减少不必要的视觉噪音。"
        ],
        images: [
          {
            src: "/assets/Unit2- (2).jpg",
            alt: "UNIT 02 design study from the side",
            width: 4032,
            height: 3024,
            layout: "full"
          }
        ]
      },
      {
        id: "surface-logic",
        sectionLabel: "Surface",
        heading: "曲面组织",
        paragraphs: [
          "内部曲面是 UNIT 02 的关键研究对象之一。设计通过对局部弧度、深度和入口连续性的调节，形成更适合缓慢进食的空间结构。",
          "这一过程同时也在考量产品如何兼顾识别性、稳定性与清洁体验，并为后续的参数化迭代提供明确的几何基准。"
        ],
        images: [
          {
            src: "/assets/Unit2- (3).jpg",
            alt: "UNIT 02 close-up of the inner curved bowl geometry",
            width: 4032,
            height: 3024,
            layout: "full"
          }
        ]
      },
      {
        id: "digital-fabrication",
        sectionLabel: "Fabrication",
        heading: "数字制造",
        paragraphs: [
          "设计语言中的参数化研究强调可复现、可调整与可迭代的几何逻辑，从概念草图到模型修正，再到制造前的验证，整个过程都保持清晰的研究脉络。",
          "当前档案仅记录已完成的设计方向与研究结构，后续将随真实素材和制造信息更新。"
        ],
        images: [
          {
            src: "/assets/Unit2- (4).jpg",
            alt: "UNIT 02 product detail showing a single bowl and color variation",
            width: 1086,
            height: 1448,
            layout: "detail"
          }
        ]
      }
    ],
    plannedChapters: [
      "封面",
      "前言",
      "概念",
      "形式研究",
      "曲面组织",
      "参数化推演",
      "原型检视",
      "制造准备",
      "规格待补充",
      "作品整理"
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
