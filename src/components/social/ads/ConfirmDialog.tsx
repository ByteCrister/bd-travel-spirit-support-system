'use client';

import * as React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'; // shadcn wrapper path - adjust if different

export interface ConfirmDialogProps {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'danger';
    children?: React.ReactNode; // trigger element
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onConfirm?: () => Promise<void> | void;
}

export function ConfirmDialog({
    title = 'Are you sure?',
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    children,
    open,
    onOpenChange,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}>
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
