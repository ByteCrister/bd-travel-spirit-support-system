"use client";

import { useMemo, useRef } from "react";
import debounce from "lodash/debounce";

/**
 * Debounced callback hook
 *
 * Returns a stable debounced function that calls the latest `callback` after
 * the specified `delay`. The hook keeps a ref to the most recent callback so
 * the debounced function always invokes the latest implementation without
 * needing to recreate the debounced wrapper on every render.
 *
 * @template A - tuple type of the callback arguments (e.g. [string, number])
 * @param {( ...args: A ) => void} callback - Function to be debounced. It will be invoked
 *   after the debounce `delay` has elapsed since the last call. The hook stores
 *   the latest callback in a ref so you can safely use inline functions.
 * @param {number} [delay=300] - Debounce delay in milliseconds. Controls how long
 *   the hook waits after the last call before invoking `callback`.
 * @returns {(...args: A) => void & { cancel?: () => void; flush?: () => void }} A debounced function
 *   with the same argument signature as `callback`. The returned function is stable
 *   across renders (unless `delay` changes) and includes lodash debounce helpers
 *   such as `cancel` and `flush` when available.
 */
export function useDebouncedCallback<A extends unknown[]>(
    callback: (...args: A) => void,
    delay = 300
) {
    // Keep a ref to the latest callback so the debounced wrapper can call it
    // without needing to be recreated on every render.
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    // Create the debounced function once per `delay`. The debounced function
    // delegates to the latest callback via callbackRef.current(...args).
    // lodash.debounce returns a function that also exposes `cancel` and `flush`.
    const debouncedFn = useMemo(
        () =>
            debounce((...args: A) => {
                callbackRef.current(...args);
            }, delay),
        [delay]
    );

    return debouncedFn;
}