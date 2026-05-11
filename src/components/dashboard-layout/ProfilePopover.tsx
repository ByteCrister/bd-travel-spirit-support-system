"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiSettings, FiLogOut, FiChevronDown } from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useCurrentUserStore } from "@/store/current-user.store";
import { USER_ROLE } from "@/constants/user.const";

interface ProfilePopoverProps {
  onViewProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}


export function ProfilePopover({ onViewProfile, onSettings, onLogout }: ProfilePopoverProps) {
  const { baseUser, fullUser, fetchFullUser, fetchBaseUser } = useCurrentUserStore();
  const [isOpen, setIsOpen] = useState(false);

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const base = await fetchBaseUser();

        if (base && base.role) {
          await fetchFullUser(base.role);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setInitialLoadComplete(true);
      }
    };

    // Only load if we haven't completed initial load or if baseUser is null
    if (!initialLoadComplete || !baseUser) {
      loadUserData();
    }
  }, [fetchBaseUser, fetchFullUser, initialLoadComplete, baseUser]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogoutClick = () => {
    onLogout?.();
    setIsOpen(false);
  };

  const togglePopover = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="relative">
        <motion.button
          onClick={togglePopover}
          className="flex items-center gap-2 rounded-xl p-1.5 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label={`Profile menu for ${fullUser?.fullName}`}
          aria-expanded={isOpen}
        >
          <Avatar className="h-8 w-8">
            {fullUser?.role === USER_ROLE.SUPPORT && (
              <AvatarImage src={fullUser?.avatar} alt={fullUser.fullName} />
            )}
            <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              {getInitials(fullUser?.fullName ?? '-')}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium truncate max-w-24 text-slate-900 dark:text-slate-100">{fullUser?.fullName}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-24">{fullUser?.role}</p>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="hidden md:block"
          >
            <FiChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />

              {/* Profile Panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20"
                role="dialog"
                aria-label="Profile menu"
              >
                {/* Profile Header */}
                <div className="flex items-center gap-3 p-4">
                  <Avatar className="h-12 w-12">
                    {fullUser?.role === USER_ROLE.SUPPORT &&
                      (<AvatarImage src={fullUser.avatar} alt={fullUser.fullName} />)
                    }

                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                      {getInitials(fullUser?.fullName ?? '-')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-slate-900 dark:text-slate-100">{fullUser?.fullName}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{fullUser?.email}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">{fullUser?.role}</p>
                  </div>
                </div>

                <Separator />

                {/* Menu Items */}
                <div className="p-2">
                  <motion.button
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onViewProfile?.();
                      setIsOpen(false);
                    }}
                  >
                    <FiUser className="h-4 w-4" />
                    View Profile
                  </motion.button>

                  <motion.button
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSettings?.();
                      setIsOpen(false);
                    }}
                  >
                    <FiSettings className="h-4 w-4" />
                    Settings
                  </motion.button>
                </div>

                <Separator />

                {/* Logout Button */}
                <div className="p-2">
                  <motion.button
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-600 dark:text-red-400 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogoutClick}
                  >
                    <FiLogOut className="h-4 w-4" />
                    Sign Out
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
