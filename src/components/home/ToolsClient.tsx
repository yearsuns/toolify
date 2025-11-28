"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import type { Tool, TagMetadata } from "@/types/tools";
import { DEFAULT_VISIBLE_TAGS } from "@/data/tools";
import { filterTools, getTagStats, getVisibleTags } from "@/utils/tools";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

interface ToolsClientProps {
  tools: Tool[];
  tagMetadata: TagMetadata[];
}

export default function ToolsClient({ tools, tagMetadata }: ToolsClientProps) {
  const { t } = useLanguage();
  const { getLocalizedPath } = useLocalizedPath();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  
  // 获取标签统计
  const tagStats = useMemo(() => getTagStats(tools), [tools]);
  
  // 获取可见标签
  const visibleTags = useMemo(() => 
    getVisibleTags(tagMetadata, tagStats, false), 
    [tagMetadata, tagStats]
  );
  
  // 获取标签显示名称
  const getTagName = (tagId: string): string => {
    const tag = tagMetadata.find(t => t.id === tagId);
    if (!tag) return tagId;
    return t.tags[tag.name as keyof typeof t.tags] || tag.name;
  };
  
  // 获取工具名称的翻译
  const getToolName = (tool: Tool): string => {
    return t.tools[tool.name as keyof typeof t.tools]?.name || tool.name;
  };
  
  // 获取工具描述的翻译
  const getToolDescription = (tool: Tool): string => {
    return t.tools[tool.description as keyof typeof t.tools]?.description || tool.description;
  };
  
  // 获取所有标签名称（包含"全部"）
  const allTagNames = useMemo(() => {
    const tagNames = visibleTags.map(tag => ({
      id: tag.id,
      name: getTagName(tag.id)
    }));
    return [{ id: "all", name: t.common.all }, ...tagNames];
  }, [visibleTags, t.common.all]);
  
  // 当语言切换时，如果当前选中的标签不在新的标签列表中，重置为"全部"
  useEffect(() => {
    const tagIds = allTagNames.map(t => t.id);
    if (!tagIds.includes(selectedTag)) {
      setSelectedTag("all");
    }
  }, [selectedTag, allTagNames]);
  
  const [showMoreTags, setShowMoreTags] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

  // 计算并设置下拉菜单位置
  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
  };

  // Handle more tags button click
  const handleMoreTagsClick = () => {
    if (!showMoreTags) {
      calculateDropdownPosition();
      setShowMoreTags(true);
    } else {
      setShowMoreTags(false);
      setDropdownPosition(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowMoreTags(false);
        setTagSearchQuery("");
        setDropdownPosition(null);
      }
    }

    if (showMoreTags) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showMoreTags]);

  // Get visible tags (popular tags, including "all")
  const visibleTagNames = allTagNames.slice(0, DEFAULT_VISIBLE_TAGS + 1);
  
  // Get hidden tags (to be displayed in dropdown)
  const hiddenTagNames = allTagNames.slice(DEFAULT_VISIBLE_TAGS + 1);

  // Filter hidden tags (for search)
  const filteredHiddenTags = hiddenTagNames.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  // Handle tag selection
  const handleTagSelect = (tagId: string) => {
    setSelectedTag(tagId);
    setShowMoreTags(false);
    setTagSearchQuery("");
    setDropdownPosition(null);
  };

  // Filter tools using utility function
  const filteredTools = useMemo(() => 
    filterTools(tools, selectedTag, searchQuery),
    [tools, selectedTag, searchQuery]
  );

  // Prepare tools with translations
  const toolsWithTranslations = useMemo(() => 
    filteredTools.map((tool) => ({
      ...tool,
      key: `tool-${tool.id}`,
      translatedName: getToolName(tool),
      translatedDescription: getToolDescription(tool),
    })),
    [filteredTools]
  );

  return (
    <>
      {/* Search box */}
      <div className="mb-8">
        <div className="relative mx-auto max-w-2xl">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              className="h-5 w-5 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder={t.common.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm py-4 pl-12 pr-4 text-cyan-50 placeholder-cyan-500/50 shadow-sm transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 glow-cyan"
          />
        </div>
      </div>

      {/* Tag buttons */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {/* Visible tags */}
          {visibleTagNames.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagSelect(tag.id)}
              className={`whitespace-nowrap rounded-lg px-5 py-2 text-sm font-medium transition-all flex-shrink-0 border ${
                selectedTag === tag.id
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-400/50 glow-cyan"
                  : "bg-[#0f0f1f]/60 text-cyan-400/70 border-cyan-500/20 hover:bg-[#0f0f1f]/80 hover:border-cyan-400/40 hover:text-cyan-300"
              }`}
            >
              {tag.name}
            </button>
          ))}
          
          {/* More tags button */}
          {hiddenTagNames.length > 0 && (() => {
            const isHiddenTagSelected = hiddenTagNames.some(t => t.id === selectedTag);
            const selectedTagName = hiddenTagNames.find(t => t.id === selectedTag)?.name || "";
            const buttonText = isHiddenTagSelected
              ? (selectedTagName.length > 8 ? selectedTagName.slice(0, 8) + "..." : selectedTagName)
              : t.common.moreCategories;
            
            return (
              <button
                ref={buttonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoreTagsClick();
                }}
                className={`whitespace-nowrap rounded-lg px-5 py-2 text-sm font-medium transition-all flex-shrink-0 border ${
                  showMoreTags || isHiddenTagSelected
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-400/50 glow-cyan"
                    : "bg-[#0f0f1f]/60 text-cyan-400/70 border-cyan-500/20 hover:bg-[#0f0f1f]/80 hover:border-cyan-400/40 hover:text-cyan-300"
                }`}
                title={isHiddenTagSelected && selectedTagName && selectedTagName.length > 8 ? selectedTagName : undefined}
              >
                {buttonText}
                <svg
                  className={`ml-1 inline-block h-4 w-4 transition-transform ${
                    showMoreTags ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            );
          })()}
        </div>
      </div>

      {/* Dropdown menu - using fixed positioning */}
      {showMoreTags && hiddenTagNames.length > 0 && dropdownPosition && (
        <>
          {/* Background overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setShowMoreTags(false);
              setDropdownPosition(null);
            }}
          />
          {/* Dropdown menu */}
          <div
            ref={dropdownRef}
            className="fixed z-50 w-64 rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/95 backdrop-blur-xl shadow-xl glow-cyan"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tag search box */}
            <div className="border-b border-cyan-500/20 p-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-4 w-4 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={t.common.search}
                  value={tagSearchQuery}
                  onChange={(e) => setTagSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-cyan-500/20 bg-[#0a0a0f]/80 py-2 pl-9 pr-3 text-sm text-cyan-50 placeholder-cyan-500/50 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Tag list */}
            <div 
              className="max-h-64 overflow-y-auto p-2 custom-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0, 240, 255, 0.4) rgba(0, 240, 255, 0.05)',
              } as React.CSSProperties}
            >
              {filteredHiddenTags.length > 0 ? (
                filteredHiddenTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagSelect(tag.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selectedTag === tag.id
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                        : "text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-300"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))
              ) : (
                <div className="py-4 text-center text-sm text-cyan-500/50">
                  {t.common.noResults}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Tool count display */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-cyan-400/70">
          {t.common.foundTools.replace("{count}", String(toolsWithTranslations.length))}
        </p>
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {toolsWithTranslations.map((tool) => (
          <Link
            key={tool.key}
            href={getLocalizedPath(tool.path)}
            className="group relative block overflow-hidden rounded-xl border border-cyan-500/20 bg-[#0f0f1f]/60 backdrop-blur-sm p-6 transition-all hover:border-cyan-400/50 hover:bg-[#0f0f1f]/80 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            {/* Tech-style border glow effect */}
            <div className="absolute inset-0 rounded-xl border border-cyan-500/0 group-hover:border-cyan-400/30 transition-all pointer-events-none" />
            
            <div className="mb-3 flex items-start justify-between relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-2xl border border-cyan-500/30">
                {tool.icon}
              </div>
              {/* Display first tag */}
              {tool.tags.length > 0 && (
                <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400 border border-cyan-500/20">
                  {getTagName(tool.tags[0])}
                </span>
              )}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-cyan-200 group-hover:text-cyan-100 transition-colors relative z-10">
              {tool.translatedName}
            </h3>
            <p className="mb-4 text-sm text-cyan-400/70 relative z-10">
              {tool.translatedDescription}
            </p>
            <div className="flex items-center text-sm font-medium text-cyan-400 opacity-0 transition-opacity group-hover:opacity-100 relative z-10">
              {t.common.useNow}
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {toolsWithTranslations.length === 0 && (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <svg
              className="h-8 w-8 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-cyan-300">
            {t.common.noResults}
          </h3>
        </div>
      )}
    </>
  );
}
