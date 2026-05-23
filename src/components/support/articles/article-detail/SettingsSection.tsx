'use client';

import React from 'react';
import { useFormikContext } from 'formik';
import { Switch } from '@/components/ui/switch';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 p-6 space-y-6';

const NEU_SURFACE_INSET =
    'bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] rounded-xl p-4';

const NEU_BADGE =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-jetbrains-mono)] font-semibold ' +
    'bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]';

const NEU_HEADING =
    'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';

const NEU_LABEL =
    'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';

const NEU_MUTED =
    'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50';

const NEU_ICON_WELL_PRIMARY =
    'p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]';

// ── Metric card sub-component ─────────────────────────────────
function MetricChip({ label, value }: { label: string; value: number }) {
    return (
        <div className={`${NEU_BADGE} flex-col items-start gap-0 px-4 py-2.5`}>
            <span className={`${NEU_LABEL} text-[10px]`}>{label}</span>
            <span className="font-[family-name:var(--font-space-mono)] text-base font-bold text-[#1E2938]">
                {value.toLocaleString()}
            </span>
        </div>
    );
}

type Values = { allowComments: boolean };
type Props = {
    metrics: { viewCount: number; likeCount: number; shareCount: number };
};

export function SettingsSection({ metrics }: Props) {
    const { values, setFieldValue } = useFormikContext<Values>();

    return (
        <div className={NEU_CARD}>
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className={NEU_ICON_WELL_PRIMARY}>
                    {/* gear icon */}
                    <svg className="w-5 h-5 text-[#006666]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <div>
                    <h3 className={`${NEU_HEADING} text-lg`}>Settings</h3>
                    <p className={NEU_MUTED}>Configuration and engagement metrics</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Allow Comments */}
                <div className={NEU_SURFACE_INSET}>
                    <p className={`${NEU_LABEL} mb-3`}>Comments</p>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-[family-name:var(--font-space-mono)] text-sm font-semibold text-[#1E2938]">
                                Allow comments
                            </p>
                            <p className={`${NEU_MUTED} text-xs mt-0.5`}>
                                {values.allowComments
                                    ? 'Readers can leave comments'
                                    : 'Comments are disabled'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={values.allowComments}
                                onCheckedChange={(checked) => setFieldValue('allowComments', checked)}
                                aria-label="Allow comments"
                            />
                            <span
                                className={`text-xs font-[family-name:var(--font-space-mono)] font-bold ${values.allowComments ? 'text-[#00A63D]' : 'text-[#1E2938]/40'
                                    }`}
                            >
                                {values.allowComments ? 'ON' : 'OFF'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                <div className={NEU_SURFACE_INSET}>
                    <p className={`${NEU_LABEL} mb-3`}>Engagement</p>
                    <div className="flex flex-wrap gap-2">
                        <MetricChip label="Views" value={metrics.viewCount} />
                        <MetricChip label="Likes" value={metrics.likeCount} />
                        <MetricChip label="Shares" value={metrics.shareCount} />
                    </div>
                </div>
            </div>
        </div>
    );
}