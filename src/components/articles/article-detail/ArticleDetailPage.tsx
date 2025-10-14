// app/articles/[articleId]/page.tsx
'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
    FiSave,
    FiTrash2,
    FiAlertCircle,
    FiRotateCw,
    FiEye,
    FiLayers,
    FiSearch,
    FiHelpCircle,
    FiSettings,
    FiCalendar
} from 'react-icons/fi';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from '@/components/ui/alert-dialog';

import {
    ArticleDetail,
    UpdateArticleInput,
    DeleteArticleInput,
    ID,
} from '@/types/article.types';
import { CreateArticleFormValues, createArticleSchema } from '@/utils/validators/article.create.validator';
import { useArticleStore } from '@/store/useArticleStore';
import { showToast } from '@/components/global/showToast';
import { ArticleDetailSkeleton } from './ArticleDetailSkeleton';
import { HeaderBar } from './HeaderBar';
import { OverviewSection } from './OverviewSection';
import { ContentSection } from './ContentSection';
import { SeoSection } from './SeoSection';
import { FaqsSection } from './FaqsSection';
import { SettingsSection } from './SettingsSection';
import { ARTICLE_STATUS, ARTICLE_TYPE } from '@/constants/article.const';


// ---------------------
// Animation Variants
// ---------------------
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
};

const tabContentVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: 'spring', stiffness: 120, damping: 20 }
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.15 } }
};

// ---------------------
// Update schema for partial updates
// ---------------------
const updateArticleSchema = createArticleSchema
    .clone()
    .shape({
        title: Yup.string().min(5, 'Title must be at least 5 characters').optional(),
        slug: Yup.string()
            .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case')
            .optional(),
        status: Yup.mixed<ARTICLE_STATUS>().oneOf(Object.values(ARTICLE_STATUS)).optional(),
        articleType: Yup.mixed<ARTICLE_TYPE>().oneOf(Object.values(ARTICLE_TYPE)).optional(),
        authorBio: Yup.string().optional(),
        summary: Yup.string().min(10, 'Summary must be at least 10 characters').max(300, 'Summary must be under 300 characters').optional(),
        heroImage: Yup.string().url().nullable().optional(),
        destinations: Yup.array().optional(),
        categories: Yup.array().optional(),
        tags: Yup.array().optional(),
        seo: Yup.object({
            metaTitle: Yup.string().min(5).optional(),
            metaDescription: Yup.string().min(10).optional(),
            ogImage: Yup.string().url().nullable().optional(),
        })
            .nullable()
            .optional(),
        faqs: Yup.array().optional(),
        allowComments: Yup.boolean().optional(),
    })
    .test(
        'destinations-required-update',
        'At least one destination is required for destination articles',
        (val) => {
            const type = val?.articleType;
            if (type === ARTICLE_TYPE.SINGLE_DESTINATION || type === ARTICLE_TYPE.MULTI_DESTINATION) {
                if (val?.destinations === undefined) return true;
                return Array.isArray(val?.destinations) && val.destinations.length > 0;
            }
            return true;
        }
    );

// ---------------------
// Helpers
// ---------------------
function normalizeOgImage(input: unknown): string | null {
    if (typeof input === 'string') return input;
    return input ? String(input) : null;
}

function mapDetailToFormValues(detail: ArticleDetail): CreateArticleFormValues {
    return {
        title: detail.title,
        slug: detail.slug,
        status: detail.status,
        articleType: detail.articleType,
        authorBio: '',
        summary: detail.summary,
        heroImage: detail.heroImage ?? null,
        destinations: (detail.destinations ?? []).map(d => ({
            ...d,
            highlights: d.highlights ?? [],
            images: d.images ?? [],
            activities: d.activities ?? [],
            attractions: (d.attractions ?? []).map(a => ({
                ...a,
                images: a.images ?? [],
                coordinates: a.coordinates ?? null,
            })),
        })),
        categories: detail.categories ?? [],
        tags: detail.tags ?? [],
        seo: {
            metaTitle: detail.seo?.metaTitle ?? '',
            metaDescription: detail.seo?.metaDescription ?? '',
            ogImage: normalizeOgImage(detail.seo?.ogImage),
        },
        faqs: detail.faqs ?? [],
        allowComments: detail.allowComments ?? true,
    };
}

