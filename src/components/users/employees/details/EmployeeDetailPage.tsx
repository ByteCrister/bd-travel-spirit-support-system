"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEmployeeStore } from "@/store/employee.store";
import {
    EmployeeDetailDTO,
    UpdateEmployeePayload,
    ContactInfoDTO,
    ShiftDTO,
    DocumentDTO,
} from "@/types/employee.types";
import { EMPLOYEE_STATUS, EMPLOYMENT_TYPE, EMPLOYEE_ROLE, EmployeeStatus, EmploymentType } from "@/constants/employee.const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumbs } from "../../../global/Breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Flame,
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
    Save,
    ArrowLeft,
    Mail,
    Calendar,
    Clock,
    Trash2,
    Lock,
    X,
    Sparkles,
    Check,
    Copy,
    Loader2,
} from "lucide-react";
import { formatDate, latestEffectiveFrom } from "@/utils/helpers/employees.details";
import { showToast } from "@/components/global/showToast";
import InfoCard from "./InfoCard";
import InfoField from "./InfoField";
import FormRow from "./FormRow";
import ModernSelect from "./ModernSelect";
import ShiftEditor from "./ShiftEditor";
import {
    fileToAvatarBase64,
    filesToDocumentDTOs,
    getFileExtension,
} from "@/utils/helpers/file-conversion";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import { CURRENCY } from "@/constants/tour.const";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { validateUpdateEmployeePayload } from "@/utils/validators/employee/employee.update-validator";
import { updateEmployeePassword } from "@/utils/api/update-employee-pass.api";
import ConfirmationDialog from "./ConfirmationDialog";
import EmployeeDetailSkeleton from "./EmployeeDetailSkeleton";
import { Checkbox } from "@/components/ui/checkbox";

/* --------------------------------------------
  Form type: lightweight and focused on fields edited in UI
--------------------------------------------- */

type UpdateEmployeeForm = Partial<
    Pick<
        UpdateEmployeePayload,
        | "id"
        | "name"
        | "status"
        | "employmentType"
        | "contactInfo"
        | "shifts"
        | "notes"
        | "avatar"
        | "dateOfJoining"
        | "dateOfLeaving"
        | "documents"
        | "salary"
        | "currency"
    >
>;

/* --------------------------------------------
  Enum bundle
--------------------------------------------- */

type EnumBundle = {
    statuses: EmployeeStatus[];
    employmentTypes: EmploymentType[];
    roles: (typeof EMPLOYEE_ROLE)[keyof typeof EMPLOYEE_ROLE][];
};

const DEFAULT_ENUMS: EnumBundle = {
    statuses: Object.values(EMPLOYEE_STATUS),
    employmentTypes: Object.values(EMPLOYMENT_TYPE),
    roles: Object.values(EMPLOYEE_ROLE),
};

const enums = DEFAULT_ENUMS;

/* --------------------------------------------
  Component
--------------------------------------------- */

