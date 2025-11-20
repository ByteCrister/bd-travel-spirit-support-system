"use client";

import React, { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { RefreshCw, Shield, AlertCircle } from "lucide-react";
import { useResetRequestsStore } from "@/store/reset-requests.store";
import RequestList from "./RequestList";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

export default function EmployeeResetRequestsPage() {
  const { fetchList, currentQuery, loading, error } = useResetRequestsStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchList(currentQuery).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchList(currentQuery);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.header
          className="mb-8"
          variants={itemVariants}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  Password Reset Requests
                </h1>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 ml-14">
                Manage employee password reset requests
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                size="lg"
                onClick={handleRefresh}
                disabled={loading || isRefreshing}
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </motion.div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
                <div className="p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error loading requests
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                      {error.message}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.header>

        <motion.div variants={itemVariants}>
          <Separator className="mb-8 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800" />
        </motion.div>

        <motion.main variants={itemVariants}>
          <Card className="shadow-xl border-slate-200 dark:border-slate-800 overflow-hidden">
            <RequestList />
          </Card>
        </motion.main>
      </div>
    </motion.div>
  );
}