// components/article/ArticleTable.tsx
'use client';

import * as React from 'react';
import { ArticleListItem } from '@/types/article/article.types';
import ArticleTableRow from './ArticleTableRow';
import { motion } from 'framer-motion';
import { FiFileText, FiUser, FiTag, FiEye, FiHeart, FiCalendar, FiTrendingUp } from 'react-icons/fi';

// ── Style tokens ──────────────────────────────────────────────
const S = {
    outer:
        'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 overflow-hidden',
    scrollWrap: 'overflow-x-auto',
    table: 'w-full',
    thead: 'border-b border-[#1E2938]/10',
    th:
        'py-3.5 px-4 text-left font-[family-name:var(--font-space-mono)] text-[10px] font-bold text-[#1E2938]/50 uppercase tracking-widest whitespace-nowrap',
    thInner: 'flex items-center gap-1.5',
    tbody: 'divide-y divide-[#1E2938]/[0.06]',
    // skeleton
    skeletonRow: 'p-4',
    skeletonGrid: 'grid grid-cols-1 md:grid-cols-8 gap-4 items-center',
    skeleton: 'rounded-lg bg-[#d0cecd] animate-pulse',
} as const;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

type Props<T extends ArticleListItem> = { items: T[]; isLoading: boolean };

export default function ArticleTable<T extends ArticleListItem>({ items, isLoading }: Props<T>) {
    if (isLoading) {
        return (
            <div className={S.outer}>
                <div className="divide-y divide-[#1E2938]/[0.06]">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className={S.skeletonRow}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.04 }}
                        >
                            <div className={S.skeletonGrid}>
                                <div className="md:col-span-2 space-y-2">
                                    <div className={`${S.skeleton} h-4 w-3/4`} />
                                    <div className={`${S.skeleton} h-3 w-1/2`} />
                                </div>
                                <div className={`${S.skeleton} h-5 w-20`} />
                                <div className={`${S.skeleton} h-4 w-16`} />
                                <div className={`${S.skeleton} h-4 w-24`} />
                                <div className="flex gap-1">
                                    <div className={`${S.skeleton} h-5 w-12`} />
                                    <div className={`${S.skeleton} h-5 w-12`} />
                                </div>
                                <div className={`${S.skeleton} h-4 w-12`} />
                                <div className={`${S.skeleton} h-4 w-20`} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={S.outer}>
            <div className={S.scrollWrap}>
                <table className={S.table} role="table" aria-label="Articles table">
                    <thead className={S.thead}>
                        <tr role="row">
                            <th className={S.th} scope="col">
                                <div className={S.thInner}><FiFileText className="w-3.5 h-3.5" /><span>Title</span></div>
                            </th>
                            <th className={S.th} scope="col">
                                <div className={S.thInner}><FiTrendingUp className="w-3.5 h-3.5" /><span>Status</span></div>
                            </th>
                            <th className={S.th} scope="col">Type</th>
                            <th className={S.th} scope="col">
                                <div className={S.thInner}><FiUser className="w-3.5 h-3.5" /><span>Author</span></div>
                            </th>
                            <th className={S.th} scope="col">
                                <div className={S.thInner}><FiTag className="w-3.5 h-3.5" /><span>Categories</span></div>
                            </th>
                            <th className={S.th} scope="col">
                                <div className={S.thInner}><FiEye className="w-3.5 h-3.5" /><span>Views</span></div>
                            </th>
                            <th className={S.th} scope="col">
                                <div className={S.thInner}><FiHeart className="w-3.5 h-3.5" /><span>Likes</span></div>
                            </th>
                            <th className={S.th} scope="col">
                                <div className={S.thInner}><FiCalendar className="w-3.5 h-3.5" /><span>Published</span></div>
                            </th>
                        </tr>
                    </thead>
                    <motion.tbody
                        className={S.tbody}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {items.map((item, index) => (
                            <ArticleTableRow key={item.id} item={item} index={index} />
                        ))}
                    </motion.tbody>
                </table>
            </div>
        </div>
    );
}