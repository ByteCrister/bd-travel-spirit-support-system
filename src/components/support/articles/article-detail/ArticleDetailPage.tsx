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
import { Button } from '@/components/ui/button';
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
} from '@/types/article/article.types';
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
// Design System Tokens — Neumorphism Club
// ---------------------
const NEU = {
    // Surface & Background
    page: 'min-h-screen bg-[#E7E5E4]',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6',

    // Neumorphic card (raised)
    card: [
        'rounded-2xl border-0',
        'bg-[#E7E5E4]',
        'shadow-[6px_6px_12px_#c8c6c4,_-6px_-6px_12px_#ffffff]',
    ].join(' '),

    // Neumorphic card (pressed/inset)
    cardInset: [
        'rounded-2xl border-0',
        'bg-[#E7E5E4]',
        'shadow-[inset_4px_4px_8px_#c8c6c4,_inset_-4px_-4px_8px_#ffffff]',
    ].join(' '),

    // Action bar inner container
    actionBar: [
        'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5',
        'p-5',
    ].join(' '),

    // Tab list wrapper (raised panel)
    tabList: [
        'grid w-full grid-cols-5 gap-1 h-auto p-1.5',
        'bg-[#E7E5E4]',
        'rounded-2xl',
        'shadow-[inset_3px_3px_6px_#c8c6c4,_inset_-3px_-3px_6px_#ffffff]',
    ].join(' '),

    // Active tab trigger (raised out of the inset surface)
    tabTriggerActive: [
        'bg-[#E7E5E4]',
        'shadow-[3px_3px_6px_#c8c6c4,_-3px_-3px_6px_#ffffff]',
        'text-[#006666]',
        'rounded-xl',
    ].join(' '),

    tabTriggerBase: [
        'relative flex items-center justify-center gap-2 px-3 py-2.5',
        'rounded-xl transition-all duration-200',
        'font-medium text-sm text-[#1E2938]',
        'hover:text-[#006666]',
    ].join(' '),

    // Typography
    fontMono: 'font-[var(--font-space-mono)]',
    fontData: 'font-[var(--font-jetbrains-mono)]',
    textPrimary: 'text-[#1E2938]',
    textMuted: 'text-[#1E2938]/60',
    textTeal: 'text-[#006666]',

    // Badges
    badgeBase: 'font-medium text-sm px-3 py-1 rounded-lg border-0 shadow-[2px_2px_4px_#c8c6c4,_-2px_-2px_4px_#ffffff] bg-[#E7E5E4]',

    // Status badge variants
    statusDraft: 'text-[#1E2938]/70',
    statusPublished: 'text-[#00A63D]',
    statusArchived: 'text-[#FE9900]',

    // Buttons — primary (teal, raised)
    btnPrimary: [
        'gap-2 rounded-xl border-0 px-5 py-2.5',
        'bg-[#006666] text-white',
        'shadow-[3px_3px_6px_#004d4d,_-2px_-2px_5px_#008080]',
        'hover:shadow-[1px_1px_3px_#004d4d,_-1px_-1px_3px_#008080]',
        'hover:translate-y-px',
        'active:shadow-[inset_2px_2px_4px_#004d4d,_inset_-2px_-2px_4px_#008080]',
        'transition-all duration-150',
        'font-[var(--font-space-mono)]',
    ].join(' '),

    // Buttons — secondary (surface, raised)
    btnSecondary: [
        'gap-2 rounded-xl border-0 px-5 py-2.5',
        'bg-[#E7E5E4] text-[#1E2938]',
        'shadow-[3px_3px_6px_#c8c6c4,_-3px_-3px_6px_#ffffff]',
        'hover:shadow-[1px_1px_3px_#c8c6c4,_-1px_-1px_3px_#ffffff]',
        'hover:text-[#006666] hover:translate-y-px',
        'active:shadow-[inset_2px_2px_4px_#c8c6c4,_inset_-2px_-2px_4px_#ffffff]',
        'transition-all duration-150',
        'font-[var(--font-space-mono)]',
    ].join(' '),

    // Buttons — success (green, raised)
    btnSuccess: [
        'gap-2 rounded-xl border-0 px-5 py-2.5',
        'bg-[#00A63D] text-white',
        'shadow-[3px_3px_6px_#007a2d,_-2px_-2px_5px_#00cc4a]',
        'hover:shadow-[1px_1px_3px_#007a2d,_-1px_-1px_3px_#00cc4a]',
        'hover:translate-y-px',
        'active:shadow-[inset_2px_2px_4px_#007a2d,_inset_-2px_-2px_4px_#00cc4a]',
        'transition-all duration-150',
        'font-[var(--font-space-mono)]',
    ].join(' '),

    // Buttons — danger (red, raised)
    btnDanger: [
        'gap-2 rounded-xl border-0 px-5 py-2.5',
        'bg-[#FF2157] text-white',
        'shadow-[3px_3px_6px_#cc1a46,_-2px_-2px_5px_#ff4d7a]',
        'hover:shadow-[1px_1px_3px_#cc1a46,_-1px_-1px_3px_#ff4d7a]',
        'hover:translate-y-px',
        'active:shadow-[inset_2px_2px_4px_#cc1a46,_inset_-2px_-2px_4px_#ff4d7a]',
        'transition-all duration-150',
        'font-[var(--font-space-mono)]',
    ].join(' '),

    // Buttons — restore (info/teal-light)
    btnRestore: [
        'gap-2 rounded-xl border-0 px-5 py-2.5',
        'bg-[#E7E5E4] text-[#006666]',
        'shadow-[3px_3px_6px_#c8c6c4,_-3px_-3px_6px_#ffffff]',
        'hover:shadow-[1px_1px_3px_#c8c6c4,_-1px_-1px_3px_#ffffff]',
        'hover:translate-y-px',
        'active:shadow-[inset_2px_2px_4px_#c8c6c4,_inset_-2px_-2px_4px_#ffffff]',
        'transition-all duration-150',
        'font-[var(--font-space-mono)]',
    ].join(' '),

    // Error state card
    errorCard: [
        'rounded-2xl border-0 p-6',
        'bg-[#E7E5E4]',
        'shadow-[6px_6px_12px_#c8c6c4,_-6px_-6px_12px_#ffffff]',
    ].join(' '),

    // Icon circle
    iconCircleDanger: [
        'h-11 w-11 rounded-full flex items-center justify-center',
        'bg-[#E7E5E4]',
        'shadow-[inset_3px_3px_6px_#c8c6c4,_inset_-3px_-3px_6px_#ffffff]',
    ].join(' '),
} as const;

