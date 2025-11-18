"use client";

import { useCallback } from "react";
import type { NormalizedEntity } from "@/types/site-setting.types";
import useSiteSettingsStore from "@/store/site-settings.store";

export default function useStableSelector<T = unknown>(id: string): NormalizedEntity<T> | undefined {
    // pull the getter once and subscribe to changes of the underlying array length + identity map.
    const entity = useSiteSettingsStore(
        useCallback((s) => {
            const list = s.model?.advertising.pricing;
            return list?.find((e) => e.id === id) as NormalizedEntity<T> | undefined;
        }, [id])
    );

    // just return the value; the selector above already memoizes via zustand
    return entity;
}
