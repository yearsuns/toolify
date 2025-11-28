// Tool type definition
export interface Tool {
  id: number;
  name: string; // Translation key
  icon: string;
  description: string; // Translation key
  path: string; // Navigation path
  tags: string[]; // 标签数组（必需，至少一个）
}

// Tag metadata type definition
export interface TagMetadata {
  id: string;
  name: string; // Translation key
  order: number; // 显示顺序（数字越小越靠前）
  isPopular?: boolean; // 是否热门标签（用于首页展示）
}

