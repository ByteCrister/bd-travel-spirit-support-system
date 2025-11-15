// components/ads/AdDetails.tsx
'use client';

import React, { JSX, useEffect } from 'react';
import type { AdvertisementResponse } from '@/types/advertising.types';
import useAdsStore from '@/store/ad.store';
import { showToast } from '@/components/global/showToast';
import { AdsSkeletons } from './AdsSkeletons';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDateLong, formatDateShort } from '@/utils/helpers/ads-ui';
import { AdActions } from './AdActions';
import {
    Calendar,
    TrendingUp,
    MousePointerClick,
    Eye,
    DollarSign,
    MapPin,
    Clock,
    User,
    FileText,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    CreditCard,
    Tag,
    BarChart3,
    XCircle,
    Pause,
    Timer,
    Sparkles
} from 'lucide-react';

export interface AdDetailsProps {
    id: string;
}

const StatusBadge = ({ status, reason }: { status: string; reason?: string }) => {
    const statusConfig: Record<string, { 
        variant: 'default' | 'secondary' | 'outline' | 'destructive';
        icon: JSX.Element; 
        label: string;
        className?: string;
    }> = {
        active: { 
            variant: 'default', 
            icon: <CheckCircle2 className="w-3.5 h-3.5" />, 
            label: 'Active',
            className: 'bg-green-500 hover:bg-green-600 text-white border-green-600'
        },
        pending: { 
            variant: 'secondary', 
            icon: <Clock className="w-3.5 h-3.5" />, 
            label: 'Pending',
            className: 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
        },
        draft: { 
            variant: 'outline', 
            icon: <FileText className="w-3.5 h-3.5" />, 
            label: 'Draft',
            className: 'border-2'
        },
        paused: { 
            variant: 'secondary', 
            icon: <Pause className="w-3.5 h-3.5" />, 
            label: 'Paused',
            className: 'bg-slate-500 hover:bg-slate-600 text-white border-slate-600'
        },
        cancelled: { 
            variant: 'destructive', 
            icon: <XCircle className="w-3.5 h-3.5" />, 
            label: 'Cancelled'
        },
        expired: { 
            variant: 'secondary', 
            icon: <Timer className="w-3.5 h-3.5" />, 
            label: 'Expired',
            className: 'bg-orange-500 hover:bg-orange-600 text-white border-orange-600'
        },
        rejected: { 
            variant: 'destructive', 
            icon: <XCircle className="w-3.5 h-3.5" />, 
            label: 'Rejected'
        },
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <Badge 
                variant={config.variant} 
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium ${config.className || ''}`}
            >
                {config.icon}
                <span>{config.label}</span>
            </Badge>
            {reason && (
                <span className="text-xs text-muted-foreground italic bg-muted px-2 py-1 rounded">
                    {reason}
                </span>
            )}
        </div>
    );
};

const StatCard = ({
    icon,
    label,
    value,
    trend,
    iconColor = 'text-primary'
}: {
    icon: JSX.Element;
    label: string;
    value: string | number;
    trend?: string;
    iconColor?: string;
}) => (
    <Card className="relative overflow-hidden hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
        <div className="p-5">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {label}
                    </p>
                    <p className="text-3xl font-bold tracking-tight mb-1">{value}</p>
                    {trend && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {trend}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 ${iconColor}`}>
                    {icon}
                </div>
            </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16" />
    </Card>
);

const InfoRow = ({
    label,
    value,
    icon,
    highlight = false
}: {
    label: string;
    value: string | JSX.Element;
    icon?: JSX.Element;
    highlight?: boolean;
}) => (
    <div className={`flex items-start gap-3 py-3 px-2 rounded-lg transition-colors ${highlight ? 'bg-accent/50' : 'hover:bg-accent/30'}`}>
        {icon && (
            <div className="text-muted-foreground mt-0.5 p-1.5 rounded-md bg-muted/50">
                {icon}
            </div>
        )}
        <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                {label}
            </p>
            <div className="text-sm font-medium">{value}</div>
        </div>
    </div>
);

