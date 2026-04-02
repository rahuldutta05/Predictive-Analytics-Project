const STORAGE_KEY = "agrisense_history_v1";

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function loadHistory() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeJsonParse(raw) : null;
  return Array.isArray(parsed) ? parsed : [];
}

export function pushHistoryEntry(entry) {
  if (typeof window === "undefined") return;
  const history = loadHistory();
  const next = [{ id: cryptoRandomId(), ...entry }, ...history].slice(0, 30); // keep last 30
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

function cryptoRandomId() {
  // Prefer built-in if available
  if (typeof crypto !== "undefined" && crypto?.randomUUID) return crypto.randomUUID();
  // Fallback
  return `h_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

