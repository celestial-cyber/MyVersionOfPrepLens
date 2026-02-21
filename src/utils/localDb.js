export function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readLocalCollection(key, fallback = []) {
  if (!canUseStorage()) return Array.isArray(fallback) ? fallback : [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : fallback;
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return Array.isArray(fallback) ? fallback : [];
  }
}

export function writeLocalCollection(key, value) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function upsertLocalItem(key, item, idField = 'id') {
  const existing = readLocalCollection(key, []);
  const next = [...existing];
  const index = next.findIndex((entry) => entry?.[idField] === item?.[idField]);
  if (index >= 0) next[index] = { ...next[index], ...item };
  else next.push(item);
  writeLocalCollection(key, next);
  return next;
}

export function randomShuffle(list = []) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function uniqueById(items = [], idField = 'id') {
  const seen = new Set();
  return items.filter((item) => {
    const key = item?.[idField];
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function toMillis(value) {
  if (!value) return null;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}
