'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { Formik, Form, FormikHelpers } from 'formik';
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
    FiCalendar,
    FiLink,
    FiRefreshCw
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
    DestinationBlock,
} from '@/types/article.types';
import { useArticleStore } from '@/store/article/article.store';
import { showToast } from '@/components/global/showToast';
import { ArticleDetailSkeleton } from './ArticleDetailSkeleton';
import { HeaderBar } from './HeaderBar';
import { OverviewSection } from './OverviewSection';
import { ContentSection } from './ContentSection';
import { SeoSection } from './SeoSection';
import { FaqsSection } from './FaqsSection';
import { SettingsSection } from './SettingsSection';
import { ARTICLE_STATUS, ArticleStatus } from '@/constants/article.const';
import { encodeId } from '@/utils/helpers/mongodb-id-conversions';
import { Breadcrumbs } from '@/components/global/Breadcrumbs';
import { CreateArticleFormValues, createArticleSchema } from '@/utils/validators/article.create.validator';
import { TOUR_CATEGORIES } from '@/constants/tour.const';
import { showFormikSubmitErrors } from '@/utils/validators/common/formik-errors';


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
        banglaTitle: detail.banglaTitle || '',
        status: detail.status,
        articleType: detail.articleType,
        authorBio: detail.authorBio || '',
        summary: detail.summary,
        heroImage: detail.heroImage ?? '',
        destinations: (detail.destinations ?? []).map(d => ({
            id: d.id,
            division: d.division,
            district: d.district,
            area: d.area || '',
            description: d.description,
            content: d.content || [],
            highlights: d.highlights || [],
            foodRecommendations: d.foodRecommendations || [],
            localFestivals: d.localFestivals || [],
            localTips: d.localTips || [],
            transportOptions: d.transportOptions || [],
            accommodationTips: d.accommodationTips || [],
            coordinates: d.coordinates,
            imageAsset: d.imageAsset,
        })),
        categories: detail.categories ?? [],
        tags: detail.tags ?? [],
        seo: {
            metaTitle: detail.seo?.metaTitle ?? '',
            metaDescription: detail.seo?.metaDescription ?? '',
            ogImage: normalizeOgImage(detail.seo?.ogImage),
        },
        faqs: (detail.faqs ?? []).map(f => ({
            question: f.question,
            answer: f.answer,
            category: f.category,
        })),
        allowComments: detail.allowComments ?? true,
    };
}

