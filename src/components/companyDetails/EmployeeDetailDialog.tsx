// components/company/EmployeeDetailDialog.tsx

"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmployeeDetailDTO } from "@/types/employee.types";
import {
    MdPerson,
    MdEmail,
    MdPhone,
    MdWork,
    MdCalendarToday,
    MdAttachMoney,
    MdAccessTime,
    MdStarRate,
    MdDescription,
    MdSecurity,
    MdContactEmergency,
    MdBadge,
} from "react-icons/md";
import { EmployeeDetailDialogSkeleton } from "./EmployeeDetailDialogSkeleton";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee: EmployeeDetailDTO | null;
    loading: boolean;
}

export function EmployeeDetailDialog({ open, onOpenChange, employee, loading }: Props) {
    const formatDate = (dateString: string | Date | null | undefined): string => {
        if (!dateString) return "—";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "—";
            return new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }).format(date);
        } catch {
            return "—";
        }
    };

    const formatCurrency = (amount: number | undefined, currency: string = "USD"): string => {
        if (amount === undefined) return "—";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50";
            case "onLeave":
                return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/50";
            default:
                return "bg-slate-50 text-slate-700 dark:bg-slate-950/50 dark:text-slate-300 border-slate-200 dark:border-slate-800/50";
        }
    };

    const formatStatus = (status: string): string => {
        return status.replace(/([A-Z])/g, " $1").trim();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
                <DialogTitle className="sr-only">Employee Details</DialogTitle>
                {loading ? (
                    <EmployeeDetailDialogSkeleton />
                ) : !employee ? (
                    <div className="flex items-center justify-center h-[500px]">
                        <p className="text-muted-foreground">Employee not found</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-gradient-to-br from-primary/5 to-transparent">
                            <div className="flex items-start gap-4">
                                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 font-bold text-primary text-3xl border-2 border-primary/10 shadow-lg">
                                    {employee.user.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-2xl font-bold text-foreground mb-2">
                                        {employee.user.name}
                                    </DialogTitle>
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <Badge className="font-semibold">{employee.position}</Badge>
                                        <Badge variant="outline">{employee.role}</Badge>
                                        {employee.subRole && (
                                            <Badge variant="secondary">{employee.subRole}</Badge>
                                        )}
                                        <Badge className={getStatusColor(employee.status)}>
                                            <span className="relative flex h-2 w-2 mr-2">
                                                {employee.status === "active" && (
                                                    <>
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                                    </>
                                                )}
                                            </span>
                                            {formatStatus(employee.status)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Scrollable Content */}
                        <ScrollArea className="flex-1 h-[calc(90vh-200px)]">
                            <div className="p-6 space-y-6">
                                {/* Contact Information */}
                                <Section icon={MdPerson} title="Contact Information">
                                    <InfoGrid>
                                        {employee.contactInfo.email && (
                                            <InfoItem
                                                label="Email"
                                                value={employee.contactInfo.email}
                                                icon={MdEmail}
                                            />
                                        )}
                                        {employee.contactInfo.phone && (
                                            <InfoItem
                                                label="Phone"
                                                value={employee.contactInfo.phone}
                                                icon={MdPhone}
                                            />
                                        )}
                                    </InfoGrid>
                                </Section>

                                {/* Emergency Contact */}
                                {employee.contactInfo.emergencyContact && (
                                    <Section icon={MdContactEmergency} title="Emergency Contact">
                                        <InfoGrid>
                                            <InfoItem
                                                label="Name"
                                                value={employee.contactInfo.emergencyContact.name}
                                            />
                                            <InfoItem
                                                label="Phone"
                                                value={employee.contactInfo.emergencyContact.phone}
                                            />
                                            <InfoItem
                                                label="Relation"
                                                value={employee.contactInfo.emergencyContact.relation}
                                                capitalize
                                            />
                                        </InfoGrid>
                                    </Section>
                                )}

                                {/* Employment Details */}
                                <Section icon={MdWork} title="Employment Details">
                                    <InfoGrid>
                                        {employee.department && (
                                            <InfoItem label="Department" value={employee.department} />
                                        )}
                                        {employee.employmentType && (
                                            <InfoItem
                                                label="Employment Type"
                                                value={employee.employmentType}
                                                capitalize
                                            />
                                        )}
                                        <InfoItem
                                            label="Date of Joining"
                                            value={formatDate(employee.dateOfJoining)}
                                            icon={MdCalendarToday}
                                        />
                                        {employee.dateOfLeaving && (
                                            <InfoItem
                                                label="Date of Leaving"
                                                value={formatDate(employee.dateOfLeaving)}
                                                icon={MdCalendarToday}
                                            />
                                        )}
                                        {employee.salary && (
                                            <InfoItem
                                                label="Base Salary"
                                                value={formatCurrency(employee.salary, employee.salaryCurrency)}
                                                icon={MdAttachMoney}
                                            />
                                        )}
                                    </InfoGrid>
                                </Section>

                                {/* Work Shifts */}
                                {employee.shifts && employee.shifts.length > 0 && (
                                    <Section icon={MdAccessTime} title="Work Shifts">
                                        <div className="space-y-3">
                                            {employee.shifts.map((shift, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-4 rounded-lg border border-border/40 bg-muted/20"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-semibold text-sm">
                                                            {shift.startTime} - {shift.endTime}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {shift.days.map((day) => (
                                                            <Badge key={day} variant="outline" className="text-xs">
                                                                {day}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Performance */}
                                {employee.performance && (
                                    <Section icon={MdStarRate} title="Performance">
                                        <InfoGrid>
                                            {employee.performance.rating && (
                                                <InfoItem
                                                    label="Rating"
                                                    value={`${employee.performance.rating}/5`}
                                                />
                                            )}
                                            {employee.performance.lastReview && (
                                                <InfoItem
                                                    label="Last Review"
                                                    value={formatDate(employee.performance.lastReview)}
                                                />
                                            )}
                                        </InfoGrid>
                                        {employee.performance.feedback && (
                                            <div className="mt-3 p-4 rounded-lg bg-muted/20 border border-border/40">
                                                <p className="text-sm text-muted-foreground">
                                                    {employee.performance.feedback}
                                                </p>
                                            </div>
                                        )}
                                    </Section>
                                )}

                                {/* Permissions */}
                                {employee.permissions && employee.permissions.length > 0 && (
                                    <Section icon={MdSecurity} title="Permissions">
                                        <div className="flex flex-wrap gap-2">
                                            {employee.permissions.map((perm, idx) => (
                                                <Badge key={idx} variant="secondary" className="font-mono text-xs">
                                                    {perm}
                                                </Badge>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Documents */}
                                {employee.documents && employee.documents.length > 0 && (
                                    <Section icon={MdDescription} title="Documents">
                                        <div className="space-y-2">
                                            {employee.documents.map((doc, idx) => (
                                                <a
                                                    key={idx}
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/40 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <MdDescription className="h-5 w-5 text-primary" />
                                                        <div>
                                                            <p className="font-medium text-sm">{doc.type}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Uploaded {formatDate(doc.uploadedAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Notes */}
                                {employee.notes && (
                                    <Section title="Notes">
                                        <div className="p-4 rounded-lg bg-muted/20 border border-border/40">
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {employee.notes}
                                            </p>
                                        </div>
                                    </Section>
                                )}

                                {/* Audit Info */}
                                <div className="pt-4 border-t border-border/40">
                                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                        <div>
                                            <span className="font-semibold">Created: </span>
                                            {formatDate(employee.createdAt)} by {employee.audit.createdBy}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Updated: </span>
                                            {formatDate(employee.updatedAt)} by {employee.audit.updatedBy}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );

}

// Helper Components
function Section({
    icon: Icon,
    title,
    children,
}: {
    icon?: React.ComponentType<{ className?: string }>;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                {Icon && <Icon className="h-5 w-5 text-primary" />}
                <h3 className="font-bold text-lg text-foreground">{title}</h3>
            </div>
            <Separator className="bg-border/40" />
            {children}
        </div>
    );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function InfoItem({
    label,
    value,
    icon: Icon,
    capitalize,
}: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    capitalize?: boolean;
}) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
            <div className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 text-primary/70" />}
                <p className={`text-sm font-medium text-foreground ${capitalize ? "capitalize" : ""}`}>{value}</p>
            </div>
        </div>
    );
}