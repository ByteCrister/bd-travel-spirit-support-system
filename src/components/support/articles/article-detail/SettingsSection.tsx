'use client';

import React from 'react';
import { useFormikContext } from 'formik';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

type Values = { allowComments: boolean };
type Props = {
    metrics: { viewCount: number; likeCount: number; shareCount: number };
};

export function SettingsSection({ metrics }: Props) {
    const { values, setFieldValue } = useFormikContext<Values>();

    return (
        <Card className="p-6 rounded-xl border border-gray-200/70 bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-950 shadow-sm space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configuration and metrics</p>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Allow Comments */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Allow comments
                    </label>
                    <div className="flex items-center gap-3">
                        <Switch
                            checked={values.allowComments}
                            onCheckedChange={(checked) => setFieldValue('allowComments', checked)}
                            aria-label="Allow comments"
                        />
                        <span
                            className={`text-sm font-medium ${values.allowComments
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            {values.allowComments ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                </div>

                {/* Metrics */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Metrics
                    </label>
                    <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Views: {metrics.viewCount}
                        </span>
                        <span className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Likes: {metrics.likeCount}
                        </span>
                        <span className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Shares: {metrics.shareCount}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
