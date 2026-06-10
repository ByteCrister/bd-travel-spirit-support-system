const EXCHANGE_RATE_API_URL = "https://open.er-api.com/v6/latest/BDT";

type ExchangeRateResponse = {
    result?: string;
    rates?: {
        USD?: number;
    };
};

let cachedRate: { value: number; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch live BDT → USD rate from open.er-api.com.
 * Result is cached in-memory for one hour to reduce API calls during cron runs.
 */
export async function getBdtToUsdRate(): Promise<number> {
    const now = Date.now();

    if (cachedRate && now - cachedRate.fetchedAt < CACHE_TTL_MS) {
        return cachedRate.value;
    }

    const response = await fetch(EXCHANGE_RATE_API_URL, {
        next: { revalidate: 3600 },
    });

    if (!response.ok) {
        throw new Error(`Exchange rate API failed with status ${response.status}`);
    }

    const data = (await response.json()) as ExchangeRateResponse;

    if (data.result !== "success" || !data.rates?.USD) {
        throw new Error("Exchange rate API returned an invalid USD rate");
    }

    cachedRate = { value: data.rates.USD, fetchedAt: now };
    return data.rates.USD;
}

/**
 * Convert a BDT amount to USD using the live exchange rate.
 */
export async function convertBdtToUsd(amountBdt: number): Promise<number> {
    if (amountBdt <= 0) return 0;

    const rate = await getBdtToUsdRate();
    return Number((amountBdt * rate).toFixed(2));
}

/**
 * Convert USD amount to Stripe smallest currency unit (cents).
 */
export function usdToStripeCents(amountUsd: number): number {
    return Math.round(amountUsd * 100);
}
