"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  EmployeeDetailDTO,
  PayrollRecordDTO,
} from "@/types/employee/employee.types";
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
  MdOpenInNew,
} from "react-icons/md";
import { EmployeeDetailDialogSkeleton } from "./EmployeeDetailDialogSkeleton";
import Image from "next/image";
import {
  EMPLOYEE_STATUS,
  EmployeeStatus,
  PAYROLL_STATUS,
  PayrollStatus,
} from "@/constants/employee.const";

// ── Neumorphic style tokens ───────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";

const NEU_BADGE =
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-[family-name:var(--font-space-mono)] " +
  "bg-[#E7E5E4] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const NEU_SECTION_TITLE =
  "font-bold text-base font-[family-name:var(--font-space-mono)] text-[#1E2938] tracking-tight";

const NEU_LABEL =
  "text-xs font-bold font-[family-name:var(--font-space-mono)] uppercase tracking-widest text-[#1E2938]/50 mb-0.5";

const NEU_VALUE =
  "text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938] font-medium";

const NEU_CARD =
  "rounded-xl bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] p-4";

const NEU_RECORD_ROW =
  "p-3 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] border border-white/50";

const NEU_DOC_LINK =
  "flex items-center justify-between p-3 rounded-xl bg-[#E7E5E4] " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] border border-white/50 " +
  "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_DAY_CHIP =
  "inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold font-[family-name:var(--font-space-mono)] " +
  "bg-[#E7E5E4] text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const NEU_ICON_WELL =
  "flex h-5 w-5 items-center justify-center text-[#006666]/70";

// ─────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeDetailDTO | null;
  loading: boolean;
}

