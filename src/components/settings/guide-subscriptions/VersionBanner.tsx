// components/GuideSubscriptions/VersionBanner.tsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Clock, RefreshCw, GitCompare, AlertTriangle } from "lucide-react";

export interface VersionBannerProps {
  version?: number;
  updatedAt?: string;
  conflict?: boolean;
  onReload?: () => void;
  onCompare?: () => void;
}

export const VersionBanner: React.FC<VersionBannerProps> = ({
  version,
  updatedAt,
  conflict = false,
  onReload,
  onCompare,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full px-5 py-4 rounded-xl border-2 flex items-center justify-between gap-4 ${
        conflict
          ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
          : 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800'
      }`}
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Version</span>
          <Badge variant="outline" className="font-mono font-semibold">
            v{version ?? "—"}
          </Badge>
        </div>
        
        {updatedAt && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Updated {format(new Date(updatedAt), "PPpp")}
          </div>
        )}
        
        {conflict && (
          <Badge variant="destructive" className="gap-1.5">
            <AlertTriangle size={12} />
            Conflict Detected
          </Badge>
        )}
      </div>

      {conflict && (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCompare}
            className="gap-2"
          >
            <GitCompare size={14} />
            Compare
          </Button>
          <Button 
            size="sm" 
            onClick={onReload}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw size={14} />
            Reload
          </Button>
        </div>
      )}
    </motion.div>
  );
};