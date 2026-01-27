"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Clock, LogOut, ChevronRight, Lock, UserCircle, Zap, Sparkles, User } from "lucide-react";
import { useCurrentUserStore } from "@/store/current-user.store";
import ProfileLoading from "./skeletons/ProfileLoading";
import AuditLogsSection from "./AuditLogsSection";
import PasswordUpdateForm from "./PasswordUpdateForm";
import ProfileForm from "./ProfileForm";
import { IEmployeeInfo } from "@/types/current-user.types";
import { USER_ROLE } from "@/constants/user.const";
import SupportEmployeeInfo from "./SupportEmployeeInfo";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import ProfileHeader from "./ProfileHeader";
import { AlertConfirmDialog } from "./AlertConfirmDialog";

const tabs = [
    { id: "profile", label: "Profile Information", icon: UserCircle, color: "from-slate-600 to-slate-700" },
    { id: "security", label: "Security", icon: Lock, color: "from-blue-600 to-blue-700" },
    { id: "audit", label: "Audit Logs", icon: Clock, color: "from-violet-600 to-violet-700" },
] as const;

const breadcrumbItems = [
    { label: "Home", href: '/' },
    { label: "Profile", href: "/dashboard/profile" },
];

export default function ProfilePage() {
    const {
        baseUser,
        fullUser,
        fetchBaseUser,
        fetchFullUser,
        baseMeta,
        fullMeta,
    } = useCurrentUserStore();

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [activeTab, setActiveTab] = useState<"profile" | "security" | "audit">("profile");
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    const handleLogoutClick = useCallback(() => setShowLogoutConfirm(true), []);
    const handleLogoutCancel = useCallback(() => setShowLogoutConfirm(false), []);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const base = await fetchBaseUser();

                if (base && base.role) {
                    await fetchFullUser(base.role);
                }
            } catch (error) {
                console.error("Error loading user data:", error);
            } finally {
                setInitialLoadComplete(true);
            }
        };

        // Only load if we haven't completed initial load or if baseUser is null
        if (!initialLoadComplete || !baseUser) {
            loadUserData();
        }
    }, [fetchBaseUser, fetchFullUser, initialLoadComplete, baseUser]);

    // Show loading state
    if (baseMeta.loading || !initialLoadComplete) {
        return <ProfileLoading />;
    }

    const handleConfirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut({ callbackUrl: "/" });
            setTimeout(() => {
                window.location.href = "/";
            }, 300);
        } catch (err) {
            console.error("Logout error:", err);
            setIsLoggingOut(false);
        }
    };

    if (baseMeta.error || !baseUser) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Card className="relative border-2 border-destructive/20 overflow-hidden shadow-2xl">
                        {/* Animated background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-destructive/5 to-background" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.1),transparent_50%)]" />

                        <CardContent className="relative pt-12 pb-12">
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                                    className="relative inline-block mb-6"
                                >
                                    <div className="absolute inset-0 bg-destructive/30 blur-3xl rounded-full animate-pulse" />
                                    <div className="relative h-24 w-24 mx-auto rounded-3xl bg-gradient-to-br from-destructive/20 via-destructive/10 to-destructive/5 flex items-center justify-center border-2 border-destructive/30 shadow-xl">
                                        <Shield className="h-12 w-12 text-destructive" />
                                    </div>
                                </motion.div>
                                <motion.h3
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-bold mb-3 bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text"
                                >
                                    Error Loading Profile
                                </motion.h3>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-muted-foreground mb-8 max-w-md mx-auto text-lg"
                                >
                                    {baseMeta.error}
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Button
                                        onClick={() => fetchBaseUser({ force: true })}
                                        size="lg"
                                        className="shadow-lg hover:shadow-2xl transition-all px-8 py-6 text-base font-semibold"
                                    >
                                        <Zap className="mr-2 h-5 w-5" />
                                        Try Again
                                    </Button>
                                </motion.div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            <div className="container mx-auto max-w-7xl px-1 sm:px-1 lg:px-2 pb-2">
                {/* Decorative background elements */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
                </div>

                <Breadcrumbs items={breadcrumbItems} />

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 mt-2"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text"
                            >
                                Account Settings
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-muted-foreground text-base sm:text-lg"
                            >
                                Manage your profile and account preferences
                            </motion.p>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                        >
                            <Badge variant="outline" className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold shadow-lg border-2 bg-gradient-to-r from-background to-muted/30">
                                <Sparkles className="h-4 w-4" />
                                {baseUser.role}
                            </Badge>
                        </motion.div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    {/* Enhanced Sidebar Navigation */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="lg:col-span-3"
                    >
                        <Card className="sticky top-6 shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                            {/* Subtle gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/50 pointer-events-none" />

                            <div className="relative p-6">
                                <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <User className="h-3.5 w-3.5" />
                                        <span>Navigation</span>
                                    </div>
                                </div>

                                <nav className="space-y-1.5">
                                    {tabs.map((tab, index) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;

                                        return (
                                            <motion.div
                                                key={tab.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 + index * 0.05 }}
                                                whileHover={{ x: isActive ? 0 : 4 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Button
                                                    variant={isActive ? "default" : "ghost"}
                                                    className={`w-full justify-start relative group transition-all duration-300 ${isActive
                                                        ? "shadow-sm bg-gradient-to-r " + tab.color + " text-white border-0"
                                                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                                                        } h-11 rounded-lg font-medium`}
                                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                                >
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="activeTab"
                                                            className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-lg`}
                                                            initial={false}
                                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                        />
                                                    )}
                                                    <span className="relative flex items-center gap-3 w-full">
                                                        <Icon className={`h-4.5 w-4.5 transition-all ${isActive
                                                            ? "text-white"
                                                            : "text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                                            }`} />
                                                        <span className={`flex-1 text-left text-sm font-medium transition-colors ${isActive
                                                            ? "text-white"
                                                            : ""
                                                            }`}>
                                                            {tab.label}
                                                        </span>
                                                        {isActive && (
                                                            <motion.div
                                                                initial={{ opacity: 0, x: -5 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                <ChevronRight className="h-4 w-4 text-white" />
                                                            </motion.div>
                                                        )}
                                                    </span>
                                                </Button>
                                            </motion.div>
                                        );
                                    })}
                                </nav>

                                <Separator className="my-6 bg-slate-200 dark:bg-slate-800" />

                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900 transition-all duration-300 border-slate-300 dark:border-slate-700 font-medium h-11 rounded-lg"
                                        onClick={handleLogoutClick}
                                    >
                                        <LogOut className="h-4 w-4 mr-3" />
                                        <span className="text-sm">Logout</span>
                                    </Button>
                                </motion.div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Enhanced Main Content Area */}
                    <div className="lg:col-span-9 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <ProfileHeader baseUser={baseUser} fullUser={fullUser} />
                        </motion.div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                            >
                                {activeTab === "profile" && (
                                    <motion.div
                                        initial={{ scale: 0.95 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {baseUser.role === USER_ROLE.SUPPORT ? (
                                            <SupportEmployeeInfo
                                                employeeInfo={fullUser as IEmployeeInfo}
                                                isLoading={fullMeta.loading}
                                            />
                                        ) : (
                                            <ProfileForm
                                                fullUser={fullUser}
                                                isLoading={fullMeta.loading}
                                                updateUserName={useCurrentUserStore.getState().updateUserName}
                                                updateNameMeta={useCurrentUserStore.getState().updateNameMeta}
                                            />
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === "security" && (
                                    <motion.div
                                        initial={{ scale: 0.95 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <PasswordUpdateForm />
                                    </motion.div>
                                )}

                                {activeTab === "audit" && (
                                    <motion.div
                                        initial={{ scale: 0.95 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <AuditLogsSection />
                                    </motion.div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <AlertConfirmDialog
                isOpen={showLogoutConfirm}
                onClose={handleLogoutCancel}
                onConfirm={handleConfirmLogout}
                title="Confirm Action"
                description="Do you want to proceed with this action?"
                isLoading={isLoggingOut}
            />
        </>
    );
}