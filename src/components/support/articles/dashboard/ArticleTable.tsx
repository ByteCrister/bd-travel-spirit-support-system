// components/article/ArticleTable.tsx
'use client';

import * as React from 'react';
import { ArticleListItem } from '@/types/article.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import ArticleTableRow from './ArticleTableRow';
import { motion } from 'framer-motion';
import { FiFileText, FiUser, FiTag, FiEye, FiHeart, FiCalendar, FiTrendingUp } from 'react-icons/fi';

type Props<T extends ArticleListItem> = {
    items: T[];
    isLoading: boolean;
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

export default function ArticleTable<T extends ArticleListItem>({ items, isLoading }: Props<T>) {
    if (isLoading) {
        return (
            <Card className="border-0 shadow-sm">
                <div className="divide-y divide-border">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center">
                                <div className="md:col-span-2 space-y-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-24" />
                                <div className="flex gap-1">
                                    <Skeleton className="h-5 w-12" />
                                    <Skeleton className="h-5 w-12" />
                                </div>
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full" role="table" aria-label="Articles table">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" role="row">
                            <th className="py-4 px-4 font-semibold" scope="col">
                                <div className="flex items-center gap-2">
                                    <FiFileText className="w-4 h-4" />
                                    <span>Title</span>
                                </div>
                            </th>
                            <th className="py-4 px-4 font-semibold" scope="col">
                                <div className="flex items-center gap-2">
                                    <FiTrendingUp className="w-4 h-4" />
                                    <span>Status</span>
                                </div>
                            </th>
                            <th className="py-4 px-4 font-semibold" scope="col">Type</th>
                            <th className="py-4 px-4 font-semibold" scope="col">
                                <div className="flex items-center gap-2">
                                    <FiUser className="w-4 h-4" />
                                    <span>Author</span>
                                </div>
                            </th>
                            <th className="py-4 px-4 font-semibold" scope="col">
                                <div className="flex items-center gap-2">
                                    <FiTag className="w-4 h-4" />
                                    <span>Categories</span>
                                </div>
                            </th>
                            <th className="py-4 px-4 font-semibold" scope="col">
                                <div className="flex items-center gap-2">
                                    <FiEye className="w-4 h-4" />
                                    <span>Views</span>
                                </div>
                            </th>
                            <th className="py-4 px-4 font-semibold" scope="col">
                                <div className="flex items-center gap-2">
                                    <FiHeart className="w-4 h-4" />
                                    <span>Likes</span>
                                </div>
                            </th>
                            <th className="py-4 px-4 font-semibold" scope="col">
                                <div className="flex items-center gap-2">
                                    <FiCalendar className="w-4 h-4" />
                                    <span>Published</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <motion.tbody
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="divide-y divide-border"
                    >
                        {items.map((item, index) => (
                            <ArticleTableRow key={item.id} item={item} index={index} />
                        ))}
                    </motion.tbody>
                </table>
            </div>
        </Card>
    );
}