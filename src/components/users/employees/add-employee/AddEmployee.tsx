"use client";

import { useState, useEffect, useRef } from "react";
import { Formik, Form, Field, FieldArray, FieldProps, FormikErrors, FormikHelpers } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Plus, Trash2, RefreshCw, Upload, File, Image as ImageIcon, X, AlertCircle,
    Loader2, User, Mail, Phone, Calendar, DollarSign, Briefcase, Clock,
    FileText, Shield, Heart, Sparkles, CheckCircle2
} from "lucide-react";
import Image from "next/image";

import { CreateEmployeeFormValues, createEmployeeValidationSchema } from "@/utils/validators/employee.validator";
import { CreateEmployeePayload, ShiftDTO, DayOfWeek, DocumentDTO } from "@/types/employee.types";
import { EMPLOYMENT_TYPE } from "@/constants/employee.const";
import { CURRENCY } from "@/constants/tour.const";
import {
    fileToDocumentDTO,
    fileToAvatarBase64,
    IMAGE_EXTENSIONS,
    DOCUMENT_EXTENSIONS,
    ALLOWED_EXTENSIONS,
    removeDocumentAt
} from "@/utils/helpers/file-conversion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEmployeeStore } from "@/store/employee.store";
import { useRouter } from "next/navigation";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";
import { showToast } from "@/components/global/showToast";

// Constants
const DAYS_OF_WEEK: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_DOCUMENTS = 5;
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Avatar & Document options
const AVATAR_OPTIONS = { maxWidth: 800, quality: 0.7, maxFileBytes: MAX_FILE_SIZE_BYTES };
const DOCUMENT_OPTIONS = { compressImages: true, maxWidth: 1200, quality: 0.8, maxFileBytes: MAX_FILE_SIZE_BYTES, allowedExtensions: ALLOWED_EXTENSIONS };

const breadcrumbItems = [
    { label: "Home", href: '/' },
    { label: "Employees", href: "/users/employees" },
    { label: "Add Employee", href: "/users/employees/add-employee" },
];


// Initial form values
const getInitialValues = (): CreateEmployeeFormValues => ({
    name: "",
    password: generateStrongPassword(10),
    employmentType: EMPLOYMENT_TYPE.FULL_TIME,
    avatar: null,
    salary: null,
    currency: CURRENCY.BDT,
    dateOfJoining: new Date(),
    contactInfo: { phone: "", email: "", emergencyContact: { name: "", phone: "", relation: "" } },
    shifts: [],
    documents: [],
    notes: "",
});

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// Formik-compatible FormItem components
const FormItem: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="space-y-2">{children}</div>;
const FormLabel: React.FC<{ children: React.ReactNode; icon?: React.ReactNode }> = ({ children, icon }) => (
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        {icon && <span className="text-blue-600">{icon}</span>}
        {children}
    </label>
);
const FormMessage: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <motion.p
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-xs text-red-500 mt-1 flex items-center gap-1"
    >
        <AlertCircle className="h-3 w-3" />{children}
    </motion.p>
);

// Type guards for shift errors
const isShiftErrorObject = (error: unknown): error is FormikErrors<ShiftDTO> => !!error && typeof error === "object" && !Array.isArray(error);
const getShiftError = (shiftError: unknown, field: keyof ShiftDTO): string | undefined => isShiftErrorObject(shiftError) ? shiftError[field] as string | undefined : undefined;
type SetFieldValue = <K extends keyof CreateEmployeeFormValues>(field: K, value: CreateEmployeeFormValues[K]) => void;

