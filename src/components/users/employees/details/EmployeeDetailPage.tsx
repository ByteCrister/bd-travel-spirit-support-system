"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useEmployeeStore } from "@/store/employee.store";

import {
    EmployeeDetailDTO,
    UpdateEmployeePayload,
    SalaryHistoryDTO,
    PositionHistoryDTO,
    ContactInfoDTO,
    PerformanceDTO,
    ShiftDTO,
    EmployeePosition,
    PositionCategory,
    EmployeeSubRole,
    EmploymentType,
    EmployeeStatus,
} from "@/types/employee.types";

import {
    EMPLOYEE_STATUS,
    EMPLOYMENT_TYPE,
    EMPLOYEE_SUB_ROLE,
    EMPLOYEE_POSITIONS,
} from "@/constants/employee.const";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Breadcrumbs } from "../../../global/Breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    Flame,
    Trash2,
    RotateCcw,
    User,
    Briefcase,
    Phone,
    DollarSign,
    History,
    TrendingUp,
    FileText,
    StickyNote,
    Shield,
    Plus,
    Save,
    ArrowLeft,
    Mail,
    Calendar,
    Clock,
    Star,
    Award,
    Building
} from "lucide-react";

import {
    clamp,
    formatDate,
    fromLocalInput,
    latestEffectiveFrom,
    toLocalInput,
} from "@/utils/helpers/employees.details";
import { showToast } from "@/components/global/showToast";
import InfoCard from "./InfoCard";
import InfoField from "./InfoField";
import FormRow from "./FormRow";
import ModernSelect from "./ModernSelect";
import ShiftEditor from "./ShiftEditor";

/* --------------------------------------------
   Enum/meta bundle with strict union typings
--------------------------------------------- */
type EnumBundle = {
    subRoles: EmployeeSubRole[];
    statuses: EmployeeStatus[];
    employmentTypes: EmploymentType[];
    positionsMap: Record<PositionCategory, EmployeePosition[]>;
};

/* --------------------------------------------
   Helpers for position/category mapping
--------------------------------------------- */
const positionCategoriesStrict = Object.keys(EMPLOYEE_POSITIONS) as PositionCategory[];

export function categoryByPosition(
    pos: EmployeePosition | undefined
): PositionCategory | undefined {
    if (!pos) return undefined;

    for (const cat of positionCategoriesStrict) {
        const positions = EMPLOYEE_POSITIONS[cat] as readonly EmployeePosition[];
        if (positions.includes(pos)) return cat;
    }

    return undefined;
}

function firstCategory(): PositionCategory {
    return positionCategoriesStrict[0];
}

// function firstPosition(): EmployeePosition {
//     const cat = firstCategory();
//     return EMPLOYEE_POSITIONS[cat][0];
// }

const DEFAULT_ENUMS: EnumBundle = {
    subRoles: Object.values(EMPLOYEE_SUB_ROLE),
    statuses: Object.values(EMPLOYEE_STATUS),
    employmentTypes: Object.values(EMPLOYMENT_TYPE),
    positionsMap: Object.fromEntries(
        Object.entries(EMPLOYEE_POSITIONS).map(([k, arr]) => [k, [...arr]])
    ) as Record<PositionCategory, EmployeePosition[]>,
};

const enums = DEFAULT_ENUMS;

