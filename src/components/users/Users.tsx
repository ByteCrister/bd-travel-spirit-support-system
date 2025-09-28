// app/users/page.tsx
"use client";

import { useEffect, useMemo, useCallback, useRef } from "react";
import { UsersToolbar } from "@/components/users/UsersToolbar";
import { UserTable } from "@/components/users/UserTable";
import { UserProfileDrawer } from "@/components/users/user-drawer/UserProfileDrawer";
import { EditUserModal } from "@/components/users/EditUserModal";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { SuspendUserDialog } from "@/components/users/SuspendUserDialog";
import { useUserModals } from "@/hooks/useUserModals";
import { UserAction, UserSortableField, UserTableRow } from "@/types/user.table.types";
import { motion } from "framer-motion";
import useUsersStore, { clearUsersCache, forceRefreshCurrent } from "@/store/useUsersManagementStore";
import { ACCOUNT_STATUS, USER_ROLE } from "@/constants/user.const";
import { User, Suspension } from "@/types/user.types";
import { showToast } from "../global/showToast";
import UserHeader from "./UserHeader";
import { useState } from "react";

export default function Users() {
    const {
        fetchUsers,
        query,
        setQuery,
        currentData,
        total,
        loading,
        error,
        userActionLoading,
        verifyUser,
        upgradeToOrganizer,
        resetPassword,
        deleteUser,
        suspendUser,
        patchUserOptimistic,
        setSelectedUser,
        selectedUser,
    } = useUsersStore();

    const {
        profileDrawerOpen,
        setProfileDrawerOpen,
        editModalOpen,
        setEditModalOpen,
        deleteDialogOpen,
        setDeleteDialogOpen,
        targetRow,
        targetUser,
        setTargetUser,
        openProfile,
        openEdit,
        openDelete,
    } = useUserModals();

    // State for suspend dialog
    const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
    const [suspendTargetUser, setSuspendTargetUser] = useState<UserTableRow | null>(null);

    // Use ref to prevent stale closures
    const actionsInProgress = useRef(new Set<string>());

    // Fetch data on mount and whenever query changes
    useEffect(() => {
        fetchUsers({ useCache: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    // Memoize list to avoid re-computation warnings
    const list = useMemo(() => currentData?.data ?? [], [currentData]);

    const verifiedCount = useMemo(() => list.filter((u) => u.isVerified).length, [list]);
    const organizerCount = useMemo(() => list.filter((u) => u.role === USER_ROLE.GUIDE).length, [list]);

    // Helper function to convert UserTableRow to User
    const convertToFullUser = useCallback((user: UserTableRow): User => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role as USER_ROLE,
        avatar: user.avatar,
        isVerified: user.isVerified,
        accountStatus: user.accountStatus as ACCOUNT_STATUS,
        isActive: user.isActive,
        bookingHistory: [],
        cart: [],
        wishlist: [],
        paymentMethods: [],
        preferences: { language: "en", currency: "USD" },
        loginAttempts: 0,
        createdAt: user.createdAt,
        updatedAt: user.createdAt,
    }), []);

    const onRowAction = useCallback(async (action: UserAction, user: UserTableRow) => {
        // Prevent duplicate actions
        const actionKey = `${action}-${user._id}`;
        if (actionsInProgress.current.has(actionKey)) {
            console.warn(`Action ${action} already in progress for user ${user._id}`);
            return;
        }

        actionsInProgress.current.add(actionKey);

        try {
            switch (action) {
                case "viewProfile": {
                    const fullUser = convertToFullUser(user);
                    setSelectedUser(fullUser);
                    // Use the converted user directly instead of relying on state
                    setTargetUser(fullUser);
                    openProfile(fullUser);
                    setProfileDrawerOpen(true);
                    break;
                }

                case "edit": {
                    const fullUser = convertToFullUser(user);
                    setSelectedUser(fullUser);
                    openEdit(user);
                    setEditModalOpen(true);
                    break;
                }

                case "activate": {
                    try {
                        await patchUserOptimistic(user._id, { accountStatus: ACCOUNT_STATUS.ACTIVE });
                        showToast.success(
                            "Status updated",
                            `${user.name} is now active.`
                        );
                    } catch (error) {
                        console.error("Failed to activate user:", error);
                        showToast.error(
                            "Update failed",
                            `Could not activate ${user.name}. Please try again.`
                        );
                    }
                    break;
                }

                case "suspend": {
                    setSuspendTargetUser(user);
                    setSuspendDialogOpen(true);
                    break;
                }

                case "verify": {
                    try {
                        const success = await verifyUser(user._id);
                        if (success) {
                            showToast.success("User verified", `${user.name} is now verified.`);
                        } else {
                            showToast.error("Verification failed", `Could not verify ${user.name}.`);
                        }
                    } catch (error) {
                        console.error("Verification error:", error);
                        showToast.error("Verification failed", "An error occurred during verification.");
                    }
                    break;
                }

                case "upgradeOrganizer": {
                    try {
                        const success = await upgradeToOrganizer(user._id);
                        if (success) {
                            showToast.success("Upgraded to organizer", `${user.name} is now an organizer.`);
                        } else {
                            showToast.error("Upgrade failed", `Could not upgrade ${user.name}.`);
                        }
                    } catch (error) {
                        console.error("Upgrade error:", error);
                        showToast.error("Upgrade failed", "An error occurred during upgrade.");
                    }
                    break;
                }

                case "resetPassword": {
                    try {
                        const success = await resetPassword(user._id);
                        if (success) {
                            showToast.success("Password reset initiated", `Reset email sent to ${user.email}`);
                        } else {
                            showToast.error("Reset failed", "Could not initiate password reset.");
                        }
                    } catch (error) {
                        console.error("Reset password error:", error);
                        showToast.error("Reset failed", "An error occurred during password reset.");
                    }
                    break;
                }

                case "delete": {
                    const fullUser = convertToFullUser(user);
                    setSelectedUser(fullUser);
                    openDelete(user);
                    setDeleteDialogOpen(true);
                    break;
                }

                default:
                    console.warn(`Unknown action: ${action}`);
            }
        } catch (error) {
            console.error(`Error handling action ${action}:`, error);
            showToast.error("Action failed", "An unexpected error occurred. Please try again.");
        } finally {
            // Always clean up the action key
            actionsInProgress.current.delete(actionKey);
        }
    }, [
        convertToFullUser,
        setSelectedUser,
        setTargetUser,
        openProfile,
        setProfileDrawerOpen,
        openEdit,
        setEditModalOpen,
        patchUserOptimistic,
        verifyUser,
        upgradeToOrganizer,
        resetPassword,
        openDelete,
        setDeleteDialogOpen,
    ]);

    // Strongly type the sort handler
    const handleSortChange = useCallback(
        (field: UserSortableField, dir: "asc" | "desc") => {
            setQuery({ sortBy: field, sortDir: dir, page: 1 });
        },
        [setQuery]
    );

    const handlePageChange = useCallback((page: number) => {
        setQuery({ page });
    }, [setQuery]);

    const handleRefresh = useCallback(() => {
        clearUsersCache();
        forceRefreshCurrent();
    }, []);

    const handleEditSubmit = useCallback(async (patch: Partial<User>) => {
        if (!selectedUser) return;

        try {
            await patchUserOptimistic(selectedUser._id, patch);
            showToast.success("Profile Updated", "Changes applied successfully.");
            setEditModalOpen(false);
        } catch (error) {
            console.error("Edit user error:", error);
            showToast.error("Update failed", "Could not save changes. Please try again.");
        }
    }, [selectedUser, patchUserOptimistic, setEditModalOpen]);

    const handleDeleteConfirm = useCallback(async () => {
        if (!targetRow) return;

        try {
            const success = await deleteUser(targetRow._id);
            setDeleteDialogOpen(false);

            if (success) {
                showToast.success("User deleted", `${targetRow.name} has been removed.`);
                forceRefreshCurrent();
            } else {
                showToast.error("Delete failed", `Could not delete ${targetRow.name}.`);
            }
        } catch (error) {
            console.error("Delete user error:", error);
            setDeleteDialogOpen(false);
            showToast.error("Delete failed", "An error occurred while deleting the user.");
        }
    }, [targetRow, deleteUser, setDeleteDialogOpen]);

    const handleSuspendConfirm = useCallback(async (suspensionData: Omit<Suspension, "suspendedBy" | "createdAt">) => {
        if (!suspendTargetUser) return;

        try {
            const fullSuspension: Suspension = {
                ...suspensionData,
                suspendedBy: 'get your logged-in admin ID', // get your logged-in admin ID
                createdAt: new Date().toISOString(),
            };

            const success = await suspendUser(suspendTargetUser._id, fullSuspension);

            setSuspendDialogOpen(false);
            setSuspendTargetUser(null);

            if (success) {
                showToast.success("User suspended", `${suspendTargetUser.name} has been suspended.`);
                forceRefreshCurrent();
            } else {
                showToast.error("Suspension failed", `Could not suspend ${suspendTargetUser.name}.`);
            }
        } catch (error) {
            console.error("Suspend user error:", error);
            setSuspendDialogOpen(false);
            setSuspendTargetUser(null);
            showToast.error("Suspension failed", "An error occurred while suspending the user.");
        }
    }, [suspendTargetUser, suspendUser]);

    return (
        <div className="space-y-6 p-4">
            {/* Header KPIs */}
            <UserHeader
                total={total ?? 0}
                verifiedCount={verifiedCount ?? 0}
                organizerCount={organizerCount ?? 0}
            />

            {/* Toolbar */}
            <UsersToolbar
                query={query}
                onQueryChange={setQuery}
                onRefresh={handleRefresh}
                totalUsers={total}
                isLoading={loading}
            />

            {/* Error banner */}
            {error && (
                <div className="rounded-md bg-destructive/10 text-destructive p-3 border border-destructive/20">
                    <div className="font-medium">Error loading users</div>
                    <div className="text-sm mt-1">{error}</div>
                </div>
            )}

            {/* Table */}
            <UserTable
                data={list}
                total={currentData?.total ?? 0}
                loading={loading}
                currentPage={query.page ?? 1}
                perPage={query.perPage ?? 20}
                onPageChange={handlePageChange}
                onSortChange={handleSortChange}
                onRowAction={onRowAction}
                sortBy={query.sortBy}
                sortDir={query.sortDir ?? "asc"}
                loadingMap={userActionLoading}
            />

            {/* Modals / Drawer */}
            <UserProfileDrawer
                user={selectedUser ?? null}
                open={profileDrawerOpen}
                onOpenChange={setProfileDrawerOpen}
            />

            <EditUserModal
                user={selectedUser ?? null}
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                saving={false}
                onSubmit={handleEditSubmit}
            />

            <DeleteUserDialog
                user={targetRow}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                confirming={false}
                onConfirm={handleDeleteConfirm}
            />

            <SuspendUserDialog
                user={suspendTargetUser}
                open={suspendDialogOpen}
                onOpenChange={setSuspendDialogOpen}
                suspending={!!userActionLoading[suspendTargetUser?._id ?? ""]}
                onConfirm={handleSuspendConfirm}
            />

            {/* Subtle first-load shimmer */}
            {loading && !currentData && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.35 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 pointer-events-none bg-background/50"
                    aria-hidden="true"
                />
            )}
        </div>
    );
}