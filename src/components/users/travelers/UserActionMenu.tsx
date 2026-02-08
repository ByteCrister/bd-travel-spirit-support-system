// components/users/UserActionMenu.tsx
"use client";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserAction, UserTableRow } from "@/types/user/user.table.types";
import { FiMoreVertical, FiUser, FiEdit3, FiCheckCircle, FiShield, FiRotateCcw, FiTrash2, FiArrowUpCircle, FiPauseCircle } from "react-icons/fi";
import { useState } from "react";

interface UserActionMenuProps {
    user: UserTableRow;
    loadingMap: Record<string, boolean>;
    onAction: (action: UserAction) => void;
}

export function UserActionMenu({ user, loadingMap, onAction }: UserActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const isBusy = !!loadingMap[user._id];

    const handleAction = (action: UserAction, event?: React.MouseEvent) => {
        // Prevent event bubbling that might cause issues
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Close the dropdown immediately
        setIsOpen(false);

        // Execute the action with a small delay to ensure smooth UX
        setTimeout(() => {
            try {
                onAction(action);
            } catch (error) {
                console.error(`Error executing action ${action}:`, error);
                // You might want to show a toast notification here
            }
        }, 100);
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Actions for ${user.name}`}
                    disabled={isBusy}
                    className="h-8 w-8 hover:bg-muted"
                >
                    <FiMoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" side="bottom" sideOffset={4}>
                <DropdownMenuItem
                    onClick={(e) => handleAction("viewProfile", e)}
                    aria-label="View profile"
                    className="cursor-pointer"
                >
                    <FiUser className="mr-2 h-4 w-4" />
                    View Full Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={(e) => handleAction("edit", e)}
                    aria-label="Edit user"
                    className="cursor-pointer"
                >
                    <FiEdit3 className="mr-2 h-4 w-4" />
                    Edit User Information
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={(e) => handleAction("activate", e)}
                    aria-label="Activate account"
                    className="cursor-pointer"
                >
                    <FiCheckCircle className="mr-2 h-4 w-4" />
                    Activate
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={(e) => handleAction("suspend", e)}
                    aria-label="Suspend account"
                    className="cursor-pointer"
                >
                    <FiPauseCircle className="mr-2 h-4 w-4" />
                    Suspend
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={(e) => handleAction("verify", e)}
                    aria-label="Verify user"
                    className="cursor-pointer"
                >
                    <FiShield className="mr-2 h-4 w-4" />
                    Verify
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={(e) => handleAction("upgradeOrganizer", e)}
                    aria-label="Upgrade to organizer"
                    className="cursor-pointer"
                >
                    <FiArrowUpCircle className="mr-2 h-4 w-4" />
                    Upgrade to Organizer
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={(e) => handleAction("resetPassword", e)}
                    aria-label="Reset password"
                    className="cursor-pointer"
                >
                    <FiRotateCcw className="mr-2 h-4 w-4" />
                    Reset Password
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={(e) => handleAction("delete", e)}
                    className="text-destructive cursor-pointer focus:text-destructive"
                    aria-label="Delete user"
                >
                    <FiTrash2 className="mr-2 h-4 w-4" />
                    Delete User
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}