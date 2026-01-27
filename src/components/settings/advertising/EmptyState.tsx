"use client";

import React from "react";
import { motion } from "framer-motion";
import { HiPlus } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

interface Props {
  onCreate: () => void;
}

const EmptyState: React.FC<Props> = ({ onCreate }) => {
  return (
    <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="relative mb-6"
        >
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
            <FaBangladeshiTakaSign className="h-12 w-12 text-emerald-600" />
          </div>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full bg-emerald-200 -z-10"
          />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-semibold text-slate-900 mb-2"
        >
          No advertising prices yet
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-600 text-center max-w-md mb-8"
        >
          Get started by creating your first advertising price entry. Define placements,
          pricing, and duration options for your advertising platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="lg"
            onClick={onCreate}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-shadow"
          >
            <HiPlus className="mr-2 h-5 w-5" />
            Create First Price
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center gap-6 text-sm text-slate-500"
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Landing banners</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Popup modals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            <span>Email campaigns</span>
          </div>
        </motion.div>
      </motion.div>
    </Card>
  );
};

export default EmptyState;