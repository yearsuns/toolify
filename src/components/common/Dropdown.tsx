"use client";

import { useState, ReactNode, cloneElement, isValidElement } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";

interface DropdownProps {
  trigger: ReactNode; // Trigger button content
  children: ReactNode; // Dropdown menu content
  searchable?: boolean; // Whether searchable
  searchPlaceholder?: string; // Search box placeholder
  onSearchChange?: (query: string) => void; // Search change callback
  width?: string; // Dropdown menu width
  align?: "left" | "right"; // Alignment
  closeOnSelect?: boolean; // Auto close after selection, default true
}

export default function Dropdown({
  trigger,
  children,
  searchable = false,
  searchPlaceholder = "搜索...",
  onSearchChange,
  width = "w-64",
  align = "left",
  closeOnSelect = true,
}: DropdownProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  // Wrap a button element with MenuItem to enable close functionality
  const wrapButton = (button: React.ReactElement<any>, key?: number | string) => {
    return (
      <MenuItem key={key}>
        {({ close }) =>
          cloneElement(button, {
            onClick: (e: React.MouseEvent) => {
              const originalOnClick = button.props?.onClick;
              originalOnClick?.(e);
              close();
    setSearchQuery("");
    onSearchChange?.("");
            },
          })
        }
      </MenuItem>
    );
  };

  // Wrap children buttons with MenuItem to enable close functionality
  const wrapChildren = (children: ReactNode): ReactNode => {
    if (!closeOnSelect) {
      return children;
    }

    // Handle primitive types
    if (typeof children === "string" || typeof children === "number") {
      return children;
    }

    // Handle arrays
    if (Array.isArray(children)) {
      return children.map((child, index) => {
        if (!isValidElement(child)) {
          return child;
        }

        const childElement = child as React.ReactElement<any>;
        
        // If it's a button, wrap it with MenuItem
        if (childElement.type === "button" || childElement.props?.onClick) {
          return wrapButton(childElement, index);
        }

        // If it's a div or container, recursively process its children
        if (childElement.type === "div" && childElement.props?.children) {
          return cloneElement(childElement, {
            key: index,
            children: wrapChildren(childElement.props.children),
          });
        }

        return child;
      });
    }

    // Handle single element
    if (isValidElement(children)) {
      const childElement = children as React.ReactElement<any>;
      
      // If it's a button, wrap it with MenuItem
      if (childElement.type === "button" || childElement.props?.onClick) {
        return wrapButton(childElement);
      }

      // If it's a div or container, recursively process its children
      if (childElement.type === "div" && childElement.props?.children) {
        return cloneElement(childElement, {
          children: wrapChildren(childElement.props.children),
        });
    }
    }

    return children;
  };

  return (
    <Menu as="div" className="relative">
      <MenuButton className="relative focus:outline-none focus:ring-0">
        {trigger}
      </MenuButton>

      <MenuItems
        modal={false}
        className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-2 ${width} rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/95 backdrop-blur-xl shadow-xl overflow-hidden z-50 focus:outline-none`}
          >
        {/* Search box */}
            {searchable && (
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
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full rounded-lg border border-cyan-500/20 bg-[#0a0a0f]/80 py-2 pl-9 pr-3 text-sm text-cyan-50 placeholder-cyan-500/50 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

        {/* Dropdown menu content */}
        <div className="max-h-64 overflow-y-auto custom-scrollbar">
          {wrapChildren(children)}
            </div>
      </MenuItems>
    </Menu>
  );
}
