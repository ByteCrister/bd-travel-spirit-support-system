// components/guide-password-request/PasswordRequestDialog.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  Clock,
  User,
  Key,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { usePasswordRequestStore } from "@/store/guide/guide-password-request.store";
import { FORGOT_PASSWORD_STATUS } from "@/constants/guide-forgot-password.const";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";
import { showToast } from "@/components/global/showToast";

interface PasswordRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_CONFIG = {
  [FORGOT_PASSWORD_STATUS.PENDING]: {
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  [FORGOT_PASSWORD_STATUS.APPROVED]: {
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  [FORGOT_PASSWORD_STATUS.REJECTED]: {
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
  },
  [FORGOT_PASSWORD_STATUS.EXPIRED]: {
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
  },
};

export function PasswordRequestDialog({ open, onOpenChange }: PasswordRequestDialogProps) {
  const {
    selectedRequest,
    approveRequest,
    rejectRequest,
    isUpdating,
    selectRequest
  } = usePasswordRequestStore();

  const [rejectionReason, setRejectionReason] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!selectedRequest) return null;

  const isPending = selectedRequest.status === FORGOT_PASSWORD_STATUS.PENDING;
  const isExpired = selectedRequest.status === FORGOT_PASSWORD_STATUS.EXPIRED;

  const handleGeneratePassword = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const password = generateStrongPassword(12);
      setGeneratedPassword(password);
      setIsGenerating(false);
      showToast.success("Password Generated", "A secure password has been generated successfully.");
    }, 300);
  };

  const handleApprove = async () => {
    if (!generatedPassword) {
      showToast.warning("Provide a Password!", "Please generate a valid password.");
      return;
    }

    await approveRequest(selectedRequest.id, generatedPassword, sendEmail);
    onOpenChange(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showToast.warning("Provide a reason!", "Please provide a valid reason to reject the password reset request.");
      return;
    }

    await rejectRequest(selectedRequest.id, rejectionReason);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setRejectionReason("");
    setGeneratedPassword("");
    setSendEmail(true);
    setTimeout(() => selectRequest(null), 300);
  };

  const statusConfig = STATUS_CONFIG[selectedRequest.status as keyof typeof STATUS_CONFIG];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-slate-200 bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-sm">
              <Key className="h-5 w-5 text-white" />
            </div>
            <span className="text-slate-900">Password Reset Request</span>
          </DialogTitle>
        </DialogHeader>

        {/* User Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <Avatar className="h-12 w-12 ring-2 ring-slate-200">
              <AvatarImage src={selectedRequest.user.avatarUrl || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white font-medium">
                {selectedRequest.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-900">{selectedRequest.user.name}</h3>
                  <p className="text-sm text-slate-600 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {selectedRequest.user.email}
                  </p>
                </div>
                <Badge 
                  variant={
                    selectedRequest.status === FORGOT_PASSWORD_STATUS.PENDING ? "secondary" :
                    selectedRequest.status === FORGOT_PASSWORD_STATUS.APPROVED ? "default" :
                    selectedRequest.status === FORGOT_PASSWORD_STATUS.REJECTED ? "destructive" : "outline"
                  }
                  className={cn(
                    "px-2.5 py-1 font-medium shadow-sm border",
                    statusConfig.bgColor,
                    statusConfig.color,
                    statusConfig.borderColor
                  )}
                >
                  {selectedRequest.status}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="p-1.5 rounded-md bg-slate-100">
                    <Calendar className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Created</p>
                    <p className="font-medium">{format(new Date(selectedRequest.createdAt), "MMM d, yyyy")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <div className={cn(
                    "p-1.5 rounded-md",
                    new Date(selectedRequest.expiresAt) < new Date() ? "bg-rose-100" : "bg-slate-100"
                  )}>
                    <Clock className={cn(
                      "h-3.5 w-3.5",
                      new Date(selectedRequest.expiresAt) < new Date() ? "text-rose-600" : "text-slate-600"
                    )} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Expires</p>
                    <p className={cn(
                      "font-medium",
                      new Date(selectedRequest.expiresAt) < new Date() ? "text-rose-700" : ""
                    )}>
                      {format(new Date(selectedRequest.expiresAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reason for Request */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Reason for Password Reset</Label>
            <Textarea
              value={selectedRequest.reason}
              readOnly
              className="resize-none border-slate-300 bg-slate-50 text-slate-900 min-h-[80px]"
            />
          </div>

          {/* Password Generation Section (Only for Pending requests) */}
          {isPending && !isExpired && (
            <>
              <Separator className="bg-slate-200" />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-slate-700" />
                    <Label className="text-lg font-semibold text-slate-900">Generate New Password</Label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGeneratePassword}
                    disabled={isGenerating}
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all"
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
                    Generate Password
                  </Button>
                </div>

                <AnimatePresence>
                  {generatedPassword && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <div className="p-4 border border-emerald-200 rounded-lg bg-emerald-50/50">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          <Label className="text-emerald-900 font-medium">Password Generated Successfully</Label>
                        </div>
                        <p className="text-sm text-emerald-700">
                          A secure {generatedPassword.length}-character password has been generated. The password will be sent to the user via email when you approve this request.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                  <div className="space-y-1 flex-1">
                    <Label className="flex items-center gap-2 text-slate-900 font-medium">
                      <Mail className="h-4 w-4 text-slate-600" />
                      Send Email Notification
                    </Label>
                    <p className="text-sm text-slate-600">
                      Email the new password securely to the user
                    </p>
                  </div>
                  <Switch
                    checked={sendEmail}
                    onCheckedChange={setSendEmail}
                    className="data-[state=checked]:bg-slate-700"
                  />
                </div>

                {!sendEmail && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 border border-amber-200 rounded-lg bg-amber-50"
                  >
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800">
                      The password will be updated without notification. Make sure to communicate the password to the user through a secure channel.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </>
          )}

          {/* Rejection Reason Section */}
          {isPending && !isExpired && (
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Rejection Reason (Optional)</Label>
              <Textarea
                placeholder="Provide a detailed reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[80px] border-slate-300 focus:border-slate-400 focus:ring-slate-400"
              />
            </div>
          )}

          {/* Existing Rejection Reason (if already rejected) */}
          {selectedRequest.status === FORGOT_PASSWORD_STATUS.REJECTED && selectedRequest.rejectionReason && (
            <div className="space-y-2">
              <Label className="text-rose-700 font-medium">Rejection Reason</Label>
              <div className="p-4 border border-rose-200 rounded-lg bg-rose-50">
                <p className="text-sm text-rose-900">{selectedRequest.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Reviewer Info (if reviewed) */}
          {selectedRequest.reviewer && selectedRequest.reviewer.reviewedById && (
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <Label className="text-sm font-medium text-slate-700 mb-3 block">Reviewed By</Label>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-slate-100">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{selectedRequest.reviewer.reviewerName}</p>
                  <p className="text-xs text-slate-600">{selectedRequest.reviewer.reviewerEmail}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-200 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUpdating}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            Cancel
          </Button>

          {isPending && !isExpired && (
            <>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isUpdating || !rejectionReason.trim()}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isUpdating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject Request
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isUpdating || !generatedPassword}
                className="bg-slate-700 hover:bg-slate-800 text-white"
              >
                {isUpdating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approve & {sendEmail ? "Send Email" : "Update Password"}
              </Button>
            </>
          )}

          {(selectedRequest.status === FORGOT_PASSWORD_STATUS.EXPIRED || !isPending) && (
            <Button 
              onClick={handleClose}
              className="bg-slate-700 hover:bg-slate-800 text-white"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}