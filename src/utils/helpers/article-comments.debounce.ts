// utils/article-comments.debounce.ts
export function useDebouncedCallback(fn: () => void, delay = 300) {
    let t: ReturnType<typeof setTimeout> | undefined;

    const handler = () => {
        if (t) clearTimeout(t);
        t = setTimeout(fn, delay);
    };

    (handler as typeof handler & { flush: () => void }).flush = () => {
        if (t) clearTimeout(t);
        fn();
    };

    return handler as typeof handler & { flush: () => void };
}

// utils/format.ts
export const formatRelative = (iso: string) => {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};
export const formatExact = (iso: string) => new Date(iso).toLocaleString();

// utils/csv.ts
import { AdminArticleRowVM } from '@/types/article-comment.types';

export function exportSliceToCsv(rows: AdminArticleRowVM[]) {
    const header = ['id', 'title', 'slug', 'authorName', 'totalComments', 'pendingComments', 'approvedComments', 'rejectedComments', 'latestCommentAt'];
    const lines = rows.map((r) =>
        [
            r.id,
            JSON.stringify(r.title),
            r.slug,
            JSON.stringify(r.authorName),
            r.totalComments,
            r.pendingComments,
            r.approvedComments,
            r.rejectedComments,
            r.latestCommentAt ?? '',
        ].join(',')
    );
    const blob = new Blob([header.join(',') + '\n' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `article-comments-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
