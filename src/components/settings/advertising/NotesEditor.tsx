"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiDocumentText, HiPencil, HiX, HiCheck } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  notes?: string | null;
  saving: boolean;
  onSave: (notes?: string | null) => Promise<void>;
}

const NotesEditor: React.FC<Props> = ({ notes, saving, onSave }) => {
  const [editing, setEditing] = useState<string | null>(notes ?? "");
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    try {
      await onSave(editing ?? null);
      setOpen(false);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setEditing(notes ?? "");
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <HiDocumentText className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Admin Notes</CardTitle>
              <CardDescription className="text-sm">
                Internal notes for advertising configuration
              </CardDescription>
            </div>
          </div>
          
          {!open && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className="border-slate-200 hover:bg-white hover:border-slate-300"
              >
                <HiPencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </motion.div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[60px]"
            >
              {notes ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {notes}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 py-4">
                  <HiDocumentText className="h-5 w-5" />
                  <span className="italic">No notes added yet</span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Textarea
                rows={6}
                className="resize-none border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                value={editing ?? ""}
                onChange={(e) => setEditing(e.target.value)}
                placeholder="Add notes about advertising configuration, pricing changes, or other relevant information..."
                aria-label="Notes editor"
              />
              
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={saving}
                  className="hover:bg-slate-100"
                >
                  <HiX className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
                  >
                    {saving ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <HiCheck className="mr-2 h-4 w-4" />
                        Save Notes
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default NotesEditor;