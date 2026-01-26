"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, Key, RefreshCw, Shield, CheckCircle2, XCircle, AlertTriangle, Lock, Zap } from "lucide-react";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";
import { useCurrentUserStore } from "@/store/current-user.store";

export default function PasswordUpdateForm() {
  const { updateUserPassword, updatePasswordMeta } = useCurrentUserStore();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGeneratePassword = () => {
    const strongPassword = generateStrongPassword();
    setFormData(prev => ({
      ...prev,
      newPassword: strongPassword,
      confirmPassword: strongPassword,
    }));
    setShowNewPassword(true);
    setShowConfirmPassword(true);
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: "", percentage: 0, color: "from-muted to-muted" };

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

    if (strength < 40) return { strength: "weak", percentage: strength, color: "from-slate-500 to-slate-600" };
    if (strength < 70) return { strength: "medium", percentage: strength, color: "from-stone-500 to-stone-600" };
    return { strength: "strong", percentage: strength, color: "from-teal-500 to-teal-600" };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const validateForm = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    setShowSuccess(false);

    if (!validateForm()) return;

    await updateUserPassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });

    if (!updatePasswordMeta?.error) {
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  };

  const requirements = [
    { met: formData.newPassword.length >= 8, label: "8+ characters" },
    { met: /[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword), label: "Upper & lowercase" },
    { met: /\d/.test(formData.newPassword), label: "Number" },
    { met: /[^a-zA-Z0-9]/.test(formData.newPassword), label: "Special character" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative border shadow-lg overflow-hidden backdrop-blur-sm">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 via-gray-500/5 to-stone-500/5 pointer-events-none" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-slate-500/8 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-gray-500/8 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        {/* Floating particles */}
        <motion.div
          className="absolute top-32 right-32 w-2 h-2 rounded-full bg-slate-500/20"
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-24 w-2 h-2 rounded-full bg-gray-500/20"
          animate={{
            y: [0, 30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Enhanced Header */}
        <CardHeader className="relative pb-8 border-b bg-gradient-to-br from-slate-500/8 via-gray-500/4 to-transparent">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
          
          <div className="relative flex items-start gap-4">
            <motion.div
              whileHover={{ rotate: [0, -15, 15, 0], scale: 1.08 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Rotating glow effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-slate-500/20 via-gray-500/20 to-stone-500/20 rounded-2xl blur-xl"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  rotate: 360,
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-500/15 via-gray-500/15 to-stone-500/15 flex items-center justify-center shadow-lg ring-1 ring-slate-500/20 backdrop-blur-sm">
                <Shield className="h-8 w-8 text-slate-600 dark:text-slate-400" />
              </div>
            </motion.div>
            
            <div className="flex-1">
              <CardTitle className="text-2xl sm:text-3xl font-bold">
                Change Password
              </CardTitle>
              <CardDescription className="text-sm mt-2">
                Update your password to keep your account secure
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-6 sm:p-8">
          <div className="space-y-8">
            {/* Current Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <Label htmlFor="currentPassword" className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                Current Password
              </Label>
              <div className="relative group">
                {/* Enhanced focus glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-slate-500/10 via-gray-500/10 to-stone-500/10 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur" />
                
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    disabled={updatePasswordMeta?.loading}
                    className="relative h-14 pr-14 text-base border transition-all focus:ring-2 focus:ring-slate-500/20 bg-background/80 backdrop-blur-sm font-medium shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-slate-500/10 rounded-lg transition-colors"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* New Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="newPassword" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  New Password
                </Label>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGeneratePassword}
                    className="h-9 text-xs hover:bg-slate-500/10 hover:text-slate-700 hover:border-slate-500/30 transition-all rounded-lg px-3 font-medium border"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Generate Strong
                  </Button>
                </motion.div>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-slate-500/10 via-gray-500/10 to-stone-500/10 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur" />
                
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    disabled={updatePasswordMeta?.loading}
                    className="relative h-14 pr-14 text-base border transition-all focus:ring-2 focus:ring-slate-500/20 bg-background/80 backdrop-blur-sm font-medium shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-slate-500/10 rounded-lg transition-colors"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Enhanced Password Strength Indicator */}
              <AnimatePresence>
                {formData.newPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5" />
                        Password Strength
                      </span>
                      <motion.span 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className={`font-medium capitalize px-3 py-1.5 rounded-full text-sm shadow-sm ${
                          passwordStrength.strength === "weak" 
                            ? "text-slate-700 bg-gradient-to-r from-slate-100 to-slate-100 dark:text-slate-300 dark:from-slate-800/40 dark:to-slate-800/40 border border-slate-200 dark:border-slate-700" 
                            : passwordStrength.strength === "medium" 
                              ? "text-stone-700 bg-gradient-to-r from-stone-100 to-stone-100 dark:text-stone-300 dark:from-stone-800/40 dark:to-stone-800/40 border border-stone-200 dark:border-stone-700" 
                              : "text-teal-700 bg-gradient-to-r from-teal-100 to-teal-100 dark:text-teal-300 dark:from-teal-800/40 dark:to-teal-800/40 border border-teal-200 dark:border-teal-700"
                        }`}
                      >
                        {passwordStrength.strength || "Enter password"}
                      </motion.span>
                    </div>
                    
                    <div className="relative h-3 bg-gradient-to-r from-muted/80 to-muted/50 rounded-full overflow-hidden border border-muted shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength.percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${passwordStrength.color} shadow`}
                      />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {requirements.map((req, index) => (
                        <motion.div
                          key={req.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all duration-300 ${
                            req.met 
                              ? "bg-gradient-to-br from-teal-50/50 to-teal-50/30 dark:from-teal-900/20 dark:to-teal-900/10 border-teal-300 dark:border-teal-700" 
                              : "bg-muted/30 border-muted hover:border-muted-foreground/20"
                          }`}
                        >
                          {req.met ? (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-500 flex-shrink-0" />
                            </motion.div>
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={`text-xs font-medium ${
                            req.met ? "text-teal-700 dark:text-teal-400" : "text-muted-foreground"
                          }`}>
                            {req.label}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                Confirm New Password
              </Label>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-slate-500/10 via-gray-500/10 to-stone-500/10 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur" />
                
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    disabled={updatePasswordMeta?.loading}
                    className="relative h-14 pr-14 text-base border transition-all focus:ring-2 focus:ring-slate-500/20 bg-background/80 backdrop-blur-sm font-medium shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-slate-500/10 rounded-lg transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              
              <AnimatePresence>
                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-slate-50/50 to-slate-50/30 dark:from-slate-900/20 dark:to-slate-900/10 border border-slate-300 dark:border-slate-700"
                  >
                    <XCircle className="h-5 w-5 text-slate-600 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700 dark:text-slate-400 font-medium">
                      Passwords do not match
                    </p>
                  </motion.div>
                )}
                {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-teal-50/50 to-teal-50/30 dark:from-teal-900/20 dark:to-teal-900/10 border border-teal-300 dark:border-teal-700"
                  >
                    <CheckCircle2 className="h-5 w-5 text-teal-600 dark:text-teal-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-teal-700 dark:text-teal-400 font-medium">
                      Passwords match perfectly
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Error/Success Messages */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Alert className="relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/5 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <CheckCircle2 className="h-5 w-5 text-teal-600 dark:text-teal-500" />
                    <AlertDescription className="text-teal-800 dark:text-teal-400 font-medium">
                      Your password has been updated successfully!
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {(error || updatePasswordMeta?.error) && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Alert variant="destructive" className="border shadow">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertDescription className="font-medium">
                      {error || updatePasswordMeta?.error}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Submit Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Button
                type="button"
                size="lg"
                onClick={handleSubmit}
                disabled={
                  updatePasswordMeta?.loading ||
                  !formData.currentPassword ||
                  !formData.newPassword ||
                  !formData.confirmPassword ||
                  formData.newPassword !== formData.confirmPassword
                }
                className="relative overflow-hidden group shadow hover:shadow-md transition-all h-12 text-base font-medium"
              >
                <AnimatePresence mode="wait">
                  {updatePasswordMeta?.loading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center"
                    >
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Updating Password...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="update"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center"
                    >
                      <Shield className="mr-2 h-5 w-5" />
                      Update Password
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {!updatePasswordMeta?.loading && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  />
                )}
              </Button>

              {(error || updatePasswordMeta?.error) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setError("")}
                    className="shadow-sm border font-medium"
                  >
                    Clear Error
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}