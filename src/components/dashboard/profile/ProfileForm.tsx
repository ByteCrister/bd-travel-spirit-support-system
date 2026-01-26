// Professional Profile Form Component
import { useState } from "react";
import { CurrentUser, RequestMeta } from "@/types/current-user.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, User, Mail, CheckCircle2, XCircle, AlertCircle, Info, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileFormProps {
  fullUser: CurrentUser | null;
  isLoading: boolean;
  updateUserName: (data: { name: string }) => Promise<CurrentUser | null>;
  updateNameMeta?: RequestMeta;
}

export default function ProfileForm({
  fullUser,
  isLoading,
  updateUserName,
  updateNameMeta,
}: ProfileFormProps) {
  const [name, setName] = useState(() => {
    if (fullUser && "fullName" in fullUser && fullUser.fullName) {
      return fullUser.fullName;
    }
    if (fullUser && "user" in fullUser && fullUser.fullName) {
      return fullUser.fullName;
    }
    return "";
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    setShowSuccess(false);
    try {
      const result = await updateUserName({ name: name.trim() });
      if (result) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = fullUser && "fullName" in fullUser
    ? name.trim() !== fullUser.fullName
    : name.trim() !== "";

  const completionPercentage = Math.min((name.trim().length / 30) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-slate-200 shadow-sm bg-white">
        {/* Header */}
        <CardHeader className="pb-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
              <User className="h-6 w-6 text-slate-700" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Profile Information
                </CardTitle>
                <AnimatePresence>
                  {hasChanges && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="h-2 w-2 rounded-full bg-slate-900 animate-pulse" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <CardDescription className="text-sm mt-1.5 text-slate-600">
                Manage your account details and preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Full Name Field */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-2.5"
            >
              <Label htmlFor="name" className="text-sm font-medium text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-slate-600" />
                  Full Name
                </span>
                {name.trim().length >= 2 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-xs text-slate-600"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Valid
                  </motion.span>
                )}
              </Label>

              <div className="relative">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={isLoading || isSubmitting}
                  className="h-11 pl-10 pr-10 text-sm border-slate-300 focus:border-slate-900 focus:ring-slate-900 bg-white"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                <AnimatePresence>
                  {hasChanges && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <div className="h-2 w-2 rounded-full bg-slate-900" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Character Count & Progress */}
              <AnimatePresence>
                {name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 pt-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5">
                        <BarChart3 className="h-3 w-3" />
                        Profile completion
                      </span>
                      <span className="font-semibold text-slate-900">
                        {name.trim().length} / 30
                      </span>
                    </div>

                    <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <motion.div
                        className="h-full bg-slate-900"
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {name.trim() && name.trim().length < 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <AlertCircle className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-700 font-medium">
                      Name should be at least 2 characters
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Email Field (Read Only) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="space-y-2.5"
            >
              <Label className="text-sm font-medium text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-600" />
                  Email Address
                </span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Read Only
                </span>
              </Label>

              <div className="relative">
                <Input
                  value={fullUser && "user" in fullUser ? fullUser.email : fullUser?.email || ""}
                  disabled
                  className="h-11 pl-10 pr-10 bg-slate-50 cursor-not-allowed border-slate-200 text-sm text-slate-600"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                    <span className="text-sm">🔒</span>
                  </div>
                </div>
              </div>

              <Alert className="border border-slate-200 bg-slate-50">
                <Info className="h-4 w-4 text-slate-600" />
                <AlertDescription className="text-xs text-slate-700 font-medium">
                  Your email address is protected and cannot be changed. Contact support for assistance.
                </AlertDescription>
              </Alert>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-slate-200"
            >
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || isSubmitting || !name.trim() || !hasChanges || name.trim().length < 2}
                className="h-10 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                size="default"
              >
                <AnimatePresence mode="wait">
                  {(isSubmitting || updateNameMeta?.loading) ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="save"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>

              <AnimatePresence>
                {hasChanges && !isSubmitting && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200"
                  >
                    <div className="h-2 w-2 rounded-full bg-slate-900 animate-pulse" />
                    <p className="text-xs font-medium text-slate-700">
                      Unsaved changes
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Success/Error Messages */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Alert className="border border-slate-300 bg-slate-50">
                    <CheckCircle2 className="h-4 w-4 text-slate-900" />
                    <AlertDescription className="text-sm text-slate-900 font-medium">
                      Your profile has been updated successfully
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {updateNameMeta?.error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Alert className="border border-slate-300 bg-slate-50">
                    <XCircle className="h-4 w-4 text-slate-900" />
                    <AlertDescription className="text-sm text-slate-900 font-medium">
                      {updateNameMeta.error}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}