function isEqual(a: unknown, b: unknown): boolean {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return a === b;
    }
}

function computeDiff(
    initial: Partial<CreateArticleFormValues>,
    current: Partial<CreateArticleFormValues>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Partial<Record<keyof CreateArticleFormValues, any>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const diff: Partial<Record<keyof CreateArticleFormValues, any>> = {};
    const keys = new Set([...Object.keys(initial ?? {}), ...Object.keys(current ?? {})]);

    keys.forEach((key) => {
        const k = key as keyof CreateArticleFormValues;
        const iv = initial[k];
        const cv = current[k];
        if (!isEqual(iv, cv)) {
            diff[k] = cv;
        }
    });

    return diff;
}

// ---------------------
// Status Badge Component
// ---------------------
const StatusBadge = ({ status }: { status: ARTICLE_STATUS }) => {
    const statusConfig = {
        [ARTICLE_STATUS.DRAFT]: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Draft' },
        [ARTICLE_STATUS.PUBLISHED]: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Published' },
        [ARTICLE_STATUS.ARCHIVED]: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Archived' },
    };

    const config = statusConfig[status] || statusConfig[ARTICLE_STATUS.DRAFT];

    return (
        <Badge variant="outline" className={`${config.color} font-medium`}>
            <span className="relative flex h-2 w-2 mr-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.color.split(' ')[0]}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${config.color.split(' ')[0]}`}></span>
            </span>
            {config.label}
        </Badge>
    );
};

// ---------------------
// Tab Configuration
// ---------------------
const TAB_CONFIG = [
    { value: 'overview', label: 'Overview', icon: FiEye },
    { value: 'content', label: 'Content', icon: FiLayers },
    { value: 'seo', label: 'SEO', icon: FiSearch },
    { value: 'faqs', label: 'FAQs', icon: FiHelpCircle },
    { value: 'settings', label: 'Settings', icon: FiSettings },
];

