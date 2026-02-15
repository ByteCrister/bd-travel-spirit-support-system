"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Clock, LogOut, Lock, UserCircle, Zap, Sparkles } from "lucide-react";
import { useCurrentUserStore } from "@/store/current-user.store";
import ProfileLoading from "./skeletons/ProfileLoading";
import AuditLogsSection from "./AuditLogsSection";
import PasswordUpdateForm from "./PasswordUpdateForm";
import ProfileForm from "./ProfileForm";
import { IEmployeeInfo } from "@/types/user/current-user.types";
import { USER_ROLE } from "@/constants/user.const";
import SupportEmployeeInfo from "./SupportEmployeeInfo";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import ProfileHeader from "./ProfileHeader";
import { AlertConfirmDialog } from "./AlertConfirmDialog";

const tabItems = [
    { id: "profile", label: "Profile", icon: UserCircle, color: "from-slate-600 to-slate-700" },
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

        if (!initialLoadComplete || !baseUser) {
            loadUserData();
        }
    }, [fetchBaseUser, fetchFullUser, initialLoadComplete, baseUser]);

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
                        <div className="flex items-center gap-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                            >
                                <Badge variant="outline" className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold shadow-lg border-2 bg-gradient-to-r from-background to-muted/30">
                                    <Sparkles className="h-4 w-4" />
                                    {baseUser.role}
                                </Badge>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, type: "spring" }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    variant="outline"
                                    className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900 transition-all duration-300 border-slate-300 dark:border-slate-700 font-medium h-11 rounded-lg"
                                    onClick={handleLogoutClick}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    <span className="text-sm">Logout</span>
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Area */}
                <div className="space-y-6">
                    {/* Profile Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <ProfileHeader baseUser={baseUser} fullUser={fullUser} />
                    </motion.div>

                    {/* Tab Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Card className="shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                            <CardContent className="p-4 sm:p-6">
                                <Tabs
                                    value={activeTab}
                                    onValueChange={(value) => setActiveTab(value as typeof activeTab)}
                                    className="w-full"
                                >
                                    <TabsList>
                                        {tabItems.map((tab) => {
                                            const Icon = tab.icon;
                                            const isActive = activeTab === tab.id;

                                            return (
                                                <TabsTrigger
                                                    key={tab.id}
                                                    value={tab.id}
                                                    className={`
                                                        relative py-4 px-6 rounded-lg font-semibold transition-all duration-300
                                                        flex items-center justify-center gap-3
                                                        data-[state=active]:shadow-lg
                                                        ${isActive
                                                            ? `bg-gradient-to-r ${tab.color} text-white shadow-md hover:shadow-lg`
                                                            : "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200"
                                                        }
                                                    `}
                                                >
                                                    <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                                                    <span className="text-sm sm:text-base font-semibold">
                                                        {tab.label}
                                                    </span>
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="activeTabIndicator"
                                                            className="absolute inset-0 rounded-lg border-2 border-white/20"
                                                            initial={false}
                                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                        />
                                                    )}
                                                </TabsTrigger>
                                            );
                                        })}
                                    </TabsList>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Tab Content Area */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                            <Card className="shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                                <CardContent className="p-6">
                                    {activeTab === "profile" && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
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
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <PasswordUpdateForm />
                                        </motion.div>
                                    )}

                                    {activeTab === "audit" && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <AuditLogsSection />
                                        </motion.div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
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