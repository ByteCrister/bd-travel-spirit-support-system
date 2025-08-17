// utils/formatTimestamp.ts

export function formatTimestamp(isoDateString: string) {
    const date = new Date(isoDateString);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    // If less than 1 minute ago
    if (diffMin < 1) {
        return 'Just now';
    }

    // If less than 1 hour ago
    if (diffHour < 1) {
        return `${diffMin} min ago`;
    }

    // If today, show time (e.g., 2:30 PM)
    if (now.toDateString() === date.toDateString()) {
        return date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    // If yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toDateString() === date.toDateString()) {
        return 'Yesterday';
    }

    // Else show date like Aug 22
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
}
