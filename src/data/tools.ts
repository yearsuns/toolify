import type { Tool, TagMetadata } from "@/types/tools";

export const tools: Tool[] = [
  // Development tools
  { 
    id: 1, 
    name: "jsonFormatter", 
    icon: "🔧",
    description: "jsonFormatter",
    path: "/tools/json-formatter",
    tags: ["development", "text", "format"]
  },
  { 
    id: 2, 
    name: "regex", 
    icon: "⚡",
    description: "regex",
    path: "/tools/regex",
    tags: ["development"]
  },
  { 
    id: 3, 
    name: "uuidGenerator", 
    icon: "🆔",
    description: "uuidGenerator",
    path: "/tools/uuid-generator",
    tags: ["development"]
  },
  
  // Encoding tools
  { 
    id: 4, 
    name: "base64", 
    icon: "🔐",
    description: "base64",
    path: "/tools/base64",
    tags: ["encoding", "development"]
  },
  { 
    id: 5, 
    name: "urlEncoder", 
    icon: "🔗",
    description: "urlEncoder",
    path: "/tools/url-encoder",
    tags: ["encoding", "development"]
  },
  
  // Encryption tools
  { 
    id: 6, 
    name: "md5", 
    icon: "🔒",
    description: "md5",
    path: "/tools/md5",
    tags: ["encryption", "security"]
  },
  { 
    id: 7, 
    name: "passwordGenerator", 
    icon: "🔑",
    description: "passwordGenerator",
    path: "/tools/password-generator",
    tags: ["encryption", "security"]
  },
  
  // Time tools
  { 
    id: 8, 
    name: "timestamp", 
    icon: "⏰",
    description: "timestamp",
    path: "/tools/timestamp",
    tags: ["time", "development"]
  },
  
  // Image tools
  { 
    id: 9, 
    name: "qrcode", 
    icon: "📱",
    description: "qrcode",
    path: "/tools/qrcode",
    tags: ["image"]
  },
  { 
    id: 10, 
    name: "imageCompress", 
    icon: "🖼️",
    description: "imageCompress",
    path: "/tools/image-compress",
    tags: ["image"]
  },
  
  // Design tools
  { 
    id: 11, 
    name: "colorPicker", 
    icon: "🎨",
    description: "colorPicker",
    path: "/tools/color-picker",
    tags: ["design"]
  },
  
  // Text tools
  { 
    id: 12, 
    name: "markdownEditor", 
    icon: "✍️",
    description: "markdownEditor",
    path: "/tools/markdown-editor",
    tags: ["text", "development"]
  },
  { 
    id: 13, 
    name: "wordCount", 
    icon: "📄",
    description: "wordCount",
    path: "/tools/word-count",
    tags: ["text"]
  },
  
  // Network tools
  { 
    id: 14, 
    name: "ipLookup", 
    icon: "🌐",
    description: "ipLookup",
    path: "/tools/ip-lookup",
    tags: ["network"]
  },
  
  // Calculation tools
  { 
    id: 15, 
    name: "unitConverter", 
    icon: "📊",
    description: "unitConverter",
    path: "/tools/unit-converter",
    tags: ["calculation"]
  },
  
  // Format tools
  { 
    id: 16, 
    name: "vlessToClash", 
    icon: "🔄",
    description: "vlessToClash",
    path: "/tools/vless-to-clash",
    tags: ["format", "network"]
  },
];

// 标签元数据
export const tagMetadata: TagMetadata[] = [
  { 
    id: "development", 
    name: "development",
    order: 1,
    isPopular: true
  },
  { 
    id: "encoding", 
    name: "encoding",
    order: 2,
    isPopular: true
  },
  { 
    id: "encryption", 
    name: "encryption",
    order: 3,
    isPopular: true
  },
  { 
    id: "time", 
    name: "time",
    order: 4,
    isPopular: true
  },
  { 
    id: "image", 
    name: "image",
    order: 5,
    isPopular: true
  },
  { 
    id: "design", 
    name: "design",
    order: 6,
    isPopular: true
  },
  { 
    id: "text", 
    name: "text",
    order: 7,
    isPopular: false
  },
  { 
    id: "network", 
    name: "network",
    order: 8,
    isPopular: false
  },
  { 
    id: "calculation", 
    name: "calculation",
    order: 9,
    isPopular: false
  },
  { 
    id: "format", 
    name: "format",
    order: 10,
    isPopular: false
  },
  { 
    id: "security", 
    name: "security",
    order: 11,
    isPopular: false
  },
];

// Default number of visible tags (popular tags)
export const DEFAULT_VISIBLE_TAGS = 6;