// ---------------------
// Status Badge Component
// ---------------------
const StatusBadge = ({ status }: { status: ArticleStatus }) => {
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
        restoreArticle,
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
    const [initialFormValues, setInitialFormValues] = useState<CreateArticleFormValues | undefined>(undefined);

    // Fetch article detail on mount and when id changes
    useEffect(() => {
        if (articleId && !detail) {
            fetchArticleDetails(articleId as ID).catch(() => { });
        }
    }, [articleId, detail, fetchArticleDetails]);

    // Set initial form values only once when detail loads
    useEffect(() => {
        if (detail && !initialFormValues) {
            setInitialFormValues(mapDetailToFormValues(detail));
        }
    }, [detail, initialFormValues]);

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

            const destinations: DestinationBlock[] = values.destinations.map(dest => ({
                id: dest.id,
                division: dest.division,
                district: dest.district,
                area: dest.area || undefined,
                description: dest.description,

                content: dest.content.map(block => ({
                    type: block.type,
                    text: block.text || undefined,
                    href: block.href || undefined,
                })),

                highlights: dest.highlights.filter(
                    (h): h is string => typeof h === 'string'
                ),

                foodRecommendations: dest.foodRecommendations.map(food => ({
                    dishName: food.dishName,
                    description: food.description,
                    bestPlaceToTry: food.bestPlaceToTry || undefined,
                    approximatePrice: food.approximatePrice || undefined,
                    spiceLevel: food.spiceLevel || undefined,
                })),

                localFestivals: dest.localFestivals.map(festival => ({
                    name: festival.name,
                    description: festival.description,
                    timeOfYear: festival.timeOfYear,
                    location: festival.location,
                    significance: festival.significance || undefined,
                })),

                localTips: dest.localTips.filter(
                    (t): t is string => typeof t === 'string'
                ),

                transportOptions: dest.transportOptions.filter(
                    (t): t is string => typeof t === 'string'
                ),

                accommodationTips: dest.accommodationTips.filter(
                    (t): t is string => typeof t === 'string'
                ),

                coordinates: {
                    lat: dest.coordinates.lat,
                    lng: dest.coordinates.lng,
                },

                imageAsset: dest.imageAsset,
            }));

            const payload: UpdateArticleInput = {
                id: detail.id,
                title: values.title,
                banglaTitle: values.banglaTitle,
                status: values.status,
                articleType: values.articleType,
                authorBio: values.authorBio || undefined,
                summary: values.summary,
                heroImage: values.heroImage,

                destinations,

                categories: values.categories.filter(
                    (c): c is TOUR_CATEGORIES => Boolean(c)
                ),

                tags: values.tags.filter((t): t is string => Boolean(t)),

                seo: {
                    metaTitle: values.seo.metaTitle,
                    metaDescription: values.seo.metaDescription,
                    ogImage: values.seo.ogImage || undefined,
                },

                faqs: values.faqs.map(faq => ({
                    question: faq.question,
                    answer: faq.answer,
                    category: faq.category || undefined,
                })),

                allowComments: values.allowComments,
            };

            try {
                const res = await updateArticle(payload);
                if (res.success && res.article) {
                    showToast.success('Article saved', 'Your changes have been saved successfully.');
                    // Update initial values to current values after successful save
                    setInitialFormValues((mapDetailToFormValues(res.article)));
                    formikHelpers.resetForm((mapDetailToFormValues(res.article)));
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
        [detail, updateArticle]
    );

    // Restore handler (from archived to draft)
    const handleRestore = useCallback(async () => {
        if (!detail) return;
        setIsSaving(true);

        const payload = {
            id: detail.id,
        };

        try {
            const res = await restoreArticle(payload);
            if (res.success) {
                showToast.success('Article restored', 'The article has been restored from archived.');
                // Refresh article details
                await fetchArticleDetails(articleId as ID, true);
            } else {
                showToast.error('Restore failed', res.message ?? 'Unknown error');
            }
        } catch {
            showToast.error('Restore failed', 'An unexpected error occurred.');
        } finally {
            setIsSaving(false);
        }
    }, [detail, restoreArticle, fetchArticleDetails, articleId]);

    // Delete handler
    const handleDelete = useCallback(async () => {
        if (!detail) return;
        const payload: DeleteArticleInput = { id: detail.id };
        try {
            const res = await deleteArticle(payload);
            if (res.success) {
                showToast.success('Article deleted', 'The article was deleted successfully.');
                router.push('/support/articles');
            } else {
                showToast.error('Delete failed', res.message ?? 'Unknown error');
            }
        } catch {
            showToast.error('Delete failed', 'An unexpected error occurred.');
        }
    }, [detail, deleteArticle, router]);

    // Get status toggle button label and action
    const getStatusToggleConfig = useCallback((currentStatus: ArticleStatus) => {
        if (currentStatus === ARTICLE_STATUS.DRAFT) {
            return {
                label: "Publish",
                newStatus: ARTICLE_STATUS.PUBLISHED,
                variant: "success" as const,
                icon: FiEye
            };
        } else if (currentStatus === ARTICLE_STATUS.PUBLISHED) {
            return {
                label: "Revert to Draft",
                newStatus: ARTICLE_STATUS.DRAFT,
                variant: "outline" as const,
                icon: FiRotateCw
            };
        }
        return null;
    }, []);

    // Render
    const isLoading = loading.isLoadingDetail && !detail;
    const isArchived = detail?.status === ARTICLE_STATUS.ARCHIVED;
    const statusToggleConfig = detail ? getStatusToggleConfig(detail.status) : null;

    const breadcrumbItems = useMemo(
        () => [
            { label: "Home", href: "/" },
            { label: "Articles", href: "/support/articles" },
            { label: detail?.title ?? "-", href: `/support/articles/${detail?.id ? encodeId(encodeURIComponent(detail?.id)) : ""}` },
        ],
        [detail?.id, detail?.title]
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <Breadcrumbs items={breadcrumbItems} />
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
                                onView={() => router.push(`/support/articles/${encodeId(encodeURIComponent(detail.id))}`)}
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
                {detail && initialFormValues ? (
                    <Formik
                        key={detail.id} // Add key to force re-initialization when detail changes
                        initialValues={initialFormValues}
                        enableReinitialize={true}
                        validationSchema={createArticleSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting, submitForm, validateForm, dirty, setFieldValue }) => {
                            const handleSafeSubmit = async () => {
                                const validationErrors = await validateForm();

                                if (Object.keys(validationErrors).length > 0) {
                                    showFormikSubmitErrors(validationErrors);
                                    return;
                                }

                                submitForm();
                            };
                            // Function to handle status toggle
                            const handleStatusToggle = async () => {
                                if (!statusToggleConfig || isSaving) return;

                                // Update the form's status field
                                await setFieldValue('status', statusToggleConfig.newStatus);

                                // Submit the form to save the status change
                                submitForm();
                            };

                            return (
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
                                                        {/* Display slug field - read only */}
                                                        <Badge
                                                            variant="outline"
                                                            className="font-medium text-sm px-3 py-1 rounded-md border-blue-200 bg-blue-50 text-blue-700 flex items-center gap-1.5"
                                                        >
                                                            <FiLink className="h-3 w-3" />
                                                            {detail.slug || 'No slug'}
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

                                                    {/* Right Section - Conditional based on status */}
                                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                                        {/* For draft/published articles */}
                                                        {!isArchived && (
                                                            <>
                                                                {/* Status Toggle Button */}
                                                                {statusToggleConfig && (
                                                                    <Button
                                                                        type="button"
                                                                        variant={"secondary"}
                                                                        onClick={handleStatusToggle}
                                                                        disabled={isSaving}
                                                                        className={`gap-2 flex-1 sm:flex-initial ${statusToggleConfig.variant === 'success'
                                                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                                                            : 'border-gray-300'
                                                                            }`}
                                                                    >
                                                                        {isSaving ? (
                                                                            <FiRotateCw className="h-4 w-4 animate-spin" />
                                                                        ) : (
                                                                            <>
                                                                                {statusToggleConfig.icon && (
                                                                                    <statusToggleConfig.icon className="h-4 w-4" />
                                                                                )}
                                                                                {statusToggleConfig.label}
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                )}

                                                                {/* Save Button (only for dirty forms) */}
                                                                {dirty && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="default"
                                                                        onClick={handleSafeSubmit}
                                                                        disabled={isSubmitting || isSaving}
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
                                                                                Save Changes
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                )}
                                                            </>
                                                        )}

                                                        {/* For archived articles - Show Restore button only */}
                                                        {isArchived && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={handleRestore}
                                                                disabled={isSaving}
                                                                className="gap-2 flex-1 sm:flex-initial bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                                            >
                                                                {isSaving ? (
                                                                    <FiRotateCw className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <FiRefreshCw className="h-4 w-4" />
                                                                        Restore from Archive
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}

                                                        {/* Delete Button (for all statuses) */}
                                                        {
                                                            !isArchived && <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-sm rounded-lg"
                                                                    >
                                                                        <FiTrash2 className="h-4 w-4" />
                                                                        <span className="hidden sm:inline">
                                                                            Delete
                                                                        </span>
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className="max-w-md rounded-xl">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className="flex items-center gap-2 text-lg font-semibold">
                                                                            <FiAlertCircle className="h-5 w-5 text-red-600" />
                                                                            {isArchived
                                                                                ? 'Delete this article permanently?'
                                                                                : 'Delete this article?'}
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription className="text-sm pt-2 text-gray-600 dark:text-gray-400">
                                                                            {isArchived
                                                                                ? `This action cannot be undone. This will permanently delete
                                                                                <span class="font-semibold text-gray-900 dark:text-gray-100">
                                                                                    " ${detail.title} "
                                                                                </span>
                                                                                and remove all associated data.`
                                                                                : `This action will move the article to archived status. You can restore it later from the archives.`}
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 rounded-md"
                                                                            onClick={handleDelete}
                                                                        >
                                                                            <FiTrash2 className="h-4 w-4 mr-2" />
                                                                            {isArchived ? 'Delete Permanently' : 'Archive'}
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        }

                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>

                                        {/* Tabs - Disabled when archived */}
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
                                                                        ${isArchived ? 'opacity-50 cursor-not-allowed' : ''}
                                                                    `}
                                                                    disabled={isArchived}
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

                                                {/* Simplified tabs content without excessive animations */}
                                                <TabsContent
                                                    key={"overview"}
                                                    value="overview"
                                                    className={activeTab !== 'overview' ? 'hidden' : ''}
                                                >
                                                    <OverviewSection />
                                                </TabsContent>

                                                <TabsContent
                                                    key={"content"}
                                                    value="content"
                                                    className={activeTab !== 'content' ? 'hidden' : ''}
                                                >
                                                    <ContentSection />
                                                </TabsContent>

                                                <TabsContent
                                                    key={"seo"}
                                                    value="seo"
                                                    className={activeTab !== 'seo' ? 'hidden' : ''}
                                                >
                                                    <SeoSection />
                                                </TabsContent>

                                                <TabsContent
                                                    key={"faqs"}
                                                    value="faqs"
                                                    className={activeTab !== 'faqs' ? 'hidden' : ''}
                                                >
                                                    <FaqsSection />
                                                </TabsContent>

                                                <TabsContent
                                                    key={"settings"}
                                                    value="settings"
                                                    className={activeTab !== 'settings' ? 'hidden' : ''}
                                                >
                                                    <SettingsSection
                                                        metrics={{
                                                            viewCount: detail.viewCount,
                                                            likeCount: detail.likeCount,
                                                            shareCount: detail.shareCount,
                                                        }}

                                                    />
                                                </TabsContent>
                                            </Tabs>
                                        </motion.div>
                                    </motion.div>
                                </Form>
                            );
                        }}
                    </Formik>
                ) : null}
            </div>
        </div>
    );
};

export default ArticleDetailPage;