/* --------------------------------------------
   Page component
--------------------------------------------- */
export default function EmployeeDetailPage({ employeeId }: { employeeId: string }) {
    const router = useRouter();
    const {
        fetchEmployeeDetail,
        updateEmployee,
        softDeleteEmployee,
        restoreEmployee,
    } = useEmployeeStore();

    const [detail, setDetail] = useState<EmployeeDetailDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState<string>("overview");
    const [form, setForm] = useState<UpdateEmployeePayload | null>(null);

    const breadcrumbItems = useMemo(
        () => [
            { label: "Home", href: "/" },
            { label: "Employees", href: "/users/employees" },
            { label: detail?.user.name ?? "Employee detail", href: `/users/employees/${employeeId}` },
        ],
        [employeeId, detail?.user.name]
    );

    useEffect(() => {
        let mounted = true;
        const hydrate = async () => {
            setLoading(true);
            try {
                const d = await fetchEmployeeDetail(employeeId);
                if (!mounted) return;
                setDetail(d);
                setForm({
                    id: d.id,
                    status: d.status,
                    employmentType: d.employmentType,
                    subRole: d.subRole,
                    position: d.position,
                    contactInfo: d.contactInfo,
                    performance: d.performance,
                    shifts: d.shifts,
                    notes: d.notes,
                    salaryHistory: d.salaryHistory,
                    positionHistory: d.positionHistory,
                });
            } catch (e) {
                showToast.error(`Failed to load employee details: ${e}`);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        hydrate();
        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employeeId]);

    const setField = <K extends keyof UpdateEmployeePayload>(
        key: K,
        value: UpdateEmployeePayload[K]
    ) => {
        setForm((prev) => {
            if (prev) return { ...prev, [key]: value };
            if (!detail) return prev;
            return { id: detail.id, [key]: value } as UpdateEmployeePayload;
        });
    };

    const setContact = (patch: Partial<ContactInfoDTO>) => {
        const next: ContactInfoDTO = {
            ...(form?.contactInfo ?? {}),
            ...patch,
        };
        setField("contactInfo", next);
    };

    const setPerformance = (patch: Partial<PerformanceDTO>) => {
        const next: PerformanceDTO = {
            ...(form?.performance ?? {}),
            ...patch,
        };
        setField("performance", next);
    };

    const setShifts = (value: ShiftDTO[] | undefined) => setField("shifts", value);

    const positionCategories = useMemo(() => positionCategoriesStrict, []);
    const allPositions = useMemo(
        () => positionCategories.flatMap((c) => enums.positionsMap[c]),
        [positionCategories]
    );

    const addSalaryEntry = useCallback(() => {
        if (!form && !detail) return;
        const baseSalary = detail?.salary ?? form?.salaryHistory?.[0]?.amount ?? 0;
        const newEntry: SalaryHistoryDTO = { amount: baseSalary, currency: detail?.salaryCurrency ?? "BDT", effectiveFrom: new Date().toISOString() };
        setForm(prev => {
            const next = [{ ...newEntry }, ...(prev?.salaryHistory ?? detail?.salaryHistory ?? [])];
            return { ...(prev ?? { id: detail!.id }), salaryHistory: next } as UpdateEmployeePayload;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detail]);

    const updateSalaryEntry = useCallback((idx: number, patch: Partial<SalaryHistoryDTO>) => {
        if (!detail) return;
        const next = detail.salaryHistory.map((e, i) => (i === idx ? { ...e, ...patch } : e));
        setDetail({ ...detail, salaryHistory: next });
        setField("salaryHistory", next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detail]);

    const removeSalaryEntry = useCallback((idx: number) => {
        if (!detail) return;
        const next = detail.salaryHistory.filter((_, i) => i !== idx);
        setDetail({ ...detail, salaryHistory: next });
        setField("salaryHistory", next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detail]);

    const addPositionEntry = useCallback(() => {
        if (!detail) return;
        const fallbackCat = categoryByPosition(detail.position) ?? firstCategory();
        const newEntry: PositionHistoryDTO = {
            position: fallbackCat,
            effectiveFrom: new Date().toISOString(),
        };
        const next = [newEntry, ...(detail.positionHistory ?? [])];
        setDetail({ ...detail, positionHistory: next });
        setField("positionHistory", next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detail]);

    const updatePositionEntry = useCallback((idx: number, patch: Partial<PositionHistoryDTO>) => {
        if (!detail) return;
        const next = detail.positionHistory.map((e, i) => (i === idx ? { ...e, ...patch } : e));
        setDetail({ ...detail, positionHistory: next });
        setField("positionHistory", next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detail]);

    const removePositionEntry = useCallback((idx: number) => {
        if (!detail) return;
        const next = detail.positionHistory.filter((_, i) => i !== idx);
        setDetail({ ...detail, positionHistory: next });
        setField("positionHistory", next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detail]);

    const handleSave = async () => {
        if (!detail || !form?.id) return;
        setSaving(true);
        try {
            const updated = await updateEmployee({
                id: form.id,
                status: form.status,
                employmentType: form.employmentType,
                subRole: form.subRole,
                position: form.position,
                contactInfo: form.contactInfo,
                performance: form.performance,
                shifts: form.shifts,
                notes: form.notes,
                salaryHistory: form.salaryHistory,
                positionHistory: form.positionHistory,
            });

            setDetail(updated);
            setForm({
                id: updated.id,
                status: updated.status,
                employmentType: updated.employmentType,
                subRole: updated.subRole,
                position: updated.position,
                contactInfo: updated.contactInfo,
                performance: updated.performance,
                shifts: updated.shifts,
                notes: updated.notes ?? "",
                salaryHistory: updated.salaryHistory,
                positionHistory: updated.positionHistory,
            });
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleSoftDelete = async () => {
        if (!detail) return;
        try {
            await softDeleteEmployee({ id: detail.id });
            const refreshed = await fetchEmployeeDetail(detail.id, true);
            setDetail(refreshed);
        } catch (e) {
            console.error(e);
        }
    };

    const handleRestore = async () => {
        if (!detail) return;
        try {
            await restoreEmployee({ id: detail.id });
            const refreshed = await fetchEmployeeDetail(detail.id, true);
            setDetail(refreshed);
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading employee details…</p>
                </div>
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <User className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="text-xl font-medium">Employee not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="max-w-7xl mx-auto space-y-6">
                <Breadcrumbs items={breadcrumbItems} />

                {/* Header Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
                                    <User className="h-10 w-10 text-white" />
                                </div>
                                <div className="text-white">
                                    <h1 className="text-3xl font-bold tracking-tight">{detail.user.name}</h1>
                                    <p className="text-blue-100 mt-1 text-lg">{detail.position || "No position assigned"}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                            {detail.subRole}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${detail.status === EMPLOYEE_STATUS.ACTIVE ? 'bg-green-500/20 text-green-100' :
                                            detail.status === EMPLOYEE_STATUS.ON_LEAVE ? 'bg-yellow-500/20 text-yellow-100' :
                                                'bg-red-500/20 text-red-100'
                                            }`}>
                                            {detail.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving || !form?.id}
                                    className="bg-white text-blue-600 hover:bg-blue-50 font-medium shadow-lg"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {saving ? "Saving…" : "Save changes"}
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => router.push("/users/employees")}
                                    className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={tab} onValueChange={setTab} className="w-full">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-2">
                        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-2 bg-transparent">
                            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">Overview</span>
                            </TabsTrigger>
                            <TabsTrigger value="role" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                                <Briefcase className="h-4 w-4" />
                                <span className="hidden sm:inline">Role</span>
                            </TabsTrigger>
                            <TabsTrigger value="contact" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                                <Phone className="h-4 w-4" />
                                <span className="hidden sm:inline">Contact</span>
                            </TabsTrigger>
                            <TabsTrigger value="compensation" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                                <DollarSign className="h-4 w-4" />
                                <span className="hidden sm:inline">Compensation</span>
                            </TabsTrigger>
                            <TabsTrigger value="positionHistory" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                                <History className="h-4 w-4" />
                                <span className="hidden sm:inline">History</span>
                            </TabsTrigger>
                            <TabsTrigger value="performance" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                                <TrendingUp className="h-4 w-4" />
                                <span className="hidden sm:inline">Performance</span>
                            </TabsTrigger>
                            <TabsTrigger value="documents" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">Documents</span>
                            </TabsTrigger>
                            <TabsTrigger value="notes" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                                <StickyNote className="h-4 w-4" />
                                <span className="hidden sm:inline">Notes</span>
                            </TabsTrigger>
                            <TabsTrigger value="admin" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                                <Shield className="h-4 w-4" />
                                <span className="hidden sm:inline">Admin</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Overview */}
                    <TabsContent value="overview" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <InfoCard icon={User} title="Personal Information" className="lg:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField icon={User} label="Full Name" value={detail.user.name} />
                                    <InfoField icon={Mail} label="Email" value={detail.user.email} />
                                    <InfoField icon={Phone} label="Phone" value={detail.user.phone ?? "—"} />
                                    <InfoField icon={Award} label="Account Status" value={detail.user.accountStatus} />
                                </div>
                            </InfoCard>

                            <InfoCard icon={Briefcase} title="Employment">
                                <div className="space-y-4">
                                    <InfoField icon={Building} label="Position" value={detail.position ?? "—"} />
                                    <InfoField icon={Briefcase} label="Sub Role" value={detail.subRole} />
                                    <InfoField icon={Calendar} label="Employment Type" value={detail.employmentType ?? "—"} />
                                </div>
                            </InfoCard>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <InfoCard icon={DollarSign} title="Compensation">
                                <div className="space-y-4">
                                    <div className="text-4xl font-bold text-blue-600">
                                        {detail.salary} <span className="text-2xl text-muted-foreground">{detail.salaryCurrency}</span>
                                    </div>
                                    <InfoField icon={Calendar} label="Effective From" value={latestEffectiveFrom(detail.salaryHistory) ?? "—"} />
                                </div>
                            </InfoCard>

                            <InfoCard icon={Calendar} title="Important Dates">
                                <div className="space-y-4">
                                    <InfoField icon={Calendar} label="Date Joined" value={formatDate(detail.dateOfJoining)} />
                                    <InfoField icon={Calendar} label="Date Left" value={detail.dateOfLeaving ? formatDate(detail.dateOfLeaving) : "—"} />
                                    <InfoField icon={Clock} label="Last Updated" value={formatDate(detail.updatedAt)} />
                                </div>
                            </InfoCard>
                        </div>
                    </TabsContent>

                    {/* Role & status */}
                    <TabsContent value="role" className="mt-6">
                        <InfoCard icon={Briefcase} title="Role & Status Configuration">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormRow label="Sub Role" icon={Briefcase}>
                                    <ModernSelect<EmployeeSubRole>
                                        value={form?.subRole ?? ""}
                                        onChange={(v) => setField("subRole", v)}
                                        options={enums.subRoles}
                                    />
                                </FormRow>

                                <FormRow label="Position" icon={Award}>
                                    <ModernSelect<EmployeePosition>
                                        value={form?.position as EmployeePosition}
                                        onChange={(v) => setField("position", v)}
                                        options={allPositions}
                                    />
                                </FormRow>

                                <FormRow label="Employment Status" icon={TrendingUp}>
                                    <ModernSelect<EmployeeStatus>
                                        value={form?.status as EmployeeStatus}
                                        onChange={(v) => setField("status", v)}
                                        options={enums.statuses}
                                    />
                                </FormRow>

                                <FormRow label="Employment Type" icon={Briefcase}>
                                    <ModernSelect<EmploymentType>
                                        value={form?.employmentType ?? ""}
                                        onChange={(v) => setField("employmentType", v)}
                                        options={enums.employmentTypes}
                                    />
                                </FormRow>
                            </div>
                        </InfoCard>
                    </TabsContent>

                    {/* Contact */}
                    <TabsContent value="contact" className="mt-6">
                        <div className="space-y-6">
                            <InfoCard icon={Phone} title="Contact Information">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormRow label="Phone Number" icon={Phone}>
                                        <Input
                                            value={form?.contactInfo?.phone ?? ""}
                                            onChange={(e) => setContact({ phone: e.target.value })}
                                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </FormRow>

                                    <FormRow label="Email Address" icon={Mail}>
                                        <Input
                                            value={form?.contactInfo?.email ?? ""}
                                            onChange={(e) => setContact({ email: e.target.value })}
                                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </FormRow>
                                </div>
                            </InfoCard>

                            <InfoCard icon={Phone} title="Emergency Contact">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormRow label="Contact Name" icon={User}>
                                        <Input
                                            value={form?.contactInfo?.emergencyContact?.name ?? ""}
                                            onChange={(e) =>
                                                setContact({
                                                    emergencyContact: {
                                                        ...(form?.contactInfo?.emergencyContact ?? { name: "", phone: "", relation: "" }),
                                                        name: e.target.value,
                                                    },
                                                })
                                            }
                                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </FormRow>

                                    <FormRow label="Contact Phone" icon={Phone}>
                                        <Input
                                            value={form?.contactInfo?.emergencyContact?.phone ?? ""}
                                            onChange={(e) =>
                                                setContact({
                                                    emergencyContact: {
                                                        ...(form?.contactInfo?.emergencyContact ?? { name: "", phone: "", relation: "" }),
                                                        phone: e.target.value,
                                                    },
                                                })
                                            }
                                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </FormRow>

                                    <FormRow label="Relationship" icon={User}>
                                        <Input
                                            value={form?.contactInfo?.emergencyContact?.relation ?? ""}
                                            onChange={(e) =>
                                                setContact({
                                                    emergencyContact: {
                                                        ...(form?.contactInfo?.emergencyContact ?? { name: "", phone: "", relation: "" }),
                                                        relation: e.target.value,
                                                    },
                                                })
                                            }
                                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </FormRow>
                                </div>
                            </InfoCard>
                        </div>
                    </TabsContent>

                    {/* Compensation */}
                    <TabsContent value="compensation" className="space-y-6 mt-6">
                        <InfoCard icon={DollarSign} title="Current Compensation">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormRow label="Current Salary">
                                    <Input type="number" value={detail.salary} disabled className="bg-slate-50" />
                                </FormRow>

                                <FormRow label="Currency">
                                    <Input value={detail.salaryCurrency} disabled className="bg-slate-50" />
                                </FormRow>

                                <FormRow label="Effective From">
                                    <Input value={latestEffectiveFrom(detail.salaryHistory) ?? "—"} disabled className="bg-slate-50" />
                                </FormRow>
                            </div>
                        </InfoCard>

                        <InfoCard icon={History} title="Salary History">
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-sm text-muted-foreground">Track all salary changes over time</p>
                                <Button onClick={addSalaryEntry} className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="mr-2 h-4 w-4" /> Add Entry
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {(detail.salaryHistory ?? []).map((entry, idx) => (
                                    <div key={idx} className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                            <FormRow label="Amount">
                                                <Input
                                                    type="number"
                                                    value={entry.amount}
                                                    onChange={(e) => updateSalaryEntry(idx, { amount: parseFloat(e.target.value) || 0 })}
                                                    className="font-semibold"
                                                />
                                            </FormRow>

                                            <FormRow label="Currency">
                                                <Input
                                                    value={entry.currency}
                                                    onChange={(e) => updateSalaryEntry(idx, { currency: e.target.value })}
                                                />
                                            </FormRow>

                                            <FormRow label="Effective From">
                                                <Input
                                                    type="datetime-local"
                                                    value={toLocalInput(entry.effectiveFrom)}
                                                    onChange={(e) => updateSalaryEntry(idx, { effectiveFrom: fromLocalInput(e.target.value) })}
                                                />
                                            </FormRow>

                                            <FormRow label="Effective To">
                                                <Input
                                                    type="datetime-local"
                                                    value={entry.effectiveTo ? toLocalInput(entry.effectiveTo) : ""}
                                                    onChange={(e) => updateSalaryEntry(idx, { effectiveTo: fromLocalInput(e.target.value) })}
                                                />
                                            </FormRow>

                                            <FormRow label="Reason">
                                                <Input
                                                    value={entry.reason ?? ""}
                                                    onChange={(e) => updateSalaryEntry(idx, { reason: e.target.value })}
                                                    placeholder="e.g., Annual raise"
                                                />
                                            </FormRow>
                                        </div>

                                        <div className="flex justify-end mt-4">
                                            <Button variant="destructive" size="sm" onClick={() => removeSalaryEntry(idx)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {detail.salaryHistory?.length === 0 && (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>No salary history recorded yet</p>
                                    </div>
                                )}
                            </div>
                        </InfoCard>
                    </TabsContent>

                    {/* Position history */}
                    <TabsContent value="positionHistory" className="space-y-6 mt-6">
                        <InfoCard icon={History} title="Position History">
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-sm text-muted-foreground">Track all position changes over time</p>
                                <Button onClick={addPositionEntry} className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="mr-2 h-4 w-4" /> Add Entry
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {(detail.positionHistory ?? []).map((entry, idx) => (
                                    <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border border-blue-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <FormRow label="Position Category">
                                                <ModernSelect<PositionCategory>
                                                    value={entry.position as PositionCategory}
                                                    onChange={(v) => updatePositionEntry(idx, { position: v })}
                                                    options={positionCategories}
                                                />
                                            </FormRow>

                                            <FormRow label="Effective From">
                                                <Input
                                                    type="datetime-local"
                                                    value={toLocalInput(entry.effectiveFrom)}
                                                    onChange={(e) => updatePositionEntry(idx, { effectiveFrom: fromLocalInput(e.target.value) })}
                                                />
                                            </FormRow>

                                            <FormRow label="Effective To">
                                                <Input
                                                    type="datetime-local"
                                                    value={entry.effectiveTo ? toLocalInput(entry.effectiveTo) : ""}
                                                    onChange={(e) => updatePositionEntry(idx, { effectiveTo: fromLocalInput(e.target.value) })}
                                                />
                                            </FormRow>
                                        </div>

                                        <div className="flex justify-end mt-4">
                                            <Button variant="destructive" size="sm" onClick={() => removePositionEntry(idx)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {detail.positionHistory?.length === 0 && (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>No position history recorded yet</p>
                                    </div>
                                )}
                            </div>
                        </InfoCard>
                    </TabsContent>

                    {/* Performance & shifts */}
                    <TabsContent value="performance" className="space-y-6 mt-6">
                        <InfoCard icon={Star} title="Performance Metrics">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormRow label="Performance Rating" icon={Star}>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={5}
                                            value={form?.performance?.rating ?? ""}
                                            onChange={(e) => setPerformance({ rating: clamp(1, 5, Number(e.target.value)) })}
                                            className="font-semibold text-lg"
                                        />
                                        <span className="text-muted-foreground">/ 5</span>
                                    </div>
                                </FormRow>

                                <FormRow label="Last Review Date" icon={Calendar}>
                                    <Input
                                        type="datetime-local"
                                        value={form?.performance?.lastReview ? toLocalInput(form.performance.lastReview) : ""}
                                        onChange={(e) => setPerformance({ lastReview: fromLocalInput(e.target.value) })}
                                    />
                                </FormRow>

                                <FormRow label="Feedback Summary" icon={StickyNote}>
                                    <Input
                                        value={form?.performance?.feedback ?? ""}
                                        onChange={(e) => setPerformance({ feedback: e.target.value })}
                                        placeholder="Brief performance notes"
                                    />
                                </FormRow>
                            </div>
                        </InfoCard>

                        <InfoCard icon={Clock} title="Work Shifts">
                            <ShiftEditor shifts={form?.shifts ?? []} onChange={setShifts} />
                        </InfoCard>
                    </TabsContent>

                    {/* Documents */}
                    <TabsContent value="documents" className="mt-6">
                        <InfoCard icon={FileText} title="Employee Documents">
                            {(detail.documents ?? []).length === 0 ? (
                                <div className="text-center py-16 text-muted-foreground">
                                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">No documents uploaded yet</p>
                                    <p className="text-sm mt-2">Employee documents will appear here</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {detail.documents!.map((doc, i) => (
                                        <div key={i} className="group border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all bg-white dark:bg-slate-800">
                                            <div className="flex items-start justify-between mb-3">
                                                <FileText className="h-8 w-8 text-blue-600" />
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                                    {doc.type}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium line-clamp-1">{doc.type}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(doc.uploadedAt)}
                                                </p>
                                                <a
                                                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    View Document →
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </InfoCard>
                    </TabsContent>

                    {/* Notes */}
                    <TabsContent value="notes" className="mt-6">
                        <InfoCard icon={StickyNote} title="Internal Notes">
                            <p className="text-sm text-muted-foreground mb-4">
                                Add private notes about this employee. Only visible to administrators.
                            </p>
                            <Textarea
                                value={form?.notes ?? ""}
                                onChange={(e) => setField("notes", e.target.value)}
                                placeholder="Enter internal notes here..."
                                className="min-h-[200px] border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </InfoCard>
                    </TabsContent>

                    {/* Admin */}
                    <TabsContent value="admin" className="space-y-6 mt-6">
                        <InfoCard icon={Shield} title="Audit Information">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoField icon={User} label="Created By" value={detail.audit.createdBy} />
                                <InfoField icon={User} label="Updated By" value={detail.audit.updatedBy} />
                                <InfoField icon={Calendar} label="Created At" value={formatDate(detail.createdAt)} />
                                <InfoField icon={Calendar} label="Updated At" value={formatDate(detail.updatedAt)} />
                            </div>
                        </InfoCard>

                        <InfoCard icon={Flame} title="Danger Zone" className="border-red-200 dark:border-red-900">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                                    <Flame className="h-5 w-5 text-red-600 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-red-900 dark:text-red-100">
                                            {!detail.isDeleted ? "Delete Employee Record" : "Restore Employee Record"}
                                        </h4>
                                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                            {!detail.isDeleted
                                                ? "This action will soft delete the employee record. It can be restored later."
                                                : "This action will restore the employee record and make it active again."}
                                        </p>
                                    </div>
                                    {!detail.isDeleted ? (
                                        <Button
                                            variant="destructive"
                                            onClick={handleSoftDelete}
                                            className="shrink-0 text-white hover:text-white"
                                        >
                                            <Flame className="mr-2 h-4 w-4" /> Delete Record
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleRestore}
                                            className="shrink-0 bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <RotateCcw className="mr-2 h-4 w-4" /> Restore Record
                                        </Button>
                                    )}
                                </div>

                                {detail.isDeleted && (
                                    <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                                        <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                                            This employee record is currently deleted
                                        </p>
                                    </div>
                                )}
                            </div>
                        </InfoCard>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}