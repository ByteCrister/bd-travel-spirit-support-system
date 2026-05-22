"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Clock, LogOut, Lock, UserCircle, RefreshCw } from "lucide-react";
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
import ProfileHeader from "./ProfileHeader";
import { AlertConfirmDialog } from "./AlertConfirmDialog";

// ── Neumorphism tokens ────────────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";

const NEU_BTN_DANGER =
    "rounded-xl bg-[#E7E5E4] text-[#FF2157] font-[family-name:var(--font-space-mono)] text-sm " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
    "transition-all duration-200";
const NEU_BTN_ICON =
    "rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/50 " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

// ── Constants ─────────────────────────────────────────────────
const TAB_ITEMS = [
    { id: "profile" as const, label: "Profile", icon: UserCircle },
    { id: "security" as const, label: "Security", icon: Lock },
    { id: "audit" as const, label: "Audit Logs", icon: Clock },
];

const BREADCRUMB_ITEMS = [
    { label: "Home", href: "/" },
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

    const handleRefresh = useCallback(() => {
        if (baseUser?.role) {
            fetchFullUser(baseUser.role, { force: true });
        }
    }, [baseUser?.role, fetchFullUser]);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const base = await fetchBaseUser();
                if (base?.role) await fetchFullUser(base.role);
            } catch (error) {
                console.error("Error loading user data:", error);
            } finally {
                setInitialLoadComplete(true);
            }
        };
        if (!initialLoadComplete || !baseUser) loadUserData();
    }, [fetchBaseUser, fetchFullUser, initialLoadComplete, baseUser]);

    if (baseMeta.loading || !initialLoadComplete) return <ProfileLoading />;

    const handleConfirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut({ callbackUrl: "/" });
            setTimeout(() => { window.location.href = "/"; }, 300);
        } catch (err) {
            console.error("Logout error:", err);
            setIsLoggingOut(false);
        }
    };

    // ── Error state ──
    if (baseMeta.error || !baseUser) {
        return (
            <div className={`${NEU_PAGE_BG} flex items-center justify-center p-4`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`${NEU_CARD} w-full max-w-md p-12 text-center`}
                >
                    <div className={`h-24 w-24 mx-auto mb-6 rounded-3xl ${NEU_SURFACE_INSET_SM} flex items-center justify-center`}>
                        <Shield className="h-12 w-12 text-[#FF2157]" />
                    </div>
                    <h3 className={`text-2xl mb-3 ${NEU_HEADING}`}>Error Loading Profile</h3>
                    <p className={`mb-8 ${NEU_MUTED}`}>{baseMeta.error}</p>
                    <button
                        onClick={() => fetchBaseUser({ force: true })}
                        className={`h-11 px-6 text-sm ${NEU_BTN_PRIMARY}`}
                    >
                        Try Again
                    </button>
                </motion.div>
            </div>
        );
    }

    // ── Main layout ──
    return (
        <>
            <div className={`${NEU_PAGE_BG} px-4 py-8`}>
                <div className="container mx-auto max-w-5xl space-y-6">
                    {/* Top bar */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                        <Breadcrumbs items={BREADCRUMB_ITEMS} />

                        <div className="flex items-center gap-2">
                            {/* Refresh */}
                            <button
                                onClick={handleRefresh}
                                disabled={fullMeta.loading}
                                aria-label="Refresh profile data"
                                className={NEU_BTN_ICON}
                            >
                                <RefreshCw className={`h-4 w-4 ${fullMeta.loading ? "animate-spin" : ""}`} />
                            </button>

                            {/* Logout */}
                            <button
                                onClick={handleLogoutClick}
                                className={`flex items-center gap-2 px-4 h-9 ${NEU_BTN_DANGER}`}
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </motion.div>

                    {/* Profile header */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.1 }}
                    >
                        <ProfileHeader baseUser={baseUser} fullUser={fullUser} />
                    </motion.div>

                    {/* Tab navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.2 }}
                    >
                        <div className={`${NEU_CARD} p-3`}>
                            <div className="flex gap-2" role="tablist">
                                {TAB_ITEMS.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            role="tab"
                                            aria-selected={isActive}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                        relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                        font-[family-name:var(--font-space-mono)] font-bold text-sm
                        transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40
                        ${isActive
                                                    ? "bg-[#006666] text-white shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080]"
                                                    : "text-[#1E2938]/60 hover:text-[#1E2938] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]"
                                                }
                      `}
                                        >
                                            <Icon className={`h-4 w-4 shrink-0 ${isActive ? "scale-110" : ""} transition-transform duration-200`} />
                                            <span className="hidden sm:inline">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Tab content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -14 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            {activeTab === "profile" && (
                                <>
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
                                </>
                            )}

                            {activeTab === "security" && (
                                <PasswordUpdateForm />
                            )}

                            {activeTab === "audit" && (
                                <AuditLogsSection />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <AlertConfirmDialog
                isOpen={showLogoutConfirm}
                onClose={handleLogoutCancel}
                onConfirm={handleConfirmLogout}
                title="Sign Out"
                description="Are you sure you want to sign out of your account?"
                confirmText="Sign Out"
                cancelText="Cancel"
                variant="warning"
                isLoading={isLoggingOut}
            />
        </>
    );
}