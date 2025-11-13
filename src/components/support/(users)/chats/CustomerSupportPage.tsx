'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StatsBar } from './StatsBar';
import { UserSidebar } from './UserSidebar';
import { ChatWindow } from './ChatWindow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { FiMenu, FiX, FiBarChart2 } from 'react-icons/fi';
import { useChatMessageStore } from '@/store/chat-message.store';
import { Breadcrumbs } from '../../../global/Breadcrumbs';

export default function CustomerSupportPage() {
    // TODO: replace with your auth/session user id provider
    const adminId = useMemo(() => 'ADMIN_ID_FROM_AUTH', []);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const breadcrumbItems = [
        { label: "Home", href: '/' },
        { label: "Customer Support", href: "/support/users" },
    ];

    // Detect mobile screen and close sidebar initially on mobile
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768; // md breakpoint
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Selectors / actions pulled individually to limit re-renders
    const { fetchStats, openConversation, stats, statsLoading, statsError } = useChatMessageStore();

    // Fetch stats once on mount (idempotent)
    useEffect(() => {
        fetchStats().catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelectUser = useCallback((id: string) => {
        setSelectedUserId(id);

        // open conversation, fetch messages and clear unread counts
        openConversation(adminId, id).catch(() => { });

        if (isMobile) {
            setSidebarOpen(false); // close mobile drawer on selection
        }
    }, [adminId, isMobile, openConversation]);

    const toggleSidebar = useCallback(() => setSidebarOpen((s) => !s), []);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            <Breadcrumbs items={breadcrumbItems} className='pb-4' />
            {/* Top stats bar — collapsible with accordion */}
            <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <Accordion type="single" collapsible defaultValue="stats">
                    <AccordionItem value="stats" className="border-0">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                    <FiBarChart2 className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    Support Statistics
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-0">
                            <StatsBar
                                stats={stats}
                                loading={statsLoading}
                                error={statsError}
                                onRetry={() => fetchStats().catch(() => { })}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* Main content fills rest of screen */}
            <div className="flex flex-1 min-h-0 overflow-hidden relative">
                {/* Mobile menu button - Fixed position with higher z-index */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleSidebar}
                    className="fixed top-20 left-4 z-50 md:hidden bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-md rounded-lg w-10 h-10 transition-colors"
                    aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                >
                    {sidebarOpen ? (
                        <FiX className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    ) : (
                        <FiMenu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    )}
                </Button>

                {/* Sidebar */}
                <aside
                    className={`z-40 bg-background border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:block shadow-2xl md:shadow-none
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                        fixed inset-y-0 left-0 top-0 w-[86vw] max-w-[420px] md:w-[340px]`}
                >
                    <div className="h-full min-h-0 flex flex-col overflow-hidden">
                        {/* Mobile close button inside sidebar */}
                        <div className="md:hidden flex justify-end p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(false)}
                                className="rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                                aria-label="Close sidebar"
                            >
                                <FiX className="w-5 h-5" />
                            </Button>
                        </div>

                        <UserSidebar
                            adminId={adminId}
                            onSelectUser={handleSelectUser}
                            selectedUserId={selectedUserId}
                        />
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {sidebarOpen && isMobile && (
                    <div
                        className="fixed inset-0 z-30 bg-black/60 md:hidden backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* Chat window */}
                <main className="flex-1 min-w-0 h-full overflow-hidden">
                    <Card className="h-full min-h-0 rounded-none border-0 shadow-none">
                        <ChatWindow adminId={adminId} userId={selectedUserId} />
                    </Card>
                </main>
            </div>
        </div>
    );
}