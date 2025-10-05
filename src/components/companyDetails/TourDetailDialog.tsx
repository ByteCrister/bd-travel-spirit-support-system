// components/company/TourDetailDialog.tsx

"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TourDetailDTO } from "@/types/tour.types";
import {
    MdCalendarToday,
    MdLocationOn,
    MdPeople,
    MdStar,
    MdAttachMoney,
    MdAccessTime,
    MdDescription,
    MdLocalOffer,
    MdInfo,
    MdMap,
    MdRestaurant,
    MdHotel,
    MdDirectionsRun,
    MdQuestionAnswer,
    MdSecurity,
    MdPhone,
    MdEmail,
    MdCheckCircle,
    MdCancel,
    MdPerson,
} from "react-icons/md";
import { TOUR_STATUS } from "@/constants/tour.const";
import { TourDetailDialogSkeleton } from "./TourDetailDialogSkeleton";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tour: TourDetailDTO | null;
    loading: boolean;
}

export function TourDetailDialog({ open, onOpenChange, tour, loading }: Props) {
    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return "—";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "—";
            return new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }).format(date);
        } catch {
            return "—";
        }
    };

    const formatCurrency = (amount: number | undefined, currency: string = "USD"): string => {
        if (amount === undefined) return "—";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        }).format(amount);
    };

    const getStatusColor = (status?: string | null) => {
        const s = typeof status === "string" ? status.toLowerCase() : "";
        switch (s) {
            case TOUR_STATUS.PUBLISHED:
                return "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/50";
            case TOUR_STATUS.DRAFT:
                return "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-300 border-amber-300/50";
            case TOUR_STATUS.ARCHIVED:
                return "bg-gradient-to-r from-slate-500/10 to-gray-500/10 text-slate-700 dark:text-slate-300 border-slate-300/50";
            default:
                return "bg-slate-50 text-slate-700 dark:bg-slate-950/50 dark:text-slate-300 border-slate-200";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden">
                <DialogTitle className="sr-only">Tour Details</DialogTitle>
                {loading ? (
                    <TourDetailDialogSkeleton />
                ) : !tour ? (
                    <div className="flex items-center justify-center h-[600px]">
                        <p className="text-muted-foreground">Tour not found</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <DialogHeader className="relative px-6 pt-8 pb-6 border-b border-border/40 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent overflow-hidden">
                            <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,transparent,black)]" />
                            <div className="relative space-y-4">
                                <DialogTitle className="text-3xl font-bold text-foreground bg-clip-text">
                                    {tour.title}
                                </DialogTitle>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className={getStatusColor(tour.status)}>{tour.status}</Badge>
                                    {tour.category && <Badge variant="outline" className="border-indigo-200 text-indigo-700 dark:text-indigo-300">{tour.category}</Badge>}
                                    {tour.subCategory && <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">{tour.subCategory}</Badge>}
                                    {tour.difficulty && <Badge variant="outline" className="capitalize border-slate-300 text-slate-700 dark:text-slate-300">{tour.difficulty}</Badge>}
                                    {tour.booking?.isFull && <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300">Fully Booked</Badge>}
                                </div>
                                {tour.slug && (
                                    <p className="text-sm text-muted-foreground font-mono bg-slate-50 dark:bg-slate-900/50 px-3 py-1 rounded-md inline-block">/{tour.slug}</p>
                                )}
                            </div>
                        </DialogHeader>

                        {/* Scrollable Content */}
                        <ScrollArea className="flex-1 h-[calc(90vh-180px)]">
                            <div className="p-6 space-y-8">
                                {/* Key Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard
                                        icon={MdCalendarToday}
                                        label="Duration"
                                        value={`${tour.durationDays} days`}
                                    />
                                    <StatCard
                                        icon={MdPeople}
                                        label="Group Size"
                                        value={`${tour.booking.count}/${tour.maxGroupSize}`}
                                    />
                                    <StatCard
                                        icon={MdStar}
                                        label="Rating"
                                        value={tour.averageRating ? `${tour.averageRating.toFixed(1)}/5` : "No ratings"}
                                    />
                                    {tour.priceSummary && (
                                        <StatCard
                                            icon={MdAttachMoney}
                                            label="Price Range"
                                            value={`${formatCurrency(tour.priceSummary.minAmount, tour.priceSummary.currency)} - ${formatCurrency(tour.priceSummary.maxAmount, tour.priceSummary.currency)}`}
                                        />
                                    )}
                                </div>

                                {/* Description */}
                                <Section icon={MdDescription} title="Description">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {tour.description}
                                    </p>
                                </Section>

                                {/* Highlights */}
                                {tour.highlights && tour.highlights.length > 0 && (
                                    <Section icon={MdStar} title="Highlights">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {tour.highlights.map((highlight, idx) => (
                                                <div
                                                    key={idx}
                                                    className="group flex items-start gap-3 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/10 hover:shadow-md transition-all duration-300"
                                                >
                                                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                                                        <MdCheckCircle className="h-4 w-4 text-white" />
                                                    </div>
                                                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{highlight}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Schedule */}
                                <Section icon={MdCalendarToday} title="Schedule">
                                    <InfoGrid>
                                        <InfoItem label="Start Date" value={formatDate(tour.startDate)} />
                                        <InfoItem label="End Date" value={formatDate(tour.endDate)} />
                                        {tour.bookingDeadline && (
                                            <InfoItem
                                                label="Booking Deadline"
                                                value={formatDate(tour.bookingDeadline)}
                                            />
                                        )}
                                        <InfoItem label="Repeat Count" value={`${tour.repeatCount} times`} />
                                    </InfoGrid>
                                </Section>

                                {/* Pricing Options */}
                                {tour.priceOptions && tour.priceOptions.length > 0 && (
                                    <Section icon={MdAttachMoney} title="Pricing Options">
                                        <div className="space-y-3">
                                            {tour.priceOptions.map((option, idx) => (
                                                <div
                                                    key={idx}
                                                    className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-900/50 dark:to-indigo-950/20 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
                                                >
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{option.name}</span>
                                                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                        {formatCurrency(option.amount, option.currency)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Discounts */}
                                {tour.discounts && tour.discounts.length > 0 && (
                                    <Section icon={MdLocalOffer} title="Active Discounts">
                                        <div className="space-y-3">
                                            {tour.discounts.map((discount, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-5 rounded-xl border border-amber-200 dark:border-amber-900/30 bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-amber-950/20 shadow-sm"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25">
                                                            {discount.percentage}% OFF
                                                        </Badge>
                                                        <code className="text-xs font-mono px-3 py-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg font-semibold text-amber-900 dark:text-amber-100">
                                                            {discount.code}
                                                        </code>
                                                    </div>
                                                    {discount.description && (
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                            {discount.description}
                                                        </p>
                                                    )}
                                                    {(discount.validFrom || discount.validUntil) && (
                                                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-500">
                                                            {discount.validFrom && (
                                                                <span>From: {formatDate(discount.validFrom)}</span>
                                                            )}
                                                            {discount.validUntil && (
                                                                <span>Until: {formatDate(discount.validUntil)}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Meeting Points */}
                                {tour.meetingPoints && tour.meetingPoints.length > 0 && (
                                    <Section icon={MdLocationOn} title="Meeting Points">
                                        <div className="space-y-3">
                                            {tour.meetingPoints.map((point, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50/50 to-indigo-50/20 dark:from-slate-900/50 dark:to-indigo-950/10 hover:shadow-md transition-all duration-300"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{point.title}</h4>
                                                        <Badge variant="outline" className="border-indigo-200 text-indigo-700 dark:text-indigo-300">
                                                            <MdAccessTime className="h-3 w-3 mr-1" />
                                                            {point.time}
                                                        </Badge>
                                                    </div>
                                                    {point.description && (
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                                            {point.description}
                                                        </p>
                                                    )}
                                                    {point.location.address && (
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                                            <MdLocationOn className="h-4 w-4 text-indigo-500" />
                                                            {point.location.address}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Inclusions/Exclusions */}
                                {tour.includes && tour.includes.length > 0 && (
                                    <Section icon={MdInfo} title="What's Included">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {tour.includes.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-3 text-sm p-3 rounded-lg bg-slate-50 dark:bg-slate-900/30"
                                                >
                                                    {item.included ? (
                                                        <MdCheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                                    ) : (
                                                        <MdCancel className="h-5 w-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                                                    )}
                                                    <span className={item.included ? "text-slate-700 dark:text-slate-300" : "line-through text-slate-500 dark:text-slate-500"}>
                                                        {item.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Itinerary */}
                                {tour.itinerary && tour.itinerary.length > 0 && (
                                    <Section icon={MdMap} title="Itinerary">
                                        <div className="space-y-4">
                                            {tour.itinerary.map((entry) => (
                                                <div
                                                    key={entry.day}
                                                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50/50 to-purple-50/20 dark:from-slate-900/50 dark:to-purple-950/10 hover:shadow-md transition-all duration-300"
                                                >
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25">
                                                            Day {entry.day}
                                                        </Badge>
                                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{entry.title}</h4>
                                                    </div>
                                                    {entry.description && (
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                                                            {entry.description}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap gap-4 text-xs">
                                                        {entry.mealsProvided && entry.mealsProvided.length > 0 && (
                                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300">
                                                                <MdRestaurant className="h-4 w-4" />
                                                                <span>{entry.mealsProvided.join(", ")}</span>
                                                            </div>
                                                        )}
                                                        {entry.accommodation && (
                                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">
                                                                <MdHotel className="h-4 w-4" />
                                                                <span>{entry.accommodation}</span>
                                                            </div>
                                                        )}
                                                        {entry.activities && entry.activities.length > 0 && (
                                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300">
                                                                <MdDirectionsRun className="h-4 w-4" />
                                                                <span>{entry.activities.join(", ")}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Activities & Tags */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {tour.activities && tour.activities.length > 0 && (
                                        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900/50 dark:to-indigo-950/20">
                                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
                                                    <MdDirectionsRun className="h-5 w-5 text-white" />
                                                </div>
                                                Activities
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {tour.activities.map((activity, idx) => (
                                                    <Badge key={idx} variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                                                        {activity}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {tour.tags && tour.tags.length > 0 && (
                                        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-900/50 dark:to-purple-950/20">
                                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md shadow-purple-500/25">
                                                    <MdLocalOffer className="h-5 w-5 text-white" />
                                                </div>
                                                Tags
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {tour.tags.map((tag, idx) => (
                                                    <Badge key={idx} variant="outline" className="border-purple-200 text-purple-700 dark:text-purple-300">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Host Information */}
                                {tour.host && (
                                    <Section icon={MdPerson} title="Your Host">
                                        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900/50 dark:to-indigo-950/20">
                                            <div className="flex items-start gap-5">
                                                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-3xl shadow-xl shadow-indigo-500/25 flex-shrink-0">
                                                    {tour.host.name?.charAt(0)?.toUpperCase() || "H"}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-xl mb-2 text-slate-900 dark:text-slate-100">
                                                        {tour.host.name || "Tour Host"}
                                                    </h4>
                                                    {tour.host.rating && (
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                                                                <MdStar className="h-4 w-4 text-amber-500" />
                                                                <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                                                                    {tour.host.rating.toFixed(1)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {tour.host.bio && (
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                                                            {tour.host.bio}
                                                        </p>
                                                    )}
                                                    {tour.host.languagesSpoken && tour.host.languagesSpoken.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            {tour.host.languagesSpoken.map((lang, idx) => (
                                                                <Badge key={idx} variant="outline" className="text-xs border-indigo-200 text-indigo-700 dark:text-indigo-300">
                                                                    {lang}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Section>
                                )}

                                {/* FAQs */}
                                {tour.faqs && tour.faqs.length > 0 && (
                                    <Section icon={MdQuestionAnswer} title="Frequently Asked Questions">
                                        <div className="space-y-3">
                                            {tour.faqs.map((faq) => (
                                                <div
                                                    key={faq.id}
                                                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-blue-50/20 dark:from-slate-900/50 dark:to-blue-950/10 hover:shadow-md transition-all duration-300"
                                                >
                                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{faq.question}</h4>
                                                    {faq.isAnswered && faq.answer && (
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Emergency Contact */}
                                {tour.emergencyContact && (
                                    <Section icon={MdPhone} title="Emergency Contact">
                                        <div className="p-5 rounded-xl border border-red-200 dark:border-red-900/30 bg-gradient-to-br from-red-50/50 to-rose-50/30 dark:from-red-950/20 dark:to-rose-950/10">
                                            <InfoGrid>
                                                {tour.emergencyContact.phone && (
                                                    <InfoItem
                                                        label="Phone"
                                                        value={tour.emergencyContact.phone}
                                                        icon={MdPhone}
                                                    />
                                                )}
                                                {tour.emergencyContact.email && (
                                                    <InfoItem
                                                        label="Email"
                                                        value={tour.emergencyContact.email}
                                                        icon={MdEmail}
                                                    />
                                                )}
                                            </InfoGrid>
                                        </div>
                                    </Section>
                                )}

                                {/* Cancellation Policy */}
                                {tour.cancellationPolicy && (
                                    <Section icon={MdSecurity} title="Cancellation Policy">
                                        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-slate-900/50 dark:to-indigo-950/10">
                                            {tour.cancellationPolicy.freeCancellationUntil && (
                                                <p className="text-sm mb-3 text-slate-700 dark:text-slate-300">
                                                    <strong className="text-slate-900 dark:text-slate-100">Free cancellation until:</strong>{" "}
                                                    {formatDate(tour.cancellationPolicy.freeCancellationUntil)}
                                                </p>
                                            )}
                                            {tour.cancellationPolicy.refundPercentage !== undefined && (
                                                <p className="text-sm mb-3 text-slate-700 dark:text-slate-300">
                                                    <strong className="text-slate-900 dark:text-slate-100">Refund:</strong> {tour.cancellationPolicy.refundPercentage}%
                                                </p>
                                            )}
                                            {tour.cancellationPolicy.notes && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                    {tour.cancellationPolicy.notes}
                                                </p>
                                            )}
                                        </div>
                                    </Section>
                                )}

                                {/* Audit Info */}
                                <div className="pt-6 border-t border-border/40">
                                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-600 dark:text-slate-400">Created:</span>
                                            {formatDate(tour.createdAt)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-600 dark:text-slate-400">Updated:</span>
                                            {formatDate(tour.updatedAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

// Helper Components
function Section({
    icon: Icon,
    title,
    children,
}: {
    icon?: React.ComponentType<{ className?: string }>;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                )}
                <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">{title}</h3>
            </div>
            <Separator className="bg-gradient-to-r from-indigo-200 via-purple-200 to-transparent dark:from-indigo-900 dark:via-purple-900 dark:to-transparent" />
            {children}
        </div>
    );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function InfoItem({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    return (
        <div className="space-y-2 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
            <div className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 text-indigo-500" />}
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
            </div>
        </div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
}) {
    return (
        <div className="group p-5 rounded-xl border border-border/40 bg-gradient-to-br from-slate-50/50 via-white to-indigo-50/30 dark:from-slate-900/50 dark:via-slate-900 dark:to-indigo-950/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-5 w-5 text-white" />
                </div>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">{label}</p>
            <p className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">{value}</p>
        </div>
    );
}