// app/guide-password-requests/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordRequestDto } from "@/types/guide-forgot-password.types";
import { RefreshCw, AlertCircle, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePasswordRequestStore } from "@/store/guide/guide-password-request.store";
import { PasswordRequestStats } from "./PasswordRequestStats";
import { PasswordRequestFilters } from "./PasswordRequestFilters";
import { PasswordRequestsTable } from "./PasswordRequestsTable";
import { PasswordRequestDialog } from "./PasswordRequestDialog";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function GuidePasswordRequestsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    fetchRequests,
    fetchStats,
    error,
    clearError,
    isFetching,
    filters,
    pagination,
    selectRequest,
  } = usePasswordRequestStore();

  // Initial data fetch
  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [fetchRequests, fetchStats]);

  // Fetch when filters or pagination changes
  useEffect(() => {
    fetchRequests();
  }, [filters, pagination.page, pagination.limit, fetchRequests]);

  const handleSelectRequest = (request: PasswordRequestDto) => {
    selectRequest(request);
    setIsDialogOpen(true);
  };

  const handleRefresh = () => {
    fetchRequests(true);
    fetchStats(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <motion.div
        className="container mx-auto py-8 px-4 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-sm">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Password Reset Requests
              </h1>
            </div>
            <p className="text-sm text-slate-600 pl-[52px]">
              Manage and review guide password reset requests
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isFetching}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 shadow-sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""
                }`}
            />
            Refresh
          </Button>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert
              variant="destructive"
              className="border-red-200 bg-red-50 text-red-900"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-7 text-red-700 hover:text-red-900 hover:bg-red-100"
                  onClick={clearError}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Stats Section */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Overview
              </CardTitle>
              <CardDescription className="text-slate-600">
                Real-time statistics for password reset requests
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <PasswordRequestStats />
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters Section */}
        <motion.div variants={itemVariants}>
          <PasswordRequestFilters />
        </motion.div>

        {/* Table Section */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Requests
              </CardTitle>
              <CardDescription className="text-slate-600">
                Click on any row to view detailed information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <PasswordRequestsTable onSelectRequest={handleSelectRequest} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Dialog for request details */}
        <PasswordRequestDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </motion.div>
    </div>
  );
}