const SectionHeader = ({ 
    icon, 
    title, 
    badge 
}: { 
    icon: JSX.Element; 
    title: string;
    badge?: string;
}) => (
    <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                {icon}
            </div>
            {title}
        </h3>
        {badge && (
            <Badge variant="secondary" className="text-xs">
                {badge}
            </Badge>
        )}
    </div>
);

export function AdDetails({ id }: AdDetailsProps): JSX.Element {
    const { cache, fetchById } = useAdsStore();
    const entry = cache.byId[id];
    const activeAdMeta = cache.byId[id]?.meta;

    useEffect(() => {
        if (!entry || !entry.ad) {
            fetchById(id).catch((e) => showToast.error(String(e?.message ?? 'Failed to load ad')));
        }
    }, [id, entry, fetchById]);

    if (!entry || activeAdMeta?.loading) {
        return <AdsSkeletons.RowDetailsSkeleton />;
    }

    if (activeAdMeta?.error) {
        return (
            <Card className="border-destructive/50 bg-destructive/5">
                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-destructive/10">
                            <AlertCircle className="w-6 h-6 text-destructive" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-destructive text-lg mb-1">
                                Error Loading Advertisement
                            </p>
                            <p className="text-sm text-destructive/80">{activeAdMeta.error}</p>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    const ad: AdvertisementResponse = entry.ad;
    const ctrValue = ad.ctr ?? (ad.impressions ? ((ad.clicks / ad.impressions) * 100) : 0);
    const ctrDisplay = ad.impressions ? `${ctrValue.toFixed(2)}%` : '—';

    return (
        <div className="space-y-6 pb-6">
            {/* Hero Header */}
            <Card className="overflow-hidden border-2">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Advertisement Campaign
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">
                                {ad.title || ad.snapshot.name}
                            </h1>
                            {ad.title && ad.snapshot.name && (
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    {ad.snapshot.name}
                                </p>
                            )}
                        </div>
                        <StatusBadge status={ad.status} reason={ad.reason} />
                    </div>
                </div>

                <Separator />

                <div className="p-6 bg-background">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <InfoRow
                            icon={<User className="w-4 h-4" />}
                            label="Guide"
                            value={ad.guideName || ad.guideId}
                            highlight
                        />
                        {ad.tourTitle && (
                            <InfoRow
                                icon={<MapPin className="w-4 h-4" />}
                                label="Tour"
                                value={ad.tourTitle}
                                highlight
                            />
                        )}
                        <InfoRow
                            icon={<Calendar className="w-4 h-4" />}
                            label="Campaign Period"
                            value={
                                <span className="text-xs">
                                    {ad.startAt ? formatDateShort(ad.startAt) : '—'} → {ad.endAt ? formatDateShort(ad.endAt) : '—'}
                                </span>
                            }
                            highlight
                        />
                        <InfoRow
                            icon={<Clock className="w-4 h-4" />}
                            label="Expiry Date"
                            value={<span className="text-xs">{ad.expiryDate ? formatDateLong(ad.expiryDate) : '—'}</span>}
                            highlight
                        />
                    </div>
                </div>
            </Card>

            {/* Performance Metrics */}
            <div>
                <SectionHeader 
                    icon={<BarChart3 className="w-5 h-5" />} 
                    title="Performance Metrics" 
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        icon={<Eye className="w-6 h-6" />}
                        label="Total Impressions"
                        value={ad.impressions.toLocaleString()}
                        iconColor="text-blue-600"
                    />
                    <StatCard
                        icon={<MousePointerClick className="w-6 h-6" />}
                        label="Total Clicks"
                        value={ad.clicks.toLocaleString()}
                        iconColor="text-purple-600"
                    />
                    <StatCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        label="Click-Through Rate"
                        value={ctrDisplay}
                        iconColor="text-green-600"
                    />
                </div>
            </div>

            {/* Plan Details */}
            <Card className="border-2">
                <div className="p-6">
                    <SectionHeader 
                        icon={<DollarSign className="w-5 h-5" />} 
                        title="Plan & Billing" 
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <InfoRow
                                icon={<Clock className="w-4 h-4" />}
                                label="Duration"
                                value={
                                    <span className="text-base font-semibold">
                                        {ad.snapshot.durationDays} days
                                    </span>
                                }
                            />
                            <InfoRow
                                icon={<DollarSign className="w-4 h-4" />}
                                label="Price"
                                value={
                                    <span className="text-lg font-bold text-primary">
                                        {ad.snapshot.currency} {ad.snapshot.price.toFixed(2)}
                                    </span>
                                }
                            />
                        </div>

                        <div className="space-y-4">
                            <InfoRow
                                icon={<MapPin className="w-4 h-4" />}
                                label="Ad Placements"
                                value={
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {ad.snapshot.placements.map((placement) => (
                                            <Badge 
                                                key={placement} 
                                                variant="secondary" 
                                                className="text-xs font-medium px-2.5 py-1"
                                            >
                                                {placement.replace(/_/g, ' ')}
                                            </Badge>
                                        ))}
                                    </div>
                                }
                            />
                            <InfoRow
                                icon={<RefreshCw className="w-4 h-4" />}
                                label="Auto-Renew"
                                value={
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge 
                                            variant={ad.autoRenew ? 'default' : 'outline'}
                                            className={ad.autoRenew ? 'bg-green-500 hover:bg-green-600' : ''}
                                        >
                                            {ad.autoRenew ? 'Enabled' : 'Disabled'}
                                        </Badge>
                                        {ad.renewCount > 0 && (
                                            <span className="text-xs text-muted-foreground font-medium">
                                                Renewed {ad.renewCount}x
                                            </span>
                                        )}
                                    </div>
                                }
                            />
                        </div>
                    </div>

                    {ad.snapshot.description && (
                        <>
                            <Separator className="my-4" />
                            <div className="p-4 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 border">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    <FileText className="w-4 h-4 inline mr-2" />
                                    {ad.snapshot.description}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* Additional Information */}
            {(ad.note || ad.paymentRef) && (
                <Card className="border-2">
                    <div className="p-6">
                        <SectionHeader 
                            icon={<FileText className="w-5 h-5" />} 
                            title="Additional Information" 
                        />
                        <div className="space-y-4">
                            {ad.paymentRef && (
                                <InfoRow
                                    icon={<CreditCard className="w-4 h-4" />}
                                    label="Payment Reference"
                                    value={
                                        <code className="text-sm bg-muted px-3 py-1.5 rounded-md font-mono border">
                                            {ad.paymentRef}
                                        </code>
                                    }
                                />
                            )}
                            {ad.note && (
                                <InfoRow
                                    icon={<FileText className="w-4 h-4" />}
                                    label="Campaign Notes"
                                    value={
                                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                            <p className="text-sm leading-relaxed text-foreground">
                                                {ad.note}
                                            </p>
                                        </div>
                                    }
                                />
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* Audit Trail */}
            <Card className="border-2">
                <div className="p-6">
                    <SectionHeader 
                        icon={<Clock className="w-5 h-5" />} 
                        title="Audit Trail" 
                    />
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                            <div className="p-2 rounded-full bg-primary/10 text-primary">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                    Created
                                </p>
                                <p className="text-sm">
                                    <span className="font-semibold text-foreground">{ad.createdBy ?? '—'}</span>
                                    {' · '}
                                    <span className="text-muted-foreground">{formatDateLong(ad.createdAt)}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                            <div className="p-2 rounded-full bg-blue-500/10 text-blue-600">
                                <RefreshCw className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                    Last Updated
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {formatDateLong(ad.updatedAt)}
                                </p>
                            </div>
                        </div>

                        {ad.isDeleted && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                <div className="p-2 rounded-full bg-destructive/10 text-destructive">
                                    <AlertCircle className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-destructive uppercase tracking-wide mb-1">
                                        Deleted
                                    </p>
                                    <p className="text-sm text-destructive">
                                        <span className="font-semibold">{ad.deletedBy ?? '—'}</span>
                                        {' · '}
                                        <span>{ad.deletedAt ? formatDateLong(ad.deletedAt) : '—'}</span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Actions */}
            <AdActions id={ad.id} />
        </div>
    );
}