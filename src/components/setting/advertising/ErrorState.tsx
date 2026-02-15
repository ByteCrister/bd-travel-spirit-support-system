"use client";

import React from "react";
import { motion } from "framer-motion";
import { HiExclamationCircle, HiRefresh } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  onRetry: () => void;
}

const ErrorState: React.FC<Props> = ({ onRetry }) => {
  return (
    <Card className="border-red-200 bg-red-50/50">
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
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
            <HiExclamationCircle className="h-12 w-12 text-red-600" />
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
            className="absolute inset-0 rounded-full bg-red-200 -z-10"
          />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-semibold text-slate-900 mb-2"
        >
          Failed to load advertising settings
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-600 text-center max-w-md mb-8"
        >
          We encountered an error while loading your advertising configuration.
          Please check your connection and try again.
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
            onClick={onRetry}
            variant="outline"
            className="border-red-300 hover:bg-red-100 hover:border-red-400"
          >
            <HiRefresh className="mr-2 h-5 w-5" />
            Retry
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-sm text-slate-500 text-center"
        >
          <p>If the problem persists, please contact support</p>
        </motion.div>
      </motion.div>
    </Card>
  );
};

export default ErrorState;