// components/company/EmployeesTable.tsx
"use client";

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { EmployeeListItemDTO } from "@/types/employee.types";
import { MdArrowBack, MdArrowForward, MdPeople } from "react-icons/md";

interface Props {
    items: EmployeeListItemDTO[];
    total: number;
    page: number;
    pages: number;
    limit: number;
    loading: boolean;
    error?: string;
    onPageChange: (page: number) => void;
}

export function EmployeesTable({ items, total, page, pages, loading, error, onPageChange }: Props) {
    const getStatusVariant = (status: string) => {
        switch (status) {
            case "active":
                return "default";
            case "onLeave":
                return "secondary";
            default:
                return "outline";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
            case "onLeave":
                return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
            default:
                return "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20";
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4"
                >
                    <p className="text-sm text-red-800 dark:text-red-400 font-medium">Error: {error}</p>
                </motion.div>
            )}

            <div className="relative">
                {/* Glass effect overlay for loading */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-medium text-muted-foreground">Loading employees...</p>
                        </div>
                    </motion.div>
                )}

                {/* Enhanced table container with gradient border */}
                <div className="relative rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/20 overflow-hidden shadow-lg">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-border/50 bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="font-semibold text-foreground/90">Name</TableHead>
                                    <TableHead className="font-semibold text-foreground/90">Role</TableHead>
                                    <TableHead className="font-semibold text-foreground/90">Sub-role</TableHead>
                                    <TableHead className="font-semibold text-foreground/90">Position</TableHead>
                                    <TableHead className="font-semibold text-foreground/90">Department</TableHead>
                                    <TableHead className="font-semibold text-foreground/90">Status</TableHead>
                                    <TableHead className="font-semibold text-foreground/90">Joined</TableHead>
                                    <TableHead className="font-semibold text-foreground/90">Updated</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="wait">
                                    {items.length === 0 && !loading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-64">
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="flex flex-col items-center justify-center gap-3"
                                                >
                                                    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
                                                        <MdPeople className="h-8 w-8 text-muted-foreground/50" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-medium text-foreground/80">No employees found</p>
                                                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search terms</p>
                                                    </div>
                                                </motion.div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((e, index) => (
                                            <motion.tr
                                                key={e.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{
                                                    duration: 0.2,
                                                    delay: index * 0.03,
                                                    ease: "easeOut"
                                                }}
                                                className="border-b border-border/30 hover:bg-muted/40 transition-colors duration-200 group"
                                            >
                                                <TableCell className="font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                                                    {e.fullName}
                                                </TableCell>
                                                <TableCell className="text-foreground/70">{e.role}</TableCell>
                                                <TableCell className="text-foreground/70">{e.subRole}</TableCell>
                                                <TableCell className="text-foreground/70">{e.position}</TableCell>
                                                <TableCell className="text-foreground/70">
                                                    {e.department ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50 text-xs font-medium">
                                                            {e.department}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={getStatusVariant(e.status)}
                                                        className={`${getStatusColor(e.status)} font-medium capitalize shadow-sm`}
                                                    >
                                                        <span className="relative flex h-2 w-2 mr-1.5">
                                                            {e.status === "active" && (
                                                                <>
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                                </>
                                                            )}
                                                            {e.status === "onLeave" && (
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                                            )}
                                                            {e.status !== "active" && e.status !== "onLeave" && (
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                                                            )}
                                                        </span>
                                                        {e.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground font-mono">
                                                    {e.dateOfJoining}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground font-mono">
                                                    {e.updatedAt}
                                                </TableCell>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Enhanced pagination footer */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary/60" />
                    <p className="text-sm font-medium text-foreground/80">
                        Showing <span className="text-foreground font-semibold">{items.length}</span> of{" "}
                        <span className="text-foreground font-semibold">{total}</span>
                    </p>
                    <span className="text-muted-foreground">•</span>
                    <p className="text-sm text-muted-foreground">
                        Page <span className="font-semibold text-foreground/80">{page}</span> /{" "}
                        <span className="font-semibold text-foreground/80">{pages}</span>
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        disabled={page <= 1 || loading}
                        className="gap-1.5 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                    >
                        <MdArrowBack className="h-4 w-4" />
                        <span className="hidden sm:inline">Previous</span>
                    </Button>

                    {/* Page numbers for larger screens */}
                    <div className="hidden md:flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                            let pageNum;
                            if (pages <= 5) {
                                pageNum = i + 1;
                            } else if (page <= 3) {
                                pageNum = i + 1;
                            } else if (page >= pages - 2) {
                                pageNum = pages - 4 + i;
                            } else {
                                pageNum = page - 2 + i;
                            }

                            return (
                                <Button
                                    key={pageNum}
                                    variant={page === pageNum ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => onPageChange(pageNum)}
                                    disabled={loading}
                                    className={`h-8 w-8 p-0 transition-all duration-200 ${page === pageNum ? "shadow-md scale-105" : "hover:scale-105"
                                        }`}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(Math.min(pages, page + 1))}
                        disabled={page >= pages || loading}
                        className="gap-1.5 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <MdArrowForward className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}