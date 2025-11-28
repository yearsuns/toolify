import type { Tool, TagMetadata } from "@/types/tools";

/**
 * 过滤工具
 * @param tools 工具列表
 * @param selectedTag 选中的标签（"all" 表示全部）
 * @param searchQuery 搜索关键词
 * @returns 过滤后的工具列表
 */
export function filterTools(
  tools: Tool[], 
  selectedTag: string, 
  searchQuery: string
): Tool[] {
  return tools.filter(tool => {
    // 标签过滤
    const matchesTag = selectedTag === "all" || tool.tags.includes(selectedTag);
    
    // 搜索过滤（搜索工具名称和描述）
    const matchesSearch = searchQuery === "" || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTag && matchesSearch;
  });
}

/**
 * 统计每个标签的工具数量
 * @param tools 工具列表
 * @returns 标签ID到工具数量的映射
 */
export function getTagStats(tools: Tool[]): Record<string, number> {
  const stats: Record<string, number> = {};
  tools.forEach(tool => {
    tool.tags.forEach(tag => {
      stats[tag] = (stats[tag] || 0) + 1;
    });
  });
  return stats;
}

/**
 * 获取热门标签（工具数量最多的）
 * @param tagMetadata 标签元数据
 * @param stats 标签统计
 * @param limit 返回数量限制
 * @returns 热门标签列表
 */
export function getPopularTags(
  tagMetadata: TagMetadata[], 
  stats: Record<string, number>,
  limit: number = 6
): TagMetadata[] {
  return tagMetadata
    .filter(tag => stats[tag.id] > 0)
    .sort((a, b) => stats[b.id] - stats[a.id])
    .slice(0, limit);
}

/**
 * 获取可见标签（用于首页展示）
 * @param tagMetadata 标签元数据
 * @param stats 标签统计
 * @param showPopularOnly 是否只显示热门标签
 * @returns 排序后的标签列表
 */
export function getVisibleTags(
  tagMetadata: TagMetadata[],
  stats: Record<string, number>,
  showPopularOnly: boolean = false
): TagMetadata[] {
  let visibleTags = tagMetadata.filter(tag => stats[tag.id] > 0);
  
  if (showPopularOnly) {
    visibleTags = visibleTags.filter(tag => tag.isPopular);
  }
  
  return visibleTags.sort((a, b) => a.order - b.order);
}

