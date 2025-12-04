"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Briefcase,
    Mail,
    Phone,
    Camera,
    Key,
    DollarSign,
    FileText,
    Upload,
    X,
    Copy,
    RefreshCw,
    Eye,
    EyeOff,
    Check,
    Trash2,
    Loader2
} from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "./primitives/Field";

import {
    CreateEmployeePayload,
    EmployeeRole,
    EmploymentType,
    EmployeeDetailDTO,
    ContactInfoDTO,
    ObjectIdString,
} from "@/types/employee.types";

import { EMPLOYEE_ROLE, EMPLOYMENT_TYPE } from "@/constants/employee.const";
import { showToast } from "@/components/global/showToast";
import { Skeleton } from "@/components/ui/skeleton";
import NextImage from "next/image";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";
import { filesToDocumentDTOs, fileToAvatarBase64 } from "@/utils/helpers/fileBase64";

/* -------------------------
   Helpers & constants
   ------------------------- */

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "pdf"];
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif"];
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

/* -------------------------
   Component
   ------------------------- */

type EnumsShape = {
    roles: EmployeeRole[];
    employmentTypes: EmploymentType[];
};

export function AddEmployeeDialog({
    open,
    onOpenChange,
    onCreate,
    fetchEnums,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    onCreate: (payload: CreateEmployeePayload) => Promise<EmployeeDetailDTO>;
    fetchEnums: (force?: boolean) => Promise<unknown>;
}) {
    const [enums, setEnums] = useState<EnumsShape | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [passwordCopied, setPasswordCopied] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingDocs, setUploadingDocs] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const avatarInputRef = useRef<HTMLInputElement | null>(null);

    const [form, setForm] = useState<CreateEmployeePayload>({
        password: "",
        role: (Object.values(EMPLOYEE_ROLE)[0] as EmployeeRole) ?? ("" as EmployeeRole),
        employmentType: undefined,
        avatar: undefined,
        salary: 0,
        currency: "BDT",
        dateOfJoining: undefined,
        contactInfo: { phone: "" } as ContactInfoDTO,
        shifts: undefined,
        documents: [],
        notes: undefined,
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const initEnums = async () => {
            try {
                await fetchEnums();
            } catch {
                // fallback to constants
            }
            if (!mounted) return;
            setEnums({
                roles: Object.values(EMPLOYEE_ROLE),
                employmentTypes: Object.values(EMPLOYMENT_TYPE),
            });
        };
        initEnums();
        return () => {
            mounted = false;
        };
    }, [fetchEnums]);

    useEffect(() => {
        if (open) {
            setForm((f) => ({ ...f, password: generateStrongPassword(10) }));
        }
    }, [open]);

    useEffect(() => {
        if (!open) {
            setForm({
                password: "",
                role: (Object.values(EMPLOYEE_ROLE)[0] as EmployeeRole) ?? ("" as EmployeeRole),
                employmentType: undefined,
                avatar: undefined,
                salary: 0,
                currency: "BDT",
                dateOfJoining: undefined,
                contactInfo: { phone: "" } as ContactInfoDTO,
                shifts: undefined,
                documents: [],
                notes: undefined,
            });
            setAvatarPreview(null);
            setErrors({});
            setPasswordCopied(false);
        }
    }, [open]);

    const validateForm = (): boolean => {
        try {
            const newErrors: Record<string, string> = {};
            if (!form.role) newErrors.role = "Role is required";
            if (!form.contactInfo || !form.contactInfo.phone) newErrors["contactInfo.phone"] = "Contact phone is required";
            if (typeof form.salary !== "number" || form.salary < 0) newErrors.salary = "Salary must be a non-negative number";
            if (!form.currency) newErrors.currency = "Currency is required";
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        } catch (err) {
            console.error(err);
            setErrors({ form: "Validation failed" });
            return false;
        }
    };

    const handleRegeneratePassword = () => {
        setForm((f) => ({ ...f, password: generateStrongPassword(10) }));
        setPasswordCopied(false);
    };

    const handleCopyPassword = async () => {
        if (!form.password) return;
        try {
            await navigator.clipboard.writeText(form.password);
            setPasswordCopied(true);
            showToast.info("Password copied to clipboard");
            setTimeout(() => setPasswordCopied(false), 2000);
        } catch {
            showToast.warning("Unable to copy password");
        }
    };

    const handleFilesSelected = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploadingDocs(true);

        try {
            // convert files -> DocumentDTO[] (helpers handle compression & validation)
            const docs = await filesToDocumentDTOs(files, { compressImages: true, maxWidth: 1600, quality: 0.8, maxFileBytes: MAX_FILE_BYTES, allowedExtensions: ALLOWED_EXTENSIONS });
            if (docs.length > 0) {
                setForm((s) => ({ ...s, documents: [...(s.documents ?? []), ...docs] }));
                showToast.info("Files added to form (stored as Base64)");
            } else {
                showToast.warning("No valid files were added");
            }
        } catch (err) {
            console.error("handleFilesSelected error", err);
            showToast.error("Failed to process selected files");
        } finally {
            setUploadingDocs(false);
            // reset native input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeDocumentAt = (index: number) => {
        setForm((s) => {
            const docs = [...(s.documents ?? [])];
            docs.splice(index, 1);
            return { ...s, documents: docs };
        });
    };


    const handleAvatarSelected = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const f = files[0];
        if (f.size > MAX_FILE_BYTES) {
            showToast.warning("Avatar too large (>5MB)");
            return;
        }

        setUploadingAvatar(true);
        try {
            const dataUrl = await fileToAvatarBase64(f, { compressImages: true, maxWidth: 1200, quality: 0.8, maxFileBytes: MAX_FILE_BYTES, allowedExtensions: IMAGE_EXTENSIONS });
            setAvatarPreview(dataUrl);
            // store base64 string in avatar field (cast for types)
            setForm((s) => ({ ...s, avatar: dataUrl as unknown as ObjectIdString }));
            showToast.info("Avatar added to form (Base64)");
        } catch (err) {
            console.error("handleAvatarSelected error", err);
            showToast.error("Failed to process avatar");
        } finally {
            setUploadingAvatar(false);
            if (avatarInputRef.current) avatarInputRef.current.value = "";
        }
    };


    const removeAvatar = () => {
        setForm((s) => ({ ...s, avatar: undefined }));
        setAvatarPreview(null);
    };

    const submit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            await onCreate(form);
            onOpenChange(false);
        } catch (err) {
            console.error("Failed to create employee:", err);
            showToast.error("Failed to create employee");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-0 shadow-2xl p-0">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <DialogHeader className="sticky top-0 z-20 border-b bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm px-8 py-6">
                        <div className="flex items-center gap-3">
                            <motion.div
                                initial={{ rotate: -180, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
                            >
                                <User className="h-6 w-6 text-primary" />
                            </motion.div>
                            <div>
                                <DialogTitle className="text-2xl font-bold">Add New Employee</DialogTitle>
                                <p className="text-sm text-muted-foreground mt-1">Fill in the details to create a new employee account</p>
                            </div>
                        </div>
                    </DialogHeader>

                    {!enums ? (
                        <div className="p-8 space-y-4">
                            <Skeleton className="h-32 w-full rounded-xl" />
                            <Skeleton className="h-32 w-full rounded-xl" />
                            <Skeleton className="h-32 w-full rounded-xl" />
                        </div>
                    ) : (
                        <div className="p-8 space-y-6">
                            {/* Avatar Section - Featured */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent p-6"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <Camera className="h-5 w-5 text-primary" />
                                    <h4 className="text-base font-semibold">Profile Picture</h4>
                                </div>
                                <div className="flex items-center gap-6">
                                    <motion.div
                                        className="relative"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg relative bg-gradient-to-br from-primary/10 to-primary/5">
                                            {avatarPreview ? (
                                                <NextImage
                                                    src={avatarPreview}
                                                    alt="avatar preview"
                                                    fill
                                                    sizes="112px"
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center">
                                                    <User className="h-10 w-10 text-muted-foreground/40" />
                                                    <span className="text-xs text-muted-foreground mt-1">No image</span>
                                                </div>
                                            )}
                                            {uploadingAvatar && (
                                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                </div>
                                            )}
                                        </div>
                                        {form.avatar && !uploadingAvatar && (
                                            <motion.button
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                onClick={removeAvatar}
                                                className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-destructive text-destructive-foreground shadow-lg flex items-center justify-center hover:bg-destructive/90 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </motion.button>
                                        )}
                                    </motion.div>

                                    <div className="flex-1 space-y-3">
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-2"
                                                disabled={uploadingAvatar}
                                                onClick={() => avatarInputRef.current?.click()}
                                            >
                                                {uploadingAvatar ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="h-4 w-4" />
                                                        {form.avatar ? "Change" : "Upload"} Photo
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <input
                                            ref={avatarInputRef}
                                            type="file"
                                            accept={IMAGE_EXTENSIONS.map((e) => `.${e}`).join(",")}
                                            onChange={(e) => handleAvatarSelected(e.target.files)}
                                            className="hidden"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Upload a professional photo. Max 5MB. Formats: JPG, PNG, GIF
                                        </p>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Identity & Employment */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.15 }}
                                className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                    <h4 className="text-base font-semibold">Employment Details</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Field label="Role" error={errors.role}>
                                        <select
                                            value={form.role ?? ""}
                                            onChange={(e) => setForm((s) => ({ ...s, role: e.target.value as EmployeeRole }))}
                                            className="h-11 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        >
                                            <option value="">Select role</option>
                                            {enums.roles.map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field label="Employment Type" error={errors.employmentType}>
                                        <select
                                            value={form.employmentType ?? ""}
                                            onChange={(e) => setForm((s) => ({ ...s, employmentType: (e.target.value as EmploymentType) || undefined }))}
                                            className="h-11 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        >
                                            <option value="">Select type</option>
                                            {enums.employmentTypes.map((t) => (
                                                <option key={t} value={t}>
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>
                            </motion.section>

                            {/* Contact Information */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                                className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-primary" />
                                    <h4 className="text-base font-semibold">Contact Information</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Field label="Email Address" error={errors["contactInfo.email"]}>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={form.contactInfo?.email ?? ""}
                                                onChange={(e) => setForm((s) => ({ ...s, contactInfo: { ...(s.contactInfo ?? {}), email: e.target.value } }))}
                                                className="pl-10 h-11 rounded-lg"
                                                placeholder="employee@company.com"
                                            />
                                        </div>
                                    </Field>

                                    <Field label="Phone Number" error={errors["contactInfo.phone"]}>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={form.contactInfo?.phone ?? ""}
                                                onChange={(e) => setForm((s) => ({ ...s, contactInfo: { ...(s.contactInfo ?? {}), phone: e.target.value } }))}
                                                className="pl-10 h-11 rounded-lg"
                                                placeholder="+880 1XXX-XXXXXX"
                                            />
                                        </div>
                                    </Field>
                                </div>
                            </motion.section>

                            {/* Credentials */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.25 }}
                                className="space-y-4 rounded-2xl border bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-2">
                                    <Key className="h-5 w-5 text-amber-600" />
                                    <h4 className="text-base font-semibold">Login Credentials</h4>
                                </div>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Input
                                            readOnly
                                            value={form.password}
                                            type={showPassword ? "text" : "password"}
                                            className="h-12 pr-32 rounded-lg font-mono text-sm bg-background"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleCopyPassword}
                                                className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center transition-colors"
                                            >
                                                {passwordCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05, rotate: 180 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleRegeneratePassword}
                                                className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center transition-colors"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </motion.button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Key className="h-3 w-3" />
                                        A secure password has been auto-generated. Copy it before creating the account.
                                    </p>
                                </div>
                            </motion.section>

                            {/* Compensation */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                                className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                    <h4 className="text-base font-semibold">Compensation & Timeline</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <Field label="Salary" error={errors.salary}>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                value={String(form.salary ?? "")}
                                                onChange={(e) => setForm((s) => ({ ...s, salary: e.target.value ? Number(e.target.value) : 0 }))}
                                                className="pl-10 h-11 rounded-lg"
                                                placeholder="50000"
                                            />
                                        </div>
                                    </Field>

                                    <Field label="Currency" error={errors.currency}>
                                        <Input
                                            value={form.currency ?? ""}
                                            onChange={(e) => setForm((s) => ({ ...s, currency: e.target.value }))}
                                            className="h-11 rounded-lg"
                                            placeholder="BDT"
                                        />
                                    </Field>

                                    <Field label="Joining Date" error={errors.dateOfJoining}>
                                        <input
                                            type="date"
                                            value={form.dateOfJoining ?? ""}
                                            onChange={(e) => setForm((s) => ({ ...s, dateOfJoining: e.target.value || undefined }))}
                                        />
                                    </Field>
                                </div>
                            </motion.section>

                            {/* Documents */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.35 }}
                                className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <h4 className="text-base font-semibold">Documents & Attachments</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Upload relevant documents such as ID cards, certificates, or contracts.
                                </p>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingDocs}
                                    className="w-full h-32 rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10 transition-all flex flex-col items-center justify-center gap-2 group"
                                >
                                    {uploadingDocs ? (
                                        <>
                                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                            <span className="text-sm font-medium text-primary">Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                                            <div className="text-center">
                                                <span className="text-sm font-medium text-primary">Click to upload</span>
                                                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, GIF (Max 5MB)</p>
                                            </div>
                                        </>
                                    )}
                                </motion.button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",")}
                                    multiple
                                    onChange={(e) => handleFilesSelected(e.target.files)}
                                    className="hidden"
                                />

                                <AnimatePresence mode="popLayout">
                                    {(form.documents ?? []).length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {(form.documents ?? []).map((d, idx) => (
                                                <div key={idx} className="flex items-center justify-between gap-3 rounded-md bg-muted/5 px-3 py-2">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <div className="truncate text-sm min-w-0">
                                                            <div className="font-medium">{d.type}</div>
                                                            <div className="text-xs text-muted-foreground">{new Date(d.uploadedAt).toLocaleString()}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {/* View: open base64 in new tab (preview) */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                try {
                                                                    // open base64 data URL in a new tab for preview
                                                                    window.open(String(d.url), "_blank", "noopener,noreferrer");
                                                                } catch (err) {
                                                                    console.error("Preview failed", err);
                                                                    showToast.error("Unable to preview file");
                                                                }
                                                            }}
                                                            className="text-sm px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition"
                                                        >
                                                            View
                                                        </button>

                                                        {/* Download: create an anchor and click it to download the file */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                try {
                                                                    const a = document.createElement("a");
                                                                    a.href = String(d.url); // data:<mime>;base64,...
                                                                    // derive a safe filename from type + timestamp
                                                                    const extFromType = d.type?.split("/").pop() ?? "bin";
                                                                    a.download = `document-${idx + 1}.${extFromType}`;
                                                                    document.body.appendChild(a);
                                                                    a.click();
                                                                    a.remove();
                                                                } catch (err) {
                                                                    console.error("Download failed", err);
                                                                    showToast.error("Unable to download file");
                                                                }
                                                            }}
                                                            className="text-sm px-2 py-1 rounded-md border hover:bg-muted/5 transition"
                                                        >
                                                            Download
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeDocumentAt(idx)}
                                                            className="text-destructive hover:underline text-sm flex items-center gap-1"
                                                            aria-label={`Remove document ${idx + 1}`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </AnimatePresence>
                            </motion.section>

                            {/* Footer Actions */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.4 }}
                                className="sticky bottom-0 -mx-8 -mb-8 border-t bg-background/95 backdrop-blur-sm px-8 py-6 rounded-b-2xl"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        {Object.keys(errors).length > 0 && (
                                            <motion.p
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="text-sm text-destructive font-medium"
                                            >
                                                Please fix {Object.keys(errors).length} validation error{Object.keys(errors).length > 1 ? 's' : ''}
                                            </motion.p>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => onOpenChange(false)}
                                            disabled={submitting}
                                            className="h-11 px-6 rounded-lg"
                                        >
                                            Cancel
                                        </Button>
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button
                                                onClick={submit}
                                                disabled={submitting}
                                                className="h-11 px-8 rounded-lg bg-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                                            >
                                                {submitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="mr-2 h-4 w-4" />
                                                        Create Employee
                                                    </>
                                                )}
                                            </Button>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}