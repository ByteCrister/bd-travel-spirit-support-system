'use client';

import React, { JSX } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

export function AdDetailsSkeleton(): JSX.Element {
  const statPlaceholders = new Array(3).fill(null);
  const placementPlaceholders = new Array(3).fill(null);

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Header skeleton */}
      <Card className="overflow-hidden border-2">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-md bg-primary/20 animate-pulse" />
                <div className="h-4 w-52 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse" />
              </div>

              <div className="h-10 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-md animate-pulse mb-2" />

              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse" />
            </div>

            <div className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-9 w-36 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-background">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* InfoRow skeletons */}
            <div className="py-3 px-2 rounded-lg transition-colors bg-accent/10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-muted/40 animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                  <div className="h-5 w-40 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
                </div>
              </div>
            </div>

            <div className="py-3 px-2 rounded-lg transition-colors hover:bg-accent/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-muted/40 animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                  <div className="h-5 w-32 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
                </div>
              </div>
            </div>

            <div className="py-3 px-2 rounded-lg transition-colors bg-accent/10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-muted/40 animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                  <div className="h-5 w-28 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
                </div>
              </div>
            </div>

            <div className="py-3 px-2 rounded-lg transition-colors hover:bg-accent/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-muted/40 animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                  <div className="h-5 w-40 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Performance Metrics skeleton */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statPlaceholders.map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="relative overflow-hidden hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                      <div className="h-10 w-32 bg-slate-300 dark:bg-slate-600 rounded animate-pulse mb-1" />
                      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                      <div className="w-6 h-6 rounded-md bg-primary/20 animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Plan & Billing skeleton */}
      <Card className="border-2">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="py-3 px-2 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-muted/40 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                    <div className="h-5 w-36 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="py-3 px-2 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-muted/40 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                    <div className="h-6 w-40 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="py-3 px-2 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-muted/40 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                    <div className="flex gap-2">
                      {placementPlaceholders.map((_, j) => (
                        <div key={j} className="h-7 w-24 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-3 px-2 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-muted/40 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                    <div className="h-5 w-36 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-3 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3" />
            <div className="p-4 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 border">
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="mt-2 h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </Card>

      {/* Additional Information skeleton */}
      <Card className="border-2">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          </div>

          <div className="space-y-4">
            <div className="py-3 px-2 rounded-lg">
              <div className="h-3 w-44 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
              <div className="h-7 w-72 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
            </div>

            <div className="py-3 px-2 rounded-lg">
              <div className="h-3 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
              <div className="h-20 w-full bg-amber-50 dark:bg-amber-950/20 rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      </Card>

      {/* Audit Trail skeleton */}
      <Card className="border-2">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className="p-2 rounded-full bg-primary/10">
                <div className="w-4 h-4 rounded-md bg-primary/20 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                <div className="h-4 w-56 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className="p-2 rounded-full bg-blue-500/10">
                <div className="w-4 h-4 rounded-md bg-blue-200 dark:bg-blue-800 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="p-2 rounded-full bg-destructive/10">
                <div className="w-4 h-4 rounded-md bg-destructive/20 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions placeholder */}
      <div className="h-16 flex items-center gap-3">
        <div className="h-11 w-28 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
        <div className="h-11 w-28 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
        <div className="h-11 w-28 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
      </div>
    </div>
  );
}

export default AdDetailsSkeleton;
