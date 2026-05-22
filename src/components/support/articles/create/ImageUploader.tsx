'use client';

import { useState, useEffect } from 'react';
import { ImageUrl } from '@/types/article/article.types';
import { UploadCloud, X, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_SURFACE_RAISED =
    'bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]';

const NEU_INPUT =
    'flex-1 rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 ' +
    'font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-2.5 border-none ' +
    'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] ' +
    'focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200';

const NEU_BTN_PRIMARY =
    'rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold ' +
    'text-xs tracking-wide px-4 py-2.5 ' +
    'shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] ' +
    'hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] ' +
    'active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] ' +
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 ' +
    'flex items-center gap-2 cursor-pointer';

const NEU_DROP_ZONE =
    'rounded-2xl bg-[#E7E5E4] border-2 border-dashed border-[#006666]/30 ' +
    'shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] ' +
    'p-6 text-center cursor-pointer transition-all duration-200 ' +
    'hover:border-[#006666]/60 hover:shadow-[inset_6px_6px_12px_#c8c6c5,inset_-6px_-6px_12px_#ffffff]';

const NEU_LABEL =
    'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';

const NEU_REMOVE_BTN =
    'absolute top-1.5 right-1.5 rounded-lg w-6 h-6 flex items-center justify-center ' +
    'bg-[#1E2938]/60 text-white hover:bg-[#FF2157] transition-all duration-200';

interface ImageUploaderProps {
    value?: ImageUrl | null;
    onChange: (v: ImageUrl | ImageUrl[] | null) => void;
    multiple?: boolean;
    label?: string;
}

export function ImageUploader({ value, onChange, multiple, label }: ImageUploaderProps) {
    const [preview, setPreview] = useState<ImageUrl[]>(
        Array.isArray(value) ? value : value ? [value] : []
    );

    useEffect(() => {
        setPreview(Array.isArray(value) ? value : value ? [value] : []);
    }, [value]);

    const handleUrlAdd = (url: string) => {
        const next = multiple ? [...preview, url] : [url];
        setPreview(next);
        onChange(multiple ? next : url);
    };

    const handleRemove = (index: number) => {
        const next = preview.filter((_, i) => i !== index);
        setPreview(next);
        onChange(multiple ? next : next[0] ?? null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        for (const file of Array.from(files)) {
            const loadingToast = toast.loading('Processing image...');
            try {
                const sizeInMB = file.size / (1024 * 1024);
                if (sizeInMB > 5) {
                    toast.dismiss(loadingToast);
                    toast.error('Image must be under 5MB.');
                    continue;
                }
                const compressedFile = await imageCompression(file, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                });
                const base64 = await convertToBase64(compressedFile);
                const next = multiple ? [...preview, base64] : [base64];
                setPreview(next);
                onChange(multiple ? next : base64);
                toast.dismiss(loadingToast);
                toast.success('Image uploaded!');
            } catch (err) {
                toast.dismiss(loadingToast);
                toast.error('Failed to process image.');
                console.error(err);
            }
        }
        e.target.value = '';
    };

    const convertToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

    return (
        <div className="space-y-3">
            {label && <p className={NEU_LABEL}>{label}</p>}

            {/* URL + Upload row */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1E2938]/40 pointer-events-none" />
                    <input
                        className={`${NEU_INPUT} pl-9`}
                        placeholder="Paste image URL and press Enter"
                        aria-label="Image URL input"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                if (target.value) {
                                    handleUrlAdd(target.value);
                                    target.value = '';
                                }
                            }
                        }}
                    />
                </div>

                <label className={NEU_BTN_PRIMARY}>
                    <UploadCloud className="h-4 w-4" />
                    Upload
                    <input
                        type="file"
                        accept="image/*"
                        multiple={multiple}
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </label>
            </div>

            {/* Previews */}
            {preview.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {preview.map((p, idx) => (
                        <div
                            key={idx}
                            className={`relative rounded-xl overflow-hidden ${NEU_SURFACE_RAISED}`}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={p}
                                alt={`Preview ${idx + 1}`}
                                className="h-24 w-full object-cover rounded-xl"
                            />
                            <button
                                type="button"
                                aria-label="Remove image"
                                className={NEU_REMOVE_BTN}
                                onClick={() => handleRemove(idx)}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}

                    {/* Add more slot when multiple */}
                    {multiple && (
                        <label
                            className={`${NEU_DROP_ZONE} h-24 flex flex-col items-center justify-center gap-1`}
                        >
                            <UploadCloud className="h-5 w-5 text-[#006666]/60" />
                            <span className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold text-[#1E2938]/50 uppercase tracking-widest">
                                Add more
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                    )}
                </div>
            )}

            {/* Empty drop zone */}
            {preview.length === 0 && (
                <label className={NEU_DROP_ZONE}>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-[#006666]/10 flex items-center justify-center shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
                            <UploadCloud className="h-5 w-5 text-[#006666]" />
                        </div>
                        <div>
                            <p className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#1E2938]/70">
                                Drag & drop or click to upload
                            </p>
                            <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40 mt-0.5">
                                PNG, JPG, WEBP up to 5MB
                            </p>
                        </div>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        multiple={multiple}
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </label>
            )}
        </div>
    );
}