"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types/user/agent";
import { useOnlineAgentsStore } from "@/store/online-agents.store";

// ─── Neumorphism style tokens ────────────────────────────────
const NEU_PANEL =
  "absolute right-0 top-10 z-50 w-64 rounded-2xl p-2 " +
  "bg-[#E7E5E4] shadow-[8px_8px_20px_#c8c6c5,-8px_-8px_20px_#ffffff] border border-white/60";
const NEU_AVATAR_RING =
  "border-2 border-[#E7E5E4] shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_COUNT_BADGE =
  "ml-1.5 flex h-6 px-2 items-center justify-center rounded-lg " +
  "bg-[#E7E5E4] text-[10px] font-bold text-[#1E2938]/60 " +
  "font-[family-name:var(--font-space-mono)] " +
  "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_LIST_ITEM =
  "flex items-center gap-3 rounded-xl p-2 cursor-pointer " +
  "transition-all duration-200 " +
  "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50";
// ─────────────────────────────────────────────────────────────

export function AdminAvatars() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredAdmin, setHoveredAdmin] = useState<string | null>(null);

  const { agents, fetchOnlineAgents } = useOnlineAgentsStore();

  useEffect(() => { fetchOnlineAgents(); }, [fetchOnlineAgents]);

  const onlineAdmins: Agent[] = Object.values(agents);

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="relative">
      <motion.div
        className="flex items-center"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => { setIsExpanded(false); setHoveredAdmin(null); }}
        role="group"
        aria-label="Online administrators"
      >
        {/* Stacked avatars */}
        <div className="flex -space-x-2">
          {onlineAdmins.slice(0, 3).map((admin, index) => (
            <motion.div
              key={admin.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.08, type: "spring", stiffness: 200, damping: 15 }}
              className="relative"
              onMouseEnter={() => setHoveredAdmin(admin.id)}
              onMouseLeave={() => setHoveredAdmin(null)}
            >
              <motion.div whileHover={{ scale: 1.12, zIndex: 10 }} transition={{ duration: 0.15 }}>
                <Avatar className={cn("h-8 w-8", NEU_AVATAR_RING)}>
                  <AvatarImage src={admin.avatar} alt={admin.name} />
                  <AvatarFallback className="text-[10px] bg-[#006666] text-white font-bold font-[family-name:var(--font-space-mono)]">
                    {getInitials(admin.name)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              {/* Online pulse */}
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#E7E5E4] bg-[#00A63D]"
                animate={{ scale: [1, 1.25, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Hover tooltip */}
              <AnimatePresence>
                {hoveredAdmin === admin.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.85 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "absolute -top-9 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-2 py-1 rounded-lg",
                      "bg-[#1E2938] text-white text-[10px]",
                      "font-[family-name:var(--font-space-mono)]",
                      "shadow-[3px_3px_8px_rgba(0,0,0,0.3)]"
                    )}
                  >
                    {admin.name}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2938]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Count badge */}
        {onlineAdmins.length > 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className={NEU_COUNT_BADGE}
          >
            +{onlineAdmins.length - 3}
          </motion.div>
        )}
      </motion.div>

      {/* Expanded panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2 }}
            className={NEU_PANEL}
          >
            <div className="space-y-0.5">
              {onlineAdmins.map((admin, index) => (
                <motion.div
                  key={admin.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={NEU_LIST_ITEM}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={admin.avatar} alt={admin.name} />
                      <AvatarFallback className="text-[10px] bg-[#006666] text-white font-bold font-[family-name:var(--font-space-mono)]">
                        {getInitials(admin.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#E7E5E4] bg-[#00A63D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(NEU_HEADING, "text-xs truncate")}>{admin.name}</p>
                    <p className={cn(NEU_MUTED, "truncate")}>{admin.role}</p>
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