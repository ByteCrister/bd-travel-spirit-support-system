// src/components/enums/ValuesSection.tsx
"use client";

import { JSX, useState } from "react";
import { Plus } from "lucide-react";
import { EnumValue, EnumValueForm } from "@/types/site-settings/enum-settings.types";
import ValuesTable from "./ValuesTable";
import ValueEditorDialog from "./ValueEditorDialog";

// ── Neu style tokens ──────────────────────────────────────────
const S = {
  headerRow: "flex items-center justify-between mb-4",
  title:
    "text-xs font-bold uppercase tracking-widest font-[family-name:var(--font-space-mono)] text-[#1E2938]/60",
  addBtnFull:
    "hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold " +
    "font-[family-name:var(--font-space-mono)] text-white bg-[#006666] " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50",
  addBtnIcon:
    "flex sm:hidden items-center justify-center w-9 h-9 rounded-xl text-white bg-[#006666] " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50",
};

export default function ValuesSection({
  _id,
  values,
}: {
  _id: string;
  values: EnumValue[];
}): JSX.Element {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EnumValue | null>(null);

  const openCreate = () => {
    setEditTarget(null);
    setEditorOpen(true);
  };

  return (
    <div>
      <div className={S.headerRow}>
        <h3 className={S.title}>Values ({values.length})</h3>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className={S.addBtnFull}
            aria-label="Add value"
          >
            <Plus className="w-4 h-4" />
            Add value
          </button>
          <button
            onClick={openCreate}
            className={S.addBtnIcon}
            aria-label="Add value"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ValuesTable
        _id={_id}
        values={values}
        onEdit={(v) => {
          setEditTarget(v);
          setEditorOpen(true);
        }}
      />

      <ValueEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        _id={_id}
        defaultValue={(editTarget as EnumValueForm) ?? undefined}
      />
    </div>
  );
}