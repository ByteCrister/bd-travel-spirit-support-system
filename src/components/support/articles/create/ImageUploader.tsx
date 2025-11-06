'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUrl } from '@/types/article.types';
import { UploadCloud, X } from 'lucide-react';
import { toast } from 'sonner'; // shadcn toast
import imageCompression from 'browser-image-compression'; // lightweight client-side compression

interface ImageUploaderProps {
    value?: ImageUrl | ImageUrl[] | null;
    onChange: (v: ImageUrl | ImageUrl[] | null ) => void;
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
        onChange(multiple ? next : next[0]);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        for (const file of Array.from(files)) {
            const loadingToast = toast.loading('Calculating image size...');

            try {
                const sizeInMB = file.size / (1024 * 1024);

                if (sizeInMB > 5) {
                    toast.dismiss(loadingToast);
                    toast.error('Image is larger than 5MB. Please upload a smaller file.');
                    continue;
                }

                // Compress image
                const compressedFile = await imageCompression(file, {
                    maxSizeMB: 1, // target ~1MB
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                });

                // Convert to base64
                const base64 = await convertToBase64(compressedFile);

                const next = multiple ? [...preview, base64] : [base64];
                setPreview(next);
                onChange(multiple ? next : base64);

                toast.dismiss(loadingToast);
                toast.success('Image uploaded successfully!');
            } catch (err) {
                toast.dismiss(loadingToast);
                toast.error('Failed to process image.');
                console.error(err);
            }
        }

        e.target.value = ''; // reset input
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    return (
        <div className="space-y-2">
            {label && <div className="text-sm font-medium">{label}</div>}
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Paste image URL"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            if (target.value) {
                                handleUrlAdd(target.value);
                                target.value = '';
                            }
                        }
                    }}
                    aria-label="Image URL input"
                />
                <Button variant="outline" type="button" asChild>
                    <label className="cursor-pointer flex items-center">
                        <UploadCloud className="h-4 w-4 mr-2" />
                        Upload
                        <input
                            type="file"
                            accept="image/*"
                            multiple={multiple}
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </label>
                </Button>
            </div>

            {/* Previews */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {preview.map((p, idx) => (
                    <div key={idx} className="relative rounded-md overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p} alt="Image" className="h-28 w-full object-cover" />
                        <button
                            type="button"
                            aria-label="Remove image"
                            className="absolute top-1 right-1 rounded bg-black/50 p-1"
                            onClick={() => handleRemove(idx)}
                        >
                            <X className="h-3 w-3 text-white" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
