"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FiLogIn,
  FiX,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
  FiArrowRight
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginFormValues, loginValidator } from "@/utils/validators/login.validator";
import ForgotPasswordDialog from "./ForgotPasswordDialog";
import useJoinAsGuideStore from "@/store/join-as-guide.store";
import { showToast } from "../global/showToast";
import { inter, jakarta } from "@/styles/fonts";
import api from "@/utils/axios";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";

const errorMap: Record<string, string> = {
  EMAIL_AND_PASS_REQUIRED: "Email and password required.",
  TOO_MANY_ATTEMPTS: "Too many attempts. Try again in a minute.",
  TOO_MANY_ATTEMPTS_TO_THIS_ACCOUNT: "Too many attempts on this account. Try again soon.",
  EMAIL_AND_PASSWORD_REQUIRED: "Email and password required.",
  NO_ACCOUNT_FOUND: "No account found with this email address.",
  INVALID_PASSWORD: "Invalid email or password.",
  GOOGLE_EMAIL_NOT_FOUND: "Google account email not found.",
  USER_NOT_EXIST_WITH_THIS_GOOGLE_EMAIL: "No account found for this Google email. Please sign up first.",
};

export default function LoginDialog() {
  const {
    isLoginOpen: isOpen,
    closeLogin: onClose,
    showForgotPassword,
    openForgotPassword,
    closeForgotPassword,
    backToLogin
  } = useJoinAsGuideStore();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginValidator),
    defaultValues: {
      email: "",
      password: "",
    },
  });


  const handleSubmit = async (values: LoginFormValues) => {

    setIsLoading(true);

    try {

      await api.post("/auth/user/v1/validate", {
        email: values.email,
        password: values.password,
      });

      await signIn("credentials", {
        redirect: true,
        email: values.email,
        password: values.password,
        callbackUrl: "/dashboard/overview",
      });

    } catch (error: unknown) {

      showToast.error("Login Failed", extractErrorMessage(error) as string);

    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await signIn("google", {
        redirect: false,
        callbackUrl: "/dashboard/overview"
      });

      if (res?.error) {
        showToast.error("Google Login Failed", errorMap[res.error]);
      } else {
        showToast.success("Login successful", "Redirecting to dashboard...");
        // Redirect after successful login
        window.location.href = res?.url || "/dashboard/overview";
      }
    } catch {
      showToast.error("Google Login Error", "Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      form.reset();
      setShowPassword(false);
    }
  };

  const handleForgotPassword = () => {
    openForgotPassword();
    onClose();
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`max-w-md p-0 gap-0 border-0 bg-transparent shadow-none ${jakarta.className}`}
        showCloseButton={false}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full"
        >
          {/* Main Container */}
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

            {/* Header */}
            <DialogHeader className="relative px-6 pt-6 pb-4 space-y-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-lg shadow-emerald-500/30">
                    <FiShield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className={`${inter.className} text-xl font-bold text-gray-900 dark:text-white`}>
                      Support Login
                    </DialogTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Access your support dashboard
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenChange(false)}
                  className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <FiX className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </DialogHeader>

            {/* Form */}
            <div className="relative px-6 pb-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiMail className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                              {...field}
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10 py-3 rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="flex items-center gap-2 text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiLock className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="pl-10 pr-12 py-3 rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 h-full w-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-transparent"
                            >
                              {showPassword ? (
                                <FiEyeOff className="h-4 w-4" />
                              ) : (
                                <FiEye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage className="flex items-center gap-2 text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Actions */}
                  <div className="mt-6 space-y-4">
                    {/* Login Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 hover:bg-gradient-to-r hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500"
                    >
                      {/* Background Glow */}
                      <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-0 blur transition-opacity duration-300 group-hover:opacity-30"></div>

                      <div className="relative flex items-center justify-center gap-2">
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                        ) : (
                          <FiLogIn className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        )}
                        <span>{isLoading ? "Signing In..." : "Sign In"}</span>
                        {!isLoading && (
                          <FiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        )}
                      </div>
                    </Button>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    {/* Google Login Button */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 py-3 transition-all duration-200"
                      onClick={handleGoogleLogin}
                    >
                      <FcGoogle className="h-4 w-4 mr-2" />
                      Sign in with Google
                    </Button>

                    {/* Forgot Password */}
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleForgotPassword}
                        className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 p-0 h-auto font-normal"
                      >
                        Forgot your password?
                      </Button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <FiShield className="h-3 w-3" />
                      <span>Secure login with SSL encryption</span>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </motion.div>
      </DialogContent>
      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        isOpen={showForgotPassword}
        onClose={() => closeForgotPassword()}
        onBackToLogin={backToLogin}
      />
    </Dialog>
  );
}