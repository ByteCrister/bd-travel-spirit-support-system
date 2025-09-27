export function formatNumber(num: number, compact = false): string {
    if (compact) {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
    }
    return new Intl.NumberFormat().format(num);
}

export function formatCurrency(amount: number, compact = false): string {
    if (compact) {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        }
        if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(1)}K`;
        }
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

export function formatPercentage(num: number, decimals = 1): string {
    return `${num.toFixed(decimals)}%`;
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(d);
}

export function formatDateRange(from: Date | null, to: Date | null): string {
    if (!from && !to) return 'All time';
    if (!from) return `Until ${formatDate(to!)}`;
    if (!to) return `From ${formatDate(from)}`;
    return `${formatDate(from)} - ${formatDate(to)}`;
}

export function formatDuration(hours: number): string {
    if (hours < 1) {
        return `${Math.round(hours * 60)}m`;
    }
    if (hours < 24) {
        return `${hours.toFixed(1)}h`;
    }
    return `${Math.round(hours / 24)}d`;
}