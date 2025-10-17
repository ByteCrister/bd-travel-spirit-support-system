"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { motion } from "framer-motion";
import {
    MdStar,
    MdQuestionAnswer,
    MdLocalOffer,
    MdOutlineGroup,
} from "react-icons/md";

import { useCompanyDetailStore } from "@/store/useCompanyDetailStore";
import AllDetailsSkeleton from "./skeletons/AllDetailsSkeleton";

/**
 * NOTES:
 * - Replace `resolveImageUrl(id)` with your actual media resolver.
 * - Colors use Tailwind tokens from your project; swap them for design system tokens if needed.
 */

type Props = { companyId: string; tourId: string };

const tourDetailLoadingKey = (id: string) => `tourDetail:${id}`;
const tourDetailErrorKey = (id: string) => `tourDetailError:${id}`;

export default function AllDetails({ companyId, tourId }: Props) {
    const fetchTourDetail = useCompanyDetailStore((s) => s.fetchTourDetail);
    const tour = useCompanyDetailStore((s) => s.tourDetails?.[tourId] ?? null);
    const loading = useCompanyDetailStore((s) => Boolean(s.loading[tourDetailLoadingKey(tourId)]));
    const error = useCompanyDetailStore((s) => s.error[tourDetailErrorKey(tourId)]);

    const load = useCallback(
        async (force = false) => {
            try {
                await fetchTourDetail(companyId, tourId, force);
            } catch {
                // store handles error
            }
        },
        [companyId, tourId, fetchTourDetail]
    );

    useEffect(() => {
        void load(false);
    }, [load]);

    const formatDate = (d?: string) => {
        if (!d) return "—";
        try {
            const dt = new Date(d);
            if (Number.isNaN(dt.getTime())) return "—";
            return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
        } catch {
            return "—";
        }
    };

    const formatCurrency = (amount?: number, currency = "USD") => {
        if (amount === undefined || amount === null) return "—";
        try {
            return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
        } catch {
            return `${amount} ${currency}`;
        }
    };

    // Simple media resolver (swap with actual implementation)
    const resolveImageUrl = (id?: string) => (id ? `/api/media/${id}` : "/placeholders/hero.jpg");

    // computed summary values
    const pricePrimary = useMemo(() => {
        if (!tour?.priceOptions?.length) return null;
        // choose cheapest option as primary
        const min = tour.priceOptions.reduce((a, b) => (a.amount <= b.amount ? a : b));
        return min;
    }, [tour]);

    if (loading && !tour) return <div className="rounded-lg overflow-hidden"><AllDetailsSkeleton /></div>;

    if (error && !tour) {
        return (
            <div className="rounded-lg bg-white border p-6">
                <div className="text-red-600 font-medium">Unable to load tour</div>
                <div className="text-sm text-slate-600 mt-2">{String(error)}</div>
                <div className="mt-4">
                    <button onClick={() => void load(true)} className="px-3 py-1.5 rounded-md bg-red-50 text-red-700 border border-red-100">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!tour) {
        return <div className="rounded-lg bg-white border p-6 text-center text-slate-500">Tour not found.</div>;
    }

    return (
        <article className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
            {/* HERO */}
            <div className="relative w-full bg-slate-50 dark:bg-slate-800">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8">
                            <div className="relative h-64 sm:h-80 lg:h-96">
                                <Image
                                    src={resolveImageUrl(tour.heroImageId ?? tour.imageIds?.[0])}
                                    alt={tour.title}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 800px"
                                    className="object-cover"
                                />
                                {tour.videoUrls?.[0] || tour.virtualTourUrl ? (
                                    <a
                                        href={tour.videoUrls?.[0] ?? tour.virtualTourUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="absolute left-4 bottom-4 inline-flex items-center gap-2 px-3 py-2 bg-black/60 text-white rounded-md hover:bg-black/70"
                                        aria-label="Open video"
                                    >
                                        ▶ View tour
                                    </a>
                                ) : null}
                                <div className="absolute left-4 top-4 flex items-center gap-2">
                                    <StatusPill status={tour.status} />
                                    {tour.featured ? <Badge>Featured</Badge> : null}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDEBAR (price + booking + quick actions) */}
                        <aside className="lg:col-span-4 p-4 lg:py-6">
                            <div className="sticky top-6 space-y-4">
                                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                                    <div className="flex items-baseline justify-between gap-4">
                                        <div>
                                            <div className="text-xs text-slate-500">From</div>
                                            <div className="flex items-baseline gap-2">
                                                <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                                    {pricePrimary ? formatCurrency(pricePrimary.amount, pricePrimary.currency) : tour.priceSummary ? formatCurrency(tour.priceSummary.minAmount, tour.priceSummary.currency) : "—"}
                                                </div>
                                                <div className="text-xs text-slate-500">per person</div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-xs text-slate-500">Seats</div>
                                            <div className="font-medium text-slate-900 dark:text-slate-100">
                                                {tour.booking?.remaining ?? "—"} left
                                            </div>
                                        </div>
                                    </div>

                                    {tour.discounts && tour.discounts.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {tour.discounts.map((d) => (
                                                <div key={d.code} className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                                                    {d.code} · {d.percentage}% off
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-4 grid gap-2">
                                        <button className={clsx("w-full px-3 py-2 rounded-md text-sm font-medium", tour.booking?.isFull ? "bg-slate-200 text-slate-600 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700")}>
                                            {tour.booking?.isFull ? "Full" : "Create booking"}
                                        </button>

                                        <button className="w-full px-3 py-2 rounded-md text-sm border border-slate-100 bg-white text-slate-700">
                                            View availability
                                        </button>
                                    </div>

                                    <div className="mt-3 text-xs text-slate-500">
                                        Booking deadline: <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(tour.bookingDeadline ?? tour.endDate)}</span>
                                    </div>
                                </div>

                                {/* Host card */}
                                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                                    <h4 className="text-sm font-semibold mb-2">Host</h4>
                                    {tour.host ? (
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-xl overflow-hidden bg-indigo-100 flex items-center justify-center text-white font-bold text-lg">
                                                {tour.host.name?.charAt(0)?.toUpperCase() ?? "H"}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-slate-100">{tour.host.name}</div>
                                                <div className="text-xs text-slate-500">{tour.host.bio ?? "Host information"}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-500">No host set</div>
                                    )}
                                </div>

                                {/* Safety & metadata */}
                                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-sm">
                                    <div className="text-xs text-slate-500">Created</div>
                                    <div className="font-medium text-slate-900 dark:text-slate-100">{formatDate(tour.createdAt)}</div>
                                    <div className="mt-3 text-xs text-slate-500">Updated</div>
                                    <div className="font-medium text-slate-900 dark:text-slate-100">{formatDate(tour.updatedAt)}</div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-6xl mx-auto p-6">
                {/* Title row with metrics */}
                <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-slate-100">{tour.title}</h1>
                        <div className="mt-1 text-sm text-slate-500">
                            <span className="font-medium text-slate-700 dark:text-slate-200">{tour.category ?? "Uncategorized"}</span> · {formatDate(tour.startDate)} – {formatDate(tour.endDate)}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2 lg:pt-0">
                        <Metric icon={<MdStar />} label="Rating" value={tour.averageRating ? `${tour.averageRating.toFixed(1)}/5` : "—"} />
                        <Metric icon={<MdOutlineGroup />} label="Bookings" value={`${tour.booking?.count ?? 0}`} />
                        <Metric icon={<MdQuestionAnswer />} label="Reviews" value={`${tour.reviewCount ?? 0}`} />
                        <Metric icon={<MdLocalOffer />} label="Wishlist" value={`${tour.wishlistCount ?? 0}`} />
                    </div>
                </header>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Overview */}
                        <section className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
                            <h2 className="text-base font-semibold">Overview</h2>
                            <p>{tour.description || "No description provided."}</p>

                            {/* includes/excludes */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                {(tour.includes || []).slice(0, 6).map((inc) => (
                                    <span key={inc.label} className="text-xs rounded-md px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        {inc.label}
                                    </span>
                                ))}
                                {(tour.importantInfo || []).slice(0, 6).map((i, idx) => (
                                    <span key={`imp-${idx}`} className="text-xs rounded-md px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100">
                                        {i}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* Itinerary (collapsible) */}
                        <Collapsible title={`Itinerary ${tour.itinerary?.length ? `(${tour.itinerary.length} days)` : ""}`} defaultOpen>
                            {tour.itinerary && tour.itinerary.length > 0 ? (
                                <div className="space-y-3">
                                    {tour.itinerary.map((it) => (
                                        <motion.div key={it.day} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.12 }}>
                                            <div className="p-4 rounded-lg border border-slate-100 bg-white dark:bg-slate-900">
                                                <div className="flex items-start gap-3">
                                                    <div className="text-sm font-semibold">Day {it.day}: {it.title}</div>
                                                </div>
                                                {it.mealsProvided?.length ? <div className="text-xs text-slate-500 mt-1">{it.mealsProvided.join(", ")}</div> : null}
                                                {it.description ? <div className="text-sm text-slate-600 mt-2">{it.description}</div> : null}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-slate-500">No itinerary available.</div>
                            )}
                        </Collapsible>

                        {/* Roadmap */}
                        <Collapsible title={`Roadmap ${tour.roadMap?.length ? `(${tour.roadMap.length})` : ""}`}>
                            {tour.roadMap && tour.roadMap.length > 0 ? (
                                <div className="grid gap-3">
                                    {tour.roadMap.map((r, idx) => (
                                        <div key={idx} className="p-3 rounded-lg border bg-slate-50">
                                            <div className="font-medium text-sm">{r.title}</div>
                                            {r.description ? <div className="text-xs text-slate-600 mt-1">{r.description}</div> : null}
                                            {r.imageId ? (
                                                <div className="mt-2 w-full h-40 relative rounded-md overflow-hidden">
                                                    <Image
                                                        src={resolveImageUrl(r.imageId)}
                                                        alt={r.title || "Roadmap image"}
                                                        fill
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-slate-500">No roadmap provided.</div>
                            )}
                        </Collapsible>

                        {/* FAQs preview */}
                        {tour.faqs && tour.faqs.length > 0 && (
                            <section>
                                <h3 className="text-sm font-semibold mb-3">Frequently asked</h3>
                                <div className="grid gap-2">
                                    {tour.faqs.slice(0, 6).map((f) => (
                                        <div key={f.id} className="p-3 rounded-lg border bg-white dark:bg-slate-900">
                                            <div className="font-medium text-sm">{f.question}</div>
                                            {f.isAnswered && f.answer ? <div className="text-sm text-slate-600 mt-1">{f.answer}</div> : <div className="text-xs text-slate-500 mt-1">Not answered yet</div>}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right column (empty here because main sidebar above is sticky hero sidebar) */}
                    <div className="lg:col-span-1" aria-hidden />
                </div>
            </div>
        </article>
    );
}

/* ----------------------
   Small presentational components
   ---------------------- */

function Badge({ children }: { children: React.ReactNode }) {
    return <div className="px-2 py-1 rounded-full bg-indigo-600 text-white text-xs font-medium">{children}</div>;
}

function StatusPill({ status }: { status: string }) {
    const color =
        status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : status === "archived" ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-slate-50 text-slate-700 border-slate-100";
    return <div className={clsx("px-2 py-1 rounded-full text-xs font-medium border", color)}>{status}</div>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 bg-white/0 px-2 py-1 rounded">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                {icon}
            </div>
            <div className="text-sm">
                <div className="text-xs text-slate-500">{label}</div>
                <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{value}</div>
            </div>
        </div>
    );
}

/* Lightweight collapsible used to keep page compact on mobile */
function Collapsible({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="rounded-lg border border-slate-100 bg-white dark:bg-slate-900 p-3">
            <button
                className="w-full flex items-center justify-between gap-3"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={`panel-${title}`}
            >
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</div>
                <div className="text-xs text-slate-500">{open ? "Hide" : "Show"}</div>
            </button>
            <div id={`panel-${title}`} className={clsx("mt-3", !open && "hidden")}>
                {children}
            </div>
        </div>
    );
}