export default function AddEmployeePage() {
    const { createEmployee, fetchEnums } = useEmployeeStore()
    const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
    const [currencies, setCurrencies] = useState<string[]>([]);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingDocuments, setUploadingDocuments] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [documentErrors, setDocumentErrors] = useState<{ [key: number]: string }>({});

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadEnums() }, []);

    const loadEnums = async () => {
        try { await fetchEnums(); } catch { }
        setEmploymentTypes(Object.values(EMPLOYMENT_TYPE));
        setCurrencies(Object.values(CURRENCY));
    };

    const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];

    // Avatar upload
    const handleAvatarUpload = async (file: File, setFieldValue: SetFieldValue) => {
        setAvatarError(null); setUploadingAvatar(true);
        try {
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!IMAGE_EXTENSIONS.includes(ext as any)) throw new Error(`Invalid file type: ${ext}`);
            if (file.size > MAX_FILE_SIZE_BYTES) throw new Error(`File too large (> ${MAX_FILE_SIZE_MB}MB)`);
            const base64 = await fileToAvatarBase64(file, AVATAR_OPTIONS);
            setFieldValue("avatar", base64);
        } catch (err) {
            setAvatarError(err instanceof Error ? err.message : "Upload failed");
            if (avatarInputRef.current) avatarInputRef.current.value = "";
        } finally { setUploadingAvatar(false); }
    };

    // Document upload
    const handleDocumentUpload = async (files: FileList | File[], currentDocs: DocumentDTO[], setFieldValue: SetFieldValue) => {
        setUploadingDocuments(true); const newErrors: { [key: number]: string } = {};
        try {
            const arr = Array.from(files);
            if (currentDocs.length + arr.length > MAX_DOCUMENTS) throw new Error(`Max ${MAX_DOCUMENTS} documents allowed`);
            for (let i = 0; i < arr.length; i++) {
                const file = arr[i], index = currentDocs.length + i;
                try {
                    const ext = file.name.split('.').pop()?.toLowerCase() || '';
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (!IMAGE_EXTENSIONS.includes(ext as any) && !DOCUMENT_EXTENSIONS.includes(ext as any))
                        throw new Error(`Unsupported file type: ${ext}`);
                    if (file.size > MAX_FILE_SIZE_BYTES) throw new Error(`File too large (> ${MAX_FILE_SIZE_MB}MB)`);
                    const dto = await fileToDocumentDTO(file, DOCUMENT_OPTIONS);
                    setFieldValue("documents", [...currentDocs, dto]);
                } catch (err) { newErrors[index] = err instanceof Error ? err.message : "Upload failed"; }
            }
            setDocumentErrors(newErrors);
            if (Object.keys(newErrors).length < arr.length && documentInputRef.current) documentInputRef.current.value = "";
        } catch (err) { alert(err instanceof Error ? err.message : "Upload failed"); }
        finally { setUploadingDocuments(false); }
    };

    const handleRemoveDocument = (index: number, currentDocs: DocumentDTO[], setFieldValue: SetFieldValue) => {
        setFieldValue("documents", removeDocumentAt(currentDocs, index));
        const newErrors = { ...documentErrors }; delete newErrors[index]; setDocumentErrors(newErrors);
    };

    const handleClearAvatar = (setFieldValue: SetFieldValue) => {
        setFieldValue("avatar", null); setAvatarError(null);
        if (avatarInputRef.current) avatarInputRef.current.value = "";
    };

    const handleSubmit = async (
        values: CreateEmployeeFormValues,
        { resetForm }: FormikHelpers<CreateEmployeeFormValues>
    ) => {
        try {
            const payload: CreateEmployeePayload = {
                name: values.name,
                password: values.password,
                employmentType: values.employmentType,
                avatar: values.avatar ?? "",
                salary: values.salary,
                currency: values.currency,
                dateOfJoining: values.dateOfJoining.toISOString(),
                contactInfo: values.contactInfo,
                shifts: values.shifts,
                documents: values.documents,
                notes: values.notes || undefined,
            };
            await createEmployee(payload);

            // Reset the form to initial values
            resetForm({
                values: getInitialValues(),
                // Also reset the touched status and errors
            });

            showToast.success("Successfully added new employee.")

        } catch (err) { console.error(err); }
    };

    // {/* Scrollable Content */ }
    return (
        <div className="overflow-y-auto flex-1 px-8 py-6" >
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
                            {/* Security Section */}
                            <motion.div variants={itemVariants} className="group">
                                <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-300/20 rounded-full blur-3xl" />
                                    <div className="relative">
                                        <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3">
                                            <div className="p-2 bg-amber-500 rounded-xl shadow-md">
                                                <Shield className="h-5 w-5 text-white" />
                                            </div>
                                            Security Credentials
                                        </h3>

                                        {/* Two-column grid for name and password */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Left Column - Name */}
                                            <FormItem>
                                                <FormLabel icon={<User className="h-4 w-4" />}>Name *</FormLabel>
                                                <Field name="name">
                                                    {({ field }: FieldProps<string>) => (
                                                        <Input
                                                            {...field}
                                                            placeholder="Enter your name"
                                                            className="w-full bg-white/80 backdrop-blur-sm border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                                                        />
                                                    )}
                                                </Field>
                                                <FormMessage>{touched.name && errors.name}</FormMessage>
                                            </FormItem>

                                            {/* Right Column - Password */}
                                            <FormItem>
                                                <FormLabel icon={<Shield className="h-4 w-4" />}>Password *</FormLabel>
                                                <div className="flex gap-3">
                                                    <Field name="password">
                                                        {({ field }: FieldProps<string>) => (
                                                            <Input
                                                                {...field}
                                                                type="password"
                                                                placeholder="Enter secure password"
                                                                className="flex-1 bg-white/80 backdrop-blur-sm border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                                                            />
                                                        )}
                                                    </Field>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="border-amber-400 bg-white hover:bg-amber-100 hover:border-amber-500 hover:scale-105 transition-all shadow-md"
                                                        onClick={() => setFieldValue("password", generateStrongPassword())}
                                                    >
                                                        <RefreshCw className="h-4 w-4 mr-2" /> Generate
                                                    </Button>
                                                </div>
                                                <FormMessage>{touched.password && errors.password}</FormMessage>
                                            </FormItem>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Profile Section */}
                            <motion.div variants={itemVariants}>
                                <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-300/20 rounded-full blur-3xl" />
                                    <div className="relative">
                                        <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3">
                                            <div className="p-2 bg-blue-500 rounded-xl shadow-md">
                                                <User className="h-5 w-5 text-white" />
                                            </div>
                                            Profile Information
                                        </h3>

                                        {/* Avatar Upload */}
                                        <FormItem>
                                            <FormLabel icon={<ImageIcon className="h-4 w-4" />}>Profile Picture</FormLabel>
                                            <div className="flex items-start gap-6">
                                                <AnimatePresence mode="wait">
                                                    {values.avatar ? (
                                                        <motion.div
                                                            initial={{ scale: 0, rotate: -90 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                            exit={{ scale: 0, rotate: 90 }}
                                                            className="relative group"
                                                        >
                                                            <div className="relative w-36 h-36 rounded-3xl overflow-hidden border-4 border-white shadow-2xl ring-4 ring-blue-200 group-hover:ring-blue-400 transition-all">
                                                                <Image src={values.avatar} alt="Avatar" fill className="object-cover" />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                type="button"
                                                                className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"
                                                                onClick={() => handleClearAvatar(setFieldValue)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </motion.button>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="w-36 h-36 rounded-3xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-4 border-white shadow-xl"
                                                        >
                                                            <User className="h-16 w-16 text-gray-400" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <Input
                                                            ref={avatarInputRef}
                                                            type="file"
                                                            accept={IMAGE_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                                                            onChange={e => e.target.files && handleAvatarUpload(e.target.files[0], setFieldValue)}
                                                            className="cursor-pointer bg-white/80 border-blue-300 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                                                            disabled={uploadingAvatar}
                                                        />
                                                        {uploadingAvatar && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
                                                    </div>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Sparkles className="h-3 w-3" />
                                                        Recommended: Square image, max {MAX_FILE_SIZE_MB}MB
                                                    </p>
                                                    {avatarError && (
                                                        <Alert variant="destructive" className="py-2 bg-red-50 border-red-300">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <AlertDescription className="text-xs">{avatarError}</AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>
                                            </div>
                                            <FormMessage>{touched.avatar && errors.avatar}</FormMessage>
                                        </FormItem>

                                        {/* Employment Type */}
                                        <FormItem>
                                            <FormLabel icon={<Briefcase className="h-4 w-4" />}>Employment Type</FormLabel>
                                            <Field name="employmentType">
                                                {({ field }: FieldProps<string>) => (
                                                    <Select value={field.value} onValueChange={v => setFieldValue("employmentType", v)}>
                                                        <SelectTrigger className="bg-white/80 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                                            <SelectValue placeholder="Select employment type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {employmentTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </Field>
                                            <FormMessage>{touched.employmentType && errors.employmentType}</FormMessage>
                                        </FormItem>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Compensation Section */}
                            <motion.div variants={itemVariants}>
                                <div className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                                    <div className="absolute top-0 left-1/2 w-32 h-32 bg-green-300/20 rounded-full blur-3xl" />
                                    <div className="relative">
                                        <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3">
                                            <div className="p-2 bg-green-500 rounded-xl shadow-md">
                                                <DollarSign className="h-5 w-5 text-white" />
                                            </div>
                                            Compensation Details
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <FormItem>
                                                <FormLabel icon={<DollarSign className="h-4 w-4" />}>Salary *</FormLabel>
                                                <div className="flex gap-2">
                                                    <Field name="salary">
                                                        {({ field }: FieldProps<number>) => (
                                                            <Input
                                                                {...field}
                                                                type="text"
                                                                inputMode="decimal"
                                                                pattern="[0-9]*"
                                                                value={field.value ?? ""}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;

                                                                    // Allow empty value
                                                                    if (value === "") {
                                                                        setFieldValue("salary", value);
                                                                        return;
                                                                    }

                                                                    // Allow valid typing states:
                                                                    // 0, 10, 10., 10.5, 0.5
                                                                    if (/^(?:0|[1-9]\d*)(?:\.\d*)?$/.test(value)) {
                                                                        setFieldValue("salary", value);
                                                                    }
                                                                }}
                                                                className="flex-1 bg-white/80 border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                                                placeholder="Enter amount"
                                                            />
                                                        )}
                                                    </Field>
                                                    <Field name="currency">
                                                        {({ field }: FieldProps<string>) => (
                                                            <Select value={field.value} onValueChange={(v) => setFieldValue("currency", v)}>
                                                                <SelectTrigger className="w-[130px] bg-white/80 border-green-300 focus:border-green-500">
                                                                    <SelectValue placeholder="Currency" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {currencies.map(cur => <SelectItem key={cur} value={cur}>{cur}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    </Field>
                                                </div>
                                                <FormMessage>{touched.salary && errors.salary}</FormMessage>
                                            </FormItem>

                                            <FormItem>
                                                <FormLabel icon={<Calendar className="h-4 w-4" />}>Date of Joining</FormLabel>
                                                <Field name="dateOfJoining">
                                                    {({ field }: FieldProps<Date>) => (
                                                        <Input
                                                            type="date"
                                                            value={field.value ? formatDateForInput(field.value) : ""}
                                                            min={formatDateForInput(new Date())}
                                                            onChange={(e) =>
                                                                setFieldValue("dateOfJoining", new Date(e.target.value))
                                                            }
                                                            className="bg-white/80 border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                                        />
                                                    )}
                                                </Field>
                                                <FormMessage>{touched.dateOfJoining && errors.dateOfJoining && String(errors.dateOfJoining)}</FormMessage>
                                            </FormItem>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Contact Information */}
                            <motion.div variants={itemVariants}>
                                <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl" />
                                    <div className="relative">
                                        <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3">
                                            <div className="p-2 bg-purple-500 rounded-xl shadow-md">
                                                <Mail className="h-5 w-5 text-white" />
                                            </div>
                                            Contact Information
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                            <FormItem>
                                                <FormLabel icon={<Phone className="h-4 w-4" />}>Phone *</FormLabel>
                                                <Field name="contactInfo.phone">
                                                    {({ field }: FieldProps<string>) => (
                                                        <Input
                                                            {...field}
                                                            value={field.value ?? ""}
                                                            type="tel"
                                                            placeholder="01XXXXXXXXX"
                                                            className="bg-white/80 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                        />
                                                    )}
                                                </Field>
                                                <FormMessage>{touched.contactInfo?.phone && errors.contactInfo?.phone}</FormMessage>
                                            </FormItem>

                                            <FormItem>
                                                <FormLabel icon={<Mail className="h-4 w-4" />}>Email *</FormLabel>
                                                <Field name="contactInfo.email">
                                                    {({ field }: FieldProps<string>) => (
                                                        <Input
                                                            {...field}
                                                            type="email"
                                                            placeholder="email@example.com"
                                                            className="bg-white/80 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                        />
                                                    )}
                                                </Field>
                                                <FormMessage>{touched.contactInfo?.email && errors.contactInfo?.email}</FormMessage>
                                            </FormItem>
                                        </div>

                                        {/* Emergency Contact */}
                                        <div className="bg-white/80 backdrop-blur-sm border-2 border-purple-300 rounded-xl p-5 space-y-4 shadow-inner">
                                            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                                <div className="p-1.5 bg-red-100 rounded-lg">
                                                    <Heart className="h-4 w-4 text-red-600" />
                                                </div>
                                                Emergency Contact *
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FormItem>
                                                    <FormLabel>Name *</FormLabel>
                                                    <Field name="contactInfo.emergencyContact.name">
                                                        {({ field }: FieldProps<string>) => (
                                                            <Input {...field} placeholder="Full name" className="border-purple-200" />
                                                        )}
                                                    </Field>
                                                    <FormMessage>{touched.contactInfo?.emergencyContact?.name && errors.contactInfo?.emergencyContact?.name}</FormMessage>
                                                </FormItem>
                                                <FormItem>
                                                    <FormLabel>Phone *</FormLabel>
                                                    <Field name="contactInfo.emergencyContact.phone">
                                                        {({ field }: FieldProps<string>) => (
                                                            <Input {...field} type="tel" placeholder="01XXXXXXXXX" className="border-purple-200" />
                                                        )}
                                                    </Field>
                                                    <FormMessage>{touched.contactInfo?.emergencyContact?.phone && errors.contactInfo?.emergencyContact?.phone}</FormMessage>
                                                </FormItem>
                                                <FormItem>
                                                    <FormLabel>Relation *</FormLabel>
                                                    <Field name="contactInfo.emergencyContact.relation">
                                                        {({ field }: FieldProps<string>) => (
                                                            <Input {...field} placeholder="e.g., Father" className="border-purple-200" />
                                                        )}
                                                    </Field>
                                                    <FormMessage>{touched.contactInfo?.emergencyContact?.relation && errors.contactInfo?.emergencyContact?.relation}</FormMessage>
                                                </FormItem>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Shifts Section */}
                            <motion.div variants={itemVariants}>
                                <div className="relative bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 rounded-2xl p-6 border-2 border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-300/20 rounded-full blur-3xl" />
                                    <div className="relative">
                                        <div className="flex justify-between items-center mb-5">
                                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                                <div className="p-2 bg-cyan-500 rounded-xl shadow-md">
                                                    <Clock className="h-5 w-5 text-white" />
                                                </div>
                                                Work Shifts
                                            </h3>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg"
                                                    onClick={() => setFieldValue("shifts", [...values.shifts, { startTime: "09:00", endTime: "17:00", days: [] }])}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" /> Add Shift
                                                </Button>
                                            </motion.div>
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
                                                                className="text-center py-12 border-2 border-dashed border-cyan-200 rounded-xl bg-white/50"
                                                            >
                                                                <Clock className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                                                                <p className="text-gray-400 font-medium">No shifts added yet</p>
                                                                <p className="text-sm text-gray-400">Click &quot;Add Shift&quot; to get started</p>
                                                            </motion.div>
                                                        ) : (
                                                            values.shifts.map((shift, index) => {
                                                                const shiftError = errors.shifts?.[index];
                                                                const touchedShift = touched.shifts?.[index];
                                                                const startTimeError = getShiftError(shiftError, "startTime");
                                                                const endTimeError = getShiftError(shiftError, "endTime");
                                                                return (
                                                                    <motion.div
                                                                        key={index}
                                                                        initial={{ opacity: 0, x: -20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        exit={{ opacity: 0, x: 20 }}
                                                                        layout
                                                                        className="bg-white/80 backdrop-blur-sm border-2 border-cyan-200 rounded-xl p-5 space-y-4 hover:shadow-lg transition-all"
                                                                    >
                                                                        <div className="flex justify-between items-center">
                                                                            <h4 className="font-semibold text-gray-700 flex items-center gap-3">
                                                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                                                                                    {index + 1}
                                                                                </div>
                                                                                Shift {index + 1}
                                                                            </h4>
                                                                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="hover:bg-red-100 text-red-500"
                                                                                    onClick={() => remove(index)}
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            </motion.div>
                                                                        </div>

                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <Field name={`shifts.${index}.startTime`}>
                                                                                {({ field }: FieldProps<string>) => (
                                                                                    <FormItem>
                                                                                        <FormLabel>Start Time *</FormLabel>
                                                                                        <Input {...field} type="time" value={field.value ?? ""} className="border-cyan-200 focus:border-cyan-400" />
                                                                                        <FormMessage>{touchedShift?.startTime && startTimeError}</FormMessage>
                                                                                    </FormItem>
                                                                                )}
                                                                            </Field>
                                                                            <Field name={`shifts.${index}.endTime`}>
                                                                                {({ field }: FieldProps<string>) => (
                                                                                    <FormItem>
                                                                                        <FormLabel>End Time *</FormLabel>
                                                                                        <Input {...field} type="time" value={field.value ?? ""} className="border-cyan-200 focus:border-cyan-400" />
                                                                                        <FormMessage>{touchedShift?.endTime && endTimeError}</FormMessage>
                                                                                    </FormItem>
                                                                                )}
                                                                            </Field>
                                                                        </div>

                                                                        <Field name={`shifts.${index}.days`}>
                                                                            {({ field }: FieldProps<DayOfWeek[]>) => {
                                                                                const selectedDays: DayOfWeek[] = Array.isArray(field.value)
                                                                                    ? field.value
                                                                                    : [];
                                                                                return (
                                                                                    <FormItem>
                                                                                        <FormLabel>Working Days</FormLabel>
                                                                                        <div className="flex gap-2 flex-wrap">
                                                                                            {DAYS_OF_WEEK.map(day => {
                                                                                                const isSelected = selectedDays.includes(day);

                                                                                                return (<motion.div
                                                                                                    key={day}
                                                                                                    whileHover={{ scale: 1.1 }}
                                                                                                    whileTap={{ scale: 0.95 }}
                                                                                                >
                                                                                                    <Badge
                                                                                                        className={`cursor-pointer px-4 py-2 transition-all font-medium ${isSelected
                                                                                                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105"
                                                                                                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                                                                                            }`}
                                                                                                        onClick={() => {
                                                                                                            const newDays = selectedDays.includes(day)
                                                                                                                ? selectedDays.filter(d => d !== day)
                                                                                                                : [...selectedDays, day];

                                                                                                            setFieldValue(`shifts.${index}.days`, newDays);
                                                                                                        }}
                                                                                                    >
                                                                                                        {day}
                                                                                                    </Badge>
                                                                                                </motion.div>)
                                                                                            })}
                                                                                        </div>
                                                                                    </FormItem>
                                                                                )
                                                                            }
                                                                            }
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
                                </div>
                            </motion.div>

                            {/* Documents Section */}
                            <motion.div variants={itemVariants}>
                                <div className="relative bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 rounded-2xl p-6 border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-slate-300/20 rounded-full blur-3xl" />
                                    <div className="relative">
                                        <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3">
                                            <div className="p-2 bg-slate-600 rounded-xl shadow-md">
                                                <FileText className="h-5 w-5 text-white" />
                                            </div>
                                            Documents & Files
                                        </h3>

                                        <FormItem>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <Input
                                                        ref={documentInputRef}
                                                        type="file"
                                                        multiple
                                                        accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                                                        onChange={e => e.target.files && handleDocumentUpload(e.target.files, values.documents, setFieldValue)}
                                                        className="cursor-pointer bg-white/80 border-slate-300 focus:border-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-600 file:text-white hover:file:bg-slate-700"
                                                        disabled={uploadingDocuments}
                                                    />
                                                    {uploadingDocuments && <Loader2 className="h-5 w-5 animate-spin text-slate-600" />}
                                                </div>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Upload className="h-3 w-3" />
                                                    Upload up to {MAX_DOCUMENTS} documents (max {MAX_FILE_SIZE_MB}MB each)
                                                </p>

                                                <AnimatePresence mode="popLayout">
                                                    {values.documents.length > 0 ? (
                                                        <motion.div layout className="space-y-3 mt-4">
                                                            {values.documents.map((doc, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, x: -20 }}
                                                                    layout
                                                                    className="flex justify-between items-center bg-white border-2 border-slate-200 rounded-xl p-4 hover:shadow-md transition-all group"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${doc.type.startsWith("image/") ? "bg-blue-100" : "bg-gray-100"
                                                                            }`}>
                                                                            {doc.type.startsWith("image/") ? (
                                                                                <ImageIcon className="h-6 w-6 text-blue-600" />
                                                                            ) : (
                                                                                <File className="h-6 w-6 text-gray-600" />
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-medium text-gray-700">{doc.type}</p>
                                                                            {documentErrors[i] && <FormMessage>{documentErrors[i]}</FormMessage>}
                                                                        </div>
                                                                    </div>
                                                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="hover:bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            onClick={() => handleRemoveDocument(i, values.documents, setFieldValue)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </motion.div>
                                                                </motion.div>
                                                            ))}
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-white/50"
                                                        >
                                                            <Upload className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                                            <p className="text-sm text-gray-400 font-medium">No documents uploaded</p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </FormItem>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Notes Section */}
                            <motion.div variants={itemVariants}>
                                <div className="relative bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300/20 rounded-full blur-3xl" />
                                    <div className="relative">
                                        <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3">
                                            <div className="p-2 bg-yellow-500 rounded-xl shadow-md">
                                                <FileText className="h-5 w-5 text-white" />
                                            </div>
                                            Additional Notes
                                        </h3>
                                        <FormItem>
                                            <Field name="notes">
                                                {({ field }: FieldProps<string>) => (
                                                    <Textarea
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        placeholder="Add any additional notes, comments, or special requirements..."
                                                        className="min-h-[120px] bg-white/80 border-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 resize-none"
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>
                                </div>
                            </motion.div>

                        </motion.div>

                        {/* Sticky Footer */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="sticky bottom-0 -mx-8 -mb-6 mt-8 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-6 px-8 border-t-2 border-gray-200"
                        >
                            <div className="flex gap-3">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push(`/users/employees`)} // ? router path
                                        className="w-full border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 font-semibold"
                                    >
                                        Return
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || uploadingAvatar || uploadingDocuments}
                                        className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-gray-950 text-white shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Creating Employee...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                                Create Employee
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}