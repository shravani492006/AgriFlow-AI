import { useEffect, useState } from "react";

// Tiny localStorage-backed useState. No database, no extra library.
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or blocked - app still works for this session */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
