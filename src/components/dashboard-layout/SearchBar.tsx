"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiCommand } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";

// ─── Neumorphism style tokens ────────────────────────────────
const NEU_INPUT =
  "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/40 transition-all duration-200";
const NEU_BTN_ICON =
  "rounded-lg flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/50 " +
  "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
  "transition-all duration-200";
const NEU_BTN_ICON_ACTIVE =
  "rounded-lg flex items-center justify-center bg-[#006666] text-white " +
  "shadow-[inset_2px_2px_4px_#004d4d,inset_-2px_-2px_4px_#008080]";
const NEU_DROPDOWN =
  "absolute left-0 right-0 top-12 z-50 max-h-80 overflow-y-auto rounded-2xl " +
  "bg-[#E7E5E4] shadow-[8px_8px_20px_#c8c6c5,-8px_-8px_20px_#ffffff] border border-white/60 p-2";
const NEU_RESULT_ITEM =
  "w-full text-left px-3 py-2 rounded-xl " +
  "font-[family-name:var(--font-jetbrains-mono)] " +
  "text-[#1E2938]/70 hover:text-[#006666] " +
  "hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
  "transition-all duration-200";
// ─────────────────────────────────────────────────────────────

interface SearchResult {
  title: string;
  route: string;
  ids: string[];
}

interface SearchBarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function SearchBar({ isMobile = false, onClose }: SearchBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchSearch = useCallback(async (query: string) => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/v1/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      const found = json.data?.results ?? json.results ?? [];
      setResults(found);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useDebouncedCallback(fetchSearch, 300);

  useEffect(() => {
    if (!searchValue.trim()) { setResults([]); return; }
    debouncedFetch(searchValue.trim());
    return () => { debouncedFetch.cancel?.(); };
  }, [searchValue, debouncedFetch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      debouncedFetch.cancel?.();
      fetchSearch(searchValue.trim());
    }
  };

  const clearSearch = () => {
    setSearchValue("");
    setResults([]);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = async (result: SearchResult) => {
    try {
      const encodedIds = await Promise.all(
        result.ids.map((rawId) => encodeId(encodeURIComponent(rawId)))
      );
      const path = `${result.route}${encodedIds.join("/")}`;
      router.push(path);
      setSearchValue("");
      setResults([]);
      if (isMobile && onClose) onClose();
    } catch (error) {
      console.error("Failed to encrypt IDs:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandMode(true);
        if (isMobile) { setIsExpanded(true); }
        else { inputRef.current?.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobile]);

  const handleMobileToggle = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
      if (isExpanded && onClose) onClose();
    }
  };

  // ── Shared input field ─────────────────────────────────────
  const InputField = (
    <div className="relative flex-1">
      {/* Search icon inside input */}
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E2938]/40 pointer-events-none" />

      <input
        ref={inputRef}
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        placeholder={
          isCommandMode ? "Type a command..." : "Search users, tours, reports..."
        }
        className={cn(
          NEU_INPUT,
          "h-10 pl-9",
          searchValue ? "pr-20" : "pr-10",
          isFocused && "ring-2 ring-[#006666]/40"
        )}
      />

      {/* Right controls */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {searchValue && (
          <motion.button
            type="button"
            onClick={clearSearch}
            className="h-5 w-5 flex items-center justify-center text-[#1E2938]/40 hover:text-[#FF2157] transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Clear search"
          >
            <FiX className="h-3.5 w-3.5" />
          </motion.button>
        )}

        {!isMobile && (
          <>
            {/* Keyboard shortcut badge */}
            <kbd
              className={cn(
                "hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px]",
                "font-[family-name:var(--font-space-mono)]",
                "bg-[#E7E5E4] text-[#1E2938]/50",
                "shadow-[1px_1px_3px_#c8c6c5,-1px_-1px_3px_#ffffff] border border-white/60"
              )}
            >
              {typeof navigator !== "undefined" && navigator.platform.includes("Mac") ? "⌘" : "Ctrl"} K
            </kbd>

            {/* Command mode toggle */}
            <motion.button
              type="button"
              onClick={() => setIsCommandMode((prev) => !prev)}
              className={cn(
                "h-6 w-6",
                isCommandMode ? NEU_BTN_ICON_ACTIVE : NEU_BTN_ICON
              )}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle command mode"
            >
              <FiCommand className="h-3.5 w-3.5" />
            </motion.button>
          </>
        )}
      </div>

      {/* Dropdown results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className={NEU_DROPDOWN}
          >
            {loading && (
              <p className="px-3 py-2 text-xs text-[#1E2938]/40 font-[family-name:var(--font-jetbrains-mono)]">
                Searching…
              </p>
            )}
            {results.map((item, idx) => (
              <button
                key={`${item.route}-${item.ids.join("-")}-${idx}`}
                type="button"
                onClick={() => handleResultClick(item)}
                className={NEU_RESULT_ITEM}
              >
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-[#1E2938]/40 truncate">{item.route}…</p>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ── Mobile ─────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="relative">
        <motion.button
          onClick={handleMobileToggle}
          className={cn(
            "h-10 w-10 flex items-center justify-center rounded-xl",
            "bg-[#E7E5E4] text-[#1E2938]/60",
            "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]",
            "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
            "transition-all duration-200"
          )}
          whileTap={{ scale: 0.95 }}
          aria-label="Open search"
        >
          <FiSearch className="h-5 w-5" />
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute right-0 top-12 z-50 w-80 rounded-2xl p-2",
                "bg-[#E7E5E4] shadow-[8px_8px_20px_#c8c6c5,-8px_-8px_20px_#ffffff] border border-white/60"
              )}
            >
              <form onSubmit={handleSearch}>{InputField}</form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Desktop ────────────────────────────────────────────────
  return (
    <motion.form
      onSubmit={handleSearch}
      className="relative flex-1 max-w-md"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {InputField}
    </motion.form>
  );
}