// components/article/ArticleTableRow.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArticleListItem } from '@/types/article/article.types';
import { motion, Variants } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { encodeId } from '@/utils/helpers/mongodb-id-conversions';

// ── Style tokens ──────────────────────────────────────────────
const S = {
    row:
        'group cursor-pointer transition-colors duration-150 ' +
        'hover:bg-[#006666]/[0.03] focus-visible:outline-none focus-visible:bg-[#006666]/[0.05]',
    td: 'py-4 px-4',
    title:
        'font-[family-name:var(--font-jetbrains-mono)] font-semibold text-sm text-[#1E2938] ' +
        'group-hover:text-[#006666] transition-colors line-clamp-1',
    statusBase:
        'inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]',
    typeText:
        'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/60 capitalize',
    avatar:
        'w-7 h-7 rounded-full bg-[#006666]/10 text-[#006666] flex items-center justify-center ' +
        'font-[family-name:var(--font-space-mono)] font-bold text-xs flex-shrink-0 ' +
        'shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]',
    authorName:
        'font-[family-name:var(--font-jetbrains-mono)] text-sm font-medium text-[#1E2938]',
    catBadge:
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-[family-name:var(--font-space-mono)] font-bold shadow-[1px_1px_3px_#c8c6c5,-1px_-1px_3px_#ffffff]',
    countBadge:
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/50 shadow-[1px_1px_3px_#c8c6c5,-1px_-1px_3px_#ffffff] bg-[#E7E5E4]',
    statNum:
        'font-[family-name:var(--font-jetbrains-mono)] text-sm font-bold text-[#1E2938]',
    dateText:
        'font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50',
} as const;

const statusStyles: Record<string, string> = {
    published: 'bg-[#00A63D]/10 text-[#00A63D]',
    draft: 'bg-[#FE9900]/10 text-[#FE9900]',
    archived: 'bg-[#FF2157]/10 text-[#FF2157]',
};

const categoryColors = [
    'bg-[#006666]/10 text-[#006666]',
    'bg-[#FE9900]/10 text-[#FE9900]',
    'bg-[#00A63D]/10 text-[#00A63D]',
    'bg-[#1E2938]/10 text-[#1E2938]/70',
];

const rowVariants: Variants = {
    hidden: { opacity: 0, x: -16 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
};

type Props<T extends ArticleListItem> = { item: T; index: number };

export default function ArticleTableRow<T extends ArticleListItem>({ item }: Props<T>) {
    const router = useRouter();
    const [isHovered, setIsHovered] = React.useState(false);

    const onClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
        e.preventDefault();
        router.push(`/support/articles/${encodeId(encodeURIComponent(item.id))}`);
    };

    const formatNumber = (num: number) => {
        if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
        if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <motion.tr
            variants={rowVariants}
            tabIndex={0}
            role="button"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick(e as unknown as React.MouseEvent<HTMLTableRowElement>);
                }
            }}
            className={S.row}
            aria-label={`Open article ${item.title}`}
        >
            {/* Title */}
            <td className={S.td}>
                <div className="flex items-center gap-2">
                    <span className={S.title}>{item.title}</span>
                    <motion.span
                        initial={{ x: -4, opacity: 0 }}
                        animate={{ x: isHovered ? 0 : -4, opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-[#006666] flex-shrink-0"
                    >
                        <FiArrowRight className="w-3.5 h-3.5" />
                    </motion.span>
                </div>
            </td>

            {/* Status */}
            <td className={S.td}>
                <span
                    className={`${S.statusBase} ${statusStyles[item.status.toLowerCase()] ?? 'bg-[#1E2938]/10 text-[#1E2938]/60'}`}
                >
                    {item.status}
                </span>
            </td>

            {/* Type */}
            <td className={S.td}>
                <span className={S.typeText}>{item.articleType}</span>
            </td>

            {/* Author */}
            <td className={S.td}>
                <div className="flex items-center gap-2">
                    <div className={S.avatar}>
                        {(item.author?.name ?? item.author?.id ?? 'U')[0].toUpperCase()}
                    </div>
                    <span className={S.authorName}>
                        {item.author?.name ?? item.author?.id}
                    </span>
                </div>
            </td>

            {/* Categories */}
            <td className={S.td}>
                <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {(item.categories ?? []).slice(0, 3).map((c, i) => (
                        <span
                            key={`${c}-${i}`}
                            className={`${S.catBadge} ${categoryColors[i % categoryColors.length]}`}
                        >
                            {c}
                        </span>
                    ))}
                    {(item.categories ?? []).length > 3 && (
                        <span className={S.countBadge}>
                            +{(item.categories ?? []).length - 3}
                        </span>
                    )}
                </div>
            </td>

            {/* Views */}
            <td className={S.td}>
                <span className={S.statNum}>{formatNumber(item.viewCount)}</span>
            </td>

            {/* Likes */}
            <td className={S.td}>
                <span className={S.statNum}>{formatNumber(item.likeCount)}</span>
            </td>

            {/* Published date */}
            <td className={S.td}>
                <span className={S.dateText}>
                    {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })
                        : '—'}
                </span>
            </td>
        </motion.tr>
    );
}