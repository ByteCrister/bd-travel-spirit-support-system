// components/GuideSubscriptions/ReorderControl.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, Save, RotateCcw, GripVertical } from "lucide-react";

export interface ReorderControlProps {
  ids: string[];
  onReorder: (orderedIds: string[]) => Promise<void> | void;
  disabled?: boolean;
}

export const ReorderControl: React.FC<ReorderControlProps> = ({ ids, onReorder, disabled }) => {
  const [order, setOrder] = useState<string[]>(ids);
  const [isChanged, setIsChanged] = useState(false);

  React.useEffect(() => {
    setOrder(ids);
    setIsChanged(false);
  }, [ids]);

  function move(index: number, dir: -1 | 1) {
    const next = [...order];
    const to = index + dir;
    if (to < 0 || to >= next.length) return;
    const item = next.splice(index, 1)[0];
    next.splice(to, 0, item);
    setOrder(next);
    setIsChanged(true);
  }

  async function commit() {
    await onReorder(order);
    setIsChanged(false);
  }

  function reset() {
    setOrder(ids);
    setIsChanged(false);
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reorder Tiers</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Drag tiers or use arrows to change display order
          </p>
        </div>
        {isChanged && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
            Unsaved changes
          </Badge>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {order.map((id, idx) => (
          <motion.div
            key={id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <GripVertical size={16} className="text-gray-400" />
            <Badge variant="secondary" className="font-mono text-xs w-8 justify-center">
              {idx + 1}
            </Badge>
            <div className="flex-1 text-sm text-gray-900 dark:text-white font-medium truncate">
              {id}
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => move(idx, -1)}
                disabled={idx === 0 || disabled}
                className="h-8 w-8 p-0"
                aria-label={`Move ${id} up`}
              >
                <ArrowUp size={14} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => move(idx, 1)}
                disabled={idx === order.length - 1 || disabled}
                className="h-8 w-8 p-0"
                aria-label={`Move ${id} down`}
              >
                <ArrowDown size={14} />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button 
          variant="outline" 
          onClick={reset}
          disabled={!isChanged || disabled}
          className="gap-2"
        >
          <RotateCcw size={16} />
          Reset
        </Button>
        <Button 
          onClick={commit} 
          disabled={!isChanged || disabled}
          className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Save size={16} />
          Save Order
        </Button>
      </div>
    </div>
  );
};