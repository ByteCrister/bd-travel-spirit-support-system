"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type {
  GuideBannerEntity,
  GuideBannerFormValues,
  GuideBannerCreateDTO,
  GuideBannerUpdateDTO,
  RequestStatus,
  ID,
  GuideBannerFormErrors,
} from "@/types/site-settings/guide-banner-settings.types";
import { GUIDE_BANNER_CONSTRAINTS } from "@/types/site-settings/guide-banner-settings.types";
import { buildAssetSrc, validateForm } from "@/utils/helpers/guide-banner-settings";
import { fileToBase64, isAllowedExtension, getFileExtension } from "@/utils/helpers/file-conversion";
import { useGuideBannersStore } from "@/store/guide/guide-bannerSetting.store";
import { Loader2, UploadCloud } from "lucide-react";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_INPUT =
  "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-2.5 " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_BTN_PRIMARY =
  "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide text-sm " +
  "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
  "hover:bg-[#007777] hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
  "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none";
const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] text-sm " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest block mb-1.5";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_SURFACE_INSET = "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

interface GuideBannerFormProps {
  initial?: Partial<GuideBannerFormValues>;
  mode: "create" | "edit";
  onClose: () => void;
  onSave?: (entity: GuideBannerEntity) => void;
  editId?: ID;
}

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
    if (mode === "edit" && editId && !entity) void fetchById(editId);
  }, [mode, editId, entity, fetchById]);

  useEffect(() => {
    if (entity && mode === "edit") {
      setValues({ asset: entity.asset, alt: entity.alt ?? "", caption: entity.caption ?? "", order: entity.order, active: entity.active });
      setFilePreview(buildAssetSrc(entity.asset) || "");
    }
  }, [entity, mode]);

  const opStatus = useMemo<RequestStatus | undefined>(() => {
    const key = mode === "create" ? "create" : "update";
    const idKey = mode === "edit" && editId ? String(editId) : undefined;
    return operations[key]?.byId?.[idKey ?? ""]?.status;
  }, [operations, mode, editId]);

  const handleFileObject = async (file?: File) => {
    if (!file) return;
    setErrors((e) => ({ ...e, asset: undefined }));
    if (!isAllowedExtension(file.name)) {
      setErrors((e) => ({ ...e, asset: "Unsupported file type. Allowed: jpg jpeg png gif pdf" }));
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      const ext = getFileExtension(file.name);
      if (!["jpg", "jpeg", "png", "gif"].includes(ext)) {
        setErrors((e) => ({ ...e, asset: "File exceeds 5MB limit." }));
        return;
      }
    }
    try {
      const dataUrl = await fileToBase64(file, { compressImages: true, maxWidth: 1600, quality: 0.8, maxFileBytes: MAX_UPLOAD_BYTES });
      setValues((v) => ({ ...v, asset: dataUrl }));
      setFilePreview(dataUrl);
      setErrors((e) => ({ ...e, asset: undefined }));
    } catch (err: unknown) {
      const msg = String(extractErrorMessage(err)) || "";
      if (msg.includes("Unsupported")) setErrors((e) => ({ ...e, asset: "Unsupported file type" }));
      else if (msg.includes("large")) setErrors((e) => ({ ...e, asset: "File too large. Try a smaller file." }));
      else setErrors((e) => ({ ...e, asset: "Failed to process image" }));
    }
  };

  const onFileChange = (file?: File) => void handleFileObject(file);
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) void handleFileObject(f); };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);

  const handleSubmit = async () => {
    const v = { ...values };
    const nextErrors = validateForm(v);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    try {
      setSubmitting(true);
      if (mode === "create") {
        const dto: GuideBannerCreateDTO = { asset: v.asset, alt: v.alt || null, caption: v.caption || null, order: v.order, active: v.active };
        const created = await createBanner(dto);
        onSave?.(created);
        onClose();
      } else if (mode === "edit" && editId) {
        const payload: GuideBannerUpdateDTO = { asset: v.asset, alt: v.alt || null, caption: v.caption || null, order: v.order, active: v.active };
        const updated = await updateBanner(editId, payload);
        onSave?.(updated);
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || opStatus === "pending";

  return (
    <Dialog open onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent
        className={`sm:max-w-lg border-0 p-0 ${NEU_SURFACE} shadow-[12px_12px_24px_#c8c6c5,-12px_-12px_24px_#ffffff] rounded-2xl overflow-hidden`}
        aria-label={`${mode === "create" ? "Create" : "Edit"} guide banner`}
      >
        {/* Header */}
        <DialogHeader className={`px-6 pt-6 pb-4 border-b ${NEU_DIVIDER}`}>
          <DialogTitle className={`text-lg ${NEU_HEADING}`}>
            {mode === "create" ? "Create guide banner" : "Edit guide banner"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Upload area */}
          <div>
            <label className={NEU_LABEL}>Image</label>
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") fileInputRef.current?.click(); }}
              className={cn(
                "flex items-center justify-between gap-4 rounded-xl px-4 py-3 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#006666]/50",
                dragOver
                  ? "shadow-[inset_4px_4px_8px_#b5e0d8,inset_-4px_-4px_8px_#d0f0e8] bg-[#006666]/5"
                  : NEU_SURFACE_INSET
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Thumbnail preview */}
                <div className="flex items-center justify-center h-14 w-20 rounded-xl bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] overflow-hidden flex-shrink-0">
                  {filePreview ? (
                    <motion.img
                      src={filePreview}
                      alt="Preview"
                      className="h-full w-full object-contain"
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  ) : (
                    <UploadCloud className="w-6 h-6 text-[#006666]/50" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className={`font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]`}>
                    {filePreview ? "Image selected" : "PNG, JPG or GIF up to 5MB"}
                  </p>
                  {errors.asset ? (
                    <p className="text-xs text-[#FF2157] mt-0.5 font-[family-name:var(--font-jetbrains-mono)]">{errors.asset}</p>
                  ) : (
                    <p className="text-xs text-[#1E2938]/40 mt-0.5 font-[family-name:var(--font-jetbrains-mono)]">
                      {dragOver ? "Drop to upload" : "Recommended: 16:9 aspect ratio"}
                    </p>
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
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`${NEU_BTN_GHOST} px-3 py-1.5 text-xs`}
                >
                  {filePreview ? "Replace" : "Upload"}
                </button>
              </div>
            </div>
          </div>

          {/* Alt text */}
          <div>
            <label htmlFor="alt" className={NEU_LABEL}>Alt text</label>
            <input
              id="alt"
              value={values.alt}
              onChange={(e) => setValues((v) => ({ ...v, alt: e.target.value }))}
              placeholder="Describe the image"
              className={cn(NEU_INPUT, errors.alt && "ring-2 ring-[#FF2157]/50")}
            />
            {errors.alt && <p className="text-xs text-[#FF2157] mt-1 font-[family-name:var(--font-jetbrains-mono)]">{errors.alt}</p>}
          </div>

          {/* Caption */}
          <div>
            <label htmlFor="caption" className={NEU_LABEL}>Caption</label>
            <textarea
              id="caption"
              value={values.caption}
              onChange={(e) => setValues((v) => ({ ...v, caption: e.target.value }))}
              placeholder="Short banner caption"
              rows={3}
              className={cn(NEU_INPUT, "resize-none leading-relaxed", errors.caption && "ring-2 ring-[#FF2157]/50")}
            />
            {errors.caption && <p className="text-xs text-[#FF2157] mt-1 font-[family-name:var(--font-jetbrains-mono)]">{errors.caption}</p>}
          </div>

          {/* Order + Active */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="order" className={NEU_LABEL}>Order</label>
              <input
                id="order"
                type="number"
                value={values.order}
                onChange={(e) => setValues((v) => ({ ...v, order: Number(e.target.value) }))}
                min={GUIDE_BANNER_CONSTRAINTS.minOrder}
                max={GUIDE_BANNER_CONSTRAINTS.maxOrder}
                className={cn(NEU_INPUT, errors.order && "ring-2 ring-[#FF2157]/50")}
              />
              {errors.order && <p className="text-xs text-[#FF2157] mt-1 font-[family-name:var(--font-jetbrains-mono)]">{errors.order}</p>}
            </div>

            <div className="flex items-end gap-3 pb-0.5">
              <div>
                <label className={NEU_LABEL}>Active</label>
                <div className="flex items-center gap-3 mt-2">
                  <Switch
                    id="active"
                    checked={values.active}
                    onCheckedChange={(checked) => setValues((v) => ({ ...v, active: checked }))}
                  />
                  <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/60">
                    {values.active ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className={`flex-row justify-end gap-3 px-6 py-4 border-t ${NEU_DIVIDER}`}>
          <button
            ref={focusRef}
            type="button"
            onClick={onClose}
            className={`${NEU_BTN_GHOST} px-5 py-2.5`}
          >
            Cancel
          </button>

          <motion.div whileTap={{ scale: 0.97 }}>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isBusy}
              className={`${NEU_BTN_PRIMARY} px-5 py-2.5 flex items-center gap-2`}
            >
              {isBusy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : mode === "create" ? "Create" : "Save"}
            </button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}