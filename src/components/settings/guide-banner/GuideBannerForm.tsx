"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  GuideBannerEntity,
  GuideBannerFormValues,
  GuideBannerCreateDTO,
  GuideBannerUpdateDTO,
  RequestStatus,
  ID,
  GuideBannerFormErrors,
} from "@/types/guide-banner-settings.types";
import { GUIDE_BANNER_CONSTRAINTS } from "@/types/guide-banner-settings.types";
import { buildAssetSrc, validateForm } from "@/utils/helpers/guide-banner-settings";
// Use the shared file helpers
import {
  fileToBase64,
  isAllowedExtension,
  getFileExtension,
} from "@/utils/helpers/fileBase64";
import { useGuideBannersStore } from "@/store/guide-bannerSetting.store";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";

interface GuideBannerFormProps {
  initial?: Partial<GuideBannerFormValues>;
  mode: "create" | "edit";
  onClose: () => void;
  onSave?: (entity: GuideBannerEntity) => void;
  editId?: ID;
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export default function GuideBannerForm({ initial, mode, onClose, onSave, editId }: GuideBannerFormProps) {
  const { operations, normalized, createBanner, updateBanner, fetchById } = useGuideBannersStore();
  const entity = editId ? normalized.byId[String(editId)] : undefined;

  const [values, setValues] = useState<GuideBannerFormValues>({
    asset: initial?.asset ?? "",
    alt: initial?.alt ?? "",
    caption: initial?.caption ?? "",
    order: initial?.order ?? GUIDE_BANNER_CONSTRAINTS.minOrder,
    active: initial?.active ?? true,
  });

  const [errors, setErrors] = useState<GuideBannerFormErrors>({});
  const [filePreview, setFilePreview] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const focusRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (mode === "edit" && editId && !entity) {
      void fetchById(editId);
    }
  }, [mode, editId, entity, fetchById]);

  useEffect(() => {
    if (entity && mode === "edit") {
      setValues({
        asset: entity.asset,
        alt: entity.alt ?? "",
        caption: entity.caption ?? "",
        order: entity.order,
        active: entity.active,
      });
      setFilePreview(buildAssetSrc(entity.asset) || "");
    }
  }, [entity, mode]);

  const opStatus = useMemo<RequestStatus | undefined>(() => {
    const key = mode === "create" ? "create" : "update";
    const idKey = mode === "edit" && editId ? String(editId) : undefined;
    const op = operations[key]?.byId?.[idKey ?? ""];
    return op?.status;
  }, [operations, mode, editId]);

  // File handling using shared helpers
  const handleFileObject = async (file?: File) => {
    if (!file) return;

    // Reset previous asset errors
    setErrors((e) => ({ ...e, asset: undefined }));

    // Validate extension first
    if (!isAllowedExtension(file.name)) {
      setErrors((e) => ({ ...e, asset: "Unsupported file type. Allowed: jpg jpeg png gif pdf" }));
      return;
    }

    // Quick size check before processing
    if (file.size > MAX_UPLOAD_BYTES) {
      // For images we still attempt compression below, but give immediate feedback for non-images
      const ext = getFileExtension(file.name);
      const imageExts = ["jpg", "jpeg", "png", "gif"];
      if (!imageExts.includes(ext)) {
        setErrors((e) => ({ ...e, asset: "File exceeds 5MB limit. Choose a smaller file." }));
        return;
      }
      // If it's an image, continue to attempt compression via fileToBase64
    }

    try {
      // Use fileToBase64 which will compress images when appropriate and return a data URL
      // Pass options if you want to tune compression (maxWidth, quality, maxFileBytes)
      const dataUrl = await fileToBase64(file, {
        compressImages: true,
        maxWidth: 1600,
        quality: 0.8,
        maxFileBytes: MAX_UPLOAD_BYTES,
      });

      // fileToBase64 returns a data URL like "data:image/jpeg;base64,...."
      // We can check the size by estimating base64 length if needed, but the helper already enforces maxFileBytes
      setValues((v) => ({ ...v, asset: dataUrl }));
      setFilePreview(dataUrl);
      setErrors((e) => ({ ...e, asset: undefined }));
    } catch (err: unknown) {
      // Map helper errors to user-friendly messages
      const msg = String(extractErrorMessage(err)) || "Failed to process image";
      if (msg.includes("Unsupported file type")) {
        setErrors((e) => ({ ...e, asset: "Unsupported file type" }));
      } else if (msg.includes("File too large")) {
        setErrors((e) => ({ ...e, asset: "File too large. Try a smaller file or lower quality." }));
      } else {
        setErrors((e) => ({ ...e, asset: "Failed to process image" }));
      }
    }
  };

  const onFileChange = (file?: File) => void handleFileObject(file);

  // drag handlers
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFileObject(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  // Submit
  const handleSubmit = async () => {
    const v = { ...values };
    const nextErrors = validateForm(v);
    setErrors(nextErrors);
    const hasError = Object.values(nextErrors).some(Boolean);
    if (hasError) return;

    try {
      setSubmitting(true);
      if (mode === "create") {
        const dto: GuideBannerCreateDTO = {
          asset: v.asset,
          alt: v.alt || null,
          caption: v.caption || null,
          order: v.order,
          active: v.active,
        };
        const created = await createBanner(dto);
        onSave?.(created);
        onClose();
      } else if (mode === "edit" && editId) {
        const payload: GuideBannerUpdateDTO = {
          asset: v.asset,
          alt: v.alt || null,
          caption: v.caption || null,
          order: v.order,
          active: v.active,
        };
        const updated = await updateBanner(editId, payload);
        onSave?.(updated);
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-lg" aria-label={`${mode === "create" ? "Create" : "Edit"} guide banner`}>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create guide banner" : "Edit guide banner"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image upload area */}
          <div>
            <Label htmlFor="asset" className="mb-2 block text-sm font-medium">
              Image
            </Label>

            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") fileInputRef.current?.click();
              }}
              className={cn(
                "flex items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-shadow focus:outline-none",
                dragOver ? "border-emerald-400 bg-emerald-50/20 shadow-md" : "border-border bg-white"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center h-16 w-28 rounded-md bg-gray-50 border border-dashed border-border overflow-hidden">
                  {filePreview ? (
                    <motion.img
                      src={filePreview}
                      alt="Preview"
                      className="h-16 w-full object-contain"
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground px-2 text-center">
                      <ImageIcon className="mx-auto mb-1 h-5 w-5 text-emerald-500" />
                      <div>Drop image or</div>
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {filePreview ? "Selected image" : "PNG, JPG or GIF up to 5MB"}
                  </div>

                  {errors.asset ? (
                    <p className="text-xs text-red-600 mt-1">{errors.asset}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">Recommended aspect ratio: 16:9 or similar</p>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0">
                <input
                  ref={fileInputRef}
                  id="asset"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFileChange(e.currentTarget.files?.[0])}
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5"
                >
                  {filePreview ? "Replace" : "Upload"}
                </Button>
              </div>
            </div>
          </div>

          {/* Fields grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alt">Alt text</Label>
              <Input
                id="alt"
                value={values.alt}
                onChange={(e) => setValues((v) => ({ ...v, alt: e.target.value }))}
                placeholder="Describe the image"
                className={errors.alt ? "border-red-600" : ""}
              />
              {errors.alt ? <p className="text-xs text-red-600 mt-1">{errors.alt}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={values.caption}
                onChange={(e) => setValues((v) => ({ ...v, caption: e.target.value }))}
                placeholder="Short banner caption"
                className="min-h-[84px] resize-none"
              />
              {errors.caption ? <p className="text-xs text-red-600 mt-1">{errors.caption}</p> : null}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={values.order}
                  onChange={(e) => setValues((v) => ({ ...v, order: Number(e.target.value) }))}
                  min={GUIDE_BANNER_CONSTRAINTS.minOrder}
                  max={GUIDE_BANNER_CONSTRAINTS.maxOrder}
                />
                {errors.order ? <p className="text-xs text-red-600 mt-1">{errors.order}</p> : null}
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <Label htmlFor="active">Active</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <Switch
                      id="active"
                      checked={values.active}
                      onCheckedChange={(checked) => setValues((v) => ({ ...v, active: checked }))}
                    />
                    <span className="text-sm text-muted-foreground">{values.active ? "Enabled" : "Disabled"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button variant="secondary" onClick={onClose} ref={focusRef}>
            Cancel
          </Button>

          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => void handleSubmit()}
              disabled={submitting || opStatus === "pending"}
            >
              {submitting || opStatus === "pending" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                  Saving
                </>
              ) : mode === "create" ? (
                "Create"
              ) : (
                "Save"
              )}
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
