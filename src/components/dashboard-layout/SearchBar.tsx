"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiCommand } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SearchResult {
  title: string;
  route: string;   // e.g. "/users/companies/"
  ids: string[];   // raw MongoDB ObjectId strings
}

interface SearchBarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
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

  // -----------------------------------------------------------------------
  // Actual search function (called by debounced version and on form submit)
  // -----------------------------------------------------------------------
  const fetchSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/dashboard/v1/search?q=${encodeURIComponent(query)}`
      );
      const json = await res.json();
      // API returns { data: { results } } with the new error handler
      const found = json.data?.results ?? json.results ?? [];
      setResults(found);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced version for live typing
  const debouncedFetch = useDebouncedCallback(fetchSearch, 300);

  // Trigger debounced search when searchValue changes
  useEffect(() => {
    if (!searchValue.trim()) {
      setResults([]);
      return;
    }
    debouncedFetch(searchValue.trim());
    // Cancel debounce on unmount
    return () => {
      debouncedFetch.cancel?.();
    };
  }, [searchValue, debouncedFetch]);

  // -----------------------------------------------------------------------
  // Form submit: cancel any pending debounce and fetch immediately
  // -----------------------------------------------------------------------
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      debouncedFetch.cancel?.(); // cancel pending debounced call
      fetchSearch(searchValue.trim());
    }
  };

  // -----------------------------------------------------------------------
  // Clear search
  // -----------------------------------------------------------------------
  const clearSearch = () => {
    setSearchValue("");
    setResults([]);
    inputRef.current?.focus();
  };

  // -----------------------------------------------------------------------
  // Close dropdown when clicking outside
  // -----------------------------------------------------------------------
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -----------------------------------------------------------------------
  // Navigate on result click (encrypt IDs client‑side)
  // -----------------------------------------------------------------------
  const handleResultClick = async (result: SearchResult) => {
    try {
      const encodedIds = await Promise.all(
        result.ids.map((rawId) => encodeId(encodeURIComponent(rawId)))
      );
      const path = `${result.route}${encodedIds.join("/")}`;
      router.push(path);
      // Reset UI
      setSearchValue("");
      setResults([]);
      if (isMobile && onClose) onClose();
    } catch (error) {
      console.error("Failed to encrypt IDs:", error);
    }
  };

  // -----------------------------------------------------------------------
  // Keyboard shortcut: Ctrl/⌘ + K
  // -----------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandMode(true);
        if (isMobile) {
          setIsExpanded(true);
        } else {
          inputRef.current?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobile]);

  // -----------------------------------------------------------------------
  // Mobile expand/collapse
  // -----------------------------------------------------------------------
  const handleMobileToggle = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
      if (isExpanded && onClose) onClose();
    }
  };

  // -----------------------------------------------------------------------
  // Placeholder with icon
  // -----------------------------------------------------------------------
  const PlaceholderWithIcon = () => (
    <span className="flex items-center gap-2 text-slate-400">
      <FiSearch className="h-4 w-4" />
      {isCommandMode ? "Type a command..." : "Search users, tours, reports..."}
    </span>
  );

  // -----------------------------------------------------------------------
  // Input field with dropdown
  // -----------------------------------------------------------------------
  const InputField = (
    <div className="relative flex-1">
      {/* Input */}
      <Input
        ref={inputRef}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        placeholder=""
        className={cn(
          "pl-10 pr-28 h-10 rounded-xl bg-white/80 dark:bg-slate-800/80",
          "border-slate-200/60 dark:border-slate-700/60",
          "focus:bg-white dark:focus:bg-slate-800",
          "focus:border-blue-400 dark:focus:border-blue-500",
          "transition-all duration-200 backdrop-blur-sm",
          "focus:outline-none focus:ring-0 focus:shadow-none",
          isFocused && "ring-2 ring-blue-500"
        )}
      />

      {/* Floating placeholder */}
      {!searchValue && (
        <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-slate-500 dark:text-slate-400">
          <PlaceholderWithIcon />
        </div>
      )}

      {/* Right-side utilities wrapper */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {/* Clear button */}
        {searchValue && (
          <motion.button
            type="button"
            onClick={clearSearch}
            className="h-5 w-5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Clear search"
          >
            <FiX className="h-4 w-4" />
          </motion.button>
        )}

        {/* Desktop-only: shortcut hint + command toggle */}
        {!isMobile && (
          <>
            {/* Shortcut hint */}
            <div className="hidden sm:flex items-center">
              <kbd
                className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-mono 
               bg-slate-100 dark:bg-slate-700 
               text-slate-600 dark:text-slate-300 
               rounded-md border border-slate-300 dark:border-slate-600 
               shadow-sm"
              >
                {navigator.platform.includes("Mac") ? (
                  <>
                    <span className="text-base leading-none">⌘</span>
                    <span>K</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs leading-none">Ctrl</span>
                    <span>K</span>
                  </>
                )}
              </kbd>
            </div>

            {/* Command toggle */}
            <motion.button
              type="button"
              onClick={() => setIsCommandMode((prev) => !prev)}
              className={cn(
                "p-1 rounded-md transition-colors",
                isCommandMode
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle command mode"
            >
              <FiCommand className="h-4 w-4" />
            </motion.button>
          </>
        )}
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-12 z-50 max-h-80 overflow-y-auto rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 shadow-xl"
          >
            {loading && (
              <p className="p-2 text-sm text-slate-400">Loading...</p>
            )}
            {results.map((item, idx) => (
              <button
                key={`${item.route}-${item.ids.join("-")}-${idx}`}
                type="button"
                onClick={() => handleResultClick(item)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {item.title}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {item.route}...
                </p>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // -----------------------------------------------------------------------
  // Mobile layout
  // -----------------------------------------------------------------------
  if (isMobile) {
    return (
      <div className="relative">
        <motion.button
          onClick={handleMobileToggle}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
          whileHover={{ scale: 1.05 }}
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
              className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 shadow-xl"
            >
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                {InputField}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Desktop layout
  // -----------------------------------------------------------------------
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