"use client";

import React, { JSX, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import GroupDetailSkeleton from "./skeletons/GroupDetailSkeleton";
import ErrorBar from "./ErrorBar";
import ValuesSection from "./ValuesSection";
import useEnumSettingsStore from "@/store/enumSettings.store";
import { EnumGroupFormSchema, enumGroupSchema } from "@/utils/validators/enums-settings.validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Database, Edit, Package, RefreshCw, X, Sparkles, FileText } from "lucide-react";
import { showToast } from "@/components/global/showToast";

export default function GroupDetail({ selected }: { selected: string | null }): JSX.Element {
  const { fetchGroup, updateGroup, groups } = useEnumSettingsStore();
  const groupState = selected ? groups[selected] : undefined;

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (selected) void fetchGroup(selected);
  }, [selected, fetchGroup]);

  const status = groupState?.status ?? "idle";
  const error = groupState?.error ?? null;
  const data = groupState?.data ?? null;

  const form = useForm<EnumGroupFormSchema>({
    resolver: zodResolver(enumGroupSchema),
    defaultValues: {
      name: data?.name ?? "",
      description: data?.description ?? undefined,
      values: data?.values ?? [],
    },
  });

  useEffect(() => {
    form.reset({
      name: data?.name ?? "",
      description: data?.description ?? undefined,
      values: data?.values ?? [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (!selected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative flex flex-col items-center justify-center h-full min-h-[500px] p-2 text-center overflow-hidden"
      >
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          className="relative"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 3, -3, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatDelay: 1,
            ease: "easeInOut"
          }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
            <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 p-6 rounded-3xl shadow-lg">
              <Package className="w-16 h-16 text-slate-400" strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mt-6"
        >
          <h3 className="text-2xl font-bold text-slate-800 mb-2 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text">
            No Group Selected
          </h3>
          <p className="text-sm text-slate-600 max-w-md leading-relaxed">
            Select a group from the sidebar to view and manage its details and values
          </p>
        </motion.div>

        {/* Floating particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
            style={{
              left: `${30 + i * 20}%`,
              top: `${30 + i * 15}%`
            }}
          />
        ))}
      </motion.div>
    );
  }

  if (status === "loading" && !data) {
    return <GroupDetailSkeleton />;
  }

  if (error) {
    return <ErrorBar message={error} onRetry={() => void fetchGroup(selected, { force: true })} />;
  }

  const onSave: SubmitHandler<EnumGroupFormSchema> = async (values) => {
    const payload = {
      name: selected,
      description: values.description ?? null,
    } as const;

    try {
      await updateGroup(payload);
      setEditing(false);
      showToast.success("Updated", "Group details updated successfully");
    } catch {
      // updateGroup will handle showing toast and updating store state
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="relative p-2 h-full"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-3"
          >
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30"
            >
              <Database className="w-5 h-5 text-white" strokeWidth={2.5} />
            </motion.div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {data?.name}
            </h2>
            {data?.version && (
              <motion.span
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-md"
              >
                v{data.version}
              </motion.span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm text-slate-600 mb-3 leading-relaxed max-w-2xl">
              {data?.description || "No description provided"}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <Package size={14} className="text-slate-600" />
                <span className="text-xs font-medium text-slate-700">
                  {data?.values?.length || 0} values
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                <Sparkles size={14} className="text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  Active
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchGroup(selected, { force: true })}
              className="rounded-xl border-slate-300 hover:border-slate-400 hover:bg-slate-50 shadow-sm"
            >
              <RefreshCw size={14} className="mr-2" />
              Refresh
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={editing ? "outline" : "default"}
              size="sm"
              onClick={() => setEditing((s) => !s)}
              className={editing
                ? "rounded-xl border-slate-300 hover:border-red-400 hover:bg-red-50 hover:text-red-600 shadow-sm"
                : "rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
              }
            >
              {editing ? (
                <>
                  <X size={14} className="mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit size={14} className="mr-2" />
                  Edit Info
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.form
              key="edit-form"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              onSubmit={form.handleSubmit(onSave)}
              className="space-y-6 bg-gradient-to-br from-slate-50/80 via-white to-blue-50/30 p-8 rounded-2xl border border-slate-200/60 shadow-lg backdrop-blur-sm"
            >
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-bl-full" />

              <div className="relative space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Database size={14} className="text-blue-600" />
                  </div>
                  Group Name
                </label>
                <Input
                  {...form.register("name")}
                  disabled
                  className="bg-slate-100/80 cursor-not-allowed border-slate-200 text-slate-600 rounded-xl h-11"
                />
                <p className="text-xs text-slate-500 flex items-center gap-1.5 ml-1">
                  <span className="w-1 h-1 bg-slate-400 rounded-full" />
                  Group name cannot be changed
                </p>
              </div>

              <div className="relative space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <FileText size={14} className="text-purple-600" />
                  </div>
                  Description
                </label>
                <Input
                  {...form.register("description")}
                  placeholder="Enter group description..."
                  className="focus:ring-2 focus:ring-blue-500/20 border-slate-200 focus:border-blue-500 rounded-xl h-11 transition-all"
                />
              </div>

              <div className="relative flex gap-3 pt-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg rounded-xl h-11"
                  >
                    <CheckCircle2 size={16} className="mr-2" />
                    Save Changes
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      form.reset();
                      setEditing(false);
                    }}
                    className="rounded-xl hover:bg-slate-100 h-11 px-6"
                  >
                    Cancel
                  </Button>
                </motion.div>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="values-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <ValuesSection groupName={selected} values={data?.values ?? []} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}