export function EmployeeDetailDialog({
  open,
  onOpenChange,
  employee,
  loading,
}: Props) {
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

  const formatCurrency = (
    amount: number | undefined,
    currency = "USD",
  ): string => {
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

  const getStatusBadgeClass = (status: EmployeeStatus | undefined) => {
    switch (status) {
      case EMPLOYEE_STATUS.ACTIVE:
        return `${NEU_BADGE} text-[#00A63D] bg-[#00A63D]/10`;
      case EMPLOYEE_STATUS.ON_LEAVE:
        return `${NEU_BADGE} text-[#FE9900] bg-[#FE9900]/10`;
      case EMPLOYEE_STATUS.SUSPENDED:
        return `${NEU_BADGE} text-[#FF2157] bg-[#FF2157]/10`;
      case EMPLOYEE_STATUS.TERMINATED:
        return `${NEU_BADGE} text-[#FF2157] bg-[#FF2157]/10`;
      default:
        return `${NEU_BADGE} text-[#1E2938]/60`;
    }
  };

  const getPaymentStatusClass = (status: PayrollStatus | undefined) => {
    switch (status) {
      case PAYROLL_STATUS.PAID:
        return `${NEU_BADGE} text-[#00A63D] bg-[#00A63D]/10`;
      case PAYROLL_STATUS.PENDING:
        return `${NEU_BADGE} text-[#FE9900] bg-[#FE9900]/10`;
      case PAYROLL_STATUS.FAILED:
        return `${NEU_BADGE} text-[#FF2157] bg-[#FF2157]/10`;
      default:
        return `${NEU_BADGE} text-[#1E2938]/60`;
    }
  };

  const formatStatus = (status: string | undefined): string => {
    if (!status) return "—";
    return (
      status.charAt(0).toUpperCase() +
      status
        .slice(1)
        .replace(/([A-Z])/g, " $1")
        .trim()
    );
  };

  const renderAvatar = (name?: string, avatarId?: string | undefined) => {
    const isUrl =
      !!avatarId &&
      (avatarId.startsWith("http://") || avatarId.startsWith("https://"));
    if (isUrl) {
      return (
        <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-white/60 shadow-[6px_6px_14px_#c8c6c5,-6px_-6px_14px_#ffffff] flex-shrink-0">
          <Image
            src={avatarId as string}
            alt={name ?? "avatar"}
            width={80}
            height={80}
            className="object-cover"
            unoptimized
          />
        </div>
      );
    }
    return (
      <div className="h-20 w-20 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-white text-3xl bg-[#006666] shadow-[6px_6px_14px_#004d4d,-4px_-4px_10px_#008080]">
        {name?.charAt(0)?.toUpperCase() || "?"}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden ${NEU_SURFACE} shadow-[12px_12px_24px_#c8c6c5,-12px_-12px_24px_#ffffff] border border-white/70 rounded-3xl`}
      >
        <DialogTitle className="sr-only">Employee Details</DialogTitle>

        {loading ? (
          <EmployeeDetailDialogSkeleton />
        ) : !employee ? (
          <div
            className={`flex items-center justify-center h-[500px] ${NEU_SURFACE}`}
          >
            <p className="font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50">
              Employee not found
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div
              className={`px-6 pt-6 pb-5 border-b border-[#c8c6c5]/50 ${NEU_SURFACE}`}
            >
              <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                {renderAvatar(employee.user?.name, employee.avatar)}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] tracking-tight mb-2">
                    {employee.user?.name ?? "—"}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={getStatusBadgeClass(employee.status)}>
                      {employee.status === EMPLOYEE_STATUS.ACTIVE && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A63D] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00A63D]" />
                        </span>
                      )}
                      {formatStatus(employee.status)}
                    </span>

                    {employee.employmentType && (
                      <span className={`${NEU_BADGE} text-[#006666]`}>
                        {employee.employmentType.replace("_", " ")}
                      </span>
                    )}

                    {employee.paymentMode && (
                      <span className={`${NEU_BADGE} text-[#1E2938]/70`}>
                        {employee.paymentMode === "auto"
                          ? "Auto Pay"
                          : "Manual Pay"}
                      </span>
                    )}
                  </div>
                  <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50">
                    {employee.user?.email ?? "—"}
                    <span className="mx-2 opacity-40">·</span>
                    {employee.user?.phone ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Body */}
            <ScrollArea
              className={`flex-1 h-[calc(90vh-200px)] ${NEU_SURFACE}`}
            >
              <div className="p-6 space-y-6">
                {/* Contact Information */}
                <Section icon={MdPerson} title="Contact Information">
                  <InfoGrid>
                    <InfoItem
                      label="Full Name"
                      value={employee.user?.name ?? "—"}
                      icon={MdPerson}
                    />
                    <InfoItem
                      label="Email"
                      value={
                        employee.contactInfo?.email ??
                        employee.user?.email ??
                        "—"
                      }
                      icon={MdEmail}
                    />
                    <InfoItem
                      label="Phone"
                      value={
                        employee.contactInfo?.phone ??
                        employee.user?.phone ??
                        "—"
                      }
                      icon={MdPhone}
                    />
                  </InfoGrid>
                </Section>

                {/* Emergency Contact */}
                {employee.contactInfo?.emergencyContact && (
                  <Section icon={MdContactEmergency} title="Emergency Contact">
                    <InfoGrid>
                      <InfoItem
                        label="Name"
                        value={
                          employee.contactInfo.emergencyContact.name ?? "—"
                        }
                      />
                      <InfoItem
                        label="Phone"
                        value={
                          employee.contactInfo.emergencyContact.phone ?? "—"
                        }
                        icon={MdPhone}
                      />
                      <InfoItem
                        label="Relation"
                        value={
                          employee.contactInfo.emergencyContact.relation ?? "—"
                        }
                        capitalize
                      />
                    </InfoGrid>
                  </Section>
                )}

                {/* Employment Details */}
                <Section icon={MdWork} title="Employment Details">
                  <InfoGrid>
                    {employee.employmentType && (
                      <InfoItem
                        label="Employment Type"
                        value={employee.employmentType.replace("_", " ")}
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
                    <InfoItem
                      label="Base Salary"
                      value={formatCurrency(employee.salary, employee.currency)}
                      icon={MdAttachMoney}
                    />
                    <InfoItem
                      label="Last Login"
                      value={
                        employee.lastLogin
                          ? formatDate(employee.lastLogin)
                          : "—"
                      }
                      icon={MdHistory}
                    />
                    {employee.companyId && (
                      <InfoItem label="Company ID" value={employee.companyId} />
                    )}
                  </InfoGrid>
                </Section>

                {/* Current Month Payment */}
                {employee.currentMonthPayment && (
                  <Section icon={MdPayment} title="Current Month Payment">
                    <div className={NEU_CARD}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={getPaymentStatusClass(
                                employee.currentMonthPayment.status,
                              )}
                            >
                              {formatStatus(
                                employee.currentMonthPayment.status,
                              )}
                            </span>
                            <span className="font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]">
                              {formatCurrency(
                                employee.currentMonthPayment.amount,
                                employee.currentMonthPayment.currency,
                              )}
                            </span>
                          </div>
                          {employee.currentMonthPayment.dueDate && (
                            <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50">
                              Due:{" "}
                              {formatDate(employee.currentMonthPayment.dueDate)}
                            </p>
                          )}
                        </div>
                        <div className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50 space-y-1 text-right">
                          {employee.currentMonthPayment.paidAt && (
                            <p>
                              Paid:{" "}
                              {formatDate(employee.currentMonthPayment.paidAt)}
                            </p>
                          )}
                          {employee.currentMonthPayment.transactionRef && (
                            <p>
                              Ref: {employee.currentMonthPayment.transactionRef}
                            </p>
                          )}
                          {employee.currentMonthPayment.failureReason && (
                            <p className="text-[#FF2157]">
                              {employee.currentMonthPayment.failureReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Section>
                )}

                {/* Salary History */}
                {employee.salaryHistory &&
                  employee.salaryHistory.length > 0 && (
                    <Section icon={MdAttachMoney} title="Salary History">
                      <div className="space-y-2">
                        {employee.salaryHistory
                          .slice()
                          .sort(
                            (a, b) =>
                              new Date(b.effectiveFrom).getTime() -
                              new Date(a.effectiveFrom).getTime(),
                          )
                          .map((history, idx) => (
                            <div key={idx} className={NEU_RECORD_ROW}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]">
                                  {formatCurrency(
                                    history.amount,
                                    history.currency,
                                  )}
                                </span>
                                <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50">
                                  {formatDate(history.effectiveFrom)}
                                </span>
                              </div>
                              {history.effectiveTo && (
                                <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50">
                                  Until: {formatDate(history.effectiveTo)}
                                </p>
                              )}
                              {history.reason && (
                                <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/70 mt-1">
                                  {history.reason}
                                </p>
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
                        <div key={idx} className={NEU_RECORD_ROW}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] text-sm">
                              {shift.startTime} – {shift.endTime}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {shift.days.map((day) => (
                              <span key={day} className={NEU_DAY_CHIP}>
                                {day}
                              </span>
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
                          className={NEU_DOC_LINK}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E7E5E4] shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
                              <MdDescription className="h-4 w-4 text-[#006666]" />
                            </div>
                            <div>
                              <p className="font-bold text-sm font-[family-name:var(--font-space-mono)] text-[#1E2938]">
                                {doc.type || "Document"}
                              </p>
                              <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50">
                                Uploaded {formatDate(doc.uploadedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#006666]">
                            Open
                            <MdOpenInNew className="h-3.5 w-3.5" />
                          </div>
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
                        .sort((a, b) => b.year - a.year || b.month - a.month)
                        .map((p: PayrollRecordDTO, i: number) => (
                          <div key={i} className={NEU_RECORD_ROW}>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className={getPaymentStatusClass(p.status)}
                                  >
                                    {formatStatus(p.status)}
                                  </span>
                                  <span className="font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] text-sm">
                                    {p.year}/{String(p.month).padStart(2, "0")}
                                  </span>
                                </div>
                                {p.failureReason && (
                                  <p className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#FF2157] mt-0.5">
                                    {p.failureReason}
                                  </p>
                                )}
                              </div>
                              <div className="text-right font-[family-name:var(--font-jetbrains-mono)]">
                                <p className="font-semibold text-[#1E2938] text-sm">
                                  {formatCurrency(p.amount, p.currency)}
                                </p>
                                {p.transactionRef && (
                                  <p className="text-xs text-[#1E2938]/50">
                                    Ref: {p.transactionRef}
                                  </p>
                                )}
                                {p.paidAt && (
                                  <p className="text-xs text-[#1E2938]/50">
                                    Paid {formatDate(p.paidAt)}
                                  </p>
                                )}
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
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime(),
                        )
                        .map((a, index) => (
                          <div key={index} className={NEU_RECORD_ROW}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]">
                                  {a.action}
                                  {a.actor ? (
                                    <span className="font-normal text-[#1E2938]/60">
                                      {" "}
                                      — {a.actor}
                                    </span>
                                  ) : null}
                                </p>
                                <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50">
                                  {formatDate(a.createdAt)}
                                </p>
                              </div>
                              <div className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40 text-right">
                                {a.ip && <div>IP: {a.ip}</div>}
                              </div>
                            </div>
                            {a.note && (
                              <p className="mt-2 font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/70 whitespace-pre-wrap">
                                {a.note}
                              </p>
                            )}
                            {a.changes &&
                              (a.changes.before || a.changes.after) && (
                                <div className="mt-2 font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50">
                                  <div>
                                    <strong>Before:</strong>{" "}
                                    <pre className="inline whitespace-pre-wrap">
                                      {JSON.stringify(
                                        a.changes.before ?? {},
                                        null,
                                        2,
                                      )}
                                    </pre>
                                  </div>
                                  <div className="mt-1">
                                    <strong>After:</strong>{" "}
                                    <pre className="inline whitespace-pre-wrap">
                                      {JSON.stringify(
                                        a.changes.after ?? {},
                                        null,
                                        2,
                                      )}
                                    </pre>
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
                    <div className={NEU_CARD}>
                      <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/70 whitespace-pre-wrap">
                        {employee.notes}
                      </p>
                    </div>
                  </Section>
                )}

                {/* Timestamps */}
                <div className="pt-4 border-t border-[#c8c6c5]/60">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40">
                      Created: {formatDate(employee.createdAt)}
                    </p>
                    <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40">
                      Updated: {formatDate(employee.updatedAt)}
                    </p>
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

// ── Helper components ──────────────────────────────────────────

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
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className={NEU_ICON_WELL}>
            <Icon className="h-5 w-5" />
          </span>
        )}
        <h3 className={NEU_SECTION_TITLE}>{title}</h3>
      </div>
      <div className="h-px w-full bg-[#c8c6c5]/50" />
      {children}
    </div>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
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
    <div className="space-y-0.5">
      <p className={NEU_LABEL}>{label}</p>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-[#006666]/60 flex-shrink-0" />}
        <p className={`${NEU_VALUE} ${capitalize ? "capitalize" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
