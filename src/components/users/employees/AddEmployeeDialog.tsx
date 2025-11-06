"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "./primitives/Field";
import { Skeleton } from "./primitives/Skeleton";

import {
    CreateEmployeePayload,
    EmployeeRole,
    EmployeeSubRole,
    EmployeeStatus,
    EmploymentType,
    EmployeePosition,
    PositionCategory,
    EmployeeDetailDTO,
    ContactInfoDTO,
} from "@/types/employee.types";

import {
    EMPLOYEE_POSITIONS,
    EMPLOYEE_ROLE,
    EMPLOYEE_SUB_ROLE,
    EMPLOYEE_STATUS,
    EMPLOYMENT_TYPE,
} from "@/constants/employee.const";

import { createEmployeeSchemaWithDates } from "@/utils/validators/employee.validator";

type EnumsShape = {
    roles: EmployeeRole[];
    subRoles: EmployeeSubRole[];
    statuses: EmployeeStatus[];
    employmentTypes: EmploymentType[];
    positionCategories: PositionCategory[];
};

type FormData = Omit<CreateEmployeePayload, "audit"> & {
  salary?: number;
  salaryCurrency?: string;
};
type ValidationErrors = Partial<
    Record<
        keyof FormData | "contactInfo.email" | "contactInfo.phone" | "dateOfJoining" | "dateOfLeaving",
        string
    >
