// components/article/ArticleTableRow.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArticleListItem } from '@/types/article/article.types';
import { Badge } from '@/components/ui/badge';
import { motion, Variants } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { encodeId } from '@/utils/helpers/mongodb-id-conversions';

type Props<T extends ArticleListItem> = {
    item: T;
    index: number;
};

const rowVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
        },
    },
};

// 🎨 Custom status styles
const statusStyles: Record<string, string> = {
    published: 'bg-blue-100 text-blue-700 border border-blue-200',
    draft: 'bg-amber-100 text-amber-700 border border-amber-200',
    archived: 'bg-rose-100 text-rose-700 border border-rose-200',
};

// 🎨 Category color rotation
const categoryColors = [
    'bg-violet-100 text-violet-700 border border-violet-200',
    'bg-pink-100 text-pink-700 border border-pink-200',
    'bg-teal-100 text-teal-700 border border-teal-200',
    'bg-indigo-100 text-indigo-700 border border-indigo-200',
];

export default function ArticleTableRow<T extends ArticleListItem>({
    item,
}: Props<T>) {
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
            className="group hover:bg-accent/50 cursor-pointer transition-all duration-200 hover:shadow-sm"
            aria-label={`Open article ${item.title}`}
        >
            {/* Title + destinations */}
            <td className="py-4 px-4">
                <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {item.title}
                            </span>
                            <motion.div
                                initial={{ x: -5, opacity: 0 }}
                                animate={{ x: isHovered ? 0 : -5, opacity: isHovered ? 1 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <FiArrowRight className="w-4 h-4 text-primary" />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </td>

            {/* Status */}
            <td className="py-4 px-4">
                <Badge
                    className={`capitalize font-medium shadow-sm ${statusStyles[item.status.toLowerCase()] ??
                        'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                >
                    {item.status}
                </Badge>
            </td>

            {/* Article type */}
            <td className="py-4 px-4">
                <span className="text-sm text-muted-foreground font-medium capitalize">
                    {item.articleType}
                </span>
            </td>

            {/* Author */}
            <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                        {(item.author?.name ?? item.author?.id ?? 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                        {item.author?.name ?? item.author?.id}
                    </span>
                </div>
            </td>

            {/* Categories */}
            <td className="py-4 px-4">
                <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                    {(item.categories ?? []).slice(0, 3).map((c, i) => (
                        <Badge
                            key={`${c}-${i}`}
                            className={`text-xs font-medium ${categoryColors[i % categoryColors.length]
                                }`}
                        >
                            {c}
                        </Badge>
                    ))}
                    {(item.categories ?? []).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{(item.categories ?? []).length - 3}
                        </Badge>
                    )}
                </div>
            </td>

            {/* Views */}
            <td className="py-4 px-4">
                <span className="text-sm font-semibold text-foreground">
                    {formatNumber(item.viewCount)}
                </span>
            </td>

            {/* Likes */}
            <td className="py-4 px-4">
                <span className="text-sm font-semibold text-foreground">
                    {formatNumber(item.likeCount)}
                </span>
            </td>

            {/* Published date */}
            <td className="py-4 px-4">
                <span className="text-xs text-muted-foreground font-medium">
                    {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })
                        : '-'}
                </span>
            </td>
        </motion.tr>
    );
}
