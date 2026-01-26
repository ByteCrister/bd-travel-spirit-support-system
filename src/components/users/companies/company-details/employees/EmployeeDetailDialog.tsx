"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmployeeDetailDTO, PayrollRecordDTO } from "@/types/employee.types";
import {
    MdPerson,
    MdEmail,
    MdPhone,
    MdWork,
    MdCalendarToday,
    MdAttachMoney,
    MdAccessTime,
    MdDescription,
    MdContactEmergency,
    MdHistory,
    MdPayment,
} from "react-icons/md";
import { EmployeeDetailDialogSkeleton } from "./EmployeeDetailDialogSkeleton";
import Image from "next/image";

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
        if (amount === undefined || amount === null) return "—";
        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
            }).format(amount);
        } catch {
            return `${amount} ${currency}`;
        }
    };

    const getStatusColor = (status: string | undefined) => {
        switch (status) {
            case "active":
                return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50";
            case "onLeave":
                return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/50";
            case "suspended":
                return "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 dark:border-orange-800/50";
            case "terminated":
                return "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800/50";
            default:
                return "bg-slate-50 text-slate-700 dark:bg-slate-950/50 dark:text-slate-300 border-slate-200 dark:border-slate-800/50";
        }
    };

    const getPaymentStatusColor = (status: string | undefined) => {
        switch (status) {
            case "paid":
                return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50";
            case "pending":
                return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/50";
            case "failed":
                return "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800/50";
            default:
                return "bg-slate-50 text-slate-700 dark:bg-slate-950/50 dark:text-slate-300 border-slate-200 dark:border-slate-800/50";
        }
    };

    const formatStatus = (status: string | undefined): string => {
        if (!status) return "—";
        return status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, " $1").trim();
    };

    const renderAvatar = (name?: string, avatarId?: string | undefined) => {
        const isUrl = !!avatarId && (avatarId.startsWith("http://") || avatarId.startsWith("https://"));
        if (isUrl) {
            return (
                <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-primary/10 shadow-lg">
                    <Image
                        src={avatarId as string}
                        alt={name ?? "avatar"}
                        width={80}
                        height={80}
                        className="object-cover"
                        unoptimized
                        priority={false}
                    />
                </div>
            );
        }

        return (
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 font-bold text-primary text-3xl border-2 border-primary/10 shadow-lg">
                {name?.charAt(0)?.toUpperCase() || "?"}
            </div>
        );
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
                                {renderAvatar(employee.user?.name, employee.avatar)}
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-2xl font-bold text-foreground mb-2">
                                        {employee.user?.name ?? "—"}
                                    </DialogTitle>
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
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

                                        {/* Employment type badge */}
                                        {employee.employmentType && (
                                            <Badge className="bg-primary/10 text-primary border-primary/20">
                                                {employee.employmentType.replace('_', ' ')}
                                            </Badge>
                                        )}

                                        {/* Payment mode badge */}
                                        {employee.paymentMode && (
                                            <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                                                {employee.paymentMode === 'auto' ? 'Auto Pay' : 'Manual Pay'}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        <span>{employee.user?.email ?? "—"}</span>
                                        <span className="mx-2">•</span>
                                        <span>{employee.user?.phone ?? "—"}</span>
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
                                        <InfoItem label="Full name" value={employee.user?.name ?? "—"} icon={MdPerson} />
                                        <InfoItem label="Email" value={employee.contactInfo?.email ?? employee.user?.email ?? "—"} icon={MdEmail} />
                                        <InfoItem label="Phone" value={employee.contactInfo?.phone ?? employee.user?.phone ?? "—"} icon={MdPhone} />
                                    </InfoGrid>
                                </Section>

                                {/* Emergency Contact */}
                                {employee.contactInfo?.emergencyContact ? (
                                    <Section icon={MdContactEmergency} title="Emergency Contact">
                                        <InfoGrid>
                                            <InfoItem label="Name" value={employee.contactInfo.emergencyContact.name ?? "—"} />
                                            <InfoItem label="Phone" value={employee.contactInfo.emergencyContact.phone ?? "—"} icon={MdPhone} />
                                            <InfoItem label="Relation" value={employee.contactInfo.emergencyContact.relation ?? "—"} capitalize />
                                        </InfoGrid>
                                    </Section>
                                ) : null}

                                {/* Employment Details */}
                                <Section icon={MdWork} title="Employment Details">
                                    <InfoGrid>
                                        {employee.employmentType && (
                                            <InfoItem label="Employment Type" value={employee.employmentType.replace('_', ' ')} capitalize />
                                        )}
                                        <InfoItem label="Date of Joining" value={formatDate(employee.dateOfJoining)} icon={MdCalendarToday} />
                                        {employee.dateOfLeaving && (
                                            <InfoItem label="Date of Leaving" value={formatDate(employee.dateOfLeaving)} icon={MdCalendarToday} />
                                        )}
                                        <InfoItem label="Base Salary" value={formatCurrency(employee.salary, employee.currency)} icon={MdAttachMoney} />
                                        <InfoItem label="Last Login" value={employee.lastLogin ? formatDate(employee.lastLogin) : "—"} icon={MdHistory} />
                                        {employee.companyId && (
                                            <InfoItem label="Company ID" value={employee.companyId} />
                                        )}
                                    </InfoGrid>
                                </Section>

                                {/* Current Month Payment Status */}
                                {employee.currentMonthPayment && (
                                    <Section icon={MdPayment} title="Current Month Payment">
                                        <div className="p-4 rounded-lg border border-border/40 bg-muted/20">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={getPaymentStatusColor(employee.currentMonthPayment.status)}>
                                                            {formatStatus(employee.currentMonthPayment.status)}
                                                        </Badge>
                                                        <span className="font-semibold">
                                                            {formatCurrency(employee.currentMonthPayment.amount, employee.currentMonthPayment.currency)}
                                                        </span>
                                                    </div>
                                                    {employee.currentMonthPayment.dueDate && (
                                                        <p className="text-sm text-muted-foreground">
                                                            Due: {formatDate(employee.currentMonthPayment.dueDate)}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-sm space-y-1">
                                                    {employee.currentMonthPayment.paidAt && (
                                                        <p className="text-muted-foreground">
                                                            Paid: {formatDate(employee.currentMonthPayment.paidAt)}
                                                        </p>
                                                    )}
                                                    {employee.currentMonthPayment.transactionRef && (
                                                        <p className="text-muted-foreground">
                                                            Ref: {employee.currentMonthPayment.transactionRef}
                                                        </p>
                                                    )}
                                                    {employee.currentMonthPayment.failureReason && (
                                                        <p className="text-rose-600">
                                                            {employee.currentMonthPayment.failureReason}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Section>
                                )}

                                {/* Salary History */}
                                {employee.salaryHistory && employee.salaryHistory.length > 0 && (
                                    <Section icon={MdAttachMoney} title="Salary History">
                                        <div className="space-y-3">
                                            {employee.salaryHistory
                                                .slice()
                                                .sort((a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime())
                                                .map((history, idx) => (
                                                    <div key={idx} className="p-4 rounded-lg border border-border/40 bg-muted/20">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-semibold">
                                                                {formatCurrency(history.amount, history.currency)}
                                                            </span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatDate(history.effectiveFrom)}
                                                            </span>
                                                        </div>
                                                        {history.effectiveTo && (
                                                            <p className="text-sm text-muted-foreground mb-2">
                                                                Effective to: {formatDate(history.effectiveTo)}
                                                            </p>
                                                        )}
                                                        {history.reason && (
                                                            <p className="text-sm">{history.reason}</p>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Work Shifts */}
                                {employee.shifts && employee.shifts.length > 0 && (
                                    <Section icon={MdAccessTime} title="Work Shifts">
                                        <div className="space-y-3">
                                            {employee.shifts.map((shift, idx) => (
                                                <div key={idx} className="p-4 rounded-lg border border-border/40 bg-muted/20">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-semibold text-sm">
                                                            {shift.startTime} - {shift.endTime}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {shift.days.join(", ")}
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
                                                            <p className="font-medium text-sm">{doc.type || "Document"}</p>
                                                            <p className="text-xs text-muted-foreground">Uploaded {formatDate(doc.uploadedAt)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{doc.url ? "Open" : "—"}</div>
                                                </a>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Payroll */}
                                {employee.payroll && employee.payroll.length > 0 && (
                                    <Section icon={MdAttachMoney} title="Payroll History">
                                        <div className="space-y-2">
                                            {employee.payroll
                                                .slice()
                                                .sort((a, b) => (b.year - a.year) || (b.month - a.month))
                                                .map((p: PayrollRecordDTO, i: number) => (
                                                    <div key={i} className="p-3 rounded-lg border border-border/40 bg-muted/10">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Badge className={getPaymentStatusColor(p.status)}>
                                                                        {formatStatus(p.status)}
                                                                    </Badge>
                                                                    <p className="font-medium">
                                                                        {p.year}/{String(p.month).padStart(2, "0")}
                                                                    </p>
                                                                </div>
                                                                {p.failureReason && (
                                                                    <p className="text-xs text-rose-600 mt-1">Failure: {p.failureReason}</p>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold">{formatCurrency(p.amount, p.currency)}</p>
                                                                {p.transactionRef && (
                                                                    <p className="text-xs text-muted-foreground">Ref: {p.transactionRef}</p>
                                                                )}
                                                                {p.paidAt && <p className="text-xs text-muted-foreground">Paid {formatDate(p.paidAt)}</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Audit Log */}
                                {employee.audit && employee.audit.length > 0 && (
                                    <Section icon={MdHistory} title="Audit Log">
                                        <div className="space-y-2">
                                            {employee.audit
                                                .slice()
                                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                .map((a, index) => (
                                                    <div key={index} className="p-3 rounded-lg border border-border/40 bg-muted/10">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    {a.action} {a.actor ? `— ${a.actor}` : ""}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">{formatDate(a.createdAt)}</p>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground text-right">
                                                                {a.ip && <div>IP: {a.ip}</div>}
                                                                {a.userAgent && <div>{a.userAgent}</div>}
                                                            </div>
                                                        </div>
                                                        {a.note && <p className="mt-2 text-sm whitespace-pre-wrap">{a.note}</p>}
                                                        {a.changes && (a.changes.before || a.changes.after) && (
                                                            <div className="mt-2 text-xs text-muted-foreground">
                                                                <div>
                                                                    <strong>Before:</strong>{" "}
                                                                    <pre className="inline whitespace-pre-wrap">{JSON.stringify(a.changes.before ?? {}, null, 2)}</pre>
                                                                </div>
                                                                <div className="mt-1">
                                                                    <strong>After:</strong>{" "}
                                                                    <pre className="inline whitespace-pre-wrap">{JSON.stringify(a.changes.after ?? {}, null, 2)}</pre>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Notes */}
                                {employee.notes && (
                                    <Section title="Notes">
                                        <div className="p-4 rounded-lg bg-muted/20 border border-border/40">
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{employee.notes}</p>
                                        </div>
                                    </Section>
                                )}

                                {/* Metadata */}
                                <Section title="Metadata">
                                    <InfoGrid>
                                        <InfoItem label="Created At" value={formatDate(employee.createdAt)} />
                                        <InfoItem label="Updated At" value={formatDate(employee.updatedAt)} />
                                        <InfoItem label="Employee ID" value={employee.id} />
                                        {employee.userId && (
                                            <InfoItem label="User ID" value={employee.userId} />
                                        )}
                                        <InfoItem
                                            label="Status"
                                            value={employee.isDeleted ? "Deleted" : "Active"}
                                            capitalize
                                        />
                                    </InfoGrid>
                                </Section>
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