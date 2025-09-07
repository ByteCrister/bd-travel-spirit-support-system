"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiCommand } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function SearchBar({ isMobile = false, onClose }: SearchBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isCommandMode, setIsCommandMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      if (isCommandMode) {
        console.log("Running command:", searchValue);
        // Handle command execution here
      } else {
        console.log("Searching for:", searchValue);
        // Handle search logic here
      }
    }
  };

  const handleMobileToggle = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
      if (isExpanded && onClose) onClose();
    }
  };

  const clearSearch = () => {
    setSearchValue("");
    inputRef.current?.focus();
  };

  // Keyboard shortcut: Ctrl/⌘ + K opens command mode
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

  const PlaceholderWithIcon = () => (
    <span className="flex items-center gap-2 text-slate-400">
      <FiSearch className="h-4 w-4" />
      {isCommandMode ? "Type a command..." : "Search users, tours, reports..."}
    </span>
  );

  const InputField = (
    <div className="relative flex-1">
      {/* Input */}
      <Input
        ref={inputRef}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder=""
        className={cn(
          "pl-10 pr-28 h-10 rounded-xl bg-white/80 dark:bg-slate-800/80",
          "border-slate-200/60 dark:border-slate-700/60",
          "focus:bg-white dark:focus:bg-slate-800",
          "focus:border-blue-400 dark:focus:border-blue-500",
          "transition-all duration-200 backdrop-blur-sm",
          "focus:outline-none focus:ring-0 focus:shadow-none", // 🚫 disable green browser highlight
          isFocused && "ring-2 ring-blue-500" // 🔵 professional blue
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
    </div>
  );



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
