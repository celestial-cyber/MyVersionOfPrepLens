import { useEffect, useMemo, useState } from 'react';

export default function useCachedAnalytics(key, computeFn, deps = [], ttlMs = 60 * 1000) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.sessionStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if ((Date.now() - Number(parsed.timestamp || 0)) > ttlMs) return null;
      return parsed.value;
    } catch {
      return null;
    }
  });

  const computed = useMemo(() => computeFn(), deps);

  useEffect(() => {
    setValue(computed);
    try {
      window.sessionStorage.setItem(key, JSON.stringify({ value: computed, timestamp: Date.now() }));
    } catch {
      // no-op
    }
  }, [computed, key]);

  return value ?? computed;
}
