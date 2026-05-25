"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  EmployeeDetailDTO,
  UpdateEmployeePayload,
  ContactInfoDTO,
  ShiftDTO,
  DocumentDTO,
  PaymentCardDTO,
} from "@/types/employee/employee.types";
import {
  EMPLOYEE_STATUS, EMPLOYMENT_TYPE, EMPLOYEE_ROLE,
  EmployeeStatus, EmploymentType,
  SALARY_PAYMENT_MODE, SalaryPaymentMode,
} from "@/constants/employee.const";
import { CARD_BRAND, CardBrand } from "@/constants/payment.const";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumbs } from "../../../global/Breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Flame, RotateCcw, User, Briefcase, Phone, FileText,
  StickyNote, Shield, Save, ArrowLeft, Mail, Calendar, Clock,
  Trash2, Lock, X, Sparkles, Check, Copy, Loader2, CreditCard, TrendingUp,
} from "lucide-react";
import { showToast } from "@/components/global/showToast";
import InfoCard from "./InfoCard";
import InfoField from "./InfoField";
import FormRow from "./FormRow";
import ModernSelect from "./ModernSelect";
import ShiftEditor from "./ShiftEditor";
import {
  fileToAvatarBase64, filesToDocumentDTOs, getFileExtension,
} from "@/utils/helpers/file-conversion";
import { CURRENCY } from "@/constants/tour.const";
import Image from "next/image";
import ConfirmationDialog from "./ConfirmationDialog";
import EmployeeDetailSkeleton from "./EmployeeDetailSkeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useEmployeeStore } from "@/store/employee/employee.store";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import { validateUpdateEmployeePayload } from "@/utils/validators/employee/employee.update-validator";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";
import { updateEmployeePassword } from "@/utils/api/update-employee-pass.api";
import { formatDate, latestEffectiveFrom } from "@/utils/helpers/employees.details";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

// ── Neumorphism tokens ──────────────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";

const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";

