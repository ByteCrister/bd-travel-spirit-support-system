'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    MdDashboard,
    MdBarChart,
    MdPeople,
    MdEvent,
    MdImage,
    MdReportProblem,
    MdNotifications,
    MdChat,
    MdWork,
} from 'react-icons/md';

const iconMap: Record<string, React.ReactNode> = {
    overview: <MdDashboard className="w-4 h-4" />,
    users: <MdPeople className="w-4 h-4" />,
    tours: <MdEvent className="w-4 h-4" />,
    reviews: <MdBarChart className="w-4 h-4" />,
    reports: <MdReportProblem className="w-4 h-4" />,
    media: <MdImage className="w-4 h-4" />,
    notifications: <MdNotifications className="w-4 h-4" />,
    chat: <MdChat className="w-4 h-4" />,
    employees: <MdWork className="w-4 h-4" />,
};

interface TabSection {
    id: string;
    label: string;
    content: React.ReactNode;
}

interface MainContentProps {
    tabSections: TabSection[];
}

export function MainContent({ tabSections }: MainContentProps) {
    return (
        <div className="flex-1 bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
                <Tabs defaultValue="overview" className="h-full">
                    {/* Professional Tab Navigation */}
                    <div className="sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                        <div className="py-3">
                            <TabsList className="
                                inline-flex h-9 items-center justify-start
                                rounded-lg bg-white dark:bg-gray-800
                                p-1 shadow-sm border border-gray-200 dark:border-gray-700
                                gap-1
                            ">
                                {tabSections.map((section) => (
                                    <TabsTrigger
                                        key={section.id}
                                        value={section.id}
                                        className="
                                            inline-flex items-center justify-center gap-1.5
                                            px-3 py-1.5 text-sm font-medium
                                            text-gray-600 dark:text-gray-400
                                            transition-all duration-200
                                            hover:text-gray-900 dark:hover:text-gray-200
                                            data-[state=active]:bg-gray-900 dark:data-[state=active]:bg-white
                                            data-[state=active]:text-white dark:data-[state=active]:text-gray-900
                                            data-[state=active]:shadow-sm
                                            rounded-md border-0
                                            focus-visible:outline-none focus-visible:ring-2 
                                            focus-visible:ring-gray-400 focus-visible:ring-offset-2
                                            whitespace-nowrap
                                        "
                                    >
                                        {iconMap[section.id]}
                                        <span className="hidden sm:inline">{section.label}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                    </div>

                    {/* Content Area with Optimized Spacing */}
                    <div className="pb-8">
                        {tabSections.map((section) => (
                            <TabsContent
                                key={section.id}
                                value={section.id}
                                className="
                                    mt-0 pt-6 
                                    focus-visible:outline-none
                                    data-[state=active]:animate-in 
                                    data-[state=active]:fade-in-50 
                                    data-[state=active]:duration-300
                                "
                            >
                                {section.content}
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
            </div>
        </div>
    );
}