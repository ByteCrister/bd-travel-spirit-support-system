// src/components/enums/ValuesTable.tsx
"use client";

import { JSX, useCallback } from "react";
import { Edit, Trash2, Hash, Tag, Database } from "lucide-react";
import { EnumValue } from "@/types/site-settings/enum-settings.types";
import useEnumSettingsStore from "@/store/site-settings/enumSettings.store";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

// ── Neu style tokens ──────────────────────────────────────────
const S = {
  tableWrap:
    "rounded-2xl bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] " +
    "border border-white/60 overflow-hidden",
  table: "w-full text-sm",
  thead: "border-b border-[#1E2938]/10",
  th:
    "px-4 py-3 text-left text-xs font-bold uppercase tracking-widest " +
    "font-[family-name:var(--font-space-mono)] text-[#1E2938]/50",
  thLast: "px-4 py-3 text-right text-xs font-bold uppercase tracking-widest " +
    "font-[family-name:var(--font-space-mono)] text-[#1E2938]/50",
  thInner: "flex items-center gap-2",
  thIcon:
    "p-1 rounded-lg bg-[#E7E5E4] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
  tr: "group border-b border-[#1E2938]/6 last:border-none transition-colors duration-150 hover:bg-[#1E2938]/[0.02]",
  td: "px-4 py-3 align-middle",
  tdLast: "px-4 py-3 align-middle",
  keyCell: "flex items-center gap-2",
  keyAccent:
    "w-0.5 h-6 rounded-full bg-[#006666] opacity-0 group-hover:opacity-100 transition-opacity duration-200",
  keyText:
    "text-xs font-bold font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]",
  labelText:
    "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/70",
  noLabel:
    "text-xs italic font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/30",
  valuePill:
    "inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold " +
    "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/70 " +
    "bg-[#E7E5E4] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
  actions:
    "flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200",
  editBtn:
    "w-7 h-7 flex items-center justify-center rounded-xl bg-[#E7E5E4] text-[#1E2938]/50 " +
    "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] " +
    "hover:text-[#006666] hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40",
  deleteBtn:
    "w-7 h-7 flex items-center justify-center rounded-xl bg-[#E7E5E4] text-[#1E2938]/50 " +
    "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] " +
    "hover:text-[#FF2157] hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/40",
  // Empty state
  emptyWrap:
    "flex flex-col items-center justify-center py-14 px-4",
  emptyIcon:
    "mb-4 p-4 rounded-2xl bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff]",
  emptyTitle:
    "text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] mb-1",
  emptyMsg:
    "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50",
};

interface Props {
  _id: string;
  values: EnumValue[];
  onEdit: (v: EnumValue) => void;
}

export default function ValuesTable({ _id, values, onEdit }: Props): JSX.Element {
  const { removeValue, setValueActive, groups } = useEnumSettingsStore();
  const groupState = groups[_id];
  const optimistic = groupState?.optimistic ?? {};

  const handleRemove = useCallback(
    async (key: string) => {
      try {
        await removeValue(_id, key);
      } catch {
        // removeValue handles errors
      }
    },
    [removeValue, _id]
  );

  return (
    <div className={S.tableWrap}>
      {values.length === 0 ? (
        <div className={S.emptyWrap}>
          <div className={S.emptyIcon}>
            <Database className="w-8 h-8 text-[#1E2938]/30" strokeWidth={1.5} />
          </div>
          <p className={S.emptyTitle}>No values yet</p>
          <p className={S.emptyMsg}>Add your first enum value to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={S.table}>
            <thead className={S.thead}>
              <tr>
                <th className={S.th}>
                  <div className={S.thInner}>
                    <span className={S.thIcon}>
                      <Hash size={10} className="text-[#006666]" />
                    </span>
                    Key
                  </div>
                </th>
                <th className={S.th}>
                  <div className={S.thInner}>
                    <span className={S.thIcon}>
                      <Tag size={10} className="text-[#006666]" />
                    </span>
                    Label
                  </div>
                </th>
                <th className={S.th}>
                  <div className={S.thInner}>
                    <span className={S.thIcon}>
                      <Database size={10} className="text-[#006666]" />
                    </span>
                    Value
                  </div>
                </th>
                <th className={S.th}>Active</th>
                <th className={S.thLast}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {values.map((v, idx) => {
                  const pending = Object.keys(optimistic).length > 0;
                  return (
                    <motion.tr
                      key={v.key}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ delay: idx * 0.025, duration: 0.25 }}
                      className={S.tr}
                    >
                      <td className={S.td}>
                        <div className={S.keyCell}>
                          <span className={S.keyAccent} />
                          <span className={S.keyText}>{v.key}</span>
                        </div>
                      </td>
                      <td className={S.td}>
                        {v.label ? (
                          <span className={S.labelText}>{v.label}</span>
                        ) : (
                          <span className={S.noLabel}>No label</span>
                        )}
                      </td>
                      <td className={S.td}>
                        <span className={S.valuePill}>{String(v.value)}</span>
                      </td>
                      <td className={S.td}>
                        <Switch
                          checked={!!v.active}
                          onCheckedChange={async (val) =>
                            await setValueActive(_id, v.key, !!val)
                          }
                          disabled={pending}
                          aria-label={`Set ${v.key} active`}
                        />
                      </td>
                      <td className={S.tdLast}>
                        <div className={S.actions}>
                          <button
                            onClick={() => onEdit(v)}
                            aria-label={`Edit ${v.key}`}
                            className={S.editBtn}
                          >
                            <Edit size={13} />
                          </button>
                          <ConfirmDeleteDialog
                            title={`Delete value "${v.key}"`}
                            description={`Permanently remove "${v.key}" from ${groupState?.data?.name}. This cannot be undone.`}
                            confirmLabel="Delete value"
                            cancelLabel="Cancel"
                            onConfirm={() => handleRemove(v.key)}
                          >
                            <button
                              aria-label={`Delete ${v.key}`}
                              className={S.deleteBtn}
                            >
                              <Trash2 size={13} />
                            </button>
                          </ConfirmDeleteDialog>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}