"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Admin {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  role: string;
}

const mockAdmins: Admin[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@travelspirit.com",
    avatar: "/avatars/sarah.jpg",
    isOnline: true,
    role: "Admin",
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike@travelspirit.com",
    avatar: "/avatars/mike.jpg",
    isOnline: true,
    role: "Support",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily@travelspirit.com",
    avatar: "/avatars/emily.jpg",
    isOnline: false,
    role: "Moderator",
  },
];

export function AdminAvatars() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredAdmin, setHoveredAdmin] = useState<string | null>(null);
  const onlineAdmins = mockAdmins.filter(admin => admin.isOnline);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleMouseEnter = () => {
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    setHoveredAdmin(null);
  };

  return (
    <div className="relative">
      <motion.div
        className="flex items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="group"
        aria-label="Online administrators"
      >
        {/* Stacked Avatars */}
        <div className="flex -space-x-2">
          {onlineAdmins.slice(0, 3).map((admin, index) => (
            <motion.div
              key={admin.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
              className="relative group"
              onMouseEnter={() => setHoveredAdmin(admin.id)}
              onMouseLeave={() => setHoveredAdmin(null)}
            >
              <motion.div
                whileHover={{ scale: 1.1, zIndex: 10 }}
                transition={{ duration: 0.2 }}
              >
                <Avatar className="h-8 w-8 border-2 border-background shadow-lg">
                  <AvatarImage src={admin.avatar} alt={admin.name} />
                  <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium">
                    {getInitials(admin.name)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              {/* Online indicator with pulse animation */}
              <motion.div 
                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-r from-green-400 to-emerald-500 shadow-sm"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Hover tooltip */}
              <AnimatePresence>
                {hoveredAdmin === admin.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs px-2 py-1 rounded-lg whitespace-nowrap z-20"
                  >
                    {admin.name}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Expand indicator */}
        {onlineAdmins.length > 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 shadow-sm"
          >
            +{onlineAdmins.length - 3}
          </motion.div>
        )}
      </motion.div>

      {/* Expanded List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
                          className="absolute right-0 top-10 z-50 w-64 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20"
          >
            <div className="space-y-1">
              {mockAdmins.map((admin, index) => (
                <motion.div
                  key={admin.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-2 transition-all duration-200 cursor-pointer",
                    "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 hover:scale-[1.02]"
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={admin.avatar} alt={admin.name} />
                      <AvatarFallback className="text-xs">
                        {getInitials(admin.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900",
                      admin.isOnline ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-slate-400"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-slate-900 dark:text-slate-100">{admin.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {admin.role} • {admin.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
