const memoryFallback = new Map();

const prototypeStoragePrefixes = [
  'ke-',
  'knowledge-engineering-demo-',
];

function cloneFallback(fallback) {
  if (Array.isArray(fallback)) return [...fallback];
  if (fallback && typeof fallback === 'object') return { ...fallback };
  return fallback;
}

function matchesFallbackShape(value, fallback) {
  if (Array.isArray(fallback)) return Array.isArray(value);
  if (fallback === null || fallback === undefined) return true;
  if (typeof fallback === 'object') return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  return typeof value === typeof fallback;
}

export function readStoredJson(key, fallback, validate) {
  try {
    const stored = memoryFallback.has(key) ? memoryFallback.get(key) : window.localStorage.getItem(key);
    if (stored == null) return cloneFallback(fallback);
    const parsed = JSON.parse(stored);
    const isValid = validate ? validate(parsed) : matchesFallbackShape(parsed, fallback);
    return isValid ? parsed : cloneFallback(fallback);
  } catch {
    return cloneFallback(fallback);
  }
}

export function writeStoredJson(key, value) {
  let serialized;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return false;
  }

  try {
    window.localStorage.setItem(key, serialized);
    memoryFallback.delete(key);
    return true;
  } catch {
    memoryFallback.set(key, serialized);
    return false;
  }
}

export function removeStoredItem(key) {
  memoryFallback.delete(key);
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function clearPrototypeStorage() {
  memoryFallback.clear();
  try {
    const keys = Array.from({ length: window.localStorage.length }, (_, index) => window.localStorage.key(index)).filter(Boolean);
    let cleared = true;
    keys
      .filter((key) => prototypeStoragePrefixes.some((prefix) => key.startsWith(prefix)))
      .forEach((key) => {
        try {
          window.localStorage.removeItem(key);
        } catch {
          cleared = false;
        }
      });
    return cleared;
  } catch {
    return false;
  }
}
