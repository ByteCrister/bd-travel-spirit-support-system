
// Enhanced Profile Header Component
import { IBaseUser, CurrentUser } from "@/types/current-user.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, Mail, Crown, Headphones, User } from "lucide-react";
import { format } from "date-fns";
import { USER_ROLE } from "@/constants/user.const";
import { motion } from "framer-motion";

interface ProfileHeaderProps {
  baseUser: IBaseUser;
  fullUser: CurrentUser | null;
}

export default function ProfileHeader({ baseUser, fullUser }: ProfileHeaderProps) {
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDisplayName = () => {
    if (fullUser && "fullName" in fullUser && fullUser.fullName) {
      return fullUser.fullName;
    }
    if (fullUser && "user" in fullUser && fullUser.fullName) {
      return fullUser.fullName;
    }
    return "User";
  };

  const getRoleConfig = (role: string) => {
    switch (role) {
      case USER_ROLE.ADMIN:
        return {
          className: "bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-600 text-white border-0 shadow-lg shadow-purple-500/30",
          icon: Crown,
          gradient: "from-purple-500/15 via-fuchsia-400/10 to-transparent",
          glowColor: "from-purple-500/30 via-fuchsia-500/30 to-purple-600/30",
          ringColor: "from-purple-400/40 to-fuchsia-400/40"
        };
      case USER_ROLE.SUPPORT:
        return {
          className: "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white border-0 shadow-lg shadow-blue-500/30",
          icon: Headphones,
          gradient: "from-blue-500/15 via-cyan-400/10 to-transparent",
          glowColor: "from-blue-500/30 via-cyan-500/30 to-blue-600/30",
          ringColor: "from-blue-400/40 to-cyan-400/40"
        };
      default:
        return {
          className: "bg-gradient-to-r from-secondary via-secondary/95 to-secondary/90 text-secondary-foreground border shadow-sm",
          icon: User,
          gradient: "from-secondary/30 via-secondary/15 to-transparent",
          glowColor: "from-secondary/25 via-muted/30 to-secondary/25",
          ringColor: "from-secondary/40 to-muted/40"
        };
    }
  };

  const roleConfig = getRoleConfig(baseUser.role);
  const RoleIcon = roleConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border-2 shadow-2xl backdrop-blur-sm">
        {/* Enhanced Background Elements */}
        <div className={`absolute inset-0 bg-gradient-to-br ${roleConfig.gradient} pointer-events-none`} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/8 via-primary/4 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        
        <div className="relative p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            {/* Enhanced Avatar Section */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative group"
            >
              {/* Multi-layer Glow Effect */}
              <motion.div 
                className={`absolute -inset-3 bg-gradient-to-br ${roleConfig.glowColor} rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-all duration-500`}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Avatar Container with animated ring */}
              <div className="relative">
                {/* Outer animated ring */}
                <motion.div 
                  className={`absolute -inset-2 bg-gradient-to-br ${roleConfig.ringColor} rounded-full opacity-60`}
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                {/* Inner ring */}
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 rounded-full" />
                
                <Avatar className="relative h-32 w-32 border-[5px] border-background shadow-2xl ring-2 ring-primary/30">
                  <AvatarImage src={fullUser && "avatar" in fullUser ? fullUser.avatar : undefined} />
                  <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary via-primary to-primary/80 text-white">
                    {getInitials(getDisplayName())}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* Enhanced Status Indicator */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                className="absolute bottom-2 right-2 flex items-center justify-center"
              >
                <motion.div 
                  className="absolute h-7 w-7 bg-emerald-500/40 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <div className="relative h-7 w-7 bg-gradient-to-br from-emerald-400 to-emerald-600 border-[3px] border-background rounded-full shadow-lg shadow-emerald-500/50" />
              </motion.div>
            </motion.div>

            {/* Enhanced User Information */}
            <div className="flex-1 space-y-5 min-w-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/80 bg-clip-text">
                    {getDisplayName()}
                  </h2>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    <Badge className={`${roleConfig.className} px-4 py-1.5`}>
                      <RoleIcon className="h-4 w-4 mr-2" />
                      <span className="font-bold text-sm">{baseUser.role}</span>
                    </Badge>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
              >
                {/* Enhanced Email Card */}
                <motion.div 
                  className="flex items-center gap-4 group cursor-default"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-muted via-muted/80 to-muted/60 flex items-center justify-center group-hover:from-blue-500/15 group-hover:via-cyan-500/10 group-hover:to-blue-500/5 transition-all duration-300 shadow-md group-hover:shadow-lg">
                      <Mail className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 transition-colors duration-300" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm font-semibold text-foreground truncate">{baseUser.email}</p>
                  </div>
                </motion.div>

                {/* Enhanced Member Since Card */}
                <motion.div 
                  className="flex items-center gap-4 group cursor-default"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-muted via-muted/80 to-muted/60 flex items-center justify-center group-hover:from-purple-500/15 group-hover:via-pink-500/10 group-hover:to-purple-500/5 transition-all duration-300 shadow-md group-hover:shadow-lg">
                      <Calendar className="h-5 w-5 text-muted-foreground group-hover:text-purple-600 transition-colors duration-300" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Member Since</p>
                    <p className="text-sm font-semibold text-foreground">
                      {format(new Date(baseUser.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Bottom shine effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </Card>
    </motion.div>
  );
}