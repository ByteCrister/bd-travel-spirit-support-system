import { useState, useRef } from 'react'
import imageCompression from 'browser-image-compression'
import { useRegisterGuideStore } from '@/store/guide/guide-registration.store'
import { validateFile } from '@/utils/validators/registerAsGuide.validator'
import { FileText, Image } from 'lucide-react'
import { DocumentFile, SegmentedDocuments } from '@/types/guide/register-as-guide.types'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 10MB raw file limit

const isValidDataUrl = (value: string): boolean => {
    return /^data:[\w.+-]+\/[\w.+-]+;base64,[A-Za-z0-9+/=]+$/.test(value)
}

export const useStepDocumentsHandlers = (onNext: () => void) => {
    const { formData, addDocument, removeDocument, setError, clearError } = useRegisterGuideStore()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string>('')
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedSegment, setSelectedSegment] =
        useState<keyof SegmentedDocuments>("governmentId")

    // Convert file to base64
    const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                reject(new Error('File size exceeds 10MB limit'))
                return
            }

            const reader = new FileReader()
            reader.readAsDataURL(file)

            reader.onload = () => {
                const result = reader.result

                if (typeof result !== 'string' || !isValidDataUrl(result)) {
                    reject(new Error('Invalid base64 data URL'))
                    return
                }

                resolve(result) // FULL data URL
            }

            reader.onerror = () => reject(new Error('Failed to read file'))
        })
    }


    // Compress image file
    const compressImage = async (file: File): Promise<File> => {
        if (!file.type.startsWith('image/')) return file

        try {
            return await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            })
        } catch {
            return file // fail-safe
        }
    }


    // Handle file upload
    const handleFileUpload = async (
        files: FileList | null,
        segment: keyof SegmentedDocuments
    ) => {
        if (!files || files.length === 0) return

        setIsUploading(true)
        setUploadError('')
        clearError('documents')

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]

                const validation = validateFile(file)
                if (!validation.isValid) {
                    setUploadError(validation.error || 'Invalid file')
                    return
                }

                let processedFile = file
                if (file.type.startsWith('image/')) {
                    processedFile = await compressImage(file)
                }

                const dataUrl = await fileToDataUrl(processedFile)

                const document: DocumentFile = {
                    name: processedFile.name,
                    base64: dataUrl, // FULL data URL
                    uploadedAt: new Date().toISOString(),
                    type: processedFile.type,
                    size: processedFile.size,
                }

                addDocument(segment, document)
            }
        } catch (err) {
            setUploadError(
                err instanceof Error ? err.message : 'Failed to process file'
            )
        } finally {
            setIsUploading(false)
        }
    }


    // Input change
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, segment: keyof SegmentedDocuments) => {
        handleFileUpload(e.target.files, segment)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Drag & drop
    const handleDrop = (e: React.DragEvent, segment: keyof SegmentedDocuments) => {
        e.preventDefault()
        setDragActive(false)
        handleFileUpload(e.dataTransfer.files, segment)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)
    }

    // Next button
    const handleNext = () => {
        const totalDocs = Object.values(formData.documents).reduce(
            (count, arr) => count + arr.length,
            0
        )

        if (totalDocs === 0) {
            setError('documents', 'At least one document is required')
            return
        }
        onNext()
    }

    // Helpers
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getFileInfo = (type: string) => {
        if (type.startsWith('image/')) {
            return {
                icon: Image,
                color: 'text-blue-500',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200'
            }
        }
        return {
            icon: FileText,
            color: 'text-red-500',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200'
        }
    }

    return {
        formData,
        isUploading,
        uploadError,
        dragActive,
        fileInputRef,
        removeDocument, // still requires (segment, index) when used
        handleFileInputChange,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        handleNext,
        formatFileSize,
        getFileInfo,
        selectedSegment,
        setSelectedSegment,
    }
}