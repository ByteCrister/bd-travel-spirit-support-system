// src/components/enums/ValuesSection.tsx
"use client";

import React, { JSX, useState } from "react";
import { Plus } from "lucide-react";
import { EnumValue, EnumValueForm } from "@/types/enum-settings.types";
import { Button } from "@/components/ui/button";
import ValuesTable from "./ValuesTable";
import ValueEditorDialog from "./ValueEditorDialog";

export default function ValuesSection({ groupName, values }: { groupName: string; values: EnumValue[] }): JSX.Element {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EnumValue | null>(null);

  const openCreate = () => {
    setEditTarget(null);
    setEditorOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Values ({values.length})</h3>
        <div className="flex items-center gap-2">
          {/* Primary Add button (visible on sm+) */}
          <Button
            onClick={openCreate}
            className="hidden sm:inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            aria-label="Add value"
            title="Add value"
          >
            <Plus className="w-4 h-4 text-white" />
            Add value
          </Button>

          {/* Compact icon-only Add button (visible on xs) */}
          <Button
            onClick={openCreate}
            className="inline-flex sm:hidden items-center justify-center rounded-md bg-emerald-600 p-2 text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            aria-label="Add value"
            title="Add value"
          >
            <Plus className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>

      <ValuesTable
        groupName={groupName}
        values={values}
        onEdit={(v) => { setEditTarget(v); setEditorOpen(true); }}
      />

      <ValueEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        groupName={groupName}
        defaultValue={editTarget as EnumValueForm ?? undefined}
      />
    </div>
  );
}
