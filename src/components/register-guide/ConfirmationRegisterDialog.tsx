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
import { AlertTriangle, CheckCircle2, Info, Mail, Shield, Loader2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ConfirmationRegisterDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    isLoading?: boolean
    email?: string
    onSendVerification?: () => Promise<{ success: boolean; message: string }>
    onVerifyToken?: (token: string) => Promise<{ success: boolean; message: string; }>
}

export function ConfirmationRegisterDialog({
    open,
    onOpenChange,
    onConfirm,
    title = "Are you absolutely sure?",
    confirmText = "Continue",
    cancelText = "Cancel",
    isLoading = false,
    email = "",
    onSendVerification,
    onVerifyToken
}: ConfirmationRegisterDialogProps) {
    const [verificationStep, setVerificationStep] = useState<'idle' | 'sending' | 'verifying' | 'verified' | 'failed'>('idle')
    const [verificationToken, setVerificationToken] = useState('')
    const [isSendingEmail, setIsSendingEmail] = useState(false)
    const [isVerifyingToken, setIsVerifyingToken] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const handleSendVerification = async () => {
        if (!email || !onSendVerification) return

        setIsSendingEmail(true)
        setErrorMessage('')

        try {
            const result = await onSendVerification()
            if (result.success) {
                setVerificationStep('verifying')
            } else {
                setErrorMessage(result.message)
                setVerificationStep('failed')
            }
        } catch {
            setErrorMessage('Failed to send verification email')
            setVerificationStep('failed')
        } finally {
            setIsSendingEmail(false)
        }
    }

    const handleVerifyToken = async () => {
        if (!verificationToken.trim() || !onVerifyToken) return

        setIsVerifyingToken(true)
        setErrorMessage('')

        try {
            const result = await onVerifyToken(verificationToken)
            if (result.success) {
                setVerificationStep('verified')
            } else {
                setErrorMessage(result.message)
                setVerificationStep('failed')
            }
        } catch {
            setErrorMessage('Failed to verify token')
            setVerificationStep('failed')
        } finally {
            setIsVerifyingToken(false)
        }
    }

    const handleConfirm = () => {
        if (!isLoading && (verificationStep === 'verified' || !email)) {
            onConfirm()
            onOpenChange(false)
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            // Reset states when closing
            setVerificationStep('idle')
            setVerificationToken('')
            setErrorMessage('')
        }
        onOpenChange(newOpen)
    }

    const isConfirmDisabled = isLoading || !!(email && verificationStep !== 'verified')

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="max-w-lg border-0 shadow-2xl p-0 overflow-hidden bg-gradient-to-br from-white to-gray-50/50">
                {/* Decorative top border */}
                <div className="h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />

                <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
                    <AlertDialogHeader>
                        <div className="flex items-start space-x-4 mb-4">
                            <div className="relative">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-200/50">
                                    {verificationStep === 'verified' ? (
                                        <CheckCircle2 className="w-7 h-7 text-green-600" strokeWidth={2.5} />
                                    ) : (
                                        <AlertTriangle className="w-7 h-7 text-amber-600" strokeWidth={2.5} />
                                    )}
                                </div>
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">!</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
                                    {verificationStep === 'verified' ? "Email Verified!" : title}
                                </AlertDialogTitle>
                                <p className="text-sm text-gray-500 font-medium">
                                    {verificationStep === 'verified' ? "Ready to submit your application" : "Final confirmation required"}
                                </p>
                            </div>
                        </div>

                        {/* Email Verification Section */}
                        {email && verificationStep !== 'verified' && (
                            <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
                                <div className="flex items-center mb-4">
                                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                                    <h3 className="font-semibold text-gray-900">Email Verification Required</h3>
                                </div>

                                {verificationStep === 'idle' && (
                                    <>
                                        <p className="text-sm text-gray-600 mb-4">
                                            We need to verify your email address <span className="font-semibold">{email}</span> before you can submit the application.
                                        </p>
                                        <Button
                                            onClick={handleSendVerification}
                                            disabled={isSendingEmail}
                                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                        >
                                            {isSendingEmail ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Sending Verification Email...
                                                </>
                                            ) : (
                                                <>
                                                    <Mail className="w-4 h-4 mr-2" />
                                                    Send Verification Email
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}

                                {verificationStep === 'verifying' && (
                                    <>
                                        <p className="text-sm text-gray-600 mb-4">
                                            We&apos;ve sent a verification code to <span className="font-semibold">{email}</span>.
                                            Please check your inbox and enter the code below.
                                        </p>
                                        <div className="space-y-3">
                                            <Input
                                                type="text"
                                                placeholder="Enter verification code"
                                                value={verificationToken}
                                                onChange={(e) => setVerificationToken(e.target.value)}
                                                className="h-11"
                                                disabled={isVerifyingToken}
                                            />
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={handleVerifyToken}
                                                    disabled={!verificationToken.trim() || isVerifyingToken}
                                                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                                >
                                                    {isVerifyingToken ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Verifying...
                                                        </>
                                                    ) : (
                                                        "Verify Code"
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={handleSendVerification}
                                                    disabled={isSendingEmail}
                                                    className="flex-1"
                                                >
                                                    Resend Code
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {verificationStep === 'failed' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center text-red-600">
                                            <XCircle className="w-5 h-5 mr-2" />
                                            <span className="font-medium">{errorMessage || "Verification failed"}</span>
                                        </div>
                                        <Button
                                            onClick={handleSendVerification}
                                            disabled={isSendingEmail}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            {isSendingEmail ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Retrying...
                                                </>
                                            ) : (
                                                "Try Again"
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {verificationStep === 'verified' && (
                            <div className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
                                <div className="flex items-center mb-3">
                                    <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                                    <h3 className="font-semibold text-gray-900">Email Verified Successfully!</h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Your email <span className="font-semibold">{email}</span> has been verified.
                                    You can now submit your application.
                                </p>
                            </div>
                        )}

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
                            disabled={isLoading || isSendingEmail || isVerifyingToken}
                            className="w-full sm:w-auto order-2 sm:order-1 h-11 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-semibold transition-all shadow-sm"
                        >
                            {cancelText}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirm}
                            disabled={isConfirmDisabled}
                            className={`w-full sm:w-auto order-1 sm:order-2 h-11 rounded-xl font-semibold shadow-lg transition-all ${isConfirmDisabled
                                ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] text-white'
                                }`}
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