// ---------------------
// Animation Variants
// ---------------------
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.05 }
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
        [ARTICLE_STATUS.DRAFT]: {
            dotColor: 'bg-[#1E2938]/40',
            textColor: NEU.statusDraft,
            label: 'Draft',
        },
        [ARTICLE_STATUS.PUBLISHED]: {
            dotColor: 'bg-[#00A63D]',
            textColor: NEU.statusPublished,
            label: 'Published',
        },
        [ARTICLE_STATUS.ARCHIVED]: {
            dotColor: 'bg-[#FE9900]',
            textColor: NEU.statusArchived,
            label: 'Archived',
        },
    };

    const config = statusConfig[status] || statusConfig[ARTICLE_STATUS.DRAFT];

    return (
        <span
            className={[
                NEU.badgeBase,
                'inline-flex items-center gap-2',
                config.textColor,
                NEU.fontMono,
                'text-xs tracking-wide uppercase',
            ].join(' ')}
        >
            <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${config.dotColor}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
            </span>
            {config.label}
        </span>
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

    useEffect(() => {
        if (articleId && !detail) {
            fetchArticleDetails(articleId as ID).catch(() => { });
        }
    }, [articleId, detail, fetchArticleDetails]);

    useEffect(() => {
        if (detail && !initialFormValues) {
            setInitialFormValues(mapDetailToFormValues(detail));
        }
    }, [detail, initialFormValues]);

    const handleRetry = useCallback(() => {
        clearError();
        if (articleId) {
            fetchArticleDetails(articleId as ID, true).catch(() => { });
        }
    }, [articleId, clearError, fetchArticleDetails]);

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
                highlights: dest.highlights.filter((h): h is string => typeof h === 'string'),
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
                localTips: dest.localTips.filter((t): t is string => typeof t === 'string'),
                transportOptions: dest.transportOptions.filter((t): t is string => typeof t === 'string'),
                accommodationTips: dest.accommodationTips.filter((t): t is string => typeof t === 'string'),
                coordinates: { lat: dest.coordinates.lat, lng: dest.coordinates.lng },
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
                categories: values.categories.filter((c): c is TOUR_CATEGORIES => Boolean(c)),
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
                    setInitialFormValues(mapDetailToFormValues(res.article));
                    formikHelpers.resetForm(mapDetailToFormValues(res.article));
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

    const handleRestore = useCallback(async () => {
        if (!detail) return;
        setIsSaving(true);
        try {
            const res = await restoreArticle({ id: detail.id });
            if (res.success) {
                showToast.success('Article restored', 'The article has been restored from archived.');
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

    const getStatusToggleConfig = useCallback((currentStatus: ArticleStatus) => {
        if (currentStatus === ARTICLE_STATUS.DRAFT) {
            return { label: 'Publish', newStatus: ARTICLE_STATUS.PUBLISHED, variant: 'success' as const, icon: FiEye };
        } else if (currentStatus === ARTICLE_STATUS.PUBLISHED) {
            return { label: 'Revert to Draft', newStatus: ARTICLE_STATUS.DRAFT, variant: 'outline' as const, icon: FiRotateCw };
        }
        return null;
    }, []);

    const isLoading = loading.isLoadingDetail && !detail;
    const isArchived = detail?.status === ARTICLE_STATUS.ARCHIVED;
    const statusToggleConfig = detail ? getStatusToggleConfig(detail.status) : null;

    const breadcrumbItems = useMemo(
        () => [
            { label: 'Home', href: '/' },
            { label: 'Articles', href: '/support/articles' },
            {
                label: detail?.title ?? '-',
                href: `/support/articles/${detail?.id ? encodeId(encodeURIComponent(detail.id)) : ''}`,
            },
        ],
        [detail?.id, detail?.title]
    );

    return (
        <div className={NEU.page}>
            <Breadcrumbs items={breadcrumbItems} />

            <div className={NEU.container}>

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
                        <div className={NEU.errorCard}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={NEU.iconCircleDanger}>
                                        <FiAlertCircle className="h-5 w-5 text-[#FF2157]" />
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold text-sm ${NEU.textPrimary} ${NEU.fontMono}`}>
                                            Error loading article
                                        </h3>
                                        <p className={`text-xs mt-0.5 ${NEU.textMuted} ${NEU.fontData}`}>{error}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={handleRetry}
                                    className={NEU.btnSecondary}
                                >
                                    <FiRotateCw className="h-4 w-4" />
                                    Retry
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Main Content */}
                {detail && initialFormValues ? (
                    <Formik
                        key={detail.id}
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

                            const handleStatusToggle = async () => {
                                if (!statusToggleConfig || isSaving) return;
                                await setFieldValue('status', statusToggleConfig.newStatus);
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
                                        {/* ── Action Bar ── */}
                                        <motion.div variants={itemVariants}>
                                            <div className={`${NEU.card} p-5`}>
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">

                                                    {/* Left — meta info */}
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
                                                        <StatusBadge status={detail.status} />

                                                        {/* Article type */}
                                                        <span className={[
                                                            NEU.badgeBase,
                                                            NEU.fontMono,
                                                            NEU.textPrimary,
                                                            'text-xs uppercase tracking-wide',
                                                        ].join(' ')}>
                                                            {detail.articleType}
                                                        </span>

                                                        {/* Slug */}
                                                        <span className={[
                                                            NEU.badgeBase,
                                                            NEU.fontData,
                                                            NEU.textTeal,
                                                            'text-xs flex items-center gap-1.5',
                                                        ].join(' ')}>
                                                            <FiLink className="h-3 w-3 shrink-0" />
                                                            {detail.slug || 'No slug'}
                                                        </span>

                                                        {/* Updated at */}
                                                        <span className={`flex items-center gap-2 text-xs ${NEU.textMuted} ${NEU.fontData}`}>
                                                            <FiCalendar className="h-3.5 w-3.5 shrink-0 text-[#006666]" />
                                                            {new Date(detail.updatedAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    </div>

                                                    {/* Right — actions */}
                                                    <div className="flex items-center gap-3 w-full sm:w-auto">

                                                        {/* Draft / Published controls */}
                                                        {!isArchived && (
                                                            <>
                                                                {statusToggleConfig && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        onClick={handleStatusToggle}
                                                                        disabled={isSaving}
                                                                        className={[
                                                                            'flex-1 sm:flex-initial',
                                                                            statusToggleConfig.variant === 'success'
                                                                                ? NEU.btnSuccess
                                                                                : NEU.btnSecondary,
                                                                            isSaving ? 'opacity-60 cursor-not-allowed' : '',
                                                                        ].join(' ')}
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

                                                                {/* Save — shown only when form is dirty */}
                                                                {dirty && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        onClick={handleSafeSubmit}
                                                                        disabled={isSubmitting || isSaving}
                                                                        className={[
                                                                            NEU.btnPrimary,
                                                                            'flex-1 sm:flex-initial',
                                                                            (isSubmitting || isSaving) ? 'opacity-60 cursor-not-allowed' : '',
                                                                        ].join(' ')}
                                                                    >
                                                                        {isSaving ? (
                                                                            <>
                                                                                <FiRotateCw className="h-4 w-4 animate-spin" />
                                                                                Saving…
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

                                                        {/* Archived — restore */}
                                                        {isArchived && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                onClick={handleRestore}
                                                                disabled={isSaving}
                                                                className={[
                                                                    NEU.btnRestore,
                                                                    'flex-1 sm:flex-initial',
                                                                    isSaving ? 'opacity-60 cursor-not-allowed' : '',
                                                                ].join(' ')}
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

                                                        {/* Delete / Archive — not shown for archived */}
                                                        {!isArchived && (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        className={NEU.btnDanger}
                                                                    >
                                                                        <FiTrash2 className="h-4 w-4" />
                                                                        <span className="hidden sm:inline">Delete</span>
                                                                    </Button>
                                                                </AlertDialogTrigger>

                                                                <AlertDialogContent className="max-w-md rounded-2xl border-0 bg-[#E7E5E4] shadow-[8px_8px_20px_#c8c6c4,_-8px_-8px_20px_#ffffff]">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className={`flex items-center gap-2 text-base font-semibold ${NEU.textPrimary} ${NEU.fontMono}`}>
                                                                            <FiAlertCircle className="h-5 w-5 text-[#FF2157]" />
                                                                            {isArchived
                                                                                ? 'Delete this article permanently?'
                                                                                : 'Delete this article?'}
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription className={`text-sm pt-2 ${NEU.textMuted} ${NEU.fontData}`}>
                                                                            {isArchived
                                                                                ? <>
                                                                                    This action cannot be undone. This will permanently delete{' '}
                                                                                    <span className={`font-semibold ${NEU.textPrimary}`}>&quot;{detail.title}&quot;</span>{' '}
                                                                                    and remove all associated data.
                                                                                </>
                                                                                : 'This action will move the article to archived status. You can restore it later from the archives.'}
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel className={NEU.btnSecondary}>
                                                                            Cancel
                                                                        </AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            className={NEU.btnDanger}
                                                                            onClick={handleDelete}
                                                                        >
                                                                            <FiTrash2 className="h-4 w-4" />
                                                                            {isArchived ? 'Delete Permanently' : 'Archive'}
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* ── Tabs ── */}
                                        <motion.div variants={itemVariants}>
                                            <Tabs
                                                value={activeTab}
                                                onValueChange={setActiveTab}
                                                className="space-y-6"
                                            >
                                                {/* Tab strip */}
                                                <div className={`${NEU.card} p-2`}>
                                                    <TabsList className={NEU.tabList}>
                                                        {TAB_CONFIG.map((tab) => {
                                                            const Icon = tab.icon;
                                                            const isActive = activeTab === tab.value;

                                                            return (
                                                                <TabsTrigger
                                                                    key={tab.value}
                                                                    value={tab.value}
                                                                    disabled={isArchived}
                                                                    className={[
                                                                        NEU.tabTriggerBase,
                                                                        isActive ? NEU.tabTriggerActive : '',
                                                                        isArchived ? 'opacity-40 cursor-not-allowed' : '',
                                                                    ].join(' ')}
                                                                >
                                                                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#006666]' : 'text-[#1E2938]/50'}`} />
                                                                    <span className={`hidden sm:inline ${NEU.fontMono} text-xs tracking-wide`}>
                                                                        {tab.label}
                                                                    </span>

                                                                    {isActive && (
                                                                        <motion.div
                                                                            layoutId="activeTab"
                                                                            className="absolute inset-0 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c4,_-3px_-3px_6px_#ffffff] -z-10"
                                                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                                        />
                                                                    )}
                                                                </TabsTrigger>
                                                            );
                                                        })}
                                                    </TabsList>
                                                </div>

                                                {/* Tab panels */}
                                                <TabsContent
                                                    value="overview"
                                                    className={activeTab !== 'overview' ? 'hidden' : ''}
                                                >
                                                    <OverviewSection />
                                                </TabsContent>

                                                <TabsContent
                                                    value="content"
                                                    className={activeTab !== 'content' ? 'hidden' : ''}
                                                >
                                                    <ContentSection />
                                                </TabsContent>

                                                <TabsContent
                                                    value="seo"
                                                    className={activeTab !== 'seo' ? 'hidden' : ''}
                                                >
                                                    <SeoSection />
                                                </TabsContent>

                                                <TabsContent
                                                    value="faqs"
                                                    className={activeTab !== 'faqs' ? 'hidden' : ''}
                                                >
                                                    <FaqsSection />
                                                </TabsContent>

                                                <TabsContent
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