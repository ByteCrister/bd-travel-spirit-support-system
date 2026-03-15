'use client';

// components/travelers/TravelerDetails.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TravelerBooking,
    TravelerCancellation,
    TravelerFAQ,
    TravelerLikedTour,
    TravelerReport,
    TravelerReview,
    TravelerSharedTour,
    TravelerTabName,
    TravelerViewedArticle,
    TravelerViewedTour,
} from '@/types/user/traveler.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useTravelerStore } from '@/store/traveler/travelers.store';
import { TravelerDetailsPagination } from './TravelerDetailsPagination';
import { extractErrorMessage } from '@/utils/axios/extract-error-message';
import { showToast } from '@/components/global/showToast';
import { cn } from '@/lib/utils';
import {
    ShieldCheck,
    ShieldOff,
    Lock,
    Unlock,
    UserX,
    UserCheck,
    Calendar,
    Mail,
    AlertTriangle,
    BookOpen,
    Star,
    Flag,
    HelpCircle,
    Heart,
    Share2,
    Eye,
    FileText,
    XCircle,
    ChevronLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

function getAvatarColor(name: string) {
    const colors = [
        'from-blue-400 to-blue-600',
        'from-violet-400 to-violet-600',
        'from-emerald-400 to-emerald-600',
        'from-amber-400 to-amber-600',
        'from-rose-400 to-rose-600',
        'from-cyan-400 to-cyan-600',
    ];
    return colors[name.charCodeAt(0) % colors.length];
}

const tabConfig: { value: TravelerTabName; label: string; icon: React.ElementType }[] = [
    { value: 'bookings', label: 'Bookings', icon: BookOpen },
    { value: 'reviews', label: 'Reviews', icon: Star },
    { value: 'reports', label: 'Reports', icon: Flag },
    { value: 'faqs', label: 'FAQs', icon: HelpCircle },
    { value: 'likedTours', label: 'Liked', icon: Heart },
    { value: 'sharedTours', label: 'Shared', icon: Share2 },
    { value: 'viewedTours', label: 'Viewed Tours', icon: Eye },
    { value: 'viewedArticles', label: 'Articles', icon: FileText },
    { value: 'cancellations', label: 'Cancellations', icon: XCircle },
];

const statusConfig: Record<string, { className: string; dotColor: string }> = {
    active: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
    suspended: { className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-500' },
    locked: { className: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
    inactive: { className: 'bg-slate-50 text-slate-600 border-slate-200', dotColor: 'bg-slate-400' },
    confirmed: { className: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500' },
    pending: { className: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
    cancelled: { className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-500' },
    approved: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
    rejected: { className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-500' },
    open: { className: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500' },
    resolved: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
    high: { className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-500' },
    medium: { className: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
    low: { className: 'bg-slate-50 text-slate-600 border-slate-200', dotColor: 'bg-slate-400' },
    answered: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
    unanswered: { className: 'bg-slate-50 text-slate-500 border-slate-200', dotColor: 'bg-slate-400' },
};

function StatusBadge({ value }: { value: string }) {
    const cfg = statusConfig[value?.toLowerCase()] ?? { className: 'bg-slate-50 text-slate-600 border-slate-200', dotColor: 'bg-slate-400' };
    return (
        <Badge variant="outline" className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border gap-1.5 capitalize', cfg.className)}>
            <span className={cn('h-1.5 w-1.5 rounded-full inline-block', cfg.dotColor)} />
            {value}
        </Badge>
    );
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={cn('h-3.5 w-3.5', i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200')}
                />
            ))}
            <span className="text-xs font-semibold text-slate-600 ml-1">{rating}</span>
        </div>
    );
}

export default function TravelerDetails({ id }: { id: string }) {
    const router = useRouter();
    const {
        fetchTravelerById,
        fetchBookings,
        fetchReviews,
        fetchReports,
        fetchFAQs,
        fetchLikedTours,
        fetchSharedTours,
        fetchViewedTours,
        fetchViewedArticles,
        fetchCancellations,
        suspendTraveler,
        unsuspendTraveler,
        lockTraveler,
        unlockTraveler,
        travelerDetailCache,
        loading,
        errors,
        tabCache
    } = useTravelerStore();

    const traveler = travelerDetailCache.get(id)?.data;
    const detailLoading = loading.detail;
    const detailError = errors.detail;

    const [activeTab, setActiveTab] = useState<TravelerTabName>('bookings');
    const [pageMap, setPageMap] = useState<Map<TravelerTabName, number>>(() => new Map());
    const limit = 10;
    const currentPage = pageMap.get(activeTab) || 1;
    const setPage = (page: number) => setPageMap((prev) => new Map(prev).set(activeTab, page));

    useEffect(() => { fetchTravelerById(id); }, [fetchTravelerById, id]);

    useEffect(() => {
        const fetchTabData = async () => {
            try {
                switch (activeTab) {
                    case 'bookings': await fetchBookings(id, currentPage, limit); break;
                    case 'reviews': await fetchReviews(id, currentPage, limit); break;
                    case 'reports': await fetchReports(id, currentPage, limit); break;
                    case 'faqs': await fetchFAQs(id, currentPage, limit); break;
                    case 'likedTours': await fetchLikedTours(id, currentPage, limit); break;
                    case 'sharedTours': await fetchSharedTours(id, currentPage, limit); break;
                    case 'viewedTours': await fetchViewedTours(id, currentPage, limit); break;
                    case 'viewedArticles': await fetchViewedArticles(id, currentPage, limit); break;
                    case 'cancellations': await fetchCancellations(id, currentPage, limit); break;
                }
            } catch (error: unknown) {
                showToast.error('Failed to load data', extractErrorMessage(error));
            }
        };
        fetchTabData();
    }, [id, activeTab, currentPage, fetchBookings, fetchReviews, fetchReports, fetchFAQs, fetchLikedTours, fetchSharedTours, fetchViewedTours, fetchViewedArticles, fetchCancellations]);

    const getTabCacheKey = (tab: TravelerTabName, page: number) => `${id}:${tab}:${page}:${limit}`;
    const tabData = tabCache.get(getTabCacheKey(activeTab, currentPage))?.data;
    const tabLoadingKey = `tab:${id}:${activeTab}`;
    const tabLoading = loading[tabLoadingKey];
    const tabError = errors[tabLoadingKey];

    const [suspendOpen, setSuspendOpen] = useState(false);
    const [lockOpen, setLockOpen] = useState(false);
    const [suspendReason, setSuspendReason] = useState('');
    const [suspendDays, setSuspendDays] = useState<number | undefined>();
    const [lockReason, setLockReason] = useState('');

    const handleSuspend = async () => {
        try {
            await suspendTraveler(id, suspendReason, suspendDays);
            showToast.success('Traveler suspended');
            setSuspendOpen(false); setSuspendReason(''); setSuspendDays(undefined);
        } catch (error: unknown) { showToast.error('Failed to suspend', extractErrorMessage(error)); }
    };
    const handleUnsuspend = async () => {
        try { await unsuspendTraveler(id); showToast.success('Traveler unsuspended'); }
        catch (error: unknown) { showToast.error('Failed to unsuspend', extractErrorMessage(error)); }
    };
    const handleLock = async () => {
        try {
            await lockTraveler(id, lockReason);
            showToast.success('Traveler locked');
            setLockOpen(false); setLockReason('');
        } catch (error: unknown) { showToast.error('Failed to lock', extractErrorMessage(error)); }
    };
    const handleUnlock = async () => {
        try { await unlockTraveler(id); showToast.success('Traveler unlocked'); }
        catch (error: unknown) { showToast.error('Failed to unlock', extractErrorMessage(error)); }
    };

    if (detailError) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 p-8 rounded-2xl bg-red-50 border border-red-200">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                    <p className="text-sm font-medium text-red-700">Error loading traveler: {detailError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto py-8 px-4 space-y-6 max-w-[1400px]">

                {/* Back button */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl -ml-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Travelers
                    </Button>
                </motion.div>

                {/* Profile card */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                    <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
                        {/* Top accent strip */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 via-violet-400 to-blue-500" />

                        <CardContent className="p-6">
                            {detailLoading && !traveler ? (
                                <div className="flex items-center gap-5">
                                    <Skeleton className="h-20 w-20 rounded-2xl bg-slate-200/70" />
                                    <div className="space-y-2.5 flex-1">
                                        <Skeleton className="h-5 w-48 bg-slate-200/70" />
                                        <Skeleton className="h-4 w-64 bg-slate-200/70" />
                                        <Skeleton className="h-4 w-40 bg-slate-200/70" />
                                    </div>
                                </div>
                            ) : traveler ? (
                                <div className="flex flex-col sm:flex-row items-start gap-6">
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        <Avatar className="h-20 w-20 ring-4 ring-slate-100 rounded-2xl">
                                            <AvatarImage src={traveler.avatarUrl} className="object-cover rounded-2xl" />
                                            <AvatarFallback className={cn('text-lg font-bold text-white bg-gradient-to-br rounded-2xl', getAvatarColor(traveler.name))}>
                                                {getInitials(traveler.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {traveler.accountStatus === 'active' && (
                                            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">{traveler.name}</h2>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                <p className="text-sm text-slate-500 font-mono">{traveler.email}</p>
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        <div className="flex flex-wrap gap-2">
                                            <StatusBadge value={traveler.accountStatus} />
                                            {traveler.isVerified ? (
                                                <Badge variant="outline" className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border-violet-200 gap-1">
                                                    <ShieldCheck className="h-3 w-3" /> Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border-slate-200 gap-1">
                                                    <ShieldOff className="h-3 w-3" /> Unverified
                                                </Badge>
                                            )}
                                            {traveler.isLocked && (
                                                <Badge variant="outline" className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border-amber-200 gap-1">
                                                    <Lock className="h-3 w-3" /> Locked
                                                </Badge>
                                            )}
                                            {traveler.isSuspended && (
                                                <Badge variant="outline" className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border-red-200 gap-1">
                                                    <UserX className="h-3 w-3" /> Suspended
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Member since {format(new Date(traveler.createdAt), 'PPP')}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex flex-wrap gap-2 sm:ml-auto sm:flex-shrink-0">
                                        {/* Suspend / Unsuspend */}
                                        {traveler.isSuspended ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleUnsuspend}
                                                className="h-9 gap-2 rounded-xl text-xs font-medium border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all"
                                            >
                                                <UserCheck className="h-3.5 w-3.5" /> Unsuspend
                                            </Button>
                                        ) : (
                                            <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" className="h-9 gap-2 rounded-xl text-xs font-medium bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all">
                                                        <UserX className="h-3.5 w-3.5" /> Suspend
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="rounded-2xl border-slate-200 bg-white shadow-xl">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-slate-900">Suspend Traveler</DialogTitle>
                                                        <DialogDescription className="text-slate-500">
                                                            Provide a reason and optional duration (in days).
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="reason" className="text-sm font-medium text-slate-700">Reason</Label>
                                                            <Textarea
                                                                id="reason"
                                                                value={suspendReason}
                                                                onChange={(e) => setSuspendReason(e.target.value)}
                                                                placeholder="Suspension reason"
                                                                className="rounded-xl border-slate-200 text-sm resize-none"
                                                                rows={3}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="days" className="text-sm font-medium text-slate-700">Duration (days, optional)</Label>
                                                            <Input
                                                                id="days"
                                                                type="number"
                                                                min="1"
                                                                value={suspendDays || ''}
                                                                onChange={(e) => setSuspendDays(e.target.value ? parseInt(e.target.value) : undefined)}
                                                                className="rounded-xl border-slate-200 text-sm"
                                                                placeholder="Leave empty for indefinite"
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter className="gap-2">
                                                        <Button variant="outline" onClick={() => setSuspendOpen(false)} className="rounded-xl border-slate-200 text-slate-600">Cancel</Button>
                                                        <Button onClick={handleSuspend} className="rounded-xl bg-red-600 hover:bg-red-700 text-white">Confirm Suspend</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}

                                        {/* Lock / Unlock */}
                                        {traveler.isLocked ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleUnlock}
                                                className="h-9 gap-2 rounded-xl text-xs font-medium border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all"
                                            >
                                                <Unlock className="h-3.5 w-3.5" /> Unlock
                                            </Button>
                                        ) : (
                                            <Dialog open={lockOpen} onOpenChange={setLockOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="h-9 gap-2 rounded-xl text-xs font-medium border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all">
                                                        <Lock className="h-3.5 w-3.5" /> Lock
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="rounded-2xl border-slate-200 bg-white shadow-xl">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-slate-900">Lock Traveler</DialogTitle>
                                                        <DialogDescription className="text-slate-500">
                                                            Optionally provide a reason for locking this account.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="lockReason" className="text-sm font-medium text-slate-700">Reason (optional)</Label>
                                                            <Textarea
                                                                id="lockReason"
                                                                value={lockReason}
                                                                onChange={(e) => setLockReason(e.target.value)}
                                                                placeholder="Lock reason"
                                                                className="rounded-xl border-slate-200 text-sm resize-none"
                                                                rows={3}
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter className="gap-2">
                                                        <Button variant="outline" onClick={() => setLockOpen(false)} className="rounded-xl border-slate-200 text-slate-600">Cancel</Button>
                                                        <Button onClick={handleLock} className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white">Confirm Lock</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
                >
                    <Tabs
                        value={activeTab}
                        onValueChange={(value) => setActiveTab(value as TravelerTabName)}
                        className="space-y-4"
                    >
                        {/* Tab list */}
                        <TabsList className="flex flex-wrap h-auto gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-full">
                            {tabConfig.map(({ value, label, icon: Icon }) => (
                                <TabsTrigger
                                    key={value}
                                    value={value}
                                    className={cn(
                                        'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium',
                                        'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
                                        'data-[state=active]:bg-blue-600 data-[state=active]:text-white',
                                        'data-[state=active]:shadow-sm transition-all duration-150'
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {/* Tab content */}
                        {(tabConfig.map(t => t.value) as TravelerTabName[]).map((tab) => (
                            <TabsContent key={tab} value={tab}>
                                <AnimatePresence mode="wait">
                                    {activeTab === tab && (
                                        <motion.div
                                            key={tab}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                                        >
                                            <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
                                                {/* Tab card header */}
                                                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {(() => {
                                                            const cfg = tabConfig.find(t => t.value === tab);
                                                            const Icon = cfg?.icon;
                                                            return Icon ? <Icon className="h-4 w-4 text-blue-500" /> : null;
                                                        })()}
                                                        <h3 className="text-sm font-semibold text-slate-700 capitalize">
                                                            {tab.replace(/([A-Z])/g, ' $1').trim()}
                                                        </h3>
                                                    </div>
                                                    {tabData?.data && tabData?.data?.length > 0 && !tabLoading && (
                                                        <span className="text-xs text-slate-400 tabular-nums">
                                                            {tabData?.data.length} of {tabData?.total} results
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="p-1">
                                                    {tabLoading ? (
                                                        <div className="p-5 space-y-3">
                                                            {[...Array(4)].map((_, i) => (
                                                                <Skeleton key={i} className="h-10 w-full rounded-lg bg-slate-100" />
                                                            ))}
                                                        </div>
                                                    ) : tabError ? (
                                                        <div className="flex items-center gap-2 p-5 text-red-600">
                                                            <AlertTriangle className="h-4 w-4" />
                                                            <p className="text-sm">{tabError}</p>
                                                        </div>
                                                    ) : tabData?.data?.length ? (
                                                        <>
                                                            <div className="rounded-xl overflow-hidden border border-slate-100">
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow className="border-slate-100 bg-slate-50/80 hover:bg-slate-50/80">
                                                                            {tab === 'bookings' && (<>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4 py-3">Ref</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Tour</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Participants</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Paid</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Status</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Booked At</TableHead>
                                                                            </>)}
                                                                            {tab === 'reviews' && (<>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4 py-3">Tour</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Rating</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Comment</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Approved</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Date</TableHead>
                                                                            </>)}
                                                                            {tab === 'reports' && (<>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4 py-3">Tour</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Reason</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Status</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Priority</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Created</TableHead>
                                                                            </>)}
                                                                            {tab === 'faqs' && (<>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4 py-3">Tour</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Question</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Status</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Likes / Dislikes</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Created</TableHead>
                                                                            </>)}
                                                                            {tab === 'likedTours' && (<>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4 py-3">Tour</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Code</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Liked At</TableHead>
                                                                            </>)}
                                                                            {tab === 'sharedTours' && (<>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4 py-3">Tour</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Code</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Shared At</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Platform</TableHead>
                                                                            </>)}
                                                                            {tab === 'viewedTours' && (<>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4 py-3">Tour</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Code</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Viewed At</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Duration (s)</TableHead>
                                                                            </>)}
                                                                            {tab === 'viewedArticles' && (<>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4 py-3">Article</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Slug</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Viewed At</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Duration (s)</TableHead>
                                                                            </>)}
                                                                            {tab === 'cancellations' && (<>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4 py-3">Ref</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Tour</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Paid</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Cancelled At</TableHead>
                                                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Reason</TableHead>
                                                                            </>)}
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {tabData.data.map((item: unknown, idx: number) => {
                                                                            const rowCls = cn(
                                                                                'border-slate-100 transition-colors duration-100 hover:bg-blue-50/40',
                                                                                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                                                                            );
                                                                            const cellCls = 'py-3 text-sm text-slate-700';
                                                                            const firstCellCls = 'pl-4 py-3 text-sm text-slate-700';

                                                                            if (tab === 'bookings') {
                                                                                const b = item as TravelerBooking;
                                                                                return (
                                                                                    <TableRow key={b._id} className={rowCls}>
                                                                                        <TableCell className={cn(firstCellCls, 'font-mono text-xs text-slate-500')}>{b.bookingReference}</TableCell>
                                                                                        <TableCell className={cn(cellCls, 'font-medium')}>{b.tour.title}</TableCell>
                                                                                        <TableCell className={cellCls}>{b.totalParticipants}</TableCell>
                                                                                        <TableCell className={cn(cellCls, 'font-semibold text-emerald-600')}>${b.totalPaid}</TableCell>
                                                                                        <TableCell className={cellCls}><StatusBadge value={b.status} /></TableCell>
                                                                                        <TableCell className={cn(cellCls, 'text-slate-500 tabular-nums')}>{format(new Date(b.bookedAt), 'PP')}</TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            }
                                                                            if (tab === 'reviews') {
                                                                                const r = item as TravelerReview;
                                                                                return (
                                                                                    <TableRow key={r._id} className={rowCls}>
                                                                                        <TableCell className={cn(firstCellCls, 'font-medium')}>{r.tour.title}</TableCell>
                                                                                        <TableCell className={cellCls}><StarRating rating={r.rating} /></TableCell>
                                                                                        <TableCell className={cn(cellCls, 'max-w-[220px] truncate text-slate-500')}>{r.comment}</TableCell>
                                                                                        <TableCell className={cellCls}>
                                                                                            {r.isApproved
                                                                                                ? <Badge variant="outline" className="text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full">Yes</Badge>
                                                                                                : <Badge variant="outline" className="text-[11px] bg-slate-50 text-slate-500 border-slate-200 rounded-full">No</Badge>
                                                                                            }
                                                                                        </TableCell>
                                                                                        <TableCell className={cn(cellCls, 'text-slate-500 tabular-nums')}>{format(new Date(r.createdAt), 'PP')}</TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            }
                                                                            if (tab === 'reports') {
                                                                                const r = item as TravelerReport;
                                                                                return (
                                                                                    <TableRow key={r._id} className={rowCls}>
                                                                                        <TableCell className={cn(firstCellCls, 'font-medium')}>{r.tour.title}</TableCell>
                                                                                        <TableCell className={cn(cellCls, 'text-slate-500')}>{r.reason}</TableCell>
                                                                                        <TableCell className={cellCls}><StatusBadge value={r.status} /></TableCell>
                                                                                        <TableCell className={cellCls}><StatusBadge value={r.priority} /></TableCell>
                                                                                        <TableCell className={cn(cellCls, 'text-slate-500 tabular-nums')}>{format(new Date(r.createdAt), 'PP')}</TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            }
                                                                            if (tab === 'faqs') {
                                                                                const f = item as TravelerFAQ;
                                                                                return (
                                                                                    <TableRow key={f._id} className={rowCls}>
                                                                                        <TableCell className={cn(firstCellCls, 'font-medium')}>{f.tour.title}</TableCell>
                                                                                        <TableCell className={cn(cellCls, 'max-w-[200px] truncate text-slate-500')}>{f.question}</TableCell>
                                                                                        <TableCell className={cellCls}><StatusBadge value={f.status} /></TableCell>
                                                                                        <TableCell className={cellCls}>
                                                                                            <span className="text-emerald-600 font-medium">{f.likeCount}</span>
                                                                                            <span className="text-slate-300 mx-1">/</span>
                                                                                            <span className="text-red-500 font-medium">{f.dislikeCount}</span>
                                                                                        </TableCell>
                                                                                        <TableCell className={cn(cellCls, 'text-slate-500 tabular-nums')}>{format(new Date(f.createdAt), 'PP')}</TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            }
                                                                            if (tab === 'likedTours') {
                                                                                const l = item as TravelerLikedTour;
                                                                                return (
                                                                                    <TableRow key={l.tour._id} className={rowCls}>
                                                                                        <TableCell className={cn(firstCellCls, 'font-medium')}>{l.tour.title}</TableCell>
                                                                                        <TableCell className={cn(cellCls, 'font-mono text-xs text-slate-500')}>{l.tour.uniqueTourCode}</TableCell>
                                                                                        <TableCell className={cn(cellCls, 'text-slate-500 tabular-nums')}>{format(new Date(l.likedAt), 'PP')}</TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            }
                                                                            if (tab === 'sharedTours') {
                                                                                const s = item as TravelerSharedTour;
                                                                                return (
                                                                                    <TableRow key={s.tour._id} className={rowCls}>
                                                                                        <TableCell className={cn(firstCellCls, 'font-medium')}>{s.tour.title}</TableCell>
                                                                                        <TableCell className={cn(cellCls, 'font-mono text-xs text-slate-500')}>{s.tour.uniqueTourCode}</TableCell>
                                                                                        <TableCell className={cn(cellCls, 'text-slate-500 tabular-nums')}>{format(new Date(s.sharedAt), 'PP')}</TableCell>
                                                                                        <TableCell className={cellCls}>
                                                                                            {s.platform
                                                                                                ? <Badge variant="outline" className="text-[11px] bg-blue-50 text-blue-700 border-blue-200 rounded-full capitalize">{s.platform}</Badge>
                                                                                                : <span className="text-slate-400">—</span>
                                                                                            }
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            }
                                                                            if (tab === 'viewedTours') {
                                                                                const v = item as TravelerViewedTour;
                                                                                return (
                                                                                    <TableRow key={v.tour._id} className={rowCls}>
                                                                                        <TableCell className={cn(firstCellCls, 'font-medium')}>{v.tour.title}</TableCell>
                                                                                        <TableCell className={cn(cellCls, 'font-mono text-xs text-slate-500')}>{v.tour.uniqueTourCode}</TableCell>
                                                                                        <TableCell className={cn(cellCls, 'text-slate-500 tabular-nums')}>{format(new Date(v.viewedAt), 'PP')}</TableCell>
                                                                                        <TableCell className={cellCls}>{v.durationSeconds ?? <span className="text-slate-400">—</span>}</TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            }
                                                                            if (tab === 'viewedArticles') {
                                                                                const v = item as TravelerViewedArticle;
                                                                                return (
                                                                                    <TableRow key={v.article._id} className={rowCls}>
                                                                                        <TableCell className={cn(firstCellCls, 'font-medium')}>{v.article.title}</TableCell>
                                                                                        <TableCell className={cn(cellCls, 'font-mono text-xs text-slate-500')}>{v.article.slug}</TableCell>
                                                                                        <TableCell className={cn(cellCls, 'text-slate-500 tabular-nums')}>{format(new Date(v.viewedAt), 'PP')}</TableCell>
                                                                                        <TableCell className={cellCls}>{v.durationSeconds ?? <span className="text-slate-400">—</span>}</TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            }
                                                                            if (tab === 'cancellations') {
                                                                                const c = item as TravelerCancellation;
                                                                                return (
                                                                                    <TableRow key={c._id} className={rowCls}>
                                                                                        <TableCell className={cn(firstCellCls, 'font-mono text-xs text-slate-500')}>{c.bookingReference}</TableCell>
                                                                                        <TableCell className={cn(cellCls, 'font-medium')}>{c.tour.title}</TableCell>
                                                                                        <TableCell className={cn(cellCls, 'font-semibold text-red-500')}>${c.totalPaid}</TableCell>
                                                                                        <TableCell className={cn(cellCls, 'text-slate-500 tabular-nums')}>
                                                                                            {c.cancellation ? format(new Date(c.cancellation.cancelledAt), 'PP') : <span className="text-slate-400">—</span>}
                                                                                        </TableCell>
                                                                                        <TableCell className={cn(cellCls, 'max-w-[200px] truncate text-slate-500')}>
                                                                                            {c.cancellation?.reason ?? <span className="text-slate-400">—</span>}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            }
                                                                            return null;
                                                                        })}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>

                                                            {tabData.totalPages > 1 && (
                                                                <div className="mt-4 flex justify-center pb-2">
                                                                    <TravelerDetailsPagination
                                                                        currentPage={currentPage}
                                                                        totalPages={tabData.totalPages}
                                                                        onPageChange={setPage}
                                                                    />
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                                                            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200">
                                                                {(() => {
                                                                    const cfg = tabConfig.find(t => t.value === tab);
                                                                    const Icon = cfg?.icon;
                                                                    return Icon ? <Icon className="h-6 w-6 text-slate-400" /> : null;
                                                                })()}
                                                            </div>
                                                            <p className="text-sm font-medium text-slate-500">No data available</p>
                                                            <p className="text-xs text-slate-400">This traveler has no {tab.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} yet.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </TabsContent>
                        ))}
                    </Tabs>
                </motion.div>
            </div>
        </div>
    );
}