"use client";

import React from "react";
import { motion } from "framer-motion";
import { HiPlus, HiPencil, HiTrash, HiRefresh } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  selectedCount: number;
  onNew: () => void;
  onBulkEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

const AdsToolbar: React.FC<Props> = ({
  selectedCount,
  onNew,
  onBulkEdit,
  onDelete,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Left side - Primary actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            onClick={onNew} 
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md"
            aria-label="Create new price"
          >
            <HiPlus className="mr-2 h-4 w-4" />
            New Price
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: selectedCount > 0 ? 1.02 : 1 }}
          whileTap={{ scale: selectedCount > 0 ? 0.98 : 1 }}
        >
          <Button
            variant="outline"
            onClick={onBulkEdit}
            disabled={selectedCount === 0}
            className="border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50"
            aria-disabled={selectedCount === 0}
            aria-label="Bulk edit selected"
          >
            <HiPencil className="mr-2 h-4 w-4" />
            Bulk Edit
            {selectedCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700">
                {selectedCount}
              </Badge>
            )}
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: selectedCount > 0 ? 1.02 : 1 }}
          whileTap={{ scale: selectedCount > 0 ? 0.98 : 1 }}
        >
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={selectedCount === 0}
            className="disabled:opacity-50"
            aria-disabled={selectedCount === 0}
          >
            <HiTrash className="mr-2 h-4 w-4" />
            Delete
            {selectedCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
                {selectedCount}
              </Badge>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Right side - Secondary actions */}
      <div className="flex items-center gap-2">
        <motion.div
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
        >
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onRefresh} 
            className="hover:bg-emerald-50"
            aria-label="Refresh"
          >
            <HiRefresh className="h-5 w-5 text-emerald-600" />
          </Button>
        </motion.div>

      </div>
    </div>
  );
};

export default AdsToolbar;