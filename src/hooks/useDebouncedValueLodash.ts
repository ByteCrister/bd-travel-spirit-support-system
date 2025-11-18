"use client";

import { useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";

/**
 * Debounces an input value using lodash.debounce
 * @param value The raw value
 * @param delay Debounce delay in ms
 */
export function useDebouncedValueLodash<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  const debouncer = useMemo(
    () =>
      debounce((val: T) => {
        setDebounced(val);
      }, delay),
    [delay]
  );

  useEffect(() => {
    debouncer(value);

    return () => {
      debouncer.cancel();
    };
  }, [value, debouncer]);

  return debounced;
}
