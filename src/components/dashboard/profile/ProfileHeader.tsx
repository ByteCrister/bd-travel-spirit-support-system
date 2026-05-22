"use client";

import { IBaseUser, CurrentUser } from "@/types/user/current-user.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Mail, Crown, Headphones, User } from "lucide-react";
import { format } from "date-fns";
import { USER_ROLE } from "@/constants/user.const";
import { motion } from "framer-motion";

// ── Neumorphism tokens ────────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MONO =
  "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_ICON_WELL =
  "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";

// Role-specific badge styles (neumorphic)
const ROLE_CONFIG = {
  [USER_ROLE.ADMIN]: {
    badge: "bg-[#006666]/15 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
    icon: Crown,
    accentLine: "from-[#006666]/40 via-[#006666]/20 to-transparent",
  },
  [USER_ROLE.SUPPORT]: {
    badge: "bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
    icon: Headphones,
    accentLine: "from-[#FE9900]/40 via-[#FE9900]/20 to-transparent",
  },
  default: {
    badge: "bg-[#1E2938]/10 text-[#1E2938]/70 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
    icon: User,
    accentLine: "from-[#1E2938]/20 via-[#1E2938]/10 to-transparent",
  },
};

interface ProfileHeaderProps {
  baseUser: IBaseUser;
  fullUser: CurrentUser | null;
}

export default function ProfileHeader({ baseUser, fullUser }: ProfileHeaderProps) {
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getDisplayName = () => {
    if (fullUser && "fullName" in fullUser && fullUser.fullName) return fullUser.fullName;
    if (fullUser && "user" in fullUser && fullUser.fullName) return fullUser.fullName;
    return "User";
  };

  const roleConfig =
    ROLE_CONFIG[baseUser.role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.default;
  const RoleIcon = roleConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className={`${NEU_CARD} relative overflow-hidden`}>
        {/* Subtle top accent stripe */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${roleConfig.accentLine} pointer-events-none`}
        />

        <div className="p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 22 }}
              className="relative shrink-0"
            >
              {/* Inset ring around avatar */}
              <div className={`${NEU_SURFACE_INSET} p-2 rounded-full`}>
                <Avatar className="h-28 w-28 border-4 border-white/80 shadow-[4px_4px_10px_#c8c6c5]">
                  <AvatarImage
                    src={fullUser && "avatar" in fullUser ? fullUser.avatar : undefined}
                  />
                  <AvatarFallback
                    className="text-3xl font-bold bg-[#006666] text-white font-[family-name:var(--font-space-mono)]"
                  >
                    {getInitials(getDisplayName())}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Online status dot */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                className="absolute bottom-2 right-2 h-5 w-5 rounded-full bg-[#00A63D] border-2 border-[#E7E5E4] shadow-[0_0_8px_#00A63D]"
              />
            </motion.div>

            {/* Info */}
            <div className="flex-1 space-y-4 min-w-0">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-3"
              >
                <h2 className={`text-2xl sm:text-3xl ${NEU_HEADING}`}>
                  {getDisplayName()}
                </h2>
                {/* Role badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ${roleConfig.badge}`}
                >
                  <RoleIcon className="h-3.5 w-3.5" />
                  {baseUser.role}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className={NEU_ICON_WELL}>
                    <Mail className="h-4 w-4 text-[#006666]" />
                  </div>
                  <div className="min-w-0">
                    <p className={NEU_LABEL}>Email</p>
                    <p className={`${NEU_MONO} text-sm font-medium truncate`}>
                      {baseUser.email}
                    </p>
                  </div>
                </div>

                {/* Member since */}
                <div className="flex items-center gap-3">
                  <div className={NEU_ICON_WELL}>
                    <Calendar className="h-4 w-4 text-[#006666]" />
                  </div>
                  <div>
                    <p className={NEU_LABEL}>Member Since</p>
                    <p className={`${NEU_MONO} text-sm font-medium`}>
                      {format(new Date(baseUser.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}