// hooks/useUserModals.ts
"use client";

import { UserTableRow } from "@/types/user/user.table.types";
import { User } from "@/types/user/user.types";
import { useState, useCallback } from "react";

export function useUserModals() {
    const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [targetRow, setTargetRow] = useState<UserTableRow | null>(null);
    const [targetUser, setTargetUser] = useState<User | null>(null);

    const openProfile = useCallback((user: User | null) => {
        setTargetUser(user);
        setProfileDrawerOpen(true);
    }, []);

    const openEdit = useCallback((row: UserTableRow) => {
        setTargetRow(row);
        setEditModalOpen(true);
    }, []);

    const openDelete = useCallback((row: UserTableRow) => {
        setTargetRow(row);
        setDeleteDialogOpen(true);
    }, []);

    return {
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
    };
}
