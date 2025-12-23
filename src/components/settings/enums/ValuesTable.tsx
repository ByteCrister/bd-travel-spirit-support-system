// src/components/enums/ValuesTable.tsx
"use client";

import React, { JSX, useCallback } from "react";
import { Edit, Trash2, Hash, Tag, Database } from "lucide-react";
import { EnumValue } from "@/types/enum-settings.types";
import useEnumSettingsStore from "@/store/enumSettings.store";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

interface Props {
  _id: string;
  values: EnumValue[];
  onEdit: (v: EnumValue) => void;
}

export default function ValuesTable({ _id, values, onEdit }: Props): JSX.Element {
  const {
    removeValue,
    setValueActive,
    groups
  } = useEnumSettingsStore();
  const groupState = groups[_id];
  const optimistic = groupState?.optimistic ?? {};

  const handleRemove = useCallback(
    async (key: string) => {
      try {
        await removeValue(_id, key);
      } catch {
        // removeValue will show toast or handle errors
      }
    },
    [removeValue, _id]
  );

  return (
    <div className="rounded-2xl border border-slate-200/60 overflow-hidden bg-white shadow-lg">
      {/* Table container with gradient border effect */}
      <div className="relative">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 hover:bg-slate-50 border-b border-slate-200/60">
              <TableHead className="font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-blue-100 rounded-md">
                    <Hash size={12} className="text-blue-600" />
                  </div>
                  Key
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-purple-100 rounded-md">
                    <Tag size={12} className="text-purple-600" />
                  </div>
                  Label
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-green-100 rounded-md">
                    <Database size={12} className="text-green-600" />
                  </div>
                  Value
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700">Active</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {values.map((v, idx) => {
                const pending = Object.keys(optimistic).length > 0;
                return (
                  <motion.tr
                    key={v.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{
                      delay: idx * 0.03,
                      duration: 0.3,
                      ease: [0.23, 1, 0.32, 1]
                    }}
                    className="group border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200"
                  >
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-slate-700 font-medium">{v.key}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-600">
                        {v.label ?? <span className="text-slate-400 italic">No label</span>}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                        {String(v.value)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Switch
                          checked={!!v.active}
                          onCheckedChange={async(val) => await setValueActive(_id, v.key, !!val)}
                          disabled={pending}
                          aria-label={`Set ${v.key} active`}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-green-600"
                        />
                      </motion.div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(v)}
                            aria-label={`Edit ${v.key}`}
                            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors"
                          >
                            <Edit size={14} />
                          </Button>
                        </motion.div>
                        <ConfirmDeleteDialog
                          title={`Delete value "${v.key}"`}
                          description={`Permanently remove "${v.key}" from ${groupState.data?.name}. This cannot be undone.`}
                          confirmLabel="Delete value"
                          cancelLabel="Cancel"
                          onConfirm={() => handleRemove(v.key)}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Delete ${v.key}`}
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </ConfirmDeleteDialog>
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </TableBody>
        </Table>

        {/* Empty state */}
        {values.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4"
          >
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-slate-200/50 blur-xl rounded-full" />
              <div className="relative p-4 bg-slate-100 rounded-2xl">
                <Database className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">No values yet</p>
            <p className="text-xs text-slate-500">Add your first enum value to get started</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}