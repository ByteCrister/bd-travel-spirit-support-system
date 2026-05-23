"use client";

import { useState, useEffect, useRef } from "react";
import {
  Formik,
  Form,
  Field,
  FieldArray,
  FieldProps,
  FormikErrors,
  FormikHelpers,
} from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  RefreshCw,
  Upload,
  File,
  Image as ImageIcon,
  X,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Clock,
  FileText,
  Shield,
  Heart,
  Sparkles,
  CheckCircle2,
  CreditCard,
  Info,
} from "lucide-react";
import Image from "next/image";

import {
  CreateEmployeeFormValues,
  createEmployeeValidationSchema,
} from "@/utils/validators/employee/employee.validator";
import {
  CreateEmployeePayload,
  ShiftDTO,
  DayOfWeek,
  DocumentDTO,
} from "@/types/employee/employee.types";
import {
  EMPLOYMENT_TYPE,
  SALARY_PAYMENT_MODE,
  SalaryPaymentMode,
} from "@/constants/employee.const";
import { CARD_BRAND, CardBrand } from "@/constants/payment.const";
import { CURRENCY } from "@/constants/tour.const";
import {
  fileToDocumentDTO,
  fileToAvatarBase64,
  IMAGE_EXTENSIONS,
  DOCUMENT_EXTENSIONS,
  ALLOWED_EXTENSIONS,
  removeDocumentAt,
} from "@/utils/helpers/file-conversion";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";
import { showToast } from "@/components/global/showToast";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";
import { useEmployeeStore } from "@/store/employee/employee.store";
import { cn } from "@/lib/utils";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { EmailVerificationService } from "@/utils/api/email-verification.api";
import { EMAIL_VERIFICATION_PURPOSE } from "@/constants/email-verification-purpose.const";
import EmployeeVerificationDialog from "./EmployeeVerificationDialog";

// ── Neumorphic style tokens ────────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_SURFACE_INSET_SM =
  "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_INPUT =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_BTN_PRIMARY =
  "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
  "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
  "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none";
const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none";
const NEU_BTN_DANGER =
  "rounded-xl bg-[#E7E5E4] text-[#FF2157] font-[family-name:var(--font-space-mono)] " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
  "transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_ICON_WELL =
  "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_ICON_WELL_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
// ─────────────────────────────────────────────────────────────

const DAYS_OF_WEEK: DayOfWeek[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];
const MAX_DOCUMENTS = 5;
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const AVATAR_OPTIONS = {
  maxWidth: 800,
  quality: 0.7,
  maxFileBytes: MAX_FILE_SIZE_BYTES,
};
const DOCUMENT_OPTIONS = {
  compressImages: true,
  maxWidth: 1200,
  quality: 0.8,
  maxFileBytes: MAX_FILE_SIZE_BYTES,
  allowedExtensions: ALLOWED_EXTENSIONS,
};

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Employees", href: "/users/employees" },
  { label: "Add Employee", href: "/users/employees/add-employee" },
];

const getInitialValues = (): CreateEmployeeFormValues => ({
  name: "",
  password: generateStrongPassword(10),
  employmentType: EMPLOYMENT_TYPE.FULL_TIME,
  avatar: null,
  salary: null,
  currency: CURRENCY.BDT,
  paymentMode: SALARY_PAYMENT_MODE.AUTO,
  paymentCard: null,
  dateOfJoining: new Date(),
  contactInfo: {
    phone: "",
    email: "",
    emergencyContact: { name: "", phone: "", relation: "" },
  },
  shifts: [],
  documents: [],
  notes: "",
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ── Internal sub-components ───────────────────────────────────
const FormItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-2">{children}</div>
);

const FormLabel: React.FC<{
  children: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ children, icon }) => (
  <label className={`flex items-center gap-2 ${NEU_LABEL}`}>
    {icon && <span className="text-[#006666]">{icon}</span>}
    {children}
  </label>
);

const FormMessage: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
  children ? (
    <motion.p
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)] flex items-center gap-1 mt-1"
    >
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      {children}
    </motion.p>
  ) : null;

// Section header helper
const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  accent?: string;
}> = ({ icon, title, accent = "#006666" }) => (
  <div className="flex items-center gap-3 mb-5">
    <div
      className="p-2.5 rounded-xl flex items-center justify-center shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]"
      style={{ background: `${accent}15` }}
    >
      <span style={{ color: accent }}>{icon}</span>
    </div>
    <h3 className={`${NEU_HEADING} text-lg`}>{title}</h3>
  </div>
);

const isShiftErrorObject = (e: unknown): e is FormikErrors<ShiftDTO> =>
  !!e && typeof e === "object" && !Array.isArray(e);
const getShiftError = (
  shiftError: unknown,
  field: keyof ShiftDTO,
): string | undefined =>
  isShiftErrorObject(shiftError)
    ? (shiftError[field] as string | undefined)
    : undefined;
type SetFieldValue = <K extends keyof CreateEmployeeFormValues>(
  field: K,
  value: CreateEmployeeFormValues[K],
) => void;

// ─────────────────────────────────────────────────────────────

