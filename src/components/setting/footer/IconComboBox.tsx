"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
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
    return ICON_OPTIONS.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const selected = ICON_OPTIONS.find((o) => o.id === value) ?? null;

  const handleSelectId = (id: string) => {
    const isSelected = id === value;
    onChange(isSelected ? null : id);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(""); }} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("justify-between gap-2 w-full truncate", className)}
          type="button"
        >
          <span className="flex items-center gap-2 truncate">
            {selected ? (
              <>
                <span className="h-5 w-5 inline-flex items-center justify-center text-slate-700">
                  <IconFromName name={selected.id} size={18} className="text-current" />
                </span>
                <span className="truncate">{selected.label}</span>
              </>
            ) : (
              <span className="truncate text-sm text-slate-500">{placeholder}</span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 opacity-80" />
        </Button>
      </PopoverTrigger>

      {/* Use portal to render outside the dialog */}
      <PopoverContent
        className="w-[320px] p-2 z-[9999] pointer-events-auto"
        side="bottom"
        align="start"
        forceMount
      >
        <Command>
          <CommandInput
            placeholder="Search icons..."
            value={query}
            onValueChange={(v) => setQuery(v)}
            className="mb-2"
            aria-label="Search icons"
          />
          <CommandList>
            <CommandEmpty>
              <div className="px-2 py-2 text-xs text-slate-500">No icons found</div>
            </CommandEmpty>

            {filtered.map((opt) => (
              <CommandItem
                key={opt.id}
                onSelect={() => handleSelectId(opt.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded px-2 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800",
                  opt.id === value ? "bg-slate-100 dark:bg-slate-800" : ""
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="truncate">{opt.label}</span>
                </div>
                {opt.id === value && <Check className="h-4 w-4 text-green-600" />}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
