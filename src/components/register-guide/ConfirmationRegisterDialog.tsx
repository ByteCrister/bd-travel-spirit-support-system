'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'

interface ConfirmationRegisterDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    isLoading?: boolean
}

export function ConfirmationRegisterDialog({
    open,
    onOpenChange,
    onConfirm,
    title = "Are you absolutely sure?",
    confirmText = "Continue",
    cancelText = "Cancel",
    isLoading = false
}: ConfirmationRegisterDialogProps) {
    const handleConfirm = () => {
        if (!isLoading) {
            onConfirm()
            onOpenChange(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-lg border-0 shadow-2xl p-0 overflow-hidden bg-gradient-to-br from-white to-gray-50/50">
                {/* Decorative top border */}
                <div className="h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />

                <div className="p-6 sm:p-8">
                    <AlertDialogHeader>
                        <div className="flex items-start space-x-4 mb-4">
                            <div className="relative">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-200/50">
                                    <AlertTriangle className="w-7 h-7 text-amber-600" strokeWidth={2.5} />
                                </div>
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">!</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
                                    {title}
                                </AlertDialogTitle>
                                <p className="text-sm text-gray-500 font-medium">
                                    Final confirmation required
                                </p>
                            </div>
                        </div>

                        <div className="text-base text-left space-y-4">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/60 rounded-2xl p-5 shadow-sm">
                                <div className="font-semibold text-gray-900 text-base mb-2 flex items-center">
                                    <Info className="w-4 h-4 mr-2 text-blue-600" />
                                    Please read carefully
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    This application cannot be changed later. Make sure all the information you&apos;ve provided is accurate and complete.
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-50 border border-amber-300/60 rounded-2xl p-5 shadow-md">
                                <div className="flex items-center mb-3">
                                    <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center mr-2.5 shadow-sm">
                                        <AlertTriangle className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                    </div>
                                    <p className="text-sm font-bold text-amber-900">
                                        Important Checklist
                                    </p>
                                </div>
                                <ul className="space-y-2.5">
                                    {[
                                        'Double-check all personal information',
                                        'Verify document uploads are correct',
                                        'Review terms and conditions',
                                        'Contact support if you need changes'
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start text-sm text-amber-900 group">
                                            <div className="mt-0.5 mr-3 flex-shrink-0">
                                                <div className="w-5 h-5 rounded-full bg-white border-2 border-amber-400 flex items-center justify-center shadow-sm group-hover:border-amber-500 transition-colors">
                                                    <CheckCircle2 className="w-3 h-3 text-amber-600" strokeWidth={3} />
                                                </div>
                                            </div>
                                            <span className="leading-relaxed font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-6">
                        <AlertDialogCancel
                            disabled={isLoading}
                            className="w-full sm:w-auto order-2 sm:order-1 h-11 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-semibold transition-all shadow-sm"
                        >
                            {cancelText}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="w-full sm:w-auto order-1 sm:order-2 h-11 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:via-blue-700 hover:to-indigo-700 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Confirming...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <span>{confirmText}</span>
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}