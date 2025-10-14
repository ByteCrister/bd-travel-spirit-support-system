// app/articles/create/ArticleForm.tsx
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
} from 'lucide-react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { showToast } from '@/components/global/showToast';
import { useArticleStore } from '@/store/useArticleStore';
import {
    CreateArticleInput,
} from '@/types/article.types';
import { ArticleBasics } from './ArticleBasics';
import { DestinationBlockForm } from './DestinationBlockForm';
import { FaqForm } from './FaqForm';
import { SeoForm } from './SeoForm';
import { CreateArticleFormValues, createArticleSchema } from '@/utils/validators/article.create.validator';
import { playfair, inter } from '@/styles/fonts';
import { ARTICLE_STATUS, ARTICLE_TYPE } from '@/constants/article.const';
import { TRAVEL_TYPE } from '@/constants/tour.const';

interface TabConfig {
    value: string;
    label: string;
    icon: React.ReactNode;
    description: string;
}

export function ArticleForm() {
    const router = useRouter();
    const { createArticle, error, clearError } = useArticleStore();

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

    const initialValues: CreateArticleFormValues = {
        title: '',
        slug: '',
        status: ARTICLE_STATUS.DRAFT,
        articleType: ARTICLE_TYPE.SINGLE_DESTINATION,
        authorBio: '',
        summary: '',
        heroImage: null,
        destinations: [],
        categories: [],
        tags: [],
        seo: { metaTitle: '', metaDescription: '', ogImage: null },
        faqs: [],
        allowComments: true,
    };

    const handleSubmit = async (values: CreateArticleFormValues) => {
        try {
            clearError();
            const payload: CreateArticleInput = {
                ...values,
                heroImage: values.heroImage ?? null,
                destinations: values.destinations?.length
                    ? values.destinations.map(dest => ({
                        ...dest,
                        region: dest.region ?? undefined,
                        content: dest.content?.map(block => ({
                            ...block,
                            text: block.text ?? undefined,
                            href: block.href ?? undefined,
                        })) ?? [],
                        attractions: dest.attractions?.map(a => ({
                            ...a,
                            bestFor: a.bestFor ?? undefined,
                            insiderTip: a.insiderTip ?? undefined,
                            address: a.address ?? undefined,
                            openingHours: a.openingHours ?? undefined,
                            coordinates: a.coordinates ?? undefined,
                            images: a.images?.filter((img): img is string => !!img) ?? [],
                        })) ?? [],
                        activities: dest.activities?.map(a => ({
                            ...a,
                            url: a.url ?? undefined,
                            provider: a.provider ?? undefined,
                            duration: a.duration ?? undefined,
                            price: a.price ?? undefined,
                            rating: a.rating ?? undefined,
                        })) ?? [],
                        highlights: dest.highlights?.filter((h): h is string => !!h) ?? [],
                        images: dest.images?.filter((img): img is string => !!img) ?? [],
                    }))
                    : undefined,
                categories: values.categories?.filter((c): c is TRAVEL_TYPE => Boolean(c))?.length
                    ? values.categories.filter((c): c is TRAVEL_TYPE => Boolean(c))
                    : undefined,
                tags: values.tags?.filter(Boolean).length
                    ? values.tags.filter((t): t is string => Boolean(t))
                    : undefined,
                seo: values.seo ?? undefined,
                allowComments: values.allowComments ?? true,
            };

            const result = await createArticle(payload);
            if (result.success && result.article) {
                showToast.info('Article created', 'Redirecting to details...');
                router.push(`/articles/${result.article.id}`);
            } else {
                showToast.error('Failed to create', result.message ?? 'Unknown error');
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            showToast.error('Error', 'Unexpected error occurred');
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
            {({ values, errors, touched, isSubmitting, setFieldValue, isValid, dirty }) => {
                const requiresDestinations =
                    values.articleType === ARTICLE_TYPE.SINGLE_DESTINATION ||
                    values.articleType === ARTICLE_TYPE.MULTI_DESTINATION;

                const tabVariants = {
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
                };

                return (
                    <Form className="space-y-6">
                        {/* Error Banner */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <p className={`${inter.className} text-sm text-red-700`}>{error}</p>
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
                                                {/* Publishing Date */}
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    transition={{ type: 'spring', stiffness: 300 }}
                                                >
                                                    <label className={`${inter.className} block text-sm font-semibold text-slate-700 mb-2`}>
                                                        Published At
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        onChange={(e) =>
                                                            setFieldValue('publishedAt', new Date(e.target.value).toISOString())
                                                        }
                                                        className={`${inter.className} w-full rounded-lg border border-slate-300 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200`}
                                                    />
                                                    <p className={`${inter.className} text-xs text-slate-500 mt-1`}>
                                                        Leave blank to publish immediately
                                                    </p>
                                                </motion.div>

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

                                                {/* Article Status */}
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    transition={{ type: 'spring', stiffness: 300 }}
                                                >
                                                    <label className={`${inter.className} block text-sm font-semibold text-slate-700 mb-2`}>
                                                        Status
                                                    </label>
                                                    <div className="flex gap-3">
                                                        {Object.values(ARTICLE_STATUS).map(status => (
                                                            <motion.button
                                                                key={status}
                                                                type="button"
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => setFieldValue('status', status)}
                                                                className={`${inter.className} px-4 py-2 rounded-lg font-medium transition-all duration-200 ${values.status === status
                                                                    ? 'bg-blue-600 text-white shadow-lg'
                                                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                                                    }`}
                                                            >
                                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            </CardContent>

                                            {/* Footer Actions */}
                                            <CardFooter className="border-t border-slate-200 bg-slate-50 flex items-center gap-3 pt-6">
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Button
                                                        type="submit"
                                                        disabled={isSubmitting || (!dirty && !isValid)}
                                                        className={`${inter.className} flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200`}
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                Creating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save className="w-4 h-4" />
                                                                Create Article
                                                            </>
                                                        )}
                                                    </Button>
                                                </motion.div>

                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Button
                                                        type="reset"
                                                        variant="outline"
                                                        disabled={isSubmitting || !dirty}
                                                        className={`${inter.className} flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200`}
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                        Reset
                                                    </Button>
                                                </motion.div>

                                                {dirty && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className={`${inter.className} ml-auto flex items-center gap-2 text-sm text-amber-600`}
                                                    >
                                                        <div className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                                                        Unsaved changes
                                                    </motion.div>
                                                )}
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