const NEU_BTN_PRIMARY =
  "inline-flex items-center gap-2 rounded-xl bg-[#006666] text-white text-sm " +
  "font-[family-name:var(--font-space-mono)] font-bold px-5 py-2.5 " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] hover:bg-[#007777] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "disabled:opacity-40 disabled:cursor-not-allowed " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";

const NEU_BTN_GHOST =
  "inline-flex items-center gap-2 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm " +
  "font-[family-name:var(--font-space-mono)] px-4 py-2.5 " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] hover:bg-[#1E2938]/10 " +
  "disabled:opacity-40 disabled:cursor-not-allowed " +
  "transition-all duration-200";

const NEU_BTN_DANGER =
  "inline-flex items-center gap-2 rounded-xl bg-[#E7E5E4] text-[#FF2157] text-sm " +
  "font-[family-name:var(--font-space-mono)] font-bold px-4 py-2.5 " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:bg-[#FF2157]/10 hover:shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
  "transition-all duration-200";

const NEU_BTN_SUCCESS =
  "inline-flex items-center gap-2 rounded-xl bg-[#00A63D] text-white text-sm " +
  "font-[family-name:var(--font-space-mono)] font-bold px-4 py-2.5 " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:bg-[#009935] transition-all duration-200";

const NEU_INPUT =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] rounded-xl";

const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";

const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

const NEU_TAB_TRIGGER =
  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/60 " +
  "transition-all duration-200 " +
  "data-[state=active]:bg-[#006666] data-[state=active]:text-white " +
  "data-[state=active]:shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080]";

const NEU_DATE_PILL =
  "flex items-start gap-3 p-3 rounded-xl bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const NEU_DIVIDER = "h-px bg-gradient-to-r from-transparent via-[#1E2938]/10 to-transparent my-4";
// ───────────────────────────────────────────────────────────────

type UpdateEmployeeForm = Partial<Pick<UpdateEmployeePayload,
  | "id" | "name" | "status" | "employmentType" | "contactInfo" | "shifts"
  | "notes" | "avatar" | "dateOfJoining" | "dateOfLeaving" | "documents"
  | "salary" | "currency" | "paymentMode" | "paymentCard"
>>;

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

const STATUS_BADGE: Record<string, string> = {
  active: "bg-[#00A63D]/10 text-[#00A63D]",
  onLeave: "bg-[#FE9900]/10 text-[#FE9900]",
  suspended: "bg-[#FF2157]/10 text-[#FF2157]",
  terminated: "bg-[#1E2938]/10 text-[#1E2938]/60",
};

const NEU_SELECT_CLS =
  "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm font-[family-name:var(--font-jetbrains-mono)] border-none " +
  "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 h-10 px-3";

export default function EmployeeDetailPage({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const { fetchEmployeeDetail, updateEmployee, softDeleteEmployee, restoreEmployee } = useEmployeeStore();

  const [detail, setDetail] = useState<EmployeeDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<string>("overview");
  const [form, setForm] = useState<UpdateEmployeeForm | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"delete" | "restore">("delete");
  const [sendMail, setSendMail] = useState<boolean>(true);
  const [isPassUpdating, setIsPassUpdating] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const breadcrumbItems = useMemo(() => [
    { label: "Home", href: "/" },
    { label: "Employees", href: "/users/employees" },
    { label: detail?.user.name ?? "Employee detail", href: `/users/employees/${employeeId}` },
  ], [employeeId, detail?.user.name]);

  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      setLoading(true);
      try {
        const d = await fetchEmployeeDetail(employeeId);
        if (!mounted) return;
        setDetail(d);
        setForm({
          id: d.id, name: d.user.name, status: d.status, employmentType: d.employmentType,
          avatar: d.avatar, salary: d.salary, paymentMode: d.paymentMode,
          paymentCard: d.paymentCard ?? undefined, dateOfJoining: d.dateOfJoining,
          dateOfLeaving: d.dateOfLeaving, contactInfo: d.contactInfo,
          shifts: d.shifts, documents: d.documents, notes: d.notes,
        });
        setAvatarPreview(typeof d.avatar === "string" ? d.avatar : null);
      } catch (e) {
        showToast.error(`Failed to load employee details: ${String(e)}`);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    hydrate();
    return () => { mounted = false; };
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
    const phoneFallback = patch.phone ?? form?.contactInfo?.phone ?? detail?.contactInfo?.phone ?? "";
    const next: ContactInfoDTO = {
      ...(form?.contactInfo ?? (detail?.contactInfo ?? {} as ContactInfoDTO)),
      ...patch, phone: phoneFallback,
    };
    setField("contactInfo", next);
  };

  const setShifts = (value: ShiftDTO[] | undefined) => setField("shifts", value);

  const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
  const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif"];

  async function handleAvatarFile(file?: File) {
    if (!file) return;
    try {
      const ext = getFileExtension(file.name);
      if (!IMAGE_EXTS.includes(ext)) { showToast.error("Avatar must be an image (jpg, jpeg, png, gif)"); return; }
      if (file.size > MAX_AVATAR_BYTES) { showToast.error("Avatar file too large. Max 5 MB allowed."); return; }
      const base64 = await fileToAvatarBase64(file, { maxFileBytes: MAX_AVATAR_BYTES });
      setAvatarPreview(base64);
      setField("avatar", base64 as unknown as UpdateEmployeeForm["avatar"]);
    } catch (err) {
      showToast.error(String(extractErrorMessage(err) ?? "Failed to process avatar"));
    }
  }

  async function handleDocumentsFiles(files?: FileList | File[]) {
    if (!files || (files as FileList).length === 0) return;
    try {
      const docs = await filesToDocumentDTOs(files as FileList);
      if (!docs?.length) { showToast.warning("No valid documents were processed"); return; }
      const existing = (form?.documents ?? []) as DocumentDTO[];
      setField("documents", [...existing, ...docs] as unknown as UpdateEmployeeForm["documents"]);
      showToast.success(`${docs.length} document(s) added`);
    } catch (err) {
      showToast.error(String(extractErrorMessage(err) ?? "Failed to process documents"));
    }
  }

  const removeDocumentAt = (index: number) => {
    setForm((s) => {
      if (!s) return s;
      const docs = [...(s.documents ?? [])];
      if (index < 0 || index >= docs.length) return s;
      docs.splice(index, 1);
      return { ...s, documents: docs };
    });
  };

  const handleSave = async () => {
    if (!detail || !form?.id) return;
    if (form.dateOfLeaving && (form.status === EMPLOYEE_STATUS.ACTIVE || detail.status === EMPLOYEE_STATUS.ACTIVE)) {
      showToast.warning("Employee has a leaving date; status cannot be active. Adjusting status to terminated.");
      setField("status", EMPLOYEE_STATUS.TERMINATED);
    }
    setSaving(true);
    try {
      const payload = {
        id: form.id!, name: form.name,
        status: (form.status ?? detail.status) as UpdateEmployeePayload["status"],
        employmentType: (form.employmentType ?? detail.employmentType) as UpdateEmployeePayload["employmentType"],
        salary: (form.salary ?? detail.salary) as UpdateEmployeePayload["salary"],
        currency: (form.currency ?? detail.currency) as UpdateEmployeePayload["currency"],
        paymentMode: form.paymentMode, paymentCard: form.paymentCard ?? detail.paymentCard ?? undefined,
        contactInfo: form.contactInfo ?? detail.contactInfo, shifts: form.shifts ?? detail.shifts,
        notes: form.notes ?? detail.notes ?? "",
        avatar: form.avatar as unknown as UpdateEmployeePayload["avatar"],
        dateOfJoining: form.dateOfJoining ?? detail.dateOfJoining,
        dateOfLeaving: form.dateOfLeaving ?? detail.dateOfLeaving,
        documents: form.documents ?? detail.documents,
      } as UpdateEmployeePayload;
      const isValid = await validateUpdateEmployeePayload(payload);
      if (!isValid) return;
      const updated = await updateEmployee(payload);
      setDetail(updated);
      setForm({
        id: updated.id, name: updated.user.name, status: updated.status,
        employmentType: updated.employmentType, salary: updated.salary, currency: updated.currency,
        paymentMode: updated.paymentMode, paymentCard: updated.paymentCard ?? undefined,
        contactInfo: updated.contactInfo, shifts: updated.shifts, notes: updated.notes,
        avatar: updated.avatar, dateOfJoining: updated.dateOfJoining, dateOfLeaving: updated.dateOfLeaving,
        documents: updated.documents,
      });
      showToast.success("Employee updated");
    } catch (e) {
      showToast.error(String(extractErrorMessage(e) ?? "Failed to update employee"));
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePassword = () => {
    try {
      const pw = generateStrongPassword(10);
      setGeneratedPassword(pw);
      setNewPassword(pw);
    } catch { showToast.error("Failed to generate password"); }
  };

  const handleUpdatePassword = async () => {
    if (!detail) return;
    if (!newPassword || newPassword.length < 8) { showToast.warning("Password is too short (min 8 characters)"); return; }
    setIsPassUpdating(true);
    await updateEmployeePassword(employeeId, newPassword, sendMail);
    setGeneratedPassword(""); setNewPassword("");
    setIsPassUpdating(false);
  };

  const handleDelete = async (reason: string) => {
    if (!detail?.id) return;
    await softDeleteEmployee(detail.id, reason);
    setDetail((prev) => prev ? { ...prev, isDeleted: !prev.isDeleted } : prev);
  };

  const handleRestore = async () => {
    if (!detail?.id) return;
    await restoreEmployee({ id: detail.id });
    setDetail((prev) => prev ? { ...prev, isDeleted: !prev.isDeleted } : prev);
  };

  if (loading) return <EmployeeDetailSkeleton />;

  if (!detail) {
    return (
      <div className={`${NEU_PAGE_BG} flex items-center justify-center`}>
        <div className={`${NEU_CARD} p-12 text-center space-y-4`}>
          <User className="h-14 w-14 mx-auto text-[#1E2938]/20" />
          <p className={`text-lg ${NEU_HEADING}`}>Employee not found</p>
        </div>
      </div>
    );
  }

  const statusBadgeCls = STATUS_BADGE[detail.status] ?? "bg-[#1E2938]/10 text-[#1E2938]/60";

  return (
    <>
      <div className={`${NEU_PAGE_BG} p-4 lg:p-6`}>
        <div className="max-w-7xl mx-auto space-y-6">
          <Breadcrumbs items={breadcrumbItems} />

          {/* ── Header card ── */}
          <div className={`${NEU_CARD} overflow-hidden`}>
            <div className="bg-[#006666] px-8 py-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Identity */}
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center border-2 border-white/20 overflow-hidden shadow-[4px_4px_12px_rgba(0,0,0,0.3)]">
                    {avatarPreview ? (
                      <Image src={avatarPreview} alt="avatar" fill className="object-cover" sizes="80px" priority />
                    ) : (
                      <User className="h-9 w-9 text-white" />
                    )}
                  </div>

                  <div className="text-white">
                    <h1 className="text-2xl font-[family-name:var(--font-space-mono)] font-bold tracking-tight">
                      {detail.user.name}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-[family-name:var(--font-space-mono)] font-bold ${statusBadgeCls}`}>
                        {detail.status}
                      </span>
                      {detail.isDeleted && (
                        <span className="px-3 py-1 rounded-full text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#FF2157]/20 text-[#FF2157]">
                          Deleted
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !form?.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-white text-[#006666] text-sm font-[family-name:var(--font-space-mono)] font-bold px-5 py-2.5 shadow-[4px_4px_8px_rgba(0,0,0,0.2)] hover:bg-[#E7E5E4] disabled:opacity-40 transition-all duration-200"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/users/employees")}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 text-white text-sm font-[family-name:var(--font-space-mono)] px-4 py-2.5 hover:bg-white/20 transition-all duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <div className={`${NEU_CARD} p-2`}>
              <TabsList className="grid w-full grid-cols-4 gap-1.5 bg-transparent lg:grid-cols-8">
                {[
                  { value: "overview", icon: <User className="h-4 w-4" />, label: "Overview" },
                  { value: "role", icon: <Briefcase className="h-4 w-4" />, label: "Role" },
                  { value: "contact", icon: <Phone className="h-4 w-4" />, label: "Contact" },
                  { value: "compensation", icon: <FaBangladeshiTakaSign className="h-4 w-4" />, label: "Pay" },
                  { value: "documents", icon: <FileText className="h-4 w-4" />, label: "Docs" },
                  { value: "notes", icon: <StickyNote className="h-4 w-4" />, label: "Notes" },
                  { value: "admin", icon: <Shield className="h-4 w-4" />, label: "Admin" },
                ].map((t) => (
                  <TabsTrigger key={t.value} value={t.value} className={NEU_TAB_TRIGGER}>
                    {t.icon}
                    <span className="hidden sm:inline">{t.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* ── Overview ── */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <InfoCard icon={User} title="Personal Information" className="lg:col-span-2">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <InfoField icon={User} label="Full Name" value={detail.user.name} />
                    <InfoField icon={Mail} label="Email" value={detail.user.email} />
                    <InfoField icon={Phone} label="Phone" value={detail.user.phone ?? "—"} />
                  </div>

                  <div className={`${NEU_DIVIDER}`} />

                  {/* Avatar upload */}
                  <div>
                    <p className={`${NEU_LABEL} mb-3`}>Profile Avatar</p>
                    <div className={`${NEU_SURFACE_INSET} p-4 flex flex-wrap items-center gap-3`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAvatarFile(e.target.files?.[0])}
                        className="flex-1 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/60 file:mr-3 file:rounded-lg file:border-0 file:px-4 file:py-2 file:text-sm file:font-bold file:bg-[#006666] file:text-white file:font-[family-name:var(--font-space-mono)] hover:file:bg-[#007777] file:cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => { setAvatarPreview(null); setField("avatar", undefined); }}
                        className={NEU_BTN_DANGER}
                      >
                        Remove
                      </button>
                    </div>
                    <p className={`mt-2 text-xs ${NEU_MUTED}`}>Only images allowed. Max 5 MB.</p>
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
                        className={NEU_INPUT}
                      />
                    </FormRow>

                    <FormRow label="Date of Leaving" icon={Calendar}>
                      <Input
                        type="date"
                        value={form?.dateOfLeaving ? form.dateOfLeaving.split("T")[0] : detail.dateOfLeaving?.split("T")[0] ?? ""}
                        onChange={(e) => {
                          const val = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                          setField("dateOfLeaving", val);
                          if (val && (form?.status ?? detail.status) === EMPLOYEE_STATUS.ACTIVE) {
                            showToast.warning("Date of leaving set — setting status to terminated.");
                            setField("status", EMPLOYEE_STATUS.TERMINATED);
                          }
                        }}
                        className={NEU_INPUT}
                      />
                    </FormRow>

                    <FormRow label="Status" icon={TrendingUp}>
                      <ModernSelect<EmployeeStatus>
                        value={form?.status ?? detail.status}
                        onChange={(v) => {
                          if ((form?.dateOfLeaving || detail.dateOfLeaving) && v === EMPLOYEE_STATUS.ACTIVE) {
                            showToast.warning("Cannot set status to active when a leaving date exists");
                            return;
                          }
                          setField("status", v);
                        }}
                        options={enums.statuses}
                      />
                    </FormRow>
                  </div>
                </InfoCard>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <InfoCard icon={FaBangladeshiTakaSign} title="Compensation">
                  <div className={`${NEU_SURFACE_INSET} p-6 text-center`}>
                    <p className={NEU_LABEL}>Current Salary</p>
                    <p className="mt-2 text-5xl font-[family-name:var(--font-space-mono)] font-bold text-[#006666]">
                      {detail.salary}
                    </p>
                    <p className="mt-1 text-lg font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50">
                      {detail.currency}
                    </p>
                  </div>
                  <div className={NEU_DIVIDER} />
                  <InfoField icon={Calendar} label="Effective From" value={latestEffectiveFrom(detail.salaryHistory) ?? "—"} />
                </InfoCard>

                <InfoCard icon={Calendar} title="Important Dates">
                  <div className="space-y-3">
                    {[
                      { label: "Date Joined", value: formatDate(detail.dateOfJoining), icon: Calendar, cls: "text-[#006666]", bg: "bg-[#006666]/10" },
                      { label: "Date Left", value: detail.dateOfLeaving ? formatDate(detail.dateOfLeaving) : "—", icon: Calendar, cls: "text-[#FE9900]", bg: "bg-[#FE9900]/10" },
                      { label: "Last Updated", value: formatDate(detail.updatedAt), icon: Clock, cls: "text-[#1E2938]/40", bg: "bg-[#1E2938]/5" },
                    ].map(({ label, value, icon: Icon, cls, bg }) => (
                      <div key={label} className={NEU_DATE_PILL}>
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                          <Icon className={`h-4 w-4 ${cls}`} />
                        </span>
                        <div>
                          <p className={NEU_LABEL}>{label}</p>
                          <p className="mt-0.5 font-[family-name:var(--font-jetbrains-mono)] text-sm font-medium text-[#1E2938]">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </InfoCard>
              </div>
            </TabsContent>

            {/* ── Role ── */}
            <TabsContent value="role" className="mt-6">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <InfoCard icon={Briefcase} title="Role & Schedule">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-8">
                    <FormRow label="Employment Type" icon={Briefcase}>
                      <ModernSelect<EmploymentType>
                        value={(form?.employmentType ?? detail.employmentType) ?? ""}
                        onChange={(v) => setField("employmentType", v)}
                        options={enums.employmentTypes}
                      />
                    </FormRow>
                    <FormRow label="Status" icon={TrendingUp}>
                      <ModernSelect<EmployeeStatus>
                        value={form?.status ?? detail.status}
                        onChange={(v) => setField("status", v)}
                        options={enums.statuses}
                      />
                    </FormRow>
                  </div>

                  <div className={NEU_DIVIDER} />

                  <ShiftEditor shifts={form?.shifts ?? detail.shifts ?? []} onChange={setShifts} />
                </InfoCard>
              </motion.div>
            </TabsContent>

            {/* ── Contact ── */}
            <TabsContent value="contact" className="mt-6 space-y-6">
              <InfoCard icon={Phone} title="Contact Information">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormRow label="Phone Number" icon={Phone}>
                    <Input
                      value={form?.contactInfo?.phone ?? detail.contactInfo?.phone ?? ""}
                      onChange={(e) => setContact({ phone: e.target.value })}
                      className={NEU_INPUT}
                    />
                  </FormRow>
                  <FormRow label="Email Address" icon={Mail}>
                    <Input
                      value={form?.contactInfo?.email ?? detail.contactInfo?.email ?? ""}
                      onChange={(e) => setContact({ email: e.target.value })}
                      readOnly
                      className={`${NEU_INPUT} opacity-60 cursor-not-allowed`}
                    />
                  </FormRow>
                </div>
              </InfoCard>

              <InfoCard icon={Phone} title="Emergency Contact">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  {[
                    { label: "Contact Name", field: "name" as const, icon: User, placeholder: "Name" },
                    { label: "Contact Phone", field: "phone" as const, icon: Phone, placeholder: "Phone" },
                    { label: "Relationship", field: "relation" as const, icon: User, placeholder: "e.g. Spouse" },
                  ].map(({ label, field, icon, placeholder }) => {
                    const emergencyContact = form?.contactInfo?.emergencyContact ?? detail.contactInfo?.emergencyContact ?? { name: "", phone: "", relation: "" };
                    return (
                      <FormRow key={field} label={label} icon={icon}>
                        <Input
                          value={emergencyContact[field]}
                          placeholder={placeholder}
                          onChange={(e) => setContact({
                            emergencyContact: {
                              ...emergencyContact,
                              [field]: e.target.value,
                            },
                          })}
                          className={NEU_INPUT}
                        />
                      </FormRow>
                    );
                  })}
                </div>
              </InfoCard>
            </TabsContent>

            {/* ── Compensation ── */}
            <TabsContent value="compensation" className="mt-6 space-y-6">
              <InfoCard icon={FaBangladeshiTakaSign} title="Current Compensation">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                  <FormRow label="Current Salary" icon={FaBangladeshiTakaSign}>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={form?.salary != null ? form.salary : ""}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value === "") { setField("salary", undefined); return; }
                        value = value.replace(/[^0-9.]/g, "");
                        const parts = value.split(".");
                        if (parts.length > 2) value = parts[0] + "." + parts.slice(1).join("");
                        if (value.includes(".")) {
                          const [int, dec] = value.split(".");
                          value = String(Number(int || "0")) + "." + dec;
                        } else { value = String(Number(value)); }
                        const numericValue = Number(value);
                        if (!Number.isNaN(numericValue)) setField("salary", numericValue);
                      }}
                      className={NEU_INPUT}
                    />
                  </FormRow>

                  <FormRow label="Currency" icon={FaBangladeshiTakaSign}>
                    <Select
                      value={(form?.currency ?? detail.currency) ?? CURRENCY.BDT}
                      onValueChange={(v) => setField("currency", v as CURRENCY)}
                    >
                      <SelectTrigger className={NEU_SELECT_CLS}><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl bg-[#E7E5E4] border border-white/60 shadow-[8px_8px_16px_#c8c6c5]">
                        <SelectItem value={CURRENCY.BDT} className="font-[family-name:var(--font-jetbrains-mono)]">{CURRENCY.BDT}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormRow>

                  <FormRow label="Payment Mode" icon={CreditCard}>
                    <Select
                      value={form?.paymentMode ?? SALARY_PAYMENT_MODE.MANUAL}
                      onValueChange={(v) => setField("paymentMode", v as SalaryPaymentMode)}
                    >
                      <SelectTrigger className={NEU_SELECT_CLS}><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl bg-[#E7E5E4] border border-white/60 shadow-[8px_8px_16px_#c8c6c5]">
                        {Object.values(SALARY_PAYMENT_MODE).map((mode) => (
                          <SelectItem key={mode} value={mode} className="font-[family-name:var(--font-jetbrains-mono)]">
                            {mode === SALARY_PAYMENT_MODE.AUTO ? "Auto" : "Manual"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormRow>

                  <FormRow label="Effective From">
                    <Input value={latestEffectiveFrom(detail.salaryHistory) ?? "—"} disabled className={`${NEU_INPUT} opacity-60 cursor-not-allowed`} />
                  </FormRow>
                </div>
              </InfoCard>

              <InfoCard icon={CreditCard} title="Payment Card">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                  <FormRow label="Card Brand" icon={CreditCard}>
                    <Select
                      value={form?.paymentCard?.brand ?? detail.paymentCard?.brand ?? CARD_BRAND.UNKNOWN}
                      onValueChange={(v) => {
                        const current = form?.paymentCard ?? detail.paymentCard ?? { brand: CARD_BRAND.UNKNOWN, last4: "", expMonth: 1, expYear: new Date().getFullYear() };
                        setField("paymentCard", { ...current, brand: v as CardBrand } as PaymentCardDTO);
                      }}
                    >
                      <SelectTrigger className={NEU_SELECT_CLS}><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl bg-[#E7E5E4] border border-white/60 shadow-[8px_8px_16px_#c8c6c5]">
                        {Object.values(CARD_BRAND).map((brand) => (
                          <SelectItem key={brand} value={brand} className="font-[family-name:var(--font-jetbrains-mono)]">
                            {brand.charAt(0).toUpperCase() + brand.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormRow>

                  <FormRow label="Last 4 Digits" icon={Lock}>
                    <Input
                      type="text" inputMode="numeric" maxLength={4} placeholder="1234"
                      value={form?.paymentCard?.last4 ?? detail.paymentCard?.last4 ?? ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                        const current = form?.paymentCard ?? detail.paymentCard ?? { brand: CARD_BRAND.UNKNOWN, expMonth: 1, expYear: new Date().getFullYear() };
                        setField("paymentCard", { ...current, last4: val } as PaymentCardDTO);
                      }}
                      className={`${NEU_INPUT} font-mono tracking-widest`}
                    />
                  </FormRow>
                </div>
              </InfoCard>
            </TabsContent>

            {/* ── Documents ── */}
            <TabsContent value="documents" className="mt-6">
              <InfoCard icon={FileText} title="Employee Documents">
                <div className={`${NEU_SURFACE_INSET} p-4 mb-5`}>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleDocumentsFiles(e.target.files ?? undefined)}
                    className="text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/60 file:mr-3 file:rounded-lg file:border-0 file:px-4 file:py-2 file:text-sm file:font-bold file:bg-[#006666] file:text-white file:cursor-pointer"
                  />
                  <p className={`mt-2 text-xs ${NEU_MUTED}`}>Images, PDFs and other allowed files. Max 5 MB per file.</p>
                </div>

                {(form?.documents ?? detail.documents ?? []).length === 0 ? (
                  <div className={`${NEU_SURFACE_INSET} flex flex-col items-center justify-center py-14 gap-3`}>
                    <FileText className="h-12 w-12 text-[#1E2938]/20" />
                    <p className={`text-sm ${NEU_HEADING}`}>No documents uploaded yet</p>
                    <p className={NEU_MUTED}>Employee documents will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {(form?.documents ?? []).map((doc, i) => (
                      <div key={i} className="rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60 p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <FileText className="h-8 w-8 text-[#006666]" />
                          <span className="text-xs font-[family-name:var(--font-space-mono)] font-bold px-2.5 py-1 rounded-lg bg-[#006666]/10 text-[#006666] shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff]">
                            {doc.type}
                          </span>
                        </div>
                        <div>
                          <p className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#1E2938] line-clamp-1">{doc.type}</p>
                          <p className={`flex items-center gap-1 mt-1 text-xs ${NEU_MUTED}`}>
                            <Calendar className="h-3 w-3" />{formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs font-[family-name:var(--font-space-mono)] font-bold text-[#006666] hover:underline">
                            View →
                          </a>
                          <button onClick={() => removeDocumentAt(i)} className="inline-flex items-center gap-1 text-xs font-[family-name:var(--font-space-mono)] font-bold text-[#FF2157]">
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </InfoCard>
            </TabsContent>

            {/* ── Notes ── */}
            <TabsContent value="notes" className="mt-6">
              <InfoCard icon={StickyNote} title="Internal Notes">
                <p className={`mb-4 ${NEU_MUTED}`}>Add private notes about this employee. Only visible to administrators.</p>
                <Textarea
                  value={form?.notes ?? ""}
                  onChange={(e) => setField("notes", e.target.value)}
                  placeholder="Enter internal notes here…"
                  className={`${NEU_INPUT} min-h-[200px] resize-y p-3`}
                />
              </InfoCard>
            </TabsContent>

            {/* ── Admin ── */}
            <TabsContent value="admin" className="mt-6 space-y-6">
              <InfoCard icon={Flame} title="Danger Zone">
                <div className="space-y-5">
                  {/* Delete / restore */}
                  <div className={`flex flex-wrap items-start gap-4 p-4 rounded-xl ${!detail.isDeleted ? "bg-[#FF2157]/5 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]" : "bg-[#00A63D]/5 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]"}`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${!detail.isDeleted ? "bg-[#FF2157]/10" : "bg-[#00A63D]/10"}`}>
                      {!detail.isDeleted ? <Flame className="h-5 w-5 text-[#FF2157]" /> : <RotateCcw className="h-5 w-5 text-[#00A63D]" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-[family-name:var(--font-space-mono)] text-sm font-bold ${!detail.isDeleted ? "text-[#FF2157]" : "text-[#00A63D]"}`}>
                        {!detail.isDeleted ? "Delete Employee Record" : "Restore Employee Record"}
                      </p>
                      <p className={`mt-1 text-xs ${NEU_MUTED}`}>
                        {!detail.isDeleted
                          ? "This action will soft delete the employee record. It can be restored later."
                          : "This action will restore the employee record and make it active again."}
                      </p>
                    </div>
                    {!detail.isDeleted ? (
                      <button type="button" onClick={() => { setDialogMode("delete"); setDialogOpen(true); }} className={NEU_BTN_DANGER}>
                        <Flame className="h-4 w-4" /> Delete Record
                      </button>
                    ) : (
                      <button type="button" onClick={() => { setDialogMode("restore"); setDialogOpen(true); }} className={NEU_BTN_SUCCESS}>
                        <RotateCcw className="h-4 w-4" /> Restore Record
                      </button>
                    )}
                  </div>

                  {/* Password management */}
                  <div className={`${NEU_SURFACE_INSET} p-5 space-y-4 max-w-md`}>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-[#006666]" />
                      <p className={`${NEU_LABEL}`}>Password Management</p>
                    </div>

                    <div className="relative">
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className={`${NEU_INPUT} pr-10`}
                      />
                      {newPassword && (
                        <button type="button" onClick={() => setNewPassword("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1E2938]/40 hover:text-[#1E2938]">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <label htmlFor="send-mail" className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        id="send-mail"
                        checked={sendMail}
                        onCheckedChange={(c) => setSendMail(c as boolean)}
                      />
                      <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60">
                        <Mail className="h-3.5 w-3.5" />
                        Send mail with new password
                      </span>
                    </label>

                    <div className="flex gap-2">
                      <button type="button" onClick={handleGeneratePassword} className={`${NEU_BTN_GHOST} flex-1 justify-center`}>
                        <Sparkles className="h-4 w-4" /> Generate
                      </button>
                      <button type="button" onClick={handleUpdatePassword} disabled={!newPassword} className={`${NEU_BTN_PRIMARY} flex-1 justify-center`}>
                        {isPassUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        {isPassUpdating ? "Updating…" : "Update"}
                      </button>
                    </div>

                    {generatedPassword && (
                      <div className="rounded-xl bg-[#00A63D]/5 border border-[#00A63D]/20 p-3 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]">
                        <p className="flex items-center gap-1 text-xs font-[family-name:var(--font-space-mono)] font-bold text-[#00A63D] mb-2">
                          <Check className="h-3 w-3" /> Generated Password:
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 rounded-lg bg-[#E7E5E4] px-3 py-2 font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938] shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff]">
                            {generatedPassword}
                          </code>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(generatedPassword)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E7E5E4] text-[#1E2938]/40 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] hover:text-[#006666] hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] transition-all duration-200"
                            title="Copy to clipboard"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {detail.isDeleted && (
                    <div className="flex items-center gap-3 rounded-xl bg-[#FE9900]/10 px-4 py-3 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#FE9900] animate-pulse shrink-0" />
                      <p className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#FE9900]">
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

      <ConfirmationDialog
        open={dialogOpen}
        onOpenChange={(s) => setDialogOpen(s)}
        onConfirm={(reason) => dialogMode === "delete" ? handleDelete(reason) : handleRestore()}
        mode={dialogMode}
        employeeName={detail.user.name}
      />
    </>
  );
}