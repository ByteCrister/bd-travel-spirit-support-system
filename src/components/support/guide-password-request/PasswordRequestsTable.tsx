// components/guide-password-request/PasswordRequestsTable.tsx
"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Mail,
  Calendar,
  User,
} from "lucide-react";
import { PasswordRequestDto } from "@/types/guide/guide-forgot-password.types";
import { FORGOT_PASSWORD_STATUS } from "@/constants/guide-forgot-password.const";
import { formatDistanceToNow, format } from "date-fns";
import TableSkeleton from "./skeletons/TableSkeleton";
import { usePasswordRequestStore } from "@/store/guide/guide-password-request.store";

const STATUS_CONFIG = {
  [FORGOT_PASSWORD_STATUS.PENDING]: {
    label: "Pending",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  [FORGOT_PASSWORD_STATUS.APPROVED]: {
    label: "Approved",
    icon: CheckCircle,
    variant: "default" as const,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  [FORGOT_PASSWORD_STATUS.REJECTED]: {
    label: "Rejected",
    icon: XCircle,
    variant: "destructive" as const,
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
  },
  [FORGOT_PASSWORD_STATUS.EXPIRED]: {
    label: "Expired",
    icon: AlertCircle,
    variant: "outline" as const,
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
  },
};

interface PasswordRequestsTableProps {
  onSelectRequest: (request: PasswordRequestDto) => void;
}

const tableRowVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
};

export function PasswordRequestsTable({ onSelectRequest }: PasswordRequestsTableProps) {
  const { requests, isFetching } = usePasswordRequestStore();

  if (isFetching && requests.length === 0) {
    return <TableSkeleton />;
  }

  if (requests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center py-16 border border-slate-200 rounded-lg bg-slate-50/50"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4 shadow-sm"
        >
          <Mail className="h-8 w-8 text-slate-400" />
        </motion.div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          No password requests found
        </h3>
        <p className="text-sm text-slate-600">
          Try adjusting your filters or check back later.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700">Guide</TableHead>
              <TableHead className="font-semibold text-slate-700">Reason</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700">Submitted</TableHead>
              <TableHead className="font-semibold text-slate-700">Expires</TableHead>
              <TableHead className="font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {requests.map((request, index) => (
                <motion.tr
                  key={request.id}
                  custom={index}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -20 }}
                  className="cursor-pointer hover:bg-slate-50/50 transition-colors duration-200 border-b border-slate-100 last:border-0 group"
                  onClick={() => onSelectRequest(request)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 ring-2 ring-slate-100 group-hover:ring-slate-200 transition-all">
                          <AvatarImage src={request.user.avatarUrl || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white font-medium">
                            {request.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-white flex items-center justify-center">
                          <User className="h-2 w-2 text-slate-600" />
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-medium text-slate-900 group-hover:text-slate-950 transition-colors">
                          {request.user.name}
                        </p>
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {request.user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate text-slate-700 group-hover:text-slate-900 transition-colors">
                      {request.reason}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-900">
                        {format(new Date(request.createdAt), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-slate-600">
                        {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${
                        new Date(request.expiresAt) < new Date() 
                          ? "bg-rose-50" 
                          : "bg-slate-50"
                      }`}>
                        <Calendar className={`h-3.5 w-3.5 ${
                          new Date(request.expiresAt) < new Date() 
                            ? "text-rose-600" 
                            : "text-slate-500"
                        }`} />
                      </div>
                      <span className={`text-sm font-medium ${
                        new Date(request.expiresAt) < new Date() 
                          ? "text-rose-700" 
                          : "text-slate-700"
                      }`}>
                        {format(new Date(request.expiresAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRequest(request);
                      }}
                      className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Badge 
        variant={config.variant} 
        className={`
          flex items-center gap-1.5 w-fit px-2.5 py-1
          ${config.bgColor} ${config.color} ${config.borderColor}
          border font-medium shadow-sm
        `}
      >
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </Badge>
    </motion.div>
  );
}