>;

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
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [positionCategory, setPositionCategory] = useState<PositionCategory | "">("");
    const [position, setPosition] = useState<EmployeePosition | "">("");

    // Initialize minimal form. contactInfo required by CreateEmployeePayload.
    const [form, setForm] = useState<Partial<FormData>>({
        role: undefined,
        subRole: undefined,
        status: "active",
        employmentType: undefined,
        contactInfo: { email: "", phone: "" } as ContactInfoDTO,
    });

    useEffect(() => {
        let mounted = true;
        const initEnums = async () => {
            try {
                await fetchEnums();
            } catch {
                // fallback to constants
            }
            if (!mounted) return;
            const cats = Object.keys(EMPLOYEE_POSITIONS) as PositionCategory[];
            const shape: EnumsShape = {
                roles: Object.values(EMPLOYEE_ROLE),
                subRoles: Object.values(EMPLOYEE_SUB_ROLE),
                statuses: Object.values(EMPLOYEE_STATUS),
                employmentTypes: Object.values(EMPLOYMENT_TYPE),
                positionCategories: cats,
            };
            setEnums(shape);
        };
        initEnums();
        return () => {
            mounted = false;
        };
    }, [fetchEnums]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            setForm({
                role: undefined,
                subRole: undefined,
                status: "active",
                employmentType: undefined,
                contactInfo: { email: "", phone: "" },
            });
            setPosition("");
            setPositionCategory("");
            setErrors({});
        }
    }, [open]);

    const derivedPositions = useMemo(
        () =>
            positionCategory
                ? (EMPLOYEE_POSITIONS[positionCategory] as readonly EmployeePosition[])
                : (Object.values(EMPLOYEE_POSITIONS).flatMap((p) => p) as readonly EmployeePosition[]),
        [positionCategory]
    );

    const validateForm = (): boolean => {
        const payload = {
            companyId: form.companyId,
            role: form.role,
            subRole: form.subRole,
            position: (position as EmployeePosition) || form.position,
            status: form.status ?? "active",
            employmentType: form.employmentType,
            salary: form.salary,
            salaryCurrency: form.salaryCurrency,
            dateOfJoining: form.dateOfJoining,
            dateOfLeaving: form.dateOfLeaving,
            contactInfo: form.contactInfo,
            permissions: form.permissions,
            shifts: form.shifts,
            performance: form.performance,
            documents: form.documents,
            notes: form.notes,
            avatar: form.avatar,
        };

        try {
            // throws ZodError when invalid
            createEmployeeSchemaWithDates.parse(payload);
            setErrors({});
            return true;
        } catch (err: unknown) {
            if (err instanceof z.ZodError) {
                const newErrors: ValidationErrors = {};
                err.issues.forEach((issue) => {
                    const path = issue.path.join(".");
                    newErrors[path as keyof ValidationErrors] = issue.message;
                });
                setErrors(newErrors);
            } else {
                console.error("Unexpected error:", err);
            }
            return false;
        }
    };

    const submit = async () => {
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            const payload: CreateEmployeePayload = {
                companyId: form.companyId,
                role: form.role!,
                subRole: form.subRole!,
                position: (position as EmployeePosition) || form.position!,
                status: (form.status as EmployeeStatus) ?? "active",
                employmentType: form.employmentType,
                avatar: form.avatar,
                salaryHistory: form.salaryHistory,
                positionHistory: form.positionHistory,
                dateOfJoining: form.dateOfJoining,
                dateOfLeaving: form.dateOfLeaving,
                contactInfo: form.contactInfo as ContactInfoDTO,
                permissions: form.permissions,
                shifts: form.shifts,
                performance: form.performance,
                documents: form.documents,
                notes: form.notes,
                audit: {
                    // Replace with actual current user id in calling code/system
                    createdBy: "000000000000000000000000",
                    updatedBy: "000000000000000000000000",
                },
            };

            await onCreate(payload);
            onOpenChange(false);
        } catch (err) {
            console.error("Failed to create employee:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl border border-border/60 p-0">
                {/* Sticky header */}
                <DialogHeader className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-6 py-4">
                    <DialogTitle className="text-lg font-semibold tracking-tight">Add employee</DialogTitle>
                </DialogHeader>

                {!enums ? (
                    <div className="p-6">
                        <Skeleton className="h-40 w-full" />
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-6 p-6"
                    >
                        {/* Section: Identity & employment */}
                        <Section title="Identity and employment">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Field label="Role" error={errors.role}>
                                    <SelectNative
                                        placeholder="Select role"
                                        value={(form.role as string) ?? ""}
                                        onChange={(v) => setForm((f) => ({ ...f, role: (v as EmployeeRole) || undefined }))}
                                        options={enums.roles}
                                    />
                                </Field>

                                <Field label="Sub-role" error={errors.subRole}>
                                    <SelectNative
                                        placeholder="Select sub-role"
                                        value={(form.subRole as string) ?? ""}
                                        onChange={(v) => setForm((f) => ({ ...f, subRole: (v as EmployeeSubRole) || undefined }))}
                                        options={enums.subRoles}
                                    />
                                </Field>

                                <Field label="Position category" hint="Filter positions by category">
                                    <SelectNative
                                        placeholder="Any"
                                        value={positionCategory ?? ""}
                                        onChange={(v) => {
                                            const cat = (v as PositionCategory) || "";
                                            setPositionCategory(cat);
                                            setPosition("");
                                        }}
                                        options={enums.positionCategories}
                                        allowEmpty
                                    />
                                </Field>

                                <Field label="Position" error={errors.position}>
                                    <SelectNative
                                        placeholder="Select position"
                                        value={position ?? ""}
                                        onChange={(v) => setPosition((v as EmployeePosition) || "")}
                                        options={derivedPositions}
                                    />
                                </Field>

                                <Field label="Employment type" error={errors.employmentType}>
                                    <SelectNative
                                        placeholder="Select type"
                                        value={(form.employmentType as string) ?? ""}
                                        onChange={(v) => setForm((f) => ({ ...f, employmentType: (v as EmploymentType) || undefined }))}
                                        options={enums.employmentTypes}
                                    />
                                </Field>

                                <Field label="Status" error={errors.status}>
                                    <SelectNative
                                        placeholder="Select status"
                                        value={(form.status as string) ?? "active"}
                                        onChange={(v) => setForm((f) => ({ ...f, status: (v as EmployeeStatus) || "active" }))}
                                        options={enums.statuses}
                                    />
                                </Field>
                            </div>
                        </Section>

                        {/* Section: Contact */}
                        <Section title="Contact information">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Field label="Contact email" error={errors["contactInfo.email"]}>
                                    <Input
                                        placeholder="email@example.com"
                                        className="h-10"
                                        type="email"
                                        value={form.contactInfo?.email ?? ""}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, contactInfo: { ...(f.contactInfo ?? {}), email: e.target.value } }))
                                        }
                                    />
                                </Field>

                                <Field label="Contact phone" error={errors["contactInfo.phone"]}>
                                    <Input
                                        placeholder="+880..."
                                        className="h-10"
                                        value={form.contactInfo?.phone ?? ""}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, contactInfo: { ...(f.contactInfo ?? {}), phone: e.target.value } }))
                                        }
                                    />
                                </Field>
                            </div>
                        </Section>

                        {/* Section: Optional metadata */}
                        <Section title="Optional details">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Field label="Salary" error={errors.salary}>
                                    <Input
                                        placeholder="e.g., 50000"
                                        className="h-10"
                                        type="number"
                                        value={String(form.salary ?? "")}
                                        onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value ? Number(e.target.value) : undefined }))}
                                    />
                                </Field>

                                <Field label="Currency" error={errors.salaryCurrency}>
                                    <Input
                                        placeholder="e.g., BDT"
                                        className="h-10"
                                        value={form.salaryCurrency ?? ""}
                                        onChange={(e) => setForm((f) => ({ ...f, salaryCurrency: e.target.value || undefined }))}
                                    />
                                </Field>

                                <Field label="Date of joining" error={errors.dateOfJoining}>
                                    <Input
                                        className="h-10"
                                        type="date"
                                        value={form.dateOfJoining ?? ""}
                                        onChange={(e) => setForm((f) => ({ ...f, dateOfJoining: e.target.value || undefined }))}
                                    />
                                </Field>

                                <Field label="Date of leaving" error={errors.dateOfLeaving}>
                                    <Input
                                        className="h-10"
                                        type="date"
                                        value={form.dateOfLeaving ?? ""}
                                        onChange={(e) => setForm((f) => ({ ...f, dateOfLeaving: e.target.value || undefined }))}
                                    />
                                </Field>
                            </div>
                        </Section>

                        {/* Sticky footer actions */}
                        <div className="sticky bottom-0 z-10 -mx-6 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {Object.keys(errors).length > 0 ? "Please fix the validation errors above." : "Fill all required fields to create employee."}
                                </p>

                                <div className="flex gap-2">
                                    <Button variant="outline" className="h-9 px-4" onClick={() => onOpenChange(false)} disabled={submitting}>
                                        Cancel
                                    </Button>

                                    <Button className="h-9 px-4" onClick={submit} disabled={submitting}>
                                        {submitting ? "Creating..." : "Create"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </DialogContent>
        </Dialog>
    );
}

/**
 * Section wrapper to provide a consistent modern card feel
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4">
            <h4 className="text-sm font-semibold tracking-tight text-foreground/90">{title}</h4>
            {children}
        </section>
    );
}

/**
 * A styled native select matching Input's design
 */
function SelectNative<T extends string>({
    placeholder,
    value,
    onChange,
    options,
}: {
    placeholder: string;
    value: string;
    onChange: (v: T | "") => void;
    options: readonly T[];
    allowEmpty?: boolean;
}) {
    return (
        <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={value}
            onChange={(e) => onChange((e.target.value as T) || "")}
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    );
}
