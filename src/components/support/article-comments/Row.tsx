'use client';

import { AdminArticleRowVM } from '@/types/article-comment.types';
import { encodeId } from '@/utils/helpers/mongodb-id-conversions';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HiArrowTopRightOnSquare } from 'react-icons/hi2';

const Row = ({ row }: { row: AdminArticleRowVM }) => {
    return (
        <motion.div
            initial={{ opacity: 0.9, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-4 w-full"
        >
            {/* Article content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                    <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {row.title}
                    </span>
                    <Link
                        href={`/support/articles/${encodeId(encodeURIComponent(row.id))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Open article"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <HiArrowTopRightOnSquare className="h-4 w-4" />
                    </Link>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{row.slug}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    {row.authorAvatarUrl && (
                        <Image
                            src={row.authorAvatarUrl}
                            alt={row.authorName}
                            width={16}
                            height={16}
                            className="rounded-full"
                        />
                    )}
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                        {row.authorName}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};
export default Row;