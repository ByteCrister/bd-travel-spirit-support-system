import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import {
    Loader2,
    Edit2,
    Info,
    Trash2,
} from "lucide-react";

type RowActionsProps = {
    updatePending?: boolean;
    deletePending?: boolean;
    setEditOpen: (v: boolean) => void;
    setDetailsOpen: (v: boolean) => void;
    setConfirmOpen: (v: boolean) => void;
};

export const RowActions: React.FC<RowActionsProps> = ({
    updatePending = false,
    deletePending = false,
    setEditOpen,
    setDetailsOpen,
    setConfirmOpen,
}) => {
    return (
        <div className="align-middle">
            <div className="flex items-center gap-2">
                <TooltipProvider>
                    {/* Primary edit button — visually prominent */}
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="shrink-0">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => setEditOpen(true)}
                                    disabled={updatePending}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-md shadow-sm bg-gradient-to-b from-emerald-500/95 to-emerald-600 text-white hover:from-emerald-500 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    aria-label="Edit item"
                                >
                                    {updatePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit2 className="h-4 w-4" />}
                                    <span className="hidden sm:inline font-medium">Edit</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-sm">
                                {updatePending ? "Saving..." : "Edit"}
                            </TooltipContent>
                        </Tooltip>
                    </motion.div>

                    {/* Details button — secondary */}
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDetailsOpen(true)}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md shadow-sm border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                    aria-label="View details"
                                >
                                    <Info className="h-4 w-4" />
                                    <span className="hidden sm:inline">Details</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-sm">
                                View details
                            </TooltipContent>
                        </Tooltip>
                    </motion.div>
                    {/* Inline delete for large screens (keeps affordance visible) */}
                    <div className="hidden md:block">
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setConfirmOpen(true)}
                                        disabled={deletePending}
                                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md shadow-sm text-white"
                                        aria-label="Delete item"
                                    >
                                        {deletePending ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Trash2 className="h-4 w-4 text-white" />}
                                        <span className="hidden lg:inline">Delete</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-sm">
                                    {deletePending ? "Deleting..." : "Delete"}
                                </TooltipContent>
                            </Tooltip>
                        </motion.div>
                    </div>
                </TooltipProvider>
            </div>
        </div>
    );
};
