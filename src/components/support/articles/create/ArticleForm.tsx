'use client';

import { useRouter } from 'next/navigation';
import { Formik, Form, FormikErrors, FormikTouched } from 'formik';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Settings,
    HelpCircle,
    FileText,
    MapPin,
    Search,
    Save,
    RotateCcw,
    Loader2,
    AlertCircle,
    X,
} from 'lucide-react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { showToast } from '@/components/global/showToast';
import { useArticleStore } from '@/store/article/article.store';
import { CreateArticleInput, DestinationBlock } from '@/types/article/article.types';
import { ArticleBasics } from './ArticleBasics';
import { DestinationBlockForm } from './DestinationBlockForm';
import { FaqForm } from './FaqForm';
import { SeoForm } from './SeoForm';
import { CreateArticleFormValues, createArticleSchema } from '@/utils/validators/article.create.validator';
import { spaceMono, jetbrainsMono } from '@/styles/fonts';
import { ARTICLE_TYPE, ARTICLE_STATUS, ArticleStatus } from '@/constants/article.const';
import { encodeId } from '@/utils/helpers/mongodb-id-conversions';
import { useState } from 'react';
import { TOUR_CATEGORIES } from '@/constants/tour.const';
import { DEFAULT_TOUR_ARTICLE } from '@/data/base-tour-articles';

// ---------------------
// Design System Tokens — Neumorphism Club
// ---------------------
const NEU = {
    // Cards — raised
    card: [
        'rounded-2xl border-0',
        'bg-[#E7E5E4]',
        'shadow-[6px_6px_12px_#c8c6c4,_-6px_-6px_12px_#ffffff]',
    ].join(' '),
    // Card header — subtle inset band
    cardHeader: [
        'rounded-t-2xl px-6 py-5',
        'bg-[#E7E5E4]',
        'shadow-[inset_0_-3px_6px_#d0cecc,_inset_0_2px_4px_#f5f4f2]',
    ].join(' '),
    cardContent: 'px-6 py-6',
    cardFooter: [
        'px-6 py-5 rounded-b-2xl',
        'bg-[#E7E5E4]',
        'shadow-[inset_0_3px_6px_#d0cecc,_inset_0_-2px_4px_#f5f4f2]',
        'flex items-center justify-between',
    ].join(' '),
    // Tab strip
    tabList: [
        'flex overflow-x-auto h-auto p-1.5 gap-1',
        'bg-[#E7E5E4] rounded-2xl border-0',
        'shadow-[inset_3px_3px_6px_#c8c6c4,_inset_-3px_-3px_6px_#ffffff]',
    ].join(' '),
    tabTriggerBase: [
        'relative flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap',
        'text-xs font-medium text-[#1E2938]/60',
        'transition-all duration-200',
        'hover:text-[#006666]',
    ].join(' '),
    tabTriggerActive: [
        'text-[#006666]',
        'shadow-[3px_3px_6px_#c8c6c4,_-3px_-3px_6px_#ffffff]',
        'bg-[#E7E5E4]',
    ].join(' '),
    // Icon container
    iconWrap: [
        'h-9 w-9 rounded-xl flex items-center justify-center shrink-0',
        'bg-[#E7E5E4]',
        'shadow-[inset_3px_3px_5px_#c8c6c4,_inset_-3px_-3px_5px_#ffffff]',
    ].join(' '),
    // Error banner
    errorBanner: [
        'flex items-start justify-between gap-3 rounded-2xl p-4',
        'bg-[#E7E5E4]',
        'shadow-[inset_3px_3px_6px_#c8c6c4,_inset_-3px_-3px_6px_#ffffff]',
        'border-l-4 border-[#FF2157]',
    ].join(' '),
    // Buttons
    btnPrimary: [
        'gap-2 rounded-xl border-0 px-5 py-2.5',
        'bg-[#006666] text-white',
        'shadow-[3px_3px_6px_#004d4d,_-2px_-2px_5px_#008080]',
        'hover:shadow-[1px_1px_3px_#004d4d,_-1px_-1px_3px_#008080] hover:translate-y-px',
        'active:shadow-[inset_2px_2px_4px_#004d4d,_inset_-2px_-2px_4px_#008080]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-all duration-150',
    ].join(' '),
    btnSuccess: [
        'gap-2 rounded-xl border-0 px-5 py-2.5',
        'bg-[#00A63D] text-white',
        'shadow-[3px_3px_6px_#007a2d,_-2px_-2px_5px_#00cc4a]',
        'hover:shadow-[1px_1px_3px_#007a2d,_-1px_-1px_3px_#00cc4a] hover:translate-y-px',
        'active:shadow-[inset_2px_2px_4px_#007a2d,_inset_-2px_-2px_4px_#00cc4a]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-all duration-150',
    ].join(' '),
    btnSecondary: [
        'gap-2 rounded-xl border-0 px-5 py-2.5',
        'bg-[#E7E5E4] text-[#1E2938]',
        'shadow-[3px_3px_6px_#c8c6c4,_-3px_-3px_6px_#ffffff]',
        'hover:shadow-[1px_1px_3px_#c8c6c4,_-1px_-1px_3px_#ffffff] hover:text-[#006666] hover:translate-y-px',
        'active:shadow-[inset_2px_2px_4px_#c8c6c4,_inset_-2px_-2px_4px_#ffffff]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'transition-all duration-150',
    ].join(' '),
    // Amber destination card accent
    destCard: [
        'rounded-2xl border-0 border-l-4 border-[#FE9900]',
        'bg-[#E7E5E4]',
        'shadow-[6px_6px_12px_#c8c6c4,_-6px_-6px_12px_#ffffff]',
    ].join(' '),
    // Typography
    fontMono: spaceMono.className,
    fontData: jetbrainsMono.className,
    textPrimary: 'text-[#1E2938]',
    textMuted: 'text-[#1E2938]/60',
    textTeal: 'text-[#006666]',
    textAmber: 'text-[#FE9900]',
    textDanger: 'text-[#FF2157]',
    // Status badge
    badgeBase: [
        'inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium',
        'bg-[#E7E5E4]',
        'shadow-[2px_2px_4px_#c8c6c4,_-2px_-2px_4px_#ffffff]',
    ].join(' '),
} as const;

