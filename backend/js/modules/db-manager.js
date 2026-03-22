/**
 * Client-side user snapshot for offline-first UX (localStorage).
 * Persists minimal session-shaped data after login; pages hydrate from cache then refresh from API.
 */

const STORAGE_KEY = 'cho_user_snapshot_v1';
const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * @param {object} user
 * @returns {void}
 */
export function persistLoginSnapshot(user) {
    if (!user || user.id == null) {
        return;
    }
    try {
        const payload = {
            user: {
                id: user.id,
                username: user.username ?? '',
                full_name: user.full_name ?? '',
                role: user.role ?? '',
                email: user.email ?? null,
            },
            savedAt: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
        console.warn('db-manager: could not persist user snapshot', e);
    }
}

/**
 * @returns {{ user: object, savedAt: number } | null}
 */
export function getLoginSnapshot() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }
        const data = JSON.parse(raw);
        if (!data?.user?.id) {
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

/**
 * @param {number} [maxAgeMs]
 * @returns {boolean}
 */
export function isSnapshotStale(maxAgeMs = DEFAULT_MAX_AGE_MS) {
    const snap = getLoginSnapshot();
    if (!snap?.savedAt) {
        return true;
    }
    return Date.now() - snap.savedAt > maxAgeMs;
}

/**
 * @returns {void}
 */
export function clearLoginSnapshot() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        /* ignore */
    }
}
