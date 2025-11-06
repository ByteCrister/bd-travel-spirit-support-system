// components/users/travelers/UsersToolbar.tsx
"use client";

import { useEffect, useState } from "react";
import { UserSortableField } from "@/types/user.table.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    FiRefreshCw,
    FiSearch,
    FiUsers,
    FiFilter,
    FiArrowUp,
    FiArrowDown,
    FiSettings,
    FiCheckCircle,
    FiX
} from "react-icons/fi";
import { UsersQuery } from "@/store/travelers.store";
import { ACCOUNT_STATUS, USER_ROLE } from "@/constants/user.const";
import { cn } from "@/lib/utils";

interface UsersToolbarProps {
    query: UsersQuery;
    onQueryChange: (partial: Partial<UsersQuery>) => void;
    onRefresh: () => void;
    totalUsers?: number;
    isLoading?: boolean;
}

export function UsersToolbar({
    query,
    onQueryChange,
    onRefresh,
    totalUsers = 0,
    isLoading = false
}: UsersToolbarProps) {
    const [searchLocal, setSearchLocal] = useState(query.search ?? "");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => onQueryChange({ search: searchLocal, page: 1 }), 300);
        return () => clearTimeout(t);
    }, [onQueryChange, searchLocal]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await onRefresh();
        setTimeout(() => setIsRefreshing(false), 500); // Smooth UX feedback
    };

    const clearFilters = () => {
        setSearchLocal("");
        onQueryChange({
            search: "",
            roles: "all",
            accountStatus: "all",
            isVerified: undefined,
            sortBy: undefined,
            sortDir: "asc",
            page: 1
        });
    };

    const hasActiveFilters = !!(
        query.search ||
        (query.roles && query.roles !== "all") ||
        (query.accountStatus && query.accountStatus !== "all") ||
        query.isVerified
    );

    const getRoleDisplayName = (role: string) => {
        const roleMap: Record<string, string> = {
            [USER_ROLE.TRAVELER]: "Travelers",
            [USER_ROLE.GUIDE]: "Guides",
            [USER_ROLE.SUPPORT]: "Support",
            [USER_ROLE.ADMIN]: "Admins"
        };
        return roleMap[role] || role;
    };

    const getStatusDisplayName = (status: string) => {
        const statusMap: Record<string, string> = {
            [ACCOUNT_STATUS.ACTIVE]: "Active Users",
            [ACCOUNT_STATUS.SUSPENDED]: "Suspended",
            [ACCOUNT_STATUS.BANNED]: "Banned"
        };
        return statusMap[status] || status;
    };

    return (
        <div className="space-y-4">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <FiUsers className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold text-foreground">Users Management</h2>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>•</span>
                        <span>{totalUsers.toLocaleString()} total users</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <FiX className="h-4 w-4 mr-1" />
                            Clear filters
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading || isRefreshing}
                        className="min-w-[100px]"
                    >
                        <FiRefreshCw className={cn(
                            "h-4 w-4 mr-2",
                            (isLoading || isRefreshing) && "animate-spin"
                        )} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Main Toolbar */}
            <div className="bg-card border border-border/50 rounded-lg shadow-sm">
                <div className="p-4 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users by name, email, or ID..."
                            value={searchLocal}
                            onChange={(e) => setSearchLocal(e.target.value)}
                            className="pl-10 h-10 bg-background/50 border-border/50 focus:bg-background"
                            aria-label="Search users"
                        />
                        {searchLocal && (
                            <button
                                onClick={() => setSearchLocal("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <FiX className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <Separator className="opacity-50" />

                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <FiFilter className="h-4 w-4" />
                            Filters:
                        </div>

                        {/* Role Filter */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Role
                            </label>
                            <Select
                                value={query.roles ?? "all"}
                                onValueChange={(v) =>
                                    onQueryChange({ roles: v === "all" ? "all" : v, page: 1 })
                                }
                            >
                                <SelectTrigger className="w-32 h-8 text-sm bg-background/50 border-border/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All roles</SelectItem>
                                    <SelectItem value={USER_ROLE.TRAVELER}>
                                        {getRoleDisplayName(USER_ROLE.TRAVELER)}
                                    </SelectItem>
                                    <SelectItem value={USER_ROLE.GUIDE}>
                                        {getRoleDisplayName(USER_ROLE.GUIDE)}
                                    </SelectItem>
                                    <SelectItem value={USER_ROLE.SUPPORT}>
                                        {getRoleDisplayName(USER_ROLE.SUPPORT)}
                                    </SelectItem>
                                    <SelectItem value={USER_ROLE.ADMIN}>
                                        {getRoleDisplayName(USER_ROLE.ADMIN)}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Status
                            </label>
                            <Select
                                value={query.accountStatus ?? "all"}
                                onValueChange={(v) =>
                                    onQueryChange({
                                        accountStatus: v === "all" ? "all" : v as ACCOUNT_STATUS,
                                        page: 1,
                                    })
                                }
                            >
                                <SelectTrigger className="w-32 h-8 text-sm bg-background/50 border-border/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All status</SelectItem>
                                    <SelectItem value={ACCOUNT_STATUS.ACTIVE}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            Active
                                        </div>
                                    </SelectItem>
                                    <SelectItem value={ACCOUNT_STATUS.SUSPENDED}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                            Suspended
                                        </div>
                                    </SelectItem>
                                    <SelectItem value={ACCOUNT_STATUS.BANNED}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                            Banned
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Verified Filter */}
                        <div className="flex items-center gap-3 px-3 py-1 rounded-md border border-border/50 bg-background/50">
                            <div className="flex items-center gap-2">
                                <FiCheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Verified Only
                                </span>
                            </div>
                            <Switch
                                checked={!!query.isVerified}
                                onCheckedChange={(v) => onQueryChange({
                                    isVerified: v ? true : undefined,
                                    page: 1
                                })}
                            />
                        </div>
                    </div>

                    <Separator className="opacity-50" />

                    {/* Sort and Display Options */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <FiSettings className="h-4 w-4" />
                                Display:
                            </div>

                            {/* Sort By */}
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Sort by
                                </label>
                                <Select
                                    value={query.sortBy ?? ""}
                                    onValueChange={(v) => onQueryChange({ sortBy: v as UserSortableField, page: 1 })}
                                >
                                    <SelectTrigger className="w-32 h-8 text-sm bg-background/50 border-border/50">
                                        <SelectValue placeholder="Default" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name">Name</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="role">Role</SelectItem>
                                        <SelectItem value="accountStatus">Status</SelectItem>
                                        <SelectItem value="createdAt">Created Date</SelectItem>
                                        <SelectItem value="lastLogin">Last Login</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sort Direction */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onQueryChange({
                                    sortDir: query.sortDir === "asc" ? "desc" : "asc",
                                    page: 1
                                })}
                                className="h-8 w-8 p-0 bg-background/50 border-border/50"
                            >
                                {query.sortDir === "desc" ? (
                                    <FiArrowDown className="h-4 w-4" />
                                ) : (
                                    <FiArrowUp className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        {/* Per Page */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Show
                            </label>
                            <Select
                                value={`${query.perPage ?? 20}`}
                                onValueChange={(v) => onQueryChange({ perPage: Number(v), page: 1 })}
                            >
                                <SelectTrigger className="w-20 h-8 text-sm bg-background/50 border-border/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-xs text-muted-foreground">per page</span>
                        </div>
                    </div>
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                    <div className="px-4 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-muted-foreground">Active filters:</span>
                            {query.search && (
                                <Badge variant="secondary" className="text-xs">
                                    Search: &quot;{query.search}&quot;
                                </Badge>
                            )}
                            {query.roles && query.roles !== "all" && (
                                <Badge variant="secondary" className="text-xs">
                                    Role: {getRoleDisplayName(query.roles)}
                                </Badge>
                            )}
                            {query.accountStatus && query.accountStatus !== "all" && (
                                <Badge variant="secondary" className="text-xs">
                                    Status: {getStatusDisplayName(query.accountStatus)}
                                </Badge>
                            )}
                            {query.isVerified && (
                                <Badge variant="secondary" className="text-xs">
                                    Verified only
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}