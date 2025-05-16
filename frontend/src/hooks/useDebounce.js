import { useState, useEffect } from "react";

/**
 * Debounces a value by a given delay
 * @param {*} value The value to debounce
 * @param {number} delay The debounce delay in ms (default: 500ms)
 * @returns The debounced value
 */
export default function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout if value changes before delay
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