interface TabConfig {
    value: string;
    label: string;
    icon: React.ReactNode;
    description: string;
}

const initialValues: CreateArticleFormValues = DEFAULT_TOUR_ARTICLE;

export function ArticleForm() {
    const router = useRouter();
    const { createArticle, error, clearError } = useArticleStore();
    const [showBanner, setShowBanner] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitType, setSubmitType] = useState<ArticleStatus | null>(null);

    const tabs: TabConfig[] = [
        { value: 'content', label: 'Content', icon: <FileText className="w-4 h-4" />, description: 'Article basics and destination details' },
        { value: 'seo', label: 'SEO', icon: <Search className="w-4 h-4" />, description: 'Search engine optimization' },
        { value: 'faqs', label: 'FAQs', icon: <HelpCircle className="w-4 h-4" />, description: 'Frequently asked questions' },
        { value: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, description: 'Publishing options' },
    ];

    function findFirstError(err: unknown): string | undefined {
        if (!err) return undefined;
        if (typeof err === 'string') return err;
        if (Array.isArray(err)) {
            for (const item of err) { const found = findFirstError(item); if (found) return found; }
        } else if (typeof err === 'object' && err !== null) {
            for (const key of Object.keys(err)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const found = findFirstError((err as any)[key]);
                if (found) return found;
            }
        }
        return undefined;
    }

    const handleSubmit = async (values: CreateArticleFormValues) => {
        try {
            clearError();
            setIsSubmitting(true);

            const destinations: DestinationBlock[] = values.destinations.map(dest => ({
                division: dest.division,
                district: dest.district,
                area: dest.area || undefined,
                description: dest.description,
                content: dest.content.map(block => ({ type: block.type, text: block.text || undefined, href: block.href || undefined })),
                highlights: dest.highlights.filter((h): h is string => typeof h === 'string'),
                foodRecommendations: dest.foodRecommendations.map(food => ({
                    dishName: food.dishName, description: food.description,
                    bestPlaceToTry: food.bestPlaceToTry || undefined,
                    approximatePrice: food.approximatePrice || undefined,
                    spiceLevel: food.spiceLevel || undefined,
                })),
                localFestivals: dest.localFestivals.map(festival => ({
                    name: festival.name, description: festival.description,
                    timeOfYear: festival.timeOfYear, location: festival.location,
                    significance: festival.significance || undefined,
                })),
                localTips: dest.localTips.filter((t): t is string => typeof t === 'string'),
                transportOptions: dest.transportOptions.filter((t): t is string => typeof t === 'string'),
                accommodationTips: dest.accommodationTips.filter((t): t is string => typeof t === 'string'),
                coordinates: { lat: dest.coordinates.lat, lng: dest.coordinates.lng },
                imageAsset: dest.imageAsset,
            }));

            const payload: CreateArticleInput = {
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
                seo: { metaTitle: values.seo.metaTitle, metaDescription: values.seo.metaDescription, ogImage: values.seo.ogImage || undefined },
                faqs: values.faqs.map(faq => ({ question: faq.question, answer: faq.answer, category: faq.category || undefined })),
                allowComments: values.allowComments,
            };

            const result = await createArticle(payload);
            if (result.success && result.article) {
                const action = values.status === ARTICLE_STATUS.PUBLISHED ? 'published' : 'saved as draft';
                showToast.info(`Article ${action}`, 'Redirecting to details...');
                router.push(`/support/articles/${encodeId(encodeURIComponent(result.article.id))}`);
            } else {
                showToast.error('Failed to create', result.message ?? 'Unknown error');
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            showToast.error('Error', 'Unexpected error occurred');
        } finally {
            setIsSubmitting(false);
            setSubmitType(null);
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={createArticleSchema}
            onSubmit={handleSubmit}
            validateOnChange
            validateOnBlur
        >
            {({ values, errors, touched, setFieldValue, dirty, submitForm, resetForm }) => {
                const requiresDestinations = [
                    ARTICLE_TYPE.SINGLE_DESTINATION,
                    ARTICLE_TYPE.MULTI_DESTINATION,
                    ARTICLE_TYPE.CITY_GUIDE,
                    ARTICLE_TYPE.HILL_STATION,
                    ARTICLE_TYPE.BEACH_DESTINATION,
                    ARTICLE_TYPE.HISTORICAL_SITE,
                ].includes(values.articleType as ARTICLE_TYPE);

                const firstFormError = findFirstError(errors);
                const bannerMessage = error ?? firstFormError;
                const showBannerNow = Boolean(bannerMessage) && showBanner;

                const tabVariants = {
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
                };

                const handleSaveAsDraft = async () => {
                    setSubmitType(ARTICLE_STATUS.DRAFT);
                    setFieldValue('status', ARTICLE_STATUS.DRAFT);
                    submitForm();
                };

                const handlePublish = async () => {
                    setSubmitType(ARTICLE_STATUS.PUBLISHED);
                    setFieldValue('status', ARTICLE_STATUS.PUBLISHED);
                    submitForm();
                };

                const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    resetForm();
                };

                return (
                    <Form className="space-y-6">

                        {/* ── Error Banner ── */}
                        <AnimatePresence>
                            {showBannerNow && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={NEU.errorBanner}
                                    role="alert"
                                >
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className={`w-5 h-5 ${NEU.textDanger} shrink-0 mt-0.5`} />
                                        <p className={`${NEU.fontData} text-sm ${NEU.textPrimary}`}>{bannerMessage}</p>
                                    </div>
                                    <button
                                        type="button"
                                        aria-label="Close error"
                                        onClick={() => { setShowBanner(false); if (error) clearError(); }}
                                        className={`p-1.5 rounded-lg ${NEU.textMuted} hover:${NEU.textDanger} transition-colors`}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Tab Navigation ── */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <Tabs defaultValue="content" className="w-full space-y-6">

                                {/* Tab strip */}
                                <div className={`${NEU.card} p-2`}>
                                    <TabsList className={NEU.tabList}>
                                        {tabs.map((tab) => (
                                            <TabsTrigger
                                                key={tab.value}
                                                value={tab.value}
                                                className={`${NEU.tabTriggerBase} data-[state=active]:${NEU.tabTriggerActive} ${NEU.fontMono}`}
                                            >
                                                {tab.icon}
                                                {tab.label}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                {/* ── Content Tab ── */}
                                <TabsContent value="content" className="mt-0">
                                    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">

                                        {/* Article Basics Card */}
                                        <div className={NEU.card}>
                                            <div className={NEU.cardHeader}>
                                                <div className="flex items-center gap-3">
                                                    <div className={NEU.iconWrap}>
                                                        <FileText className={`w-4 h-4 ${NEU.textTeal}`} />
                                                    </div>
                                                    <div>
                                                        <h2 className={`${NEU.fontMono} text-base font-bold ${NEU.textPrimary} tracking-tight`}>
                                                            Article Basics
                                                        </h2>
                                                        <p className={`${NEU.fontData} text-xs ${NEU.textMuted} mt-0.5`}>
                                                            Start with the fundamentals of your article
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={NEU.cardContent}>
                                                <ArticleBasics
                                                    values={values}
                                                    errors={errors}
                                                    touched={touched}
                                                    setFieldValue={setFieldValue}
                                                />
                                            </div>
                                        </div>

                                        {/* Destinations Card — conditional */}
                                        <AnimatePresence initial={false}>
                                            {requiresDestinations && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0, y: -20 }}
                                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                                    exit={{ opacity: 0, height: 0, y: -20 }}
                                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                >
                                                    <div className={NEU.destCard}>
                                                        <div className={`${NEU.cardHeader} rounded-tl-2xl rounded-tr-2xl`}>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={NEU.iconWrap}>
                                                                        <MapPin className={`w-4 h-4 ${NEU.textAmber}`} />
                                                                    </div>
                                                                    <div>
                                                                        <h2 className={`${NEU.fontMono} text-base font-bold ${NEU.textPrimary} tracking-tight`}>
                                                                            Destinations
                                                                        </h2>
                                                                        <p className={`${NEU.fontData} text-xs ${NEU.textMuted} mt-0.5`}>
                                                                            Add destinations and detailed information
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <span className={`${NEU.badgeBase} ${NEU.fontMono} ${NEU.textAmber} text-xs uppercase tracking-wide`}>
                                                                    Required
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className={NEU.cardContent}>
                                                            <DestinationBlockForm
                                                                values={values}
                                                                setFieldValue={setFieldValue}
                                                                errors={errors}
                                                                touched={touched}
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </TabsContent>

                                {/* ── SEO Tab ── */}
                                <TabsContent value="seo" className="mt-0">
                                    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                                        <div className={NEU.card}>
                                            <div className={NEU.cardHeader}>
                                                <div className="flex items-center gap-3">
                                                    <div className={NEU.iconWrap}>
                                                        <Search className={`w-4 h-4 ${NEU.textTeal}`} />
                                                    </div>
                                                    <div>
                                                        <h2 className={`${NEU.fontMono} text-base font-bold ${NEU.textPrimary} tracking-tight`}>
                                                            SEO Settings
                                                        </h2>
                                                        <p className={`${NEU.fontData} text-xs ${NEU.textMuted} mt-0.5`}>
                                                            Optimize for search engines
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={NEU.cardContent}>
                                                <SeoForm
                                                    values={values}
                                                    setFieldValue={setFieldValue}
                                                    errors={(errors.seo ?? {}) as FormikErrors<CreateArticleFormValues['seo']>}
                                                    touched={(typeof touched.seo === 'object' && touched.seo !== null ? touched.seo : {}) as FormikTouched<CreateArticleFormValues['seo']>}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                </TabsContent>

                                {/* ── FAQs Tab ── */}
                                <TabsContent value="faqs" className="mt-0">
                                    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                                        <div className={NEU.card}>
                                            <div className={NEU.cardHeader}>
                                                <div className="flex items-center gap-3">
                                                    <div className={NEU.iconWrap}>
                                                        <HelpCircle className={`w-4 h-4 ${NEU.textTeal}`} />
                                                    </div>
                                                    <div>
                                                        <h2 className={`${NEU.fontMono} text-base font-bold ${NEU.textPrimary} tracking-tight`}>
                                                            FAQs
                                                        </h2>
                                                        <p className={`${NEU.fontData} text-xs ${NEU.textMuted} mt-0.5`}>
                                                            Add frequently asked questions
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={NEU.cardContent}>
                                                <FaqForm
                                                    values={values}
                                                    setFieldValue={setFieldValue}
                                                    errors={errors}
                                                    touched={touched}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                </TabsContent>

                                {/* ── Settings Tab ── */}
                                <TabsContent value="settings" className="mt-0">
                                    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                                        <div className={NEU.card}>
                                            <div className={NEU.cardHeader}>
                                                <div className="flex items-center gap-3">
                                                    <div className={NEU.iconWrap}>
                                                        <Settings className={`w-4 h-4 ${NEU.textTeal}`} />
                                                    </div>
                                                    <div>
                                                        <h2 className={`${NEU.fontMono} text-base font-bold ${NEU.textPrimary} tracking-tight`}>
                                                            Publishing Options
                                                        </h2>
                                                        <p className={`${NEU.fontData} text-xs ${NEU.textMuted} mt-0.5`}>
                                                            Configure how your article is published
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`${NEU.cardContent} space-y-4`}>
                                                {/* Allow Comments */}
                                                <motion.div
                                                    whileHover={{ scale: 1.01 }}
                                                    transition={{ type: 'spring', stiffness: 300 }}
                                                    className={[
                                                        'flex items-center justify-between p-4 rounded-xl',
                                                        'bg-[#E7E5E4] shadow-[inset_3px_3px_6px_#c8c6c4,_inset_-3px_-3px_6px_#ffffff]',
                                                    ].join(' ')}
                                                >
                                                    <div>
                                                        <p className={`${NEU.fontMono} text-sm font-semibold ${NEU.textPrimary}`}>
                                                            Allow Comments
                                                        </p>
                                                        <p className={`${NEU.fontData} text-xs ${NEU.textMuted} mt-1`}>
                                                            Toggle to allow readers to comment on this article
                                                        </p>
                                                    </div>
                                                    <motion.input
                                                        type="checkbox"
                                                        checked={values.allowComments}
                                                        onChange={(e) => setFieldValue('allowComments', e.target.checked)}
                                                        className="w-5 h-5 cursor-pointer accent-[#006666]"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    />
                                                </motion.div>

                                                {/* Status Info */}
                                                <motion.div
                                                    whileHover={{ scale: 1.01 }}
                                                    transition={{ type: 'spring', stiffness: 300 }}
                                                    className={[
                                                        'p-4 rounded-xl',
                                                        'bg-[#E7E5E4] shadow-[inset_3px_3px_6px_#c8c6c4,_inset_-3px_-3px_6px_#ffffff]',
                                                    ].join(' ')}
                                                >
                                                    <p className={`${NEU.fontMono} text-sm font-semibold ${NEU.textPrimary} mb-2`}>
                                                        Article Status
                                                    </p>
                                                    <p className={`${NEU.fontData} text-xs ${NEU.textMuted}`}>
                                                        Choose &quot;Save as Draft&quot; to save for later editing, or &quot;Publish&quot; to make it live immediately.
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <span className={[
                                                            NEU.badgeBase,
                                                            NEU.fontMono,
                                                            values.status === ARTICLE_STATUS.DRAFT ? 'text-[#1E2938]/70' : 'text-[#00A63D]',
                                                            'text-xs uppercase tracking-wide',
                                                        ].join(' ')}>
                                                            {values.status === ARTICLE_STATUS.DRAFT ? 'Draft' : 'Published'}
                                                        </span>
                                                        <span className={`${NEU.fontData} text-xs ${NEU.textMuted}`}>
                                                            Current status
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            </div>

                                            {/* Footer Actions */}
                                            <div className={NEU.cardFooter}>
                                                <div className="flex items-center gap-4">
                                                    {dirty && (
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className={`${NEU.fontData} flex items-center gap-2 text-xs text-[#FE9900]`}
                                                        >
                                                            <span className="w-2 h-2 rounded-full bg-[#FE9900] animate-pulse" />
                                                            Unsaved changes
                                                        </motion.div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <Button
                                                        type="button"
                                                        onClick={handleReset}
                                                        variant="ghost"
                                                        disabled={isSubmitting || !dirty}
                                                        className={`${NEU.btnSecondary} ${NEU.fontMono} text-sm`}
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                        Reset
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        onClick={handleSaveAsDraft}
                                                        disabled={isSubmitting}
                                                        variant="ghost"
                                                        className={`${NEU.btnPrimary} ${NEU.fontMono} text-sm`}
                                                    >
                                                        {isSubmitting && submitType === ARTICLE_STATUS.DRAFT ? (
                                                            <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                                                        ) : (
                                                            <><Save className="w-4 h-4" />Save as Draft</>
                                                        )}
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        onClick={handlePublish}
                                                        disabled={isSubmitting}
                                                        variant="ghost"
                                                        className={`${NEU.btnSuccess} ${NEU.fontMono} text-sm`}
                                                    >
                                                        {isSubmitting && submitType === ARTICLE_STATUS.PUBLISHED ? (
                                                            <><Loader2 className="w-4 h-4 animate-spin" />Publishing…</>
                                                        ) : (
                                                            <><Save className="w-4 h-4" />Publish</>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    </Form>
                );
            }}
        </Formik>
    );
}