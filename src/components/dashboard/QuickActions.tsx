'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  FiEye,
} from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/dashboard.types';

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
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-200',
  },
  {
    id: 'support-inbox',
    title: 'Support Inbox',
    description: 'Check messages and inquiries',
    icon: FiInbox,
    color: 'bg-green-500 hover:bg-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-200',
  },
  {
    id: 'review-reports',
    title: 'Review Reports',
    description: 'Investigate user reports and complaints',
    icon: FiFlag,
    color: 'bg-orange-500 hover:bg-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-200',
  },
  {
    id: 'user-management',
    title: 'User Management',
    description: 'Manage user accounts and permissions',
    icon: FiUsers,
    color: 'bg-purple-500 hover:bg-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-200',
  },
];

const adminActions = [
  {
    id: 'manage-users',
    title: 'Manage Users',
    description: 'View and manage all user accounts',
    icon: FiUsers,
    color: 'bg-blue-500 hover:bg-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-200',
  },
  {
    id: 'view-tours',
    title: 'View Tours',
    description: 'Review and approve tour listings',
    icon: FiMapPin,
    color: 'bg-green-500 hover:bg-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-200',
  },
  {
    id: 'add-announcement',
    title: 'Add Announcement',
    description: 'Create new system announcements',
    icon: FiVolume2,
    color: 'bg-orange-500 hover:bg-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-200',
  },
  {
    id: 'finance-reports',
    title: 'Finance Reports',
    description: 'View revenue and financial analytics',
    icon: FiBarChart2,
    color: 'bg-purple-500 hover:bg-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-200',
  },
  {
    id: 'system-settings',
    title: 'System Settings',
    description: 'Configure system-wide settings',
    icon: FiSettings,
    color: 'bg-indigo-500 hover:bg-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/30',
    textColor: 'text-indigo-700 dark:text-indigo-200',
  },
  {
    id: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    description: 'View detailed analytics and insights',
    icon: FiEye,
    color: 'bg-teal-500 hover:bg-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-900/30',
    textColor: 'text-teal-700 dark:text-teal-200',
  },
];

export function QuickActions({ userRole, onAction, className }: QuickActionsProps) {
  const actions = userRole === 'admin' ? adminActions : supportActions;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FiPlus className="h-5 w-5" aria-hidden />
          Quick Actions
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Responsive grid:
            - xs: 1 col
            - sm: 2 cols
            - md: 3 cols
            - lg: 4 cols (if screen allows)
            Gap and min child width ensures better wrapping on narrow screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.18 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.985 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => onAction?.(action.id)}
                  aria-label={action.title}
                  className={cn(
                    'w-full p-3 rounded-lg flex items-start gap-3 transition-shadow duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    // keep the button neutral so colored badge stands out
                    'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  )}
                >
                  {/* Icon badge: fixed size so icons align */}
                  <div
                    className={cn(
                      'flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center',
                      action.bgColor,
                      'shadow-sm'
                    )}
                    aria-hidden
                  >
                    <Icon className={cn('h-5 w-5', action.textColor)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {action.title}
                      </h4>
                    </div>

                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300/90 line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
