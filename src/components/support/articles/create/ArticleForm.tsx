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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { showToast } from '@/components/global/showToast';
import { useArticleStore } from '@/store/article/article.store';
import {
    CreateArticleInput,
    DestinationBlock,
} from '@/types/article.types';
import { ArticleBasics } from './ArticleBasics';
import { DestinationBlockForm } from './DestinationBlockForm';
import { FaqForm } from './FaqForm';
import { SeoForm } from './SeoForm';
import { CreateArticleFormValues, createArticleSchema } from '@/utils/validators/article.create.validator';
import { playfair, inter } from '@/styles/fonts';
import { ARTICLE_TYPE, ARTICLE_STATUS, ArticleStatus } from '@/constants/article.const';
import { encodeId } from '@/utils/helpers/mongodb-id-conversions';
import { useState } from 'react';
import { TOUR_CATEGORIES } from '@/constants/tour.const';
import { DEFAULT_TOUR_ARTICLE } from '@/data/base-tour-articles';

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
        {
            value: 'content',
            label: 'Content',
            icon: <FileText className="w-4 h-4" />,
            description: 'Article basics and destination details',
        },
        {
            value: 'seo',
            label: 'SEO',
            icon: <Search className="w-4 h-4" />,
            description: 'Search engine optimization',
        },
        {
            value: 'faqs',
            label: 'FAQs',
            icon: <HelpCircle className="w-4 h-4" />,
            description: 'Frequently asked questions',
        },
        {
            value: 'settings',
            label: 'Settings',
            icon: <Settings className="w-4 h-4" />,
            description: 'Publishing options',
        },
    ];

    function findFirstError(err: unknown): string | undefined {
        if (!err) return undefined;
        if (typeof err === 'string') return err;
        if (Array.isArray(err)) {
            for (const item of err) {
                const found = findFirstError(item);
                if (found) return found;
            }
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

            // Prepare destinations data according to new structure
            const destinations: DestinationBlock[] = values.destinations.map(dest => ({
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

            const payload: CreateArticleInput = {
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
                    ARTICLE_TYPE.HISTORICAL_SITE
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
                    setFieldValue('status', ARTICLE_STATUS.DRAFT);
                    submitForm();
                };

                const handlePublish = async () => {
                    setFieldValue('status', ARTICLE_STATUS.PUBLISHED);
                    submitForm();
                };

                const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    resetForm();
                };

                return (
                    <Form className="space-y-6">
                        {/* Error Banner */}
                        <AnimatePresence>
                            {showBannerNow && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
                                    role="alert"
                                >
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className={`${inter.className} text-sm text-red-700`}>
                                            {bannerMessage}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        aria-label="Close error"
                                        onClick={() => {
                                            setShowBanner(false);
                                            if (error) clearError();
                                        }}
                                        className="inline-flex items-center justify-center rounded-md p-1 text-red-500 hover:bg-red-100"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Tab Navigation */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Tabs defaultValue="content" className="w-full">
                                <div className="relative">
                                    <TabsList className="flex overflow-x-auto border-b border-slate-200 bg-white rounded-t-lg">
                                        {tabs.map((tab) => (
                                            <TabsTrigger
                                                key={tab.value}
                                                value={tab.value}
                                                className={`${inter.className} relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-cyan-50`}
                                            >
                                                {tab.icon}
                                                {tab.label}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                {/* Content Tab */}
                                <TabsContent value="content" className="mt-0">
                                    <motion.div
                                        variants={tabVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="space-y-6"
                                    >
                                        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-blue-600" />
                                                    <CardTitle className={`${playfair.className} text-xl text-slate-900`}>
                                                        Article Basics
                                                    </CardTitle>
                                                </div>
                                                <p className={`${inter.className} text-xs text-slate-500 mt-1`}>
                                                    Start with the fundamentals of your article
                                                </p>
                                            </CardHeader>
                                            <CardContent className="pt-6">
                                                <ArticleBasics
                                                    values={values}
                                                    errors={errors}
                                                    touched={touched}
                                                    setFieldValue={setFieldValue}
                                                />
                                            </CardContent>
                                        </Card>

                                        {/* Destinations Section */}
                                        <AnimatePresence initial={false}>
                                            {requiresDestinations && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0, y: -20 }}
                                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                                    exit={{ opacity: 0, height: 0, y: -20 }}
                                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                >
                                                    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-amber-500">
                                                        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-slate-200">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <MapPin className="w-5 h-5 text-amber-600" />
                                                                    <CardTitle className={`${playfair.className} text-xl text-slate-900`}>
                                                                        Destinations
                                                                    </CardTitle>
                                                                </div>
                                                                <Badge
                                                                    className="bg-amber-100 text-amber-800 hover:bg-amber-100"
                                                                    variant="outline"
                                                                >
                                                                    Required
                                                                </Badge>
                                                            </div>
                                                            <p className={`${inter.className} text-xs text-slate-500 mt-1`}>
                                                                Add destinations and detailed information
                                                            </p>
                                                        </CardHeader>
                                                        <CardContent className="pt-6">
                                                            <DestinationBlockForm
                                                                values={values}
                                                                setFieldValue={setFieldValue}
                                                                errors={errors}
                                                                touched={touched}
                                                            />
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </TabsContent>

                                {/* SEO Tab */}
                                <TabsContent value="seo" className="mt-0">
                                    <motion.div
                                        variants={tabVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <Search className="w-5 h-5 text-blue-600" />
                                                    <CardTitle className={`${playfair.className} text-xl text-slate-900`}>
                                                        SEO Settings
                                                    </CardTitle>
                                                </div>
                                                <p className={`${inter.className} text-xs text-slate-500 mt-1`}>
                                                    Optimize for search engines
                                                </p>
                                            </CardHeader>
                                            <CardContent className="pt-6">
                                                <SeoForm
                                                    values={values}
                                                    setFieldValue={setFieldValue}
                                                    errors={(errors.seo ?? {}) as FormikErrors<CreateArticleFormValues['seo']>}
                                                    touched={(typeof touched.seo === 'object' && touched.seo !== null ? touched.seo : {}) as FormikTouched<CreateArticleFormValues['seo']>}
                                                />
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </TabsContent>

                                {/* FAQs Tab */}
                                <TabsContent value="faqs" className="mt-0">
                                    <motion.div
                                        variants={tabVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <HelpCircle className="w-5 h-5 text-blue-600" />
                                                    <CardTitle className={`${playfair.className} text-xl text-slate-900`}>
                                                        FAQs
                                                    </CardTitle>
                                                </div>
                                                <p className={`${inter.className} text-xs text-slate-500 mt-1`}>
                                                    Add frequently asked questions
                                                </p>
                                            </CardHeader>
                                            <CardContent className="pt-6">
                                                <FaqForm
                                                    values={values}
                                                    setFieldValue={setFieldValue}
                                                    errors={errors}
                                                    touched={touched}
                                                />
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </TabsContent>

                                {/* Settings Tab */}
                                <TabsContent value="settings" className="mt-0">
                                    <motion.div
                                        variants={tabVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <Settings className="w-5 h-5 text-blue-600" />
                                                    <CardTitle className={`${playfair.className} text-xl text-slate-900`}>
                                                        Publishing Options
                                                    </CardTitle>
                                                </div>
                                                <p className={`${inter.className} text-xs text-slate-500 mt-1`}>
                                                    Configure how your article is published
                                                </p>
                                            </CardHeader>
                                            <CardContent className="space-y-6 pt-6">
                                                {/* Comments Toggle */}
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    transition={{ type: 'spring', stiffness: 300 }}
                                                    className="flex items-center justify-between border border-slate-200 p-4 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 hover:shadow-sm transition-shadow"
                                                >
                                                    <div>
                                                        <div className={`${inter.className} text-sm font-semibold text-slate-900`}>
                                                            Allow Comments
                                                        </div>
                                                        <p className={`${inter.className} text-xs text-slate-500 mt-1`}>
                                                            Toggle to allow readers to comment on this article
                                                        </p>
                                                    </div>
                                                    <motion.input
                                                        type="checkbox"
                                                        checked={values.allowComments}
                                                        onChange={(e) => setFieldValue('allowComments', e.target.checked)}
                                                        className="w-5 h-5 cursor-pointer accent-blue-600"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    />
                                                </motion.div>

                                                {/* Status Information */}
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    transition={{ type: 'spring', stiffness: 300 }}
                                                    className="border border-slate-200 p-4 rounded-lg bg-gradient-to-r from-slate-50 to-amber-50 hover:shadow-sm transition-shadow"
                                                >
                                                    <div className={`${inter.className} text-sm font-semibold text-slate-900 mb-2`}>
                                                        Article Status
                                                    </div>
                                                    <p className={`${inter.className} text-xs text-slate-500`}>
                                                        Choose &quot;Save as Draft&quot; to save for later editing, or &quot;Publish&quot; to make the article live immediately.
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <Badge
                                                            variant="outline"
                                                            className={`${values.status === ARTICLE_STATUS.DRAFT ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}
                                                        >
                                                            {values.status === ARTICLE_STATUS.DRAFT ? 'Draft' : 'Published'}
                                                        </Badge>
                                                        <span className={`${inter.className} text-xs text-slate-500`}>
                                                            Current status: {values.status}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            </CardContent>

                                            {/* Footer Actions */}
                                            <CardFooter className="border-t border-slate-200 bg-slate-50 flex items-center justify-between pt-6">
                                                <div className="flex items-center gap-4">
                                                    {dirty && (
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className={`${inter.className} flex items-center gap-2 text-sm text-amber-600`}
                                                        >
                                                            <div className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                                                            Unsaved changes
                                                        </motion.div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <Button
                                                            type="button"
                                                            onClick={handleReset}
                                                            variant="outline"
                                                            disabled={isSubmitting || !dirty}
                                                            className={`${inter.className} flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200`}
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                            Reset
                                                        </Button>
                                                    </motion.div>

                                                    <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <Button
                                                            type="button"
                                                            onClick={() => handleSaveAsDraft()}
                                                            disabled={isSubmitting}
                                                            className={`${inter.className} flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200`}
                                                        >
                                                            {isSubmitting && submitType === ARTICLE_STATUS.DRAFT ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                    Saving as Draft...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Save className="w-4 h-4" />
                                                                    Save as Draft
                                                                </>
                                                            )}
                                                        </Button>
                                                    </motion.div>

                                                    <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <Button
                                                            type="button"
                                                            onClick={() => handlePublish()}
                                                            disabled={isSubmitting}
                                                            className={`${inter.className} flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200`}
                                                        >
                                                            {isSubmitting && submitType === ARTICLE_STATUS.PUBLISHED ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                    Publishing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Save className="w-4 h-4" />
                                                                    Publish
                                                                </>
                                                            )}
                                                        </Button>
                                                    </motion.div>
                                                </div>
                                            </CardFooter>
                                        </Card>
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