export default function AddEmployeePage() {
  const { createEmployee, fetchEnums } = useEmployeeStore();
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [, setCurrencies] = useState<string[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [documentErrors, setDocumentErrors] = useState<{
    [key: number]: string;
  }>({});
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<{
    values: CreateEmployeeFormValues;
    resetForm: () => void;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadEnums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEnums = async () => {
    try {
      await fetchEnums();
    } catch {}
    setEmploymentTypes(Object.values(EMPLOYMENT_TYPE));
    setCurrencies(Object.values(CURRENCY));
  };

  const formatDateForInput = (date: Date) => date.toISOString().split("T")[0];

  const handleAvatarUpload = async (
    file: File,
    setFieldValue: SetFieldValue,
  ) => {
    setAvatarError(null);
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!IMAGE_EXTENSIONS.includes(ext as any))
        throw new Error(`Invalid file type: ${ext}`);
      if (file.size > MAX_FILE_SIZE_BYTES)
        throw new Error(`File too large (> ${MAX_FILE_SIZE_MB}MB)`);
      const base64 = await fileToAvatarBase64(file, AVATAR_OPTIONS);
      setFieldValue("avatar", base64);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Upload failed");
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDocumentUpload = async (
    files: FileList | File[],
    currentDocs: DocumentDTO[],
    setFieldValue: SetFieldValue,
  ) => {
    setUploadingDocuments(true);
    const newErrors: { [key: number]: string } = {};
    try {
      const arr = Array.from(files);
      if (currentDocs.length + arr.length > MAX_DOCUMENTS)
        throw new Error(`Max ${MAX_DOCUMENTS} documents allowed`);
      for (let i = 0; i < arr.length; i++) {
        const file = arr[i];
        const index = currentDocs.length + i;
        try {
          const ext = file.name.split(".").pop()?.toLowerCase() || "";
          if (
            !IMAGE_EXTENSIONS.includes(ext) &&
            !DOCUMENT_EXTENSIONS.includes(ext)
          )
            throw new Error(`Unsupported file type: ${ext}`);
          if (file.size > MAX_FILE_SIZE_BYTES)
            throw new Error(`File too large (> ${MAX_FILE_SIZE_MB}MB)`);
          const dto = await fileToDocumentDTO(file, DOCUMENT_OPTIONS);
          setFieldValue("documents", [...currentDocs, dto]);
        } catch (err) {
          newErrors[index] =
            err instanceof Error ? err.message : "Upload failed";
        }
      }
      setDocumentErrors(newErrors);
      if (
        Object.keys(newErrors).length < arr.length &&
        documentInputRef.current
      )
        documentInputRef.current.value = "";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingDocuments(false);
    }
  };

  const handleRemoveDocument = (
    index: number,
    currentDocs: DocumentDTO[],
    setFieldValue: SetFieldValue,
  ) => {
    setFieldValue("documents", removeDocumentAt(currentDocs, index));
    const newErrors = { ...documentErrors };
    delete newErrors[index];
    setDocumentErrors(newErrors);
  };

  const handleClearAvatar = (setFieldValue: SetFieldValue) => {
    setFieldValue("avatar", null);
    setAvatarError(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleSubmit = async (
    values: CreateEmployeeFormValues,
    { resetForm, setSubmitting }: FormikHelpers<CreateEmployeeFormValues>,
  ) => {
    try {
      setSubmitting(true);
      const service = new EmailVerificationService(values.contactInfo.email);
      const sendResult = await service.sendVerificationEmail(
        EMAIL_VERIFICATION_PURPOSE.EMPLOYEE_VERIFICATION,
      );
      if (!sendResult.success) {
        showToast.error(sendResult.message);
        setSubmitting(false);
        return;
      }
      setPendingSubmission({ values, resetForm });
      setShowVerificationDialog(true);
      setSubmitting(false);
    } catch {
      showToast.error("Failed to send verification email");
      setSubmitting(false);
    }
  };

  const handleVerifyToken = async (token: string) => {
    if (!pendingSubmission) return;
    setVerifying(true);
    setVerificationError(null);
    try {
      const service = new EmailVerificationService(
        pendingSubmission.values.contactInfo.email,
      );
      const verifyResult = await service.verifyToken(
        token,
        EMAIL_VERIFICATION_PURPOSE.EMPLOYEE_VERIFICATION,
      );
      if (!verifyResult.success) {
        setVerificationError(verifyResult.message);
        setVerifying(false);
        return;
      }
      const payload: CreateEmployeePayload = {
        name: pendingSubmission.values.name,
        password: pendingSubmission.values.password,
        employmentType: pendingSubmission.values.employmentType,
        avatar: pendingSubmission.values.avatar ?? "",
        salary: pendingSubmission.values.salary,
        currency: pendingSubmission.values.currency,
        paymentMode: pendingSubmission.values.paymentMode,
        paymentCard: pendingSubmission.values.paymentCard ?? undefined,
        dateOfJoining: pendingSubmission.values.dateOfJoining.toISOString(),
        contactInfo: pendingSubmission.values.contactInfo,
        shifts: pendingSubmission.values.shifts,
        documents: pendingSubmission.values.documents,
        notes: pendingSubmission.values.notes || undefined,
      };
      await createEmployee(payload);
      pendingSubmission.resetForm();
      showToast.success("Successfully added new employee.");
      setShowVerificationDialog(false);
      setPendingSubmission(null);
    } catch {
      setVerificationError("Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleCancelVerification = () => {
    setShowVerificationDialog(false);
    setPendingSubmission(null);
    setVerificationError(null);
    setVerifying(false);
    showToast.info("Employee creation cancelled.");
  };

  return (
    <div className={`${NEU_PAGE_BG} overflow-y-auto flex-1 px-6 py-6 lg:px-8`}>
      <Breadcrumbs items={breadcrumbItems} />

      <Formik
        initialValues={getInitialValues()}
        validationSchema={createEmployeeValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <Form>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 pt-5"
            >
              {/* ── Security Credentials ─────────────────────── */}
              <motion.div variants={itemVariants}>
                <div className={`${NEU_CARD} p-6`}>
                  <SectionHeader
                    icon={<Shield className="h-5 w-5" />}
                    title="Security Credentials"
                    accent="#FE9900"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormItem>
                      <FormLabel icon={<User className="h-4 w-4" />}>
                        Name *
                      </FormLabel>
                      <Field name="name">
                        {({ field }: FieldProps<string>) => (
                          <input
                            {...field}
                            disabled={showVerificationDialog}
                            placeholder="Enter employee name"
                            className={`${NEU_INPUT} w-full h-10 px-4`}
                          />
                        )}
                      </Field>
                      <FormMessage>{touched.name && errors.name}</FormMessage>
                    </FormItem>

                    <FormItem>
                      <FormLabel icon={<Shield className="h-4 w-4" />}>
                        Password *
                      </FormLabel>
                      <div className="flex gap-3">
                        <Field name="password">
                          {({ field }: FieldProps<string>) => (
                            <input
                              {...field}
                              type="password"
                              disabled={showVerificationDialog}
                              placeholder="Enter secure password"
                              className={`${NEU_INPUT} flex-1 h-10 px-4`}
                            />
                          )}
                        </Field>
                        <button
                          type="button"
                          disabled={showVerificationDialog}
                          onClick={() =>
                            setFieldValue("password", generateStrongPassword())
                          }
                          className={`${NEU_BTN_GHOST} flex items-center gap-2 px-4 h-10 text-sm`}
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span className="hidden sm:inline">Generate</span>
                        </button>
                      </div>
                      <FormMessage>
                        {touched.password && errors.password}
                      </FormMessage>
                    </FormItem>
                  </div>
                </div>
              </motion.div>

              {/* ── Profile Information ───────────────────────── */}
              <motion.div variants={itemVariants}>
                <div className={`${NEU_CARD} p-6`}>
                  <SectionHeader
                    icon={<User className="h-5 w-5" />}
                    title="Profile Information"
                    accent="#006666"
                  />

                  {/* Avatar Upload */}
                  <FormItem>
                    <FormLabel icon={<ImageIcon className="h-4 w-4" />}>
                      Profile Picture
                    </FormLabel>
                    <div className="flex items-start gap-6">
                      <AnimatePresence mode="wait">
                        {values.avatar ? (
                          <motion.div
                            key="preview"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            className="relative group flex-shrink-0"
                          >
                            <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff] border border-white/60">
                              <Image
                                src={values.avatar}
                                alt="Avatar"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              disabled={showVerificationDialog}
                              className="absolute -top-2 -right-2 p-1.5 bg-[#FF2157] text-white rounded-xl shadow-md hover:bg-[#e0003e] disabled:opacity-50"
                              onClick={() => handleClearAvatar(setFieldValue)}
                            >
                              <X className="h-3 w-3" />
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="placeholder"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-28 h-28 rounded-2xl flex-shrink-0 flex items-center justify-center ${NEU_SURFACE_INSET}`}
                          >
                            <User className="h-12 w-12 text-[#1E2938]/20" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept={IMAGE_EXTENSIONS.map(
                              (ext) => `.${ext}`,
                            ).join(",")}
                            onChange={(e) =>
                              e.target.files &&
                              handleAvatarUpload(
                                e.target.files[0],
                                setFieldValue,
                              )
                            }
                            disabled={uploadingAvatar || showVerificationDialog}
                            className={`${NEU_INPUT} cursor-pointer h-10 px-3 flex-1 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#006666] file:text-white file:text-xs file:font-[family-name:var(--font-space-mono)] file:font-bold hover:file:bg-[#007777] text-xs`}
                          />
                          {uploadingAvatar && (
                            <Loader2 className="h-5 w-5 animate-spin text-[#006666]" />
                          )}
                        </div>
                        <p
                          className={`${NEU_MUTED} text-xs flex items-center gap-1`}
                        >
                          <Sparkles className="h-3 w-3" />
                          Square image recommended, max {MAX_FILE_SIZE_MB}MB
                        </p>
                        {avatarError && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)] bg-[#FF2157]/5 border border-[#FF2157]/20">
                            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                            {avatarError}
                          </div>
                        )}
                      </div>
                    </div>
                    <FormMessage>{touched.avatar && errors.avatar}</FormMessage>
                  </FormItem>

                  <div className="mt-5">
                    <FormItem>
                      <FormLabel icon={<Briefcase className="h-4 w-4" />}>
                        Employment Type
                      </FormLabel>
                      <Field name="employmentType">
                        {({ field }: FieldProps<string>) => (
                          <Select
                            value={field.value}
                            onValueChange={(v) =>
                              setFieldValue("employmentType", v)
                            }
                            disabled={showVerificationDialog}
                          >
                            <SelectTrigger
                              className={`${NEU_BTN_GHOST} w-full h-10 px-4 flex items-center justify-between text-sm`}
                            >
                              <SelectValue placeholder="Select employment type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60">
                              {employmentTypes.map((type) => (
                                <SelectItem
                                  key={type}
                                  value={type}
                                  className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938] hover:bg-[#006666]/10 focus:bg-[#006666]/10 rounded-lg cursor-pointer"
                                >
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </Field>
                      <FormMessage>
                        {touched.employmentType && errors.employmentType}
                      </FormMessage>
                    </FormItem>
                  </div>
                </div>
              </motion.div>

              {/* ── Compensation Details ──────────────────────── */}
              <motion.div variants={itemVariants}>
                <div className={`${NEU_CARD} p-6`}>
                  <SectionHeader
                    icon={<FaBangladeshiTakaSign className="h-5 w-5" />}
                    title="Compensation Details"
                    accent="#00A63D"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Salary */}
                    <FormItem>
                      <FormLabel
                        icon={<FaBangladeshiTakaSign className="h-4 w-4" />}
                      >
                        Salary *
                      </FormLabel>
                      <div className="flex gap-2">
                        <Field name="salary">
                          {({ field }: FieldProps<number>) => (
                            <input
                              {...field}
                              type="text"
                              inputMode="decimal"
                              value={field.value ?? ""}
                              disabled={showVerificationDialog}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (
                                  val === "" ||
                                  /^(?:0|[1-9]\d*)(?:\.\d*)?$/.test(val)
                                )
                                  setFieldValue("salary", val);
                              }}
                              placeholder="Enter amount"
                              className={`${NEU_INPUT} flex-1 h-10 px-4`}
                            />
                          )}
                        </Field>
                        <Field name="currency">
                          {({ field }: FieldProps<string>) => (
                            <Select
                              value={field.value}
                              onValueChange={(v) =>
                                setFieldValue("currency", v)
                              }
                              disabled={showVerificationDialog}
                            >
                              <SelectTrigger
                                className={`${NEU_BTN_GHOST} w-[100px] h-10 px-3 text-sm`}
                              >
                                <SelectValue placeholder="Currency" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60">
                                <SelectItem
                                  value={CURRENCY.BDT}
                                  className="font-[family-name:var(--font-jetbrains-mono)] text-sm cursor-pointer"
                                >
                                  BDT
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </Field>
                      </div>
                      <FormMessage>
                        {touched.salary && errors.salary}
                      </FormMessage>
                    </FormItem>

                    {/* Date of Joining */}
                    <FormItem>
                      <FormLabel icon={<Calendar className="h-4 w-4" />}>
                        Date of Joining
                      </FormLabel>
                      <Field name="dateOfJoining">
                        {({ field }: FieldProps<Date>) => (
                          <input
                            type="date"
                            value={
                              field.value ? formatDateForInput(field.value) : ""
                            }
                            min={formatDateForInput(new Date())}
                            disabled={showVerificationDialog}
                            onChange={(e) =>
                              setFieldValue(
                                "dateOfJoining",
                                new Date(e.target.value),
                              )
                            }
                            className={`${NEU_INPUT} w-full h-10 px-4`}
                          />
                        )}
                      </Field>
                      <FormMessage>
                        {touched.dateOfJoining &&
                          errors.dateOfJoining &&
                          String(errors.dateOfJoining)}
                      </FormMessage>
                    </FormItem>

                    {/* Payment Mode */}
                    <div className="md:col-span-2">
                      <FormItem>
                        <FormLabel icon={<CreditCard className="h-4 w-4" />}>
                          Payment Mode *
                        </FormLabel>
                        <Field name="paymentMode">
                          {({ field }: FieldProps<SalaryPaymentMode>) => (
                            <div className="grid grid-cols-2 gap-4">
                              {Object.values(SALARY_PAYMENT_MODE).map(
                                (mode) => (
                                  <div
                                    key={mode}
                                    onClick={() =>
                                      !showVerificationDialog &&
                                      setFieldValue("paymentMode", mode)
                                    }
                                    className={cn(
                                      "relative flex items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-200",
                                      field.value === mode
                                        ? "bg-[#006666]/10 shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] border border-[#006666]/20"
                                        : `${NEU_CARD_SM} hover:shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]`,
                                      showVerificationDialog &&
                                        "pointer-events-none opacity-60",
                                    )}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={cn(
                                          "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                                          field.value === mode
                                            ? "border-[#006666] bg-[#006666]"
                                            : "border-[#1E2938]/30 bg-[#E7E5E4] shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff]",
                                        )}
                                      >
                                        {field.value === mode && (
                                          <div className="h-2 w-2 rounded-full bg-white" />
                                        )}
                                      </div>
                                      <span className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#1E2938]">
                                        {mode === SALARY_PAYMENT_MODE.AUTO
                                          ? "Automatic"
                                          : "Manual"}
                                      </span>
                                    </div>
                                    {mode === SALARY_PAYMENT_MODE.AUTO && (
                                      <div className="absolute -top-2 -right-2">
                                        <span className="px-2 py-0.5 text-[10px] font-[family-name:var(--font-space-mono)] font-bold bg-[#FE9900] text-white rounded-lg shadow-sm">
                                          Recommended
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </Field>
                        <div
                          className={`mt-3 flex items-start gap-2 text-xs ${NEU_MUTED}`}
                        >
                          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-[#1E2938]/70">
                              Automatic:
                            </strong>{" "}
                            Paid on set date.{" "}
                            <strong className="text-[#1E2938]/70">
                              Manual:
                            </strong>{" "}
                            Requires approval each payment.
                          </span>
                        </div>
                        <FormMessage>
                          {touched.paymentMode && errors.paymentMode}
                        </FormMessage>
                      </FormItem>
                    </div>

                    {/* Payment Card */}
                    {values.paymentMode === SALARY_PAYMENT_MODE.AUTO && (
                      <div className="md:col-span-2">
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`${NEU_SURFACE_INSET} rounded-xl p-5 space-y-4`}
                        >
                          <h4
                            className={`${NEU_HEADING} text-sm flex items-center gap-2`}
                          >
                            <div className={`${NEU_ICON_WELL_PRIMARY} p-1.5`}>
                              <CreditCard className="h-4 w-4 text-[#006666]" />
                            </div>
                            Payment Card Details *
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormItem>
                              <FormLabel>Card Brand *</FormLabel>
                              <Select
                                value={
                                  values.paymentCard?.brand ??
                                  CARD_BRAND.UNKNOWN
                                }
                                onValueChange={(v) => {
                                  if (showVerificationDialog) return;
                                  setFieldValue("paymentCard", {
                                    ...(values.paymentCard ?? {
                                      last4: "",
                                      expMonth: 1,
                                      expYear: new Date().getFullYear(),
                                      brand: CARD_BRAND.UNKNOWN,
                                    }),
                                    brand: v as CardBrand,
                                  });
                                }}
                                disabled={showVerificationDialog}
                              >
                                <SelectTrigger
                                  className={`${NEU_BTN_GHOST} w-full h-10 px-4 text-sm`}
                                >
                                  <SelectValue placeholder="Select card brand" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60">
                                  {Object.values(CARD_BRAND).map((brand) => (
                                    <SelectItem
                                      key={brand}
                                      value={brand}
                                      className="font-[family-name:var(--font-jetbrains-mono)] text-sm cursor-pointer"
                                    >
                                      {brand.charAt(0).toUpperCase() +
                                        brand.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                            <FormItem>
                              <FormLabel>Last 4 Digits *</FormLabel>
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={4}
                                placeholder="1234"
                                disabled={showVerificationDialog}
                                value={values.paymentCard?.last4 ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 4);
                                  setFieldValue("paymentCard", {
                                    ...(values.paymentCard ?? {
                                      brand: CARD_BRAND.UNKNOWN,
                                      expMonth: 1,
                                      expYear: new Date().getFullYear(),
                                    }),
                                    last4: val,
                                  });
                                }}
                                className={`${NEU_INPUT} w-full h-10 px-4 font-mono tracking-widest`}
                              />
                            </FormItem>
                            <FormItem>
                              <FormLabel>Exp. Month *</FormLabel>
                              <Select
                                value={String(
                                  values.paymentCard?.expMonth ?? 1,
                                )}
                                onValueChange={(v) => {
                                  if (showVerificationDialog) return;
                                  setFieldValue("paymentCard", {
                                    ...(values.paymentCard ?? {
                                      brand: CARD_BRAND.UNKNOWN,
                                      last4: "",
                                      expYear: new Date().getFullYear(),
                                    }),
                                    expMonth: parseInt(v, 10),
                                  });
                                }}
                                disabled={showVerificationDialog}
                              >
                                <SelectTrigger
                                  className={`${NEU_BTN_GHOST} w-full h-10 px-4 text-sm`}
                                >
                                  <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60">
                                  {Array.from(
                                    { length: 12 },
                                    (_, i) => i + 1,
                                  ).map((m) => (
                                    <SelectItem
                                      key={m}
                                      value={String(m)}
                                      className="font-[family-name:var(--font-jetbrains-mono)] text-sm cursor-pointer"
                                    >
                                      {String(m).padStart(2, "0")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                            <FormItem>
                              <FormLabel>Exp. Year *</FormLabel>
                              <Select
                                value={String(
                                  values.paymentCard?.expYear ??
                                    new Date().getFullYear(),
                                )}
                                onValueChange={(v) => {
                                  if (showVerificationDialog) return;
                                  setFieldValue("paymentCard", {
                                    ...(values.paymentCard ?? {
                                      brand: CARD_BRAND.UNKNOWN,
                                      last4: "",
                                      expMonth: 1,
                                    }),
                                    expYear: parseInt(v, 10),
                                  });
                                }}
                                disabled={showVerificationDialog}
                              >
                                <SelectTrigger
                                  className={`${NEU_BTN_GHOST} w-full h-10 px-4 text-sm`}
                                >
                                  <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60">
                                  {Array.from(
                                    { length: 10 },
                                    (_, i) => new Date().getFullYear() + i,
                                  ).map((y) => (
                                    <SelectItem
                                      key={y}
                                      value={String(y)}
                                      className="font-[family-name:var(--font-jetbrains-mono)] text-sm cursor-pointer"
                                    >
                                      {y}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                            <div className="md:col-span-2">
                              <FormItem>
                                <FormLabel>Cardholder Name</FormLabel>
                                <input
                                  type="text"
                                  placeholder="Name as shown on card"
                                  disabled={showVerificationDialog}
                                  value={
                                    values.paymentCard?.cardholderName ?? ""
                                  }
                                  onChange={(e) =>
                                    setFieldValue("paymentCard", {
                                      ...(values.paymentCard ?? {
                                        brand: CARD_BRAND.UNKNOWN,
                                        last4: "",
                                        expMonth: 1,
                                        expYear: new Date().getFullYear(),
                                      }),
                                      cardholderName: e.target.value,
                                    })
                                  }
                                  className={`${NEU_INPUT} w-full h-10 px-4`}
                                />
                              </FormItem>
                            </div>
                          </div>
                          <div
                            className={`flex items-start gap-2 text-xs ${NEU_MUTED}`}
                          >
                            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>
                              Card details are stored securely and used only for
                              automatic salary disbursement.
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* ── Contact Information ───────────────────────── */}
              <motion.div variants={itemVariants}>
                <div className={`${NEU_CARD} p-6`}>
                  <SectionHeader
                    icon={<Mail className="h-5 w-5" />}
                    title="Contact Information"
                    accent="#006666"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <FormItem>
                      <FormLabel icon={<Phone className="h-4 w-4" />}>
                        Phone *
                      </FormLabel>
                      <Field name="contactInfo.phone">
                        {({ field }: FieldProps<string>) => (
                          <input
                            {...field}
                            value={field.value ?? ""}
                            type="tel"
                            disabled={showVerificationDialog}
                            placeholder="01XXXXXXXXX"
                            className={`${NEU_INPUT} w-full h-10 px-4`}
                          />
                        )}
                      </Field>
                      <FormMessage>
                        {touched.contactInfo?.phone &&
                          errors.contactInfo?.phone}
                      </FormMessage>
                    </FormItem>
                    <FormItem>
                      <FormLabel icon={<Mail className="h-4 w-4" />}>
                        Email *
                      </FormLabel>
                      <Field name="contactInfo.email">
                        {({ field }: FieldProps<string>) => (
                          <input
                            {...field}
                            type="email"
                            disabled={showVerificationDialog}
                            placeholder="email@example.com"
                            className={`${NEU_INPUT} w-full h-10 px-4`}
                          />
                        )}
                      </Field>
                      <FormMessage>
                        {touched.contactInfo?.email &&
                          errors.contactInfo?.email}
                      </FormMessage>
                    </FormItem>
                  </div>

                  {/* Emergency Contact */}
                  <div
                    className={`${NEU_SURFACE_INSET} rounded-xl p-5 space-y-4`}
                  >
                    <h4
                      className={`${NEU_HEADING} text-sm flex items-center gap-2`}
                    >
                      <div className="p-1.5 rounded-lg bg-[#FF2157]/10 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]">
                        <Heart className="h-4 w-4 text-[#FF2157]" />
                      </div>
                      Emergency Contact *
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          name: "contactInfo.emergencyContact.name",
                          label: "Name *",
                          placeholder: "Full name",
                          errKey: "name" as const,
                        },
                        {
                          name: "contactInfo.emergencyContact.phone",
                          label: "Phone *",
                          placeholder: "01XXXXXXXXX",
                          errKey: "phone" as const,
                        },
                        {
                          name: "contactInfo.emergencyContact.relation",
                          label: "Relation *",
                          placeholder: "e.g., Father",
                          errKey: "relation" as const,
                        },
                      ].map(({ name, label, placeholder, errKey }) => (
                        <FormItem key={name}>
                          <FormLabel>{label}</FormLabel>
                          <Field name={name}>
                            {({ field }: FieldProps<string>) => (
                              <input
                                {...field}
                                disabled={showVerificationDialog}
                                placeholder={placeholder}
                                className={`${NEU_INPUT} w-full h-10 px-4`}
                              />
                            )}
                          </Field>
                          <FormMessage>
                            {touched.contactInfo?.emergencyContact?.[errKey] &&
                              errors.contactInfo?.emergencyContact?.[errKey]}
                          </FormMessage>
                        </FormItem>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── Work Shifts ───────────────────────────────── */}
              <motion.div variants={itemVariants}>
                <div className={`${NEU_CARD} p-6`}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#006666]/10 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]">
                        <Clock className="h-5 w-5 text-[#006666]" />
                      </div>
                      <h3 className={`${NEU_HEADING} text-lg`}>Work Shifts</h3>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={showVerificationDialog}
                      className={`${NEU_BTN_PRIMARY} flex items-center gap-2 px-4 h-9 text-sm`}
                      onClick={() =>
                        setFieldValue("shifts", [
                          ...values.shifts,
                          { startTime: "09:00", endTime: "17:00", days: [] },
                        ])
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Add Shift
                    </motion.button>
                  </div>

                  <FieldArray name="shifts">
                    {({ remove }) => (
                      <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                          {values.shifts.length === 0 ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className={`${NEU_SURFACE_INSET} rounded-xl text-center py-12`}
                            >
                              <Clock className="h-12 w-12 mx-auto mb-3 text-[#1E2938]/20" />
                              <p
                                className={`${NEU_HEADING} text-sm text-[#1E2938]/40`}
                              >
                                No shifts added yet
                              </p>
                              <p className={`${NEU_MUTED} text-xs mt-1`}>
                                Click &quot;Add Shift&quot; to get started
                              </p>
                            </motion.div>
                          ) : (
                            values.shifts.map((shift, index) => {
                              const shiftError = errors.shifts?.[index];
                              const touchedShift = touched.shifts?.[index];
                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -16 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  layout
                                  className={`${NEU_SURFACE_INSET_SM} rounded-xl p-5 space-y-4`}
                                >
                                  <div className="flex justify-between items-center">
                                    <h4
                                      className={`${NEU_HEADING} text-sm flex items-center gap-3`}
                                    >
                                      <div className="w-8 h-8 rounded-xl bg-[#006666] flex items-center justify-center text-white text-xs font-bold shadow-[inset_2px_2px_4px_#004d4d,inset_-2px_-2px_4px_#008080]">
                                        {index + 1}
                                      </div>
                                      Shift {index + 1}
                                    </h4>
                                    <button
                                      type="button"
                                      disabled={showVerificationDialog}
                                      onClick={() => remove(index)}
                                      className={`${NEU_BTN_DANGER} flex items-center gap-1 px-3 h-8 text-xs`}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <Field name={`shifts.${index}.startTime`}>
                                      {({ field }: FieldProps<string>) => (
                                        <FormItem>
                                          <FormLabel>Start Time *</FormLabel>
                                          <input
                                            {...field}
                                            type="time"
                                            value={field.value ?? ""}
                                            disabled={showVerificationDialog}
                                            className={`${NEU_INPUT} w-full h-10 px-4`}
                                          />
                                          <FormMessage>
                                            {touchedShift?.startTime &&
                                              getShiftError(
                                                shiftError,
                                                "startTime",
                                              )}
                                          </FormMessage>
                                        </FormItem>
                                      )}
                                    </Field>
                                    <Field name={`shifts.${index}.endTime`}>
                                      {({ field }: FieldProps<string>) => (
                                        <FormItem>
                                          <FormLabel>End Time *</FormLabel>
                                          <input
                                            {...field}
                                            type="time"
                                            value={field.value ?? ""}
                                            disabled={showVerificationDialog}
                                            className={`${NEU_INPUT} w-full h-10 px-4`}
                                          />
                                          <FormMessage>
                                            {touchedShift?.endTime &&
                                              getShiftError(
                                                shiftError,
                                                "endTime",
                                              )}
                                          </FormMessage>
                                        </FormItem>
                                      )}
                                    </Field>
                                  </div>
                                  <Field name={`shifts.${index}.days`}>
                                    {({ field }: FieldProps<DayOfWeek[]>) => {
                                      const selectedDays: DayOfWeek[] =
                                        Array.isArray(field.value)
                                          ? field.value
                                          : [];
                                      return (
                                        <FormItem>
                                          <FormLabel>Working Days</FormLabel>
                                          <div className="flex gap-2 flex-wrap">
                                            {DAYS_OF_WEEK.map((day) => {
                                              const isSelected =
                                                selectedDays.includes(day);
                                              return (
                                                <motion.button
                                                  key={day}
                                                  type="button"
                                                  whileHover={{ scale: 1.05 }}
                                                  whileTap={{ scale: 0.95 }}
                                                  disabled={
                                                    showVerificationDialog
                                                  }
                                                  onClick={() => {
                                                    if (showVerificationDialog)
                                                      return;
                                                    const newDays =
                                                      selectedDays.includes(day)
                                                        ? selectedDays.filter(
                                                            (d) => d !== day,
                                                          )
                                                        : [
                                                            ...selectedDays,
                                                            day,
                                                          ];
                                                    setFieldValue(
                                                      `shifts.${index}.days`,
                                                      newDays,
                                                    );
                                                  }}
                                                  className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
                                                    isSelected
                                                      ? "bg-[#006666] text-white shadow-[inset_2px_2px_4px_#004d4d,inset_-2px_-2px_4px_#008080]"
                                                      : "bg-[#E7E5E4] text-[#1E2938]/60 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] hover:text-[#006666]",
                                                  )}
                                                >
                                                  {day}
                                                </motion.button>
                                              );
                                            })}
                                          </div>
                                        </FormItem>
                                      );
                                    }}
                                  </Field>
                                </motion.div>
                              );
                            })
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </FieldArray>
                </div>
              </motion.div>

              {/* ── Documents & Files ─────────────────────────── */}
              <motion.div variants={itemVariants}>
                <div className={`${NEU_CARD} p-6`}>
                  <SectionHeader
                    icon={<FileText className="h-5 w-5" />}
                    title="Documents & Files"
                    accent="#1E2938"
                  />
                  <FormItem>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          ref={documentInputRef}
                          type="file"
                          multiple
                          accept={ALLOWED_EXTENSIONS.map(
                            (ext) => `.${ext}`,
                          ).join(",")}
                          onChange={(e) =>
                            e.target.files &&
                            handleDocumentUpload(
                              e.target.files,
                              values.documents,
                              setFieldValue,
                            )
                          }
                          disabled={
                            uploadingDocuments || showVerificationDialog
                          }
                          className={`${NEU_INPUT} flex-1 cursor-pointer h-10 px-3 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#1E2938] file:text-white file:text-xs file:font-[family-name:var(--font-space-mono)] file:font-bold hover:file:bg-[#1E2938]/80`}
                        />
                        {uploadingDocuments && (
                          <Loader2 className="h-5 w-5 animate-spin text-[#006666]" />
                        )}
                      </div>
                      <p
                        className={`${NEU_MUTED} text-xs flex items-center gap-1`}
                      >
                        <Upload className="h-3 w-3" />
                        Upload up to {MAX_DOCUMENTS} documents (max{" "}
                        {MAX_FILE_SIZE_MB}MB each)
                      </p>

                      <AnimatePresence mode="popLayout">
                        {values.documents.length > 0 ? (
                          <motion.div layout className="space-y-3 mt-2">
                            {values.documents.map((doc, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                layout
                                className={`${NEU_CARD_SM} flex items-center justify-between p-4 group`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${doc.type.startsWith("image/") ? "bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]" : NEU_ICON_WELL}`}
                                  >
                                    {doc.type.startsWith("image/") ? (
                                      <ImageIcon className="h-5 w-5 text-[#006666]" />
                                    ) : (
                                      <File className="h-5 w-5 text-[#1E2938]/60" />
                                    )}
                                  </div>
                                  <div>
                                    <p
                                      className={`${NEU_LABEL} text-[#1E2938]/70 normal-case tracking-normal`}
                                    >
                                      {doc.type}
                                    </p>
                                    {documentErrors[i] && (
                                      <p className="text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)]">
                                        {documentErrors[i]}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  type="button"
                                  disabled={showVerificationDialog}
                                  className={`${NEU_BTN_DANGER} flex items-center p-2 opacity-0 group-hover:opacity-100 transition-opacity`}
                                  onClick={() =>
                                    handleRemoveDocument(
                                      i,
                                      values.documents,
                                      setFieldValue,
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </motion.button>
                              </motion.div>
                            ))}
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`${NEU_SURFACE_INSET} rounded-xl text-center py-10`}
                          >
                            <Upload className="h-10 w-10 mx-auto mb-3 text-[#1E2938]/20" />
                            <p className={`${NEU_MUTED} text-sm`}>
                              No documents uploaded
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </FormItem>
                </div>
              </motion.div>

              {/* ── Additional Notes ─────────────────────────── */}
              <motion.div variants={itemVariants}>
                <div className={`${NEU_CARD} p-6`}>
                  <SectionHeader
                    icon={<FileText className="h-5 w-5" />}
                    title="Additional Notes"
                    accent="#FE9900"
                  />
                  <FormItem>
                    <Field name="notes">
                      {({ field }: FieldProps<string>) => (
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          disabled={showVerificationDialog}
                          placeholder="Add any additional notes, comments, or special requirements..."
                          className={`${NEU_INPUT} min-h-[120px] p-4 resize-none`}
                        />
                      )}
                    </Field>
                  </FormItem>
                </div>
              </motion.div>
            </motion.div>

            {/* ── Sticky Footer ─────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`sticky bottom-0 -mx-6 lg:-mx-8 -mb-6 mt-8 bg-[#E7E5E4] shadow-[0_-4px_16px_#c8c6c5] border-t border-white/60 pt-4 pb-5 px-6 lg:px-8`}
            >
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={showVerificationDialog}
                  onClick={() => router.push("/users/employees")}
                  className={`${NEU_BTN_GHOST} flex-1 flex items-center justify-center h-11 text-sm`}
                >
                  Return
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={
                    isSubmitting ||
                    uploadingAvatar ||
                    uploadingDocuments ||
                    showVerificationDialog
                  }
                  className={`${NEU_BTN_PRIMARY} flex-1 flex items-center justify-center gap-2 h-11 text-sm`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating Employee…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Create Employee
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </Form>
        )}
      </Formik>

      <EmployeeVerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        email={pendingSubmission?.values.contactInfo.email || ""}
        onVerify={handleVerifyToken}
        onCancel={handleCancelVerification}
        verifying={verifying}
        error={verificationError}
      />
    </div>
  );
}
