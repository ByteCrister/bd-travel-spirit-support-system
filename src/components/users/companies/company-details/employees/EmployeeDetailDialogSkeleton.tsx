"use client";

import { motion } from "framer-motion";
import {
    MdPerson,
    MdContactEmergency,
    MdWork,
    MdAttachMoney,
    MdAccessTime,
    MdStarRate,
    MdSecurity,
    MdDescription,
} from "react-icons/md";
import React from "react";

export function EmployeeDetailDialogSkeleton() {
    return (
        <div className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden bg-transparent">
            <h2 className="sr-only">Employee Details</h2>

            <motion.div
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="px-6 pt-6 pb-4 border-b border-slate-300 bg-gradient-to-br from-slate-50 to-transparent"
            >
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="h-20 w-20 rounded-2xl bg-slate-200 flex items-center justify-center border border-slate-300 shadow">
                            <div className="h-10 w-10 rounded-full bg-slate-300 animate-pulse" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="h-6 w-56 rounded-md bg-slate-200 animate-pulse mb-3" />
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="h-6 w-20 rounded-md bg-slate-200 animate-pulse" />
                                    <div className="h-6 w-20 rounded-md bg-slate-200 animate-pulse" />
                                    <div className="h-6 w-20 rounded-md bg-slate-200 animate-pulse" />
                                </div>
                                <div className="mt-3 h-4 w-36 rounded-md bg-slate-200 animate-pulse" />
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="h-8 w-24 rounded-md bg-slate-200 animate-pulse" />
                                <div className="h-8 w-8 rounded-md bg-slate-200 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="flex-1 h-[calc(90vh-220px)] overflow-auto bg-white">
                <div className="p-6 space-y-6">
                    <SectionSkeleton icon={MdPerson} titleWidth="w-44">
                        <GridSkeleton cols={3}>
                            <CellSkeleton />
                            <CellSkeleton />
                            <CellSkeleton />
                            <CellSkeleton />
                            <CellSkeleton />
                            <CellSkeleton />
                        </GridSkeleton>
                    </SectionSkeleton>

                    <SectionSkeleton icon={MdContactEmergency} titleWidth="w-48">
                        <GridSkeleton cols={3}>
                            <CellSkeleton />
                            <CellSkeleton />
                            <CellSkeleton />
                        </GridSkeleton>
                    </SectionSkeleton>

                    <SectionSkeleton icon={MdWork} titleWidth="w-40">
                        <GridSkeleton cols={3}>
                            <CellSkeleton />
                            <CellSkeleton />
                            <CellSkeleton />
                            <CellSkeleton />
                            <CellSkeleton />
                            <CellSkeleton />
                        </GridSkeleton>
                    </SectionSkeleton>

                    <SectionSkeleton icon={MdAttachMoney} titleWidth="w-44">
                        <GridSkeleton cols={3}>
                            <CellSkeleton />
                            <CellSkeleton />
                            <CellSkeleton />
                            <CellSkeleton />
                        </GridSkeleton>
                    </SectionSkeleton>

                    <SectionSkeleton icon={MdAccessTime} titleWidth="w-44">
                        <div className="space-y-3">
                            <div className="p-3 rounded-lg border border-slate-300 bg-slate-100">
                                <div className="h-4 w-40 rounded-md bg-slate-200 animate-pulse mb-2" />
                                <div className="flex gap-2">
                                    <div className="h-6 w-12 rounded-md bg-slate-200 animate-pulse" />
                                    <div className="h-6 w-12 rounded-md bg-slate-200 animate-pulse" />
                                    <div className="h-6 w-12 rounded-md bg-slate-200 animate-pulse" />
                                </div>
                            </div>

                            <div className="p-3 rounded-lg border border-slate-300 bg-slate-100">
                                <div className="h-4 w-40 rounded-md bg-slate-200 animate-pulse mb-2" />
                                <div className="flex gap-2">
                                    <div className="h-6 w-12 rounded-md bg-slate-200 animate-pulse" />
                                    <div className="h-6 w-12 rounded-md bg-slate-200 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </SectionSkeleton>

                    <SectionSkeleton icon={MdStarRate} titleWidth="w-36">
                        <GridSkeleton cols={3}>
                            <CellSkeleton />
                            <CellSkeleton />
                        </GridSkeleton>

                        <div className="mt-3 p-4 rounded-lg bg-slate-100 border border-slate-300">
                            <div className="h-12 w-full rounded-md bg-slate-200 animate-pulse" />
                        </div>
                    </SectionSkeleton>

                    <SectionSkeleton icon={MdSecurity} titleWidth="w-36">
                        <div className="flex flex-wrap gap-2">
                            <div className="h-6 w-24 rounded-md bg-slate-200 animate-pulse" />
                            <div className="h-6 w-28 rounded-md bg-slate-200 animate-pulse" />
                            <div className="h-6 w-20 rounded-md bg-slate-200 animate-pulse" />
                        </div>
                    </SectionSkeleton>

                    <SectionSkeleton icon={MdDescription} titleWidth="w-36">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-300 bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="h-5 w-5 rounded-md bg-slate-200 animate-pulse" />
                                    <div>
                                        <div className="h-4 w-36 rounded-md bg-slate-200 animate-pulse mb-1" />
                                        <div className="h-3 w-28 rounded-md bg-slate-200/70 animate-pulse" />
                                    </div>
                                </div>
                                <div className="h-4 w-10 rounded-md bg-slate-200/70 animate-pulse" />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-300 bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="h-5 w-5 rounded-md bg-slate-200 animate-pulse" />
                                    <div>
                                        <div className="h-4 w-36 rounded-md bg-slate-200 animate-pulse mb-1" />
                                        <div className="h-3 w-28 rounded-md bg-slate-200/70 animate-pulse" />
                                    </div>
                                </div>
                                <div className="h-4 w-10 rounded-md bg-slate-200/70 animate-pulse" />
                            </div>
                        </div>
                    </SectionSkeleton>

                    <SectionSkeleton titleWidth="w-28">
                        <div className="p-4 rounded-lg bg-slate-100 border border-slate-300">
                            <div className="h-16 w-full rounded-md bg-slate-200 animate-pulse" />
                        </div>
                    </SectionSkeleton>

                    <div className="pt-4 border-t border-slate-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500">
                            <div>
                                <div className="h-3 w-48 rounded-md bg-slate-200 animate-pulse" />
                            </div>
                            <div>
                                <div className="h-3 w-48 rounded-md bg-slate-200 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* Small skeleton helpers */

type IconComp = React.ComponentType<{ className?: string }>;

interface SectionSkeletonProps {
    icon?: IconComp;
    titleWidth?: string;
    children?: React.ReactNode;
    title?: string;
}

export function SectionSkeleton({ icon: Icon, titleWidth = "w-40", children }: SectionSkeletonProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                {Icon ? <Icon className="h-5 w-5 text-slate-600" /> : <div className="h-5 w-5 rounded bg-slate-200" />}
                <div className={`h-4 ${titleWidth} rounded-md bg-slate-200 animate-pulse`} />
            </div>

            <div className="h-px w-full bg-slate-200" />
            <div>{children}</div>
        </div>
    );
}

function GridSkeleton({ cols = 2, children }: { cols?: number; children: React.ReactNode }) {
    const colClass = cols === 3 ? "lg:grid-cols-3 sm:grid-cols-2 grid-cols-1" : cols === 2 ? "sm:grid-cols-2 grid-cols-1" : "grid-cols-1";
    return <div className={`grid ${colClass} gap-4`}>{children}</div>;
}

function CellSkeleton() {
    return (
        <div className="space-y-2">
            <div className="h-3 w-32 rounded-md bg-slate-200 animate-pulse" />
            <div className="h-5 w-full rounded-md bg-slate-300 animate-pulse" />
        </div>
    );
}
