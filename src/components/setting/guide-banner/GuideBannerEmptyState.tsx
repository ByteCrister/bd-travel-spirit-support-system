"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { ImagePlus, Sparkles, ArrowRight, Layers } from "lucide-react";
import GuideBannerForm from "./GuideBannerForm";

export default function GuideBannerEmptyState() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden border-2 border-dashed border-gray-200 bg-gradient-to-br from-white via-gray-50/50 to-emerald-50/30 backdrop-blur-sm shadow-xl">
          {/* Animated background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity,
                ease: "linear" 
              }}
              className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-200/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ 
                rotate: [360, 0],
                scale: [1, 1.3, 1]
              }}
              transition={{ 
                duration: 25, 
                repeat: Infinity,
                ease: "linear" 
              }}
              className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl"
            />
          </div>

          <div className="relative p-12 text-center space-y-6">
            {/* Animated icon stack */}
            <motion.div 
              className="flex justify-center items-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
              }}
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative z-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 shadow-2xl"
                >
                  <ImagePlus className="w-12 h-12 text-white" />
                </motion.div>
                
                {/* Floating sparkles */}
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-6 h-6 text-amber-400 fill-amber-400" />
                </motion.div>
                
                <motion.div
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -bottom-2 -left-2"
                >
                  <Layers className="w-5 h-5 text-blue-400" />
                </motion.div>

                {/* Glow effect */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-emerald-400 rounded-2xl blur-2xl -z-10"
                />
              </div>
            </motion.div>

            {/* Text content with staggered animation */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-emerald-700 bg-clip-text text-transparent">
                No guide banners yet
              </h3>
              <p className="text-base text-gray-600 max-w-md mx-auto leading-relaxed">
                Create your first banner to guide users through your application with beautiful, engaging visuals
              </p>
            </motion.div>

            {/* Feature highlights */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4 pt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {[
                "Easy to create",
                "Fully customizable",
                "Drag to reorder"
              ].map((feature, idx) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex items-center gap-1.5 text-sm text-gray-600 bg-white/80 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {feature}
                </motion.div>
              ))}
            </motion.div>

            {/* CTA button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                onClick={() => setOpen(true)}
              >
                <ImagePlus className="w-5 h-5 mr-2" />
                Create your first banner
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight className="w-5 h-5 ml-2" />
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
      
      {open && (
        <GuideBannerForm
          mode="create"
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}