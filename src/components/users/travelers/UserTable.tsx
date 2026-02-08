// components/users/travelers/UserTable.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserTableRow, UserSortableField, UserAction } from "@/types/user/user.table.types";
import { UserActionMenu } from "./UserActionMenu";
import {
    FiChevronUp,
    FiChevronDown,
    FiCheck,
    FiX,
    FiUsers,
    FiClock,
    FiCalendar,
    FiMail,
    FiShield,
    FiChevronLeft,
    FiChevronRight,
    FiMoreHorizontal,
    FiActivity
} from "react-icons/fi";
import { ACCOUNT_STATUS } from "@/constants/user.const";
import { cn } from "@/lib/utils";

interface UserTableProps {
    data: UserTableRow[];
    total: number;
    loading: boolean;
    currentPage: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onSortChange: (field: UserSortableField, dir: "asc" | "desc") => void;
    onRowAction: (action: UserAction, user: UserTableRow) => void;
    sortBy?: UserSortableField;
    sortDir?: "asc" | "desc";
    loadingMap?: Record<string, boolean>;
}

export function UserTable({
    data,
    total,
    loading,
    currentPage,
    perPage,
    onPageChange,
    onSortChange,
    onRowAction,
    sortBy,
    sortDir = "asc",
    loadingMap = {},
}: UserTableProps) {
    const pages = Math.max(1, Math.ceil(total / perPage));
    const startIndex = (currentPage - 1) * perPage + 1;
    const endIndex = Math.min(currentPage * perPage, total);

    const SortHeader = ({
        field,
        children,
        icon
    }: {
        field: UserSortableField;
        children: React.ReactNode;
        icon?: React.ReactNode;
    }) => {
        const active = sortBy === field;
        const isAsc = sortDir === "asc";

        return (
            <button
                className={cn(
                    "flex items-center gap-2 text-left font-medium transition-all duration-200",
                    "hover:text-primary group",
                    active && "text-primary"
                )}
                onClick={() => onSortChange(field, active && isAsc ? "desc" : "asc")}
                aria-label={`Sort by ${field}`}
            >
                {icon && <span className="text-muted-foreground group-hover:text-primary">{icon}</span>}
                <span>{children}</span>
                <div className={cn(
                    "transition-all duration-200",
                    active ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-60"
                )}>
                    {active ? (
                        isAsc ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />
                    ) : (
                        <FiChevronUp className="h-4 w-4" />
                    )}
                </div>
            </button>
        );
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case ACCOUNT_STATUS.ACTIVE:
                return {
                    variant: "default" as const,
                    color: "bg-green-500",
                    label: "Active",
                    icon: <FiActivity className="h-3 w-3" />
                };
            case ACCOUNT_STATUS.SUSPENDED:
                return {
                    variant: "secondary" as const,
                    color: "bg-yellow-500",
                    label: "Suspended",
                    icon: <FiClock className="h-3 w-3" />
                };
            case ACCOUNT_STATUS.BANNED:
                return {
                    variant: "destructive" as const,
                    color: "bg-red-500",
                    label: "Banned",
                    icon: <FiX className="h-3 w-3" />
                };
            default:
                return {
                    variant: "outline" as const,
                    color: "bg-gray-500",
                    label: status,
                    icon: <FiMoreHorizontal className="h-3 w-3" />
                };
        }
    };

    const formatRelativeTime = (date: string | Date) => {
        const now = new Date();
        const past = new Date(date);
        const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return past.toLocaleDateString();
    };

    const generatePageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(pages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < pages - 1) {
            rangeWithDots.push('...', pages);
        } else if (pages > 1) {
            rangeWithDots.push(pages);
        }

        return rangeWithDots;
    };

    return (
        <div className="space-y-4">
            {/* Table Container */}
            <div className="bg-card border border-border/50 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent border-border/50">
                                <TableHead className="font-semibold text-foreground py-4">
                                    <SortHeader field="name" icon={<FiUsers className="h-4 w-4" />}>
                                        User
                                    </SortHeader>
                                </TableHead>
                                <TableHead className="font-semibold text-foreground">
                                    <SortHeader field="email" icon={<FiMail className="h-4 w-4" />}>
                                        Contact
                                    </SortHeader>
                                </TableHead>
                                <TableHead className="font-semibold text-foreground">
                                    <SortHeader field="role" icon={<FiShield className="h-4 w-4" />}>
                                        Role & Status
                                    </SortHeader>
                                </TableHead>
                                <TableHead className="font-semibold text-foreground">
                                    <SortHeader field="accountStatus">
                                        Account
                                    </SortHeader>
                                </TableHead>
                                <TableHead className="font-semibold text-foreground">
                                    <SortHeader field="lastLogin" icon={<FiClock className="h-4 w-4" />}>
                                        Activity
                                    </SortHeader>
                                </TableHead>
                                <TableHead className="font-semibold text-foreground">
                                    <SortHeader field="createdAt" icon={<FiCalendar className="h-4 w-4" />}>
                                        Joined
                                    </SortHeader>
                                </TableHead>
                                <TableHead className="text-right font-semibold text-foreground">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    Array.from({ length: Math.min(perPage, 8) }).map((_, i) => (
                                        <TableRow key={`skeleton-${i}`} className="hover:bg-muted/20">
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="h-10 w-10 rounded-full" />
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-32" />
                                                        <Skeleton className="h-3 w-24" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                            <TableCell>
                                                <div className="space-y-2">
                                                    <Skeleton className="h-5 w-20" />
                                                    <Skeleton className="h-4 w-16" />
                                                </div>
                                            </TableCell>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="h-8 w-8 ml-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-16">
                                            <div className="text-center space-y-3">
                                                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                                    <FiUsers className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-foreground">No users found</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Try adjusting your filters or search criteria
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((user, index) => {
                                        const statusConfig = getStatusConfig(user.accountStatus);
                                        const isLoading = loadingMap[user._id];

                                        return (
                                            <motion.tr
                                                key={user._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{
                                                    duration: 0.2,
                                                    delay: index * 0.02
                                                }}
                                                className={cn(
                                                    "group hover:bg-muted/20 transition-colors duration-150",
                                                    isLoading && "opacity-50 pointer-events-none"
                                                )}
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                                                                <AvatarImage
                                                                    src={user.avatar ?? ""}
                                                                    alt={`${user.name} avatar`}
                                                                />
                                                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                                    {user.name.slice(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {user.isVerified && (
                                                                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                                                                    <FiCheck className="h-2 w-2 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-medium text-foreground truncate">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground truncate">
                                                                ID: {user._id.slice(-8)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium text-foreground">
                                                            {user.email}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {user.isVerified ? (
                                                                <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                                                                    <FiCheck className="h-3 w-3 mr-1" />
                                                                    Verified
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-orange-700 border-orange-200 bg-orange-50">
                                                                    <FiX className="h-3 w-3 mr-1" />
                                                                    Unverified
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="space-y-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className="font-medium bg-primary/10 text-primary border-primary/20"
                                                        >
                                                            {user.role}
                                                        </Badge>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("h-2 w-2 rounded-full", statusConfig.color)} />
                                                        <Badge
                                                            variant={statusConfig.variant}
                                                            className="gap-1 font-medium"
                                                        >
                                                            {statusConfig.icon}
                                                            {statusConfig.label}
                                                        </Badge>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium text-foreground">
                                                            {user.lastLogin ? formatRelativeTime(user.lastLogin) : "Never"}
                                                        </div>
                                                        {user.lastLogin && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {new Date(user.lastLogin).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="text-sm font-medium text-foreground">
                                                        {formatRelativeTime(user.createdAt)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end">
                                                        <UserActionMenu
                                                            user={user}
                                                            loadingMap={loadingMap}
                                                            onAction={(action) => onRowAction(action, user)}
                                                        />
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Enhanced Pagination */}
            {!loading && data.length > 0 && (
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Showing</span>
                        <span className="font-medium text-foreground">
                            {startIndex.toLocaleString()}-{endIndex.toLocaleString()}
                        </span>
                        <span>of</span>
                        <span className="font-medium text-foreground">
                            {total.toLocaleString()}
                        </span>
                        <span>users</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="h-8 px-3"
                        >
                            <FiChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-1 mx-2">
                            {generatePageNumbers().map((pageNum, idx) => (
                                pageNum === '...' ? (
                                    <span key={`dots-${idx}`} className="px-2 text-muted-foreground">
                                        ...
                                    </span>
                                ) : (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => onPageChange(pageNum as number)}
                                        className="h-8 w-8 p-0"
                                    >
                                        {pageNum}
                                    </Button>
                                )
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage >= pages}
                            className="h-8 px-3"
                        >
                            Next
                            <FiChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}