// ---------------------
// Main Component
// ---------------------
const ArticleDetailPage = ({ articleId }: { articleId: string }) => {
    const router = useRouter();

    const {
        fetchArticleDetails,
        updateArticle,
        deleteArticle,
        loading,
        error,
        detailById,
        clearError,
    } = useArticleStore();

    const detail: ArticleDetail | undefined = detailById[articleId as ID];
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [headerPulse, setHeaderPulse] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Fetch article detail on mount and when id changes
    useEffect(() => {
        if (articleId && !detail) {
            fetchArticleDetails(articleId as ID).catch(() => { });
        }
    }, [articleId, detail, fetchArticleDetails]);

    const initialValues = useMemo(() => {
        return detail ? mapDetailToFormValues(detail) : undefined;
    }, [detail]);

    // Retry handler for errors
    const handleRetry = useCallback(() => {
        clearError();
        if (articleId) {
            fetchArticleDetails(articleId as ID, true).catch(() => { });
        }
    }, [articleId, clearError, fetchArticleDetails]);

    // Submit handler
    const handleSubmit = useCallback(
        async (values: CreateArticleFormValues, formikHelpers: FormikHelpers<CreateArticleFormValues>) => {
            if (!detail) return;
            setIsSaving(true);

            const payloadDiff = computeDiff(initialValues ?? {}, values);
            const payload: UpdateArticleInput = { id: detail.id, ...payloadDiff };

            try {
                const res = await updateArticle(payload);
                if (res.success) {
                    showToast.success('Article saved', 'Your changes have been saved successfully.');
                    formikHelpers.resetForm({ values });
                    setHeaderPulse(true);
                    setTimeout(() => setHeaderPulse(false), 900);
                } else {
                    showToast.error('Failed to save', res.message ?? 'Unknown error');
                }
            } catch {
                showToast.error('Failed to save', 'An unexpected error occurred.');
            } finally {
                setIsSaving(false);
            }
        },
        [detail, initialValues, updateArticle]
    );

    // Delete handler
    const handleDelete = useCallback(async () => {
        if (!detail) return;
        const payload: DeleteArticleInput = { id: detail.id };
        try {
            const res = await deleteArticle(payload);
            if (res.success) {
                showToast.success('Article deleted', 'The article was deleted successfully.');
                router.replace('/articles');
            } else {
                showToast.error('Delete failed', res.message ?? 'Unknown error');
            }
        } catch {
            showToast.error('Delete failed', 'An unexpected error occurred.');
        }
    }, [detail, deleteArticle, router]);

    // Render
    const isLoading = loading.isLoadingDetail && !detail;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Header / Loading Skeleton */}
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="skeleton"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <ArticleDetailSkeleton />
                        </motion.div>
                    ) : detail ? (
                        <motion.div
                            key="header"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 100 }}
                        >
                            <HeaderBar
                                title={detail.title}
                                status={detail.status}
                                updatedAt={detail.updatedAt}
                                commentCount={detail.commentCount}
                                pendingCommentCount={detail.pendingCommentCount}
                                headerPulse={headerPulse}
                                onView={() => router.push(`/articles/${detail.id}`)}
                                onDelete={undefined}
                            />
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                {/* Error State */}
                {!isLoading && !detail && error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 120 }}
                    >
                        <Card className="p-6 border-red-200 bg-red-50/50 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <FiAlertCircle className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-red-900">Error loading article</h3>
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleRetry}
                                    className="gap-2 border-red-300 hover:bg-red-100"
                                >
                                    <FiRotateCw className="h-4 w-4" />
                                    Retry
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Main Content */}
                {detail && initialValues ? (
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={updateArticleSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting, submitForm, dirty }) => (
                            <Form>
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-6"
                                >
                                    {/* Action Bar */}
                                    <motion.div variants={itemVariants}>
                                        <Card className="p-5 rounded-xl border border-gray-200/70 bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-950 shadow-sm backdrop-blur-md">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">

                                                {/* Left Section */}
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
                                                    <StatusBadge status={detail.status} />
                                                    <Badge
                                                        variant="outline"
                                                        className="font-medium text-sm px-3 py-1 rounded-md border-gray-300/70"
                                                    >
                                                        {detail.articleType}
                                                    </Badge>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <FiCalendar className="h-4 w-4 text-gray-500" />
                                                        <span>
                                                            {new Date(detail.updatedAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right Section */}
                                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                                    <Button
                                                        type="button"
                                                        variant="default"
                                                        onClick={submitForm}
                                                        disabled={isSubmitting || isSaving || !dirty}
                                                        className="gap-2 flex-1 sm:flex-initial bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md rounded-lg"
                                                    >
                                                        {isSaving ? (
                                                            <>
                                                                <FiRotateCw className="h-4 w-4 animate-spin" />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiSave className="h-4 w-4" />
                                                                Save
                                                            </>
                                                        )}
                                                    </Button>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-sm rounded-lg"
                                                            >
                                                                <FiTrash2 className="h-4 w-4" />
                                                                <span className="hidden sm:inline">Delete</span>
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="max-w-md rounded-xl">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="flex items-center gap-2 text-lg font-semibold">
                                                                    <FiAlertCircle className="h-5 w-5 text-red-600" />
                                                                    Delete this article?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription className="text-sm pt-2 text-gray-600 dark:text-gray-400">
                                                                    This action cannot be undone. This will permanently delete
                                                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                                        {" "}
                                                                        &quot;{detail.title}&quot;{" "}
                                                                    </span>
                                                                    and remove all associated data.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600 rounded-md"
                                                                    onClick={handleDelete}
                                                                >
                                                                    <FiTrash2 className="h-4 w-4 mr-2" />
                                                                    Delete Article
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>

                                    {/* Tabs */}
                                    <motion.div variants={itemVariants}>
                                        <Tabs
                                            value={activeTab}
                                            onValueChange={setActiveTab}
                                            className="space-y-6"
                                        >
                                            <Card>
                                                <TabsList className="grid w-full grid-cols-5 gap-1 bg-gray-100/50 p-1 h-auto">
                                                    {TAB_CONFIG.map((tab) => {
                                                        const Icon = tab.icon;
                                                        const isActive = activeTab === tab.value;

                                                        return (
                                                            <TabsTrigger
                                                                key={tab.value}
                                                                value={tab.value}
                                                                className={`
                                                                    relative flex items-center justify-center gap-2 px-3 py-2.5 
                                                                    rounded-md transition-all duration-200
                                                                    data-[state=active]:bg-white 
                                                                    data-[state=active]:shadow-sm
                                                                    data-[state=active]:text-blue-600
                                                                    hover:bg-white/50
                                                                `}
                                                            >
                                                                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                                                                <span className="hidden sm:inline font-medium text-sm">
                                                                    {tab.label}
                                                                </span>
                                                                {isActive && (
                                                                    <motion.div
                                                                        layoutId="activeTab"
                                                                        className="absolute inset-0 bg-white rounded-md shadow-sm -z-10"
                                                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                                    />
                                                                )}
                                                            </TabsTrigger>
                                                        );
                                                    })}
                                                </TabsList>
                                            </Card>

                                            <AnimatePresence mode="wait">
                                                <TabsContent
                                                    key={"overview"}
                                                    value="overview"
                                                    className={activeTab !== 'overview' ? 'hidden' : ''}
                                                >
                                                    <motion.div
                                                        key="overview"
                                                        variants={tabContentVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                    >
                                                        <OverviewSection />
                                                    </motion.div>
                                                </TabsContent>

                                                <TabsContent
                                                    key={"content"}
                                                    value="content"
                                                    className={activeTab !== 'content' ? 'hidden' : ''}
                                                >
                                                    <motion.div
                                                        key="content"
                                                        variants={tabContentVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                    >
                                                        <ContentSection />
                                                    </motion.div>
                                                </TabsContent>

                                                <TabsContent
                                                    key={"seo"}
                                                    value="seo"
                                                    className={activeTab !== 'seo' ? 'hidden' : ''}
                                                >
                                                    <motion.div
                                                        key="seo"
                                                        variants={tabContentVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                    >
                                                        <SeoSection />
                                                    </motion.div>
                                                </TabsContent>

                                                <TabsContent
                                                    key={"faqs"}
                                                    value="faqs"
                                                    className={activeTab !== 'faqs' ? 'hidden' : ''}
                                                >
                                                    <motion.div
                                                        key="faqs"
                                                        variants={tabContentVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                    >
                                                        <FaqsSection />
                                                    </motion.div>
                                                </TabsContent>

                                                <TabsContent
                                                    key={"settings"}
                                                    value="settings"
                                                    className={activeTab !== 'settings' ? 'hidden' : ''}
                                                >
                                                    <motion.div
                                                        key="settings"
                                                        variants={tabContentVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                    >
                                                        <SettingsSection
                                                            metrics={{
                                                                viewCount: detail.viewCount,
                                                                likeCount: detail.likeCount,
                                                                shareCount: detail.shareCount,
                                                            }}
                                                        />
                                                    </motion.div>
                                                </TabsContent>
                                            </AnimatePresence>
                                        </Tabs>
                                    </motion.div>
                                </motion.div>
                            </Form>
                        )}
                    </Formik>
                ) : null}
            </div>
        </div>
    );
};

export default ArticleDetailPage;