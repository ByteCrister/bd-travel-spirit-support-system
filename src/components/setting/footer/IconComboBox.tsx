"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import IconFromName from "@/components/global/IconFromName";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import ICON_OPTIONS from "@/data/react-social-icons";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_TRIGGER =
  "flex w-full items-center justify-between gap-2 truncate rounded-xl px-3 py-2.5 " +
  "bg-[#E7E5E4] text-[#1E2938] text-sm " +
  "font-[family-name:var(--font-jetbrains-mono)] " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 " +
  "hover:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200";

const NEU_POPOVER =
  "w-[320px] rounded-2xl border border-white/60 p-2 z-[9999] " +
  "bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]";

const NEU_COMMAND_ITEM_ACTIVE = "bg-[#006666]/10 text-[#006666]";
const NEU_COMMAND_ITEM =
  "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm " +
  "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938] " +
  "hover:bg-[#006666]/10 hover:text-[#006666] cursor-pointer transition-colors duration-150";
// ─────────────────────────────────────────────────────────────

interface IconComboBoxProps {
  value?: string | null;
  onChange: (v: string | null) => void;
  placeholder?: string;
  className?: string;
}

export function IconComboBox({
  value,
  onChange,
  placeholder = "Choose icon",
  className,
}: IconComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!query) return ICON_OPTIONS;
    return ICON_OPTIONS.filter((o) =>
      o.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const selected = ICON_OPTIONS.find((o) => o.id === value) ?? null;

  const handleSelectId = (id: string) => {
    const isSelected = id === value;
    onChange(isSelected ? null : id);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery("");
      }}
      modal
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(NEU_TRIGGER, className)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            {selected ? (
              <>
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-[#006666]">
                  <IconFromName name={selected.id} size={18} className="text-current" />
                </span>
                <span className="truncate">{selected.label}</span>
              </>
            ) : (
              <span className="truncate text-[#1E2938]/40">{placeholder}</span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[#1E2938]/40" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className={NEU_POPOVER}
        side="bottom"
        align="start"
        forceMount
      >
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search icons..."
            value={query}
            onValueChange={(v) => setQuery(v)}
            className="mb-1 rounded-xl bg-[#E7E5E4] font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] border-none focus:outline-none focus:ring-1 focus:ring-[#006666]/40"
            aria-label="Search icons"
          />
          <CommandList>
            <CommandEmpty>
              <div className="px-3 py-2 font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50">
                No icons found
              </div>
            </CommandEmpty>

            {filtered.map((opt) => (
              <CommandItem
                key={opt.id}
                onSelect={() => handleSelectId(opt.id)}
                className={cn(
                  NEU_COMMAND_ITEM,
                  opt.id === value ? NEU_COMMAND_ITEM_ACTIVE : ""
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="truncate">{opt.label}</span>
                </div>
                {opt.id === value && (
                  <Check className="h-3.5 w-3.5 text-[#006666] shrink-0" />
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}