export default function EmployeeDetailPage({ employeeId }: { employeeId: string }) {
    const router = useRouter();
    const { fetchEmployeeDetail, updateEmployee, softDeleteEmployee, restoreEmployee } =
        useEmployeeStore();

    const [detail, setDetail] = useState<EmployeeDetailDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState<string>("overview");
    const [form, setForm] = useState<UpdateEmployeeForm | null>(null);


    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"delete" | "restore">('delete');

    const [sendMail, setSendMail] = useState<boolean>(true);
    const [isPassUpdating, setIsPassUpdating] = useState<boolean>(false);

    // avatar preview base64
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // password management
    const [generatedPassword, setGeneratedPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");

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
                    name: d.user.name,
                    status: d.status,
                    employmentType: d.employmentType,
                    contactInfo: d.contactInfo,
                    shifts: d.shifts,
                    notes: d.notes,
                    avatar: d.avatar,
                    dateOfJoining: d.dateOfJoining,
                    dateOfLeaving: d.dateOfLeaving,
                    documents: d.documents,
                });
                // set avatar preview if avatar is a data URL
                if (d.avatar && typeof d.avatar === "string") {
                    setAvatarPreview(d.avatar);
                } else {
                    setAvatarPreview(null);
                }
            } catch (e) {
                showToast.error(`Failed to load employee details: ${String(e)}`);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        hydrate();
        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employeeId]);

    const setField = <K extends keyof UpdateEmployeeForm>(key: K, value: UpdateEmployeeForm[K]) => {
        setForm((prev) => {
            if (prev) return { ...prev, [key]: value };
            if (!detail) return prev;
            return { id: detail.id, [key]: value } as UpdateEmployeeForm;
        });
    };

    const setContact = (patch: Partial<ContactInfoDTO>) => {
        // prefer patch.phone -> existing form.contactInfo.phone -> detail.contactInfo.phone -> empty string
        const phoneFallback =
            patch.phone ?? form?.contactInfo?.phone ?? detail?.contactInfo?.phone ?? "";

        const next: ContactInfoDTO = {
            ...(form?.contactInfo ?? (detail?.contactInfo ?? {} as ContactInfoDTO)),
            ...patch,
            phone: phoneFallback, // guaranteed string
        };

        setField("contactInfo", next);
    };
    const setShifts = (value: ShiftDTO[] | undefined) => setField("shifts", value);

    /* -------------------------
       File handling helpers
       ------------------------- */

    const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB
    const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif"];

    async function handleAvatarFile(file?: File) {
        if (!file) return;
        try {
            const ext = getFileExtension(file.name);
            if (!IMAGE_EXTS.includes(ext)) {
                showToast.error("Avatar must be an image (jpg, jpeg, png, gif)");
                return;
            }
            if (file.size > MAX_AVATAR_BYTES) {
                showToast.error("Avatar file too large. Max 5 MB allowed.");
                return;
            }
            const base64 = await fileToAvatarBase64(file, { maxFileBytes: MAX_AVATAR_BYTES });
            setAvatarPreview(base64);
            // set in form as base64 string (cast to avatar field)
            setField("avatar", base64 as unknown as UpdateEmployeeForm["avatar"]);
        } catch (err: unknown) {
            console.error(err);
            showToast.error(String(extractErrorMessage(err) ?? "Failed to process avatar"));
        }
    }

    async function handleDocumentsFiles(files?: FileList | File[]) {
        if (!files || (files as FileList).length === 0) return;
        try {
            const docs = await filesToDocumentDTOs(files as FileList);
            if (!docs || docs.length === 0) {
                showToast.warning("No valid documents were processed");
                return;
            }
            // append to existing documents in form
            const existing = (form?.documents ?? []) as DocumentDTO[];
            const merged = [...existing, ...docs];
            setField("documents", merged as unknown as UpdateEmployeeForm["documents"]);
            showToast.success(`${docs.length} document(s) added`);
        } catch (err: unknown) {
            console.error(err);
            showToast.error(String(extractErrorMessage(err) ?? "Failed to process documents"));
        }
    }

    const removeDocumentAt = (index: number) => {
        setForm((s) => {
            if (!s) return s;
            const docs = [...(s.documents ?? [])]; // use s, not outer form
            if (index < 0 || index >= docs.length) return s;
            docs.splice(index, 1);
            return { ...s, documents: docs };
        });
    };

    /* -------------------------
       Save main employee payload
       ------------------------- */

    const handleSave = async () => {
        if (!detail || !form?.id) return;
        // enforce dateOfLeaving vs status rule
        if (form.dateOfLeaving && (form.status === EMPLOYEE_STATUS.ACTIVE || detail.status === EMPLOYEE_STATUS.ACTIVE)) {
            showToast.warning("Employee has a leaving date; status cannot be active. Adjusting status to terminated.");
            setField("status", EMPLOYEE_STATUS.TERMINATED);
        }

        setSaving(true);
        try {
            // Build a payload by merging detail (source of truth for required fields)
            const partialPayload: Partial<UpdateEmployeePayload> = {
                id: form.id!,
                name: form.name,
                salary: (form.salary ?? detail.salary) as UpdateEmployeePayload["salary"],
                currency: (form.currency ?? detail.currency) as UpdateEmployeePayload["currency"],
                status: (form.status ?? detail.status) as UpdateEmployeePayload["status"],
                employmentType: (form.employmentType ?? detail.employmentType) as UpdateEmployeePayload["employmentType"],
                contactInfo: form.contactInfo ?? detail.contactInfo,
                shifts: form.shifts ?? detail.shifts,
                notes: form.notes ?? detail.notes ?? "",
                avatar: form.avatar as unknown as UpdateEmployeePayload["avatar"],
                dateOfJoining: form.dateOfJoining ?? detail.dateOfJoining,
                dateOfLeaving: form.dateOfLeaving ?? detail.dateOfLeaving,
                documents: form.documents ?? detail.documents,
            };

            // Cast to UpdateEmployeePayload for store call; if your store accepts Partial, update accordingly
            const payload = partialPayload as UpdateEmployeePayload;

            const isValid = await validateUpdateEmployeePayload(payload);

            if (!isValid) return;

            const updated = await updateEmployee(payload);
            setDetail(updated);
            setForm({
                id: updated.id,
                name: updated.user.name,
                status: updated.status,
                employmentType: updated.employmentType,
                contactInfo: updated.contactInfo,
                shifts: updated.shifts,
                notes: updated.notes,
                avatar: updated.avatar,
                dateOfJoining: updated.dateOfJoining,
                dateOfLeaving: updated.dateOfLeaving,
                documents: updated.documents,
            });
            showToast.success("Employee updated");
        } catch (e: unknown) {
            console.error(e);
            showToast.error(String(extractErrorMessage(e) ?? "Failed to update employee"));
        } finally {
            setSaving(false);
        }
    };

    /* -------------------------
       Password generation & update
       ------------------------- */

    const handleGeneratePassword = () => {
        try {
            const pw = generateStrongPassword(10); // assume returns a string
            setGeneratedPassword(pw);
            setNewPassword(pw);
        } catch (err) {
            console.error(err);
            showToast.error("Failed to generate password");
        }
    };

    const handleUpdatePassword = async () => {
        if (!detail) return;
        if (!newPassword || newPassword.length < 8) {
            showToast.warning("Password is too short (min 8 characters)");
            return;
        }
        setIsPassUpdating(true);
        await updateEmployeePassword(employeeId, newPassword, sendMail);
        setGeneratedPassword("");
        setNewPassword("");
        setIsPassUpdating(false);
    };


    const handleDelete = async (reason: string) => {
        if (!detail?.id) return

        await softDeleteEmployee(detail.id, reason);
        setDetail((prev) => {
            if (!prev) return prev;

            return {
                ...prev,
                isDeleted: !prev.isDeleted,
            };
        });
    };

    const handleRestore = async () => {
        if (!detail?.id) return

        await restoreEmployee({ id: detail.id });
        setDetail((prev) => {
            if (!prev) return prev;

            return {
                ...prev,
                isDeleted: !prev.isDeleted,
            };
        });
    };

    if (loading) {
        return <EmployeeDetailSkeleton />;
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
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Breadcrumbs items={breadcrumbItems} />

                    {/* Header Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20 overflow-hidden">
                                        {avatarPreview ? (
                                            <Image
                                                src={avatarPreview}
                                                alt="avatar"
                                                fill
                                                className="object-cover"
                                                sizes="100vw"
                                                priority
                                            />) : (
                                            <User className="h-10 w-10 text-white" />
                                        )}
                                    </div>
                                    <div className="text-white">
                                        <h1 className="text-3xl font-bold tracking-tight">{detail.user.name}</h1>
                                        <div className="flex items-center gap-4 mt-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${detail.status === EMPLOYEE_STATUS.ACTIVE
                                                    ? "bg-green-500/20 text-green-100"
                                                    : detail.status === EMPLOYEE_STATUS.ON_LEAVE
                                                        ? "bg-yellow-500/20 text-yellow-100"
                                                        : "bg-red-500/20 text-red-100"
                                                    }`}
                                            >
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
                            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-10 gap-2 bg-transparent">
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
                                    </div>

                                    <div className="mt-6 p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Profile Avatar
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleAvatarFile(e.target.files?.[0] ?? undefined)}
                                                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => { setAvatarPreview(null); setField("avatar", undefined); }}
                                                className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                            <span className="inline-block w-1 h-1 rounded-full bg-blue-500"></span>
                                            Only images allowed. Max 5 MB.
                                        </p>
                                    </div>
                                </InfoCard>

                                <InfoCard icon={Briefcase} title="Employment">
                                    <div className="space-y-4">

                                        <FormRow label="Employment Type" icon={Briefcase}>
                                            <ModernSelect<EmploymentType>
                                                value={(form?.employmentType ?? detail.employmentType) ?? ""}
                                                onChange={(v) => setField("employmentType", v)}
                                                options={enums.employmentTypes}
                                            />
                                        </FormRow>

                                        <FormRow label="Date of Joining" icon={Calendar}>
                                            <Input
                                                type="date"
                                                value={form?.dateOfJoining ? form.dateOfJoining.split("T")[0] : detail.dateOfJoining?.split("T")[0] ?? ""}
                                                onChange={(e) => setField("dateOfJoining", e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                                                className="font-mono"
                                            />
                                        </FormRow>

                                        <FormRow label="Date of Leaving" icon={Calendar}>
                                            <Input
                                                type="date"
                                                value={form?.dateOfLeaving ? form.dateOfLeaving.split("T")[0] : detail.dateOfLeaving?.split("T")[0] ?? ""}
                                                onChange={(e) => {
                                                    const val = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                                                    setField("dateOfLeaving", val);
                                                    if (val) {
                                                        // if leaving date set and status is active, change status
                                                        if ((form?.status ?? detail.status) === EMPLOYEE_STATUS.ACTIVE) {
                                                            showToast.warning("Date of leaving set — status cannot remain active. Setting status to terminated.");
                                                            setField("status", EMPLOYEE_STATUS.TERMINATED);
                                                        }
                                                    }
                                                }}
                                                className="font-mono"
                                            />
                                        </FormRow>

                                        <FormRow label="Status" icon={TrendingUp}>
                                            <ModernSelect<EmployeeStatus>
                                                value={form?.status ?? detail.status}
                                                onChange={(v) => {
                                                    // prevent setting active if dateOfLeaving exists
                                                    if (form?.dateOfLeaving || detail.dateOfLeaving) {
                                                        if (v === EMPLOYEE_STATUS.ACTIVE) {
                                                            showToast.warning("Cannot set status to active when a leaving date exists");
                                                            return;
                                                        }
                                                    }
                                                    setField("status", v);
                                                }}
                                                options={enums.statuses}
                                            />
                                        </FormRow>
                                    </div>
                                </InfoCard>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <InfoCard icon={DollarSign} title="Compensation">
                                    <div className="space-y-4">
                                        <div className="relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg"></div>
                                            <div className="relative p-6 text-center">
                                                <p className="text-sm text-muted-foreground mb-2">Current Salary</p>
                                                <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                                    {detail.salary}
                                                </div>
                                                <span className="text-xl font-semibold text-muted-foreground mt-2 inline-block">{detail.currency}</span>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <InfoField icon={Calendar} label="Effective From" value={latestEffectiveFrom(detail.salaryHistory) ?? "—"} />
                                        </div>
                                    </div>
                                </InfoCard>

                                <InfoCard icon={Calendar} title="Important Dates">
                                    <div className="space-y-5">
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <div className="mt-1 p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                                                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date Joined</p>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">{formatDate(detail.dateOfJoining)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <div className="mt-1 p-2 rounded-full bg-orange-100 dark:bg-orange-900/50">
                                                <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date Left</p>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                                                    {detail.dateOfLeaving ? formatDate(detail.dateOfLeaving) : "—"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <div className="mt-1 p-2 rounded-full bg-purple-100 dark:bg-purple-900/50">
                                                <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Updated</p>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">{formatDate(detail.updatedAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </InfoCard>
                            </div>
                        </TabsContent>

                        {/* Role & status */}
                        <TabsContent value="role" className="mt-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                {/* Role & Status Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                    className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-primary/5 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    {/* Decorative background element */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-0" />

                                    <div className="relative z-10 p-6">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-6">
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ duration: 0.5, delay: 0.2 }}
                                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-inner"
                                            >
                                                <Briefcase className="h-6 w-6 text-primary" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-lg font-semibold">Role & Status Configuration</h3>
                                                <p className="text-sm text-muted-foreground">Manage employment details and status</p>
                                            </div>
                                        </div>

                                        {/* Form Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: 0.3 }}
                                            >
                                                <FormRow label="Employment Status" icon={TrendingUp}>
                                                    <div className="relative">
                                                        <ModernSelect<EmployeeStatus>
                                                            value={form?.status as EmployeeStatus}
                                                            onChange={(v) => {
                                                                if ((form?.dateOfLeaving ?? detail.dateOfLeaving) && v === EMPLOYEE_STATUS.ACTIVE) {
                                                                    showToast.warning("Cannot set status to active when a leaving date exists");
                                                                    return;
                                                                }
                                                                setField("status", v);
                                                            }}
                                                            options={enums.statuses}
                                                        />
                                                        {/* Status indicator dot */}
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                                        >
                                                            <div className={`h-2 w-2 rounded-full ${form?.status === EMPLOYEE_STATUS.ACTIVE
                                                                ? 'bg-green-500 shadow-lg shadow-green-500/50'
                                                                : 'bg-gray-400'
                                                                }`} />
                                                        </motion.div>
                                                    </div>
                                                </FormRow>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: 0.35 }}
                                            >
                                                <FormRow label="Employment Type" icon={Briefcase}>
                                                    <ModernSelect<EmploymentType>
                                                        value={(form?.employmentType ?? detail.employmentType) ?? ""}
                                                        onChange={(v) => setField("employmentType", v)}
                                                        options={enums.employmentTypes}
                                                    />
                                                </FormRow>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Shift Editor Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.4 }}
                                    className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card to-blue-500/5 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    {/* Decorative background element */}
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl -z-0" />

                                    <div className="relative z-10 p-6">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-6">
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ duration: 0.5, delay: 0.5 }}
                                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 shadow-inner"
                                            >
                                                <Clock className="h-6 w-6 text-blue-600" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-lg font-semibold">Shift Schedule</h3>
                                                <p className="text-sm text-muted-foreground">Configure working hours and shift patterns</p>
                                            </div>
                                        </div>

                                        {/* Shift Editor */}
                                        <ShiftEditor
                                            shifts={form?.shifts ?? detail.shifts ?? []}
                                            onChange={setShifts}
                                        />
                                    </div>
                                </motion.div>
                            </motion.div>
                        </TabsContent>

                        {/* Contact */}
                        <TabsContent value="contact" className="mt-6">
                            <div className="space-y-6">
                                <InfoCard icon={Phone} title="Contact Information">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormRow label="Phone Number" icon={Phone}>
                                            <Input
                                                value={form?.contactInfo?.phone ?? detail.contactInfo?.phone ?? ""}
                                                onChange={(e) => setContact({ phone: e.target.value })}
                                                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </FormRow>

                                        <FormRow label="Email Address" icon={Mail}>
                                            <Input
                                                value={form?.contactInfo?.email ?? detail.contactInfo?.email ?? ""}
                                                onChange={(e) => setContact({ email: e.target.value })}
                                                readOnly
                                                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </FormRow>
                                    </div>
                                </InfoCard>

                                <InfoCard icon={Phone} title="Emergency Contact">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormRow label="Contact Name" icon={User}>
                                            <Input
                                                value={form?.contactInfo?.emergencyContact?.name ?? detail.contactInfo?.emergencyContact?.name ?? ""}
                                                onChange={(e) =>
                                                    setContact({
                                                        emergencyContact: {
                                                            ...(form?.contactInfo?.emergencyContact ?? detail.contactInfo?.emergencyContact ?? { name: "", phone: "", relation: "" }),
                                                            name: e.target.value,
                                                        },
                                                    })
                                                }
                                                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </FormRow>

                                        <FormRow label="Contact Phone" icon={Phone}>
                                            <Input
                                                value={form?.contactInfo?.emergencyContact?.phone ?? detail.contactInfo?.emergencyContact?.phone ?? ""}
                                                onChange={(e) =>
                                                    setContact({
                                                        emergencyContact: {
                                                            ...(form?.contactInfo?.emergencyContact ?? detail.contactInfo?.emergencyContact ?? { name: "", phone: "", relation: "" }),
                                                            phone: e.target.value,
                                                        },
                                                    })
                                                }
                                                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </FormRow>

                                        <FormRow label="Relationship" icon={User}>
                                            <Input
                                                value={form?.contactInfo?.emergencyContact?.relation ?? detail.contactInfo?.emergencyContact?.relation ?? ""}
                                                onChange={(e) =>
                                                    setContact({
                                                        emergencyContact: {
                                                            ...(form?.contactInfo?.emergencyContact ?? detail.contactInfo?.emergencyContact ?? { name: "", phone: "", relation: "" }),
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
                                    <FormRow label="Current Salary" icon={DollarSign}>
                                        <Input
                                            type="text"
                                            inputMode="decimal"
                                            value={form?.salary != null ? form.salary : ""}
                                            onChange={(e) => {
                                                let value = e.target.value;

                                                // allow empty
                                                if (value === "") {
                                                    setField("salary", undefined);
                                                    return;
                                                }

                                                // remove everything except digits and dot
                                                value = value.replace(/[^0-9.]/g, "");

                                                // prevent multiple dots
                                                const parts = value.split(".");
                                                if (parts.length > 2) {
                                                    value = parts[0] + "." + parts.slice(1).join("");
                                                }

                                                // normalize leading zeros (except "0" and "0.xxx")
                                                if (value.includes(".")) {
                                                    const [int, dec] = value.split(".");
                                                    value = String(Number(int || "0")) + "." + dec;
                                                } else {
                                                    value = String(Number(value));
                                                }

                                                const numericValue = Number(value);

                                                if (!Number.isNaN(numericValue)) {
                                                    setField("salary", numericValue);
                                                }
                                            }}
                                        />
                                    </FormRow>

                                    <FormRow label="Currency" icon={DollarSign}>
                                        <Select
                                            value={(form?.currency ?? detail.currency) ?? CURRENCY.BDT}
                                            onValueChange={(value) => setField("currency", value as CURRENCY)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {Object.values(CURRENCY).map((currency) => (
                                                    <SelectItem key={currency} value={currency}>
                                                        {currency}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormRow>

                                    <FormRow label="Effective From">
                                        <Input value={latestEffectiveFrom(detail.salaryHistory) ?? "—"} disabled className="bg-slate-50" />
                                    </FormRow>
                                </div>
                            </InfoCard>
                        </TabsContent>

                        {/* Position History (salary history + audits) */}
                        <TabsContent value="positionHistory" className="space-y-6 mt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <InfoCard icon={TrendingUp} title="Salary History">
                                    {(detail?.salaryHistory ?? []).length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">No salary history available</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {(detail?.salaryHistory ?? []).map((s, idx) => (
                                                <div key={idx} className="p-3 border rounded-lg bg-white dark:bg-slate-800">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-sm font-medium">
                                                                {s.amount} {s.currency}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">{s.reason ?? "—"}</div>
                                                        </div>
                                                        <div className="text-right text-xs text-muted-foreground">
                                                            <div>From: {formatDate(s.effectiveFrom)}</div>
                                                            <div>To: {s.effectiveTo ? formatDate(s.effectiveTo) : "Present"}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </InfoCard>

                                <InfoCard icon={History} title="Audit Log (latest)">
                                    {(detail?.audit ?? []).length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">No audit entries</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {(detail?.audit ?? []).map((a) => (
                                                <div key={a._id} className="p-3 border rounded-lg bg-white dark:bg-slate-800">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="text-sm font-medium">{a.action}</div>
                                                            <div className="text-xs text-muted-foreground">{a.note ?? ""}</div>
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                Actor: {a.actor ?? "system"} {a.actorModel ? `(${a.actorModel})` : ""}
                                                            </div>
                                                        </div>
                                                        <div className="text-right text-xs text-muted-foreground">
                                                            <div>{formatDate(a.createdAt)}</div>
                                                        </div>
                                                    </div>

                                                    {a.changes && (
                                                        <details className="mt-2 text-xs text-muted-foreground">
                                                            <summary className="cursor-pointer">View changes</summary>
                                                            <pre className="whitespace-pre-wrap mt-2 text-xs">{JSON.stringify(a.changes, null, 2)}</pre>
                                                        </details>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </InfoCard>
                            </div>
                        </TabsContent>

                        {/* Documents */}
                        <TabsContent value="documents" className="mt-6">
                            <InfoCard icon={FileText} title="Employee Documents">
                                <div className="mb-4">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => handleDocumentsFiles(e.target.files ?? undefined)}
                                        className="text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">Images, PDFs and other allowed files. Max 5 MB per file.</p>
                                </div>

                                {(form?.documents ?? detail.documents ?? []).length === 0 ? (
                                    <div className="text-center py-16 text-muted-foreground">
                                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg">No documents uploaded yet</p>
                                        <p className="text-sm mt-2">Employee documents will appear here</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(form?.documents ?? []).map((doc, i) => (
                                            <div key={i} className="group border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all bg-white dark:bg-slate-800">
                                                <div className="flex items-start justify-between mb-3">
                                                    <FileText className="h-8 w-8 text-blue-600" />
                                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">{doc.type}</span>
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium line-clamp-1">{doc.type}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(doc.uploadedAt)}
                                                    </p>

                                                    <a className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2" href={doc.url} target="_blank" rel="noreferrer">
                                                        View Document →
                                                    </a>

                                                    <div className="mt-3 flex gap-2">
                                                        <button onClick={() => removeDocumentAt(i)} className="text-destructive text-sm flex items-center gap-1">
                                                            <Trash2 className="h-4 w-4" /> Remove
                                                        </button>
                                                    </div>
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
                                <p className="text-sm text-muted-foreground mb-4">Add private notes about this employee. Only visible to administrators.</p>

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
                                            <Button variant="destructive" onClick={async () => { setDialogMode("delete"); setDialogOpen(true); }} className="shrink-0 text-white hover:text-white">
                                                <Flame className="mr-2 h-4 w-4" /> Delete Record
                                            </Button>
                                        ) : (
                                            <Button onClick={async () => { setDialogMode("restore"); setDialogOpen(true); }} className="shrink-0 bg-green-600 hover:bg-green-700 text-white">
                                                <RotateCcw className="mr-2 h-4 w-4" /> Restore Record
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                                    <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Password Management</h4>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="relative">
                                                    <Input
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="Enter new password"
                                                        className="pr-10 font-mono text-sm"
                                                    />
                                                    {newPassword && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewPassword("")}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Send Mail Checkbox */}
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="send-mail"
                                                        checked={sendMail}
                                                        onCheckedChange={(checked) => setSendMail(checked as boolean)}
                                                    />
                                                    <label
                                                        htmlFor="send-mail"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                                                    >
                                                        <Mail className="h-3.5 w-3.5" />
                                                        Send mail with new password
                                                    </label>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={handleGeneratePassword}
                                                        variant="outline"
                                                        className="flex-1 flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950"
                                                    >
                                                        <Sparkles className="h-4 w-4" />
                                                        Generate
                                                    </Button>
                                                    <Button
                                                        onClick={handleUpdatePassword}
                                                        disabled={!newPassword}
                                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isPassUpdating ? (
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <Check className="h-4 w-4 mr-2" />
                                                        )}

                                                        {isPassUpdating ? "Updating..." : "Update"}
                                                    </Button>
                                                </div>

                                                {generatedPassword && (
                                                    <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-green-200 dark:border-green-800">
                                                        <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                                                            <Check className="h-3 w-3" />
                                                            Generated Password:
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <code className="flex-1 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded font-mono text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                                                                {generatedPassword}
                                                            </code>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(generatedPassword);
                                                                    // Optional: show a toast notification
                                                                }}
                                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                                                title="Copy to clipboard"
                                                            >
                                                                <Copy className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {detail.isDeleted && (
                                        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                                            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                                            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">This employee record is currently deleted</p>
                                        </div>
                                    )}
                                </div>
                            </InfoCard>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <ConfirmationDialog
                open={dialogOpen}
                onOpenChange={(s: boolean) => setDialogOpen(s)}
                onConfirm={(reason: string) => dialogMode === 'delete' ? handleDelete(reason) : handleRestore()}
                mode={dialogMode}
                employeeName={detail.user.name}
            />
        </>
    );
}