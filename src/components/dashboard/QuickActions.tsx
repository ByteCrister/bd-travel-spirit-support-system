"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FiUsers, 
  FiMapPin, 
  FiVolume2, 
  FiBarChart2,
  FiMessageSquare,
  FiInbox,
  FiFlag,
  FiSettings,
  FiPlus,
  FiEye
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/dashboard.types";

interface QuickActionsProps {
  userRole: UserRole;
  onAction?: (action: string) => void;
  className?: string;
}

const supportActions = [
  {
    id: 'manage-tickets',
    title: 'Manage Tickets',
    description: 'View and respond to support tickets',
    icon: FiMessageSquare,
    color: 'bg-blue-500 hover:bg-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'support-inbox',
    title: 'Support Inbox',
    description: 'Check messages and inquiries',
    icon: FiInbox,
    color: 'bg-green-500 hover:bg-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    textColor: 'text-green-600 dark:text-green-400',
  },
  {
    id: 'review-reports',
    title: 'Review Reports',
    description: 'Investigate user reports and complaints',
    icon: FiFlag,
    color: 'bg-orange-500 hover:bg-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    textColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'user-management',
    title: 'User Management',
    description: 'Manage user accounts and permissions',
    icon: FiUsers,
    color: 'bg-purple-500 hover:bg-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
];

const adminActions = [
  {
    id: 'manage-users',
    title: 'Manage Users',
    description: 'View and manage all user accounts',
    icon: FiUsers,
    color: 'bg-blue-500 hover:bg-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'view-tours',
    title: 'View Tours',
    description: 'Review and approve tour listings',
    icon: FiMapPin,
    color: 'bg-green-500 hover:bg-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    textColor: 'text-green-600 dark:text-green-400',
  },
  {
    id: 'add-announcement',
    title: 'Add Announcement',
    description: 'Create new system announcements',
    icon: FiVolume2,
    color: 'bg-orange-500 hover:bg-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    textColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'finance-reports',
    title: 'Finance Reports',
    description: 'View revenue and financial analytics',
    icon: FiBarChart2,
    color: 'bg-purple-500 hover:bg-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'system-settings',
    title: 'System Settings',
    description: 'Configure system-wide settings',
    icon: FiSettings,
    color: 'bg-indigo-500 hover:bg-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    textColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    description: 'View detailed analytics and insights',
    icon: FiEye,
    color: 'bg-teal-500 hover:bg-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-950/20',
    textColor: 'text-teal-600 dark:text-teal-400',
  },
];

export function QuickActions({ userRole, onAction, className }: QuickActionsProps) {
  const actions = userRole === 'admin' ? adminActions : supportActions;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FiPlus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="ghost"
                className={cn(
                  "h-auto p-4 w-full flex flex-col items-start gap-3 text-left transition-all duration-200 hover:shadow-md",
                  action.bgColor
                )}
                onClick={() => onAction?.(action.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={cn(
                    "p-2 rounded-lg",
                    action.bgColor
                  )}>
                    <action.icon className={cn("h-5 w-5", action.textColor)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {action.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
