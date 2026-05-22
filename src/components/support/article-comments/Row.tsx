'use client';

import { AdminArticleRowVM } from '@/types/article/article-comment.types';
import { encodeId } from '@/utils/helpers/mongodb-id-conversions';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HiArrowTopRightOnSquare } from 'react-icons/hi2';

// ── Style constants ────────────────────────────────────────────
const S = {
    root: 'flex items-center gap-4 w-full',
    inner: 'flex-1 min-w-0',

    titleRow: 'flex items-start gap-2 mb-1',
    title:
        'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-sm truncate',

    externalBtn:
        'flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center ' +
        'bg-[#E7E5E4] text-[#1E2938]/50 ' +
        'shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff] ' +
        'hover:text-[#006666] hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] ' +
        'transition-all duration-200',

    metaRow: 'flex items-center gap-2 flex-wrap',
    slug:
        'font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40',
    dot: 'text-[#1E2938]/20 text-xs',
    authorImg: 'rounded-full ring-1 ring-white/60',
    authorName:
        'font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/60',
};

const Row = ({ row }: { row: AdminArticleRowVM }) => (
    <motion.div
        initial={{ opacity: 0.9, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={S.root}
    >
        <div className={S.inner}>
            <div className={S.titleRow}>
                <span className={S.title}>{row.title}</span>
                <Link
                    href={`/support/articles/${encodeId(encodeURIComponent(row.id))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={S.externalBtn}
                    title="Open article"
                    onClick={(e) => e.stopPropagation()}
                >
                    <HiArrowTopRightOnSquare className="h-3.5 w-3.5" />
                </Link>
            </div>

            <div className={S.metaRow}>
                <span className={S.slug}>{row.slug}</span>
                <span className={S.dot}>•</span>
                {row.authorAvatarUrl && (
                    <Image
                        src={row.authorAvatarUrl}
                        alt={row.authorName}
                        width={16}
                        height={16}
                        className={S.authorImg}
                    />
                )}
                <span className={S.authorName}>{row.authorName}</span>
            </div>
        </div>
    </motion.div>
);

export default Row;