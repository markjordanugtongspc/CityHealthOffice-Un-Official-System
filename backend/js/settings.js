/**
 * Settings page: panels, profile API, password flow, preferences, local data
 */

import Swal from 'sweetalert2';
import { clearLoginSnapshot, getLoginSnapshot, persistLoginSnapshot } from './modules/db-manager.js';

const DASHBOARD_CACHE_KEY = 'dashboardState_v1';
const EXPORT_CONFIG_KEY = 'export_config';
const AI_CHAT_KEY = 'ai_chat_history';
const NAV_STATE_KEY = 'navState';
const VOUCHER_PREFIX = 'voucher_dv_seq_';

const PREF_REDUCE_MOTION = 'cho_pref_reduce_motion';
const PREF_CONFIRM_CLEAR = 'cho_pref_confirm_clear';
const PREF_EXPORT_HINT = 'cho_pref_export_hint';
const SETTINGS_LAST_PANEL = 'cho_settings_last_panel';

function getApiBasePath() {
    const path = window.location.pathname || '/';
    if (path.includes('/frontend/')) {
        return path.substring(0, path.indexOf('/frontend/'));
    }
    if (path.includes('/index.php')) {
        return path.substring(0, path.indexOf('/index.php'));
    }
    if (path !== '/' && path.endsWith('/')) {
        return path.slice(0, -1);
    }
    return '';
}

function toastOk(title) {
    Swal.fire({
        icon: 'success',
        title,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2800,
        timerProgressBar: true,
    });
}

function toastErr(text) {
    Swal.fire({
        icon: 'error',
        title: text,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3500,
    });
}

function clearVoucherSequenceKeys() {
    try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(VOUCHER_PREFIX)) {
                keys.push(k);
            }
        }
        keys.forEach((k) => localStorage.removeItem(k));
        return keys.length;
    } catch {
        return 0;
    }
}

function wantsClearConfirm() {
    try {
        return localStorage.getItem(PREF_CONFIRM_CLEAR) === '1';
    } catch {
        return false;
    }
}

async function confirmDestructive(message) {
    if (!wantsClearConfirm()) {
        return true;
    }
    const r = await Swal.fire({
        icon: 'warning',
        title: 'Are you sure?',
        text: message,
        showCancelButton: true,
        confirmButtonText: 'Yes, continue',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#224796',
    });
    return r.isConfirmed;
}

/** Match dashboard chart-page-btn active / inactive styling */
const SETTINGS_TAB_ACTIVE = [
    'bg-linear-to-br', 'from-[#224796]', 'to-[#1e3a8a]', 'text-white',
    'shadow-[0_4px_15px_rgba(34,71,150,0.3)]', 'hover:shadow-[0_8px_25px_rgba(34,71,150,0.4)]',
];
const SETTINGS_TAB_INACTIVE = ['text-slate-500', 'hover:text-slate-900', 'hover:bg-white/70'];

function styleSettingsTabs(activePanel) {
    document.querySelectorAll('.settings-tab-btn').forEach((btn) => {
        const tab = btn.getAttribute('data-settings-tab');
        SETTINGS_TAB_ACTIVE.forEach((c) => btn.classList.remove(c));
        SETTINGS_TAB_INACTIVE.forEach((c) => btn.classList.remove(c));
        if (tab === activePanel) {
            SETTINGS_TAB_ACTIVE.forEach((c) => btn.classList.add(c));
            btn.setAttribute('aria-selected', 'true');
        } else {
            SETTINGS_TAB_INACTIVE.forEach((c) => btn.classList.add(c));
            btn.setAttribute('aria-selected', 'false');
        }
    });
}

function setPanel(panel) {
    document.querySelectorAll('[data-settings-panel]').forEach((el) => {
        const id = el.getAttribute('data-settings-panel');
        if (id === panel) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
    styleSettingsTabs(panel);
    try {
        localStorage.setItem(SETTINGS_LAST_PANEL, panel);
    } catch { /* ignore */ }
}

function applyReduceMotion(on) {
    document.documentElement.classList.toggle('cho-reduce-motion', !!on);
    try {
        localStorage.setItem(PREF_REDUCE_MOTION, on ? '1' : '0');
    } catch { /* ignore */ }
}

function syncProfileFieldsFromUser(user) {
    if (!user) return;
    const setVal = (id, v) => {
        const el = document.getElementById(id);
        if (el && 'value' in el) {
            el.value = v ?? '';
        }
    };
    setVal('settingsProfileUsername', user.username);
    setVal('settingsProfileRole', user.role);
    setVal('settingsProfileFullName', user.full_name);
    setVal('settingsProfileEmail', user.email);
    setVal('settingsProfilePhone', user.phone_number || '');
    setVal('settingsProfileDob', user.date_of_birth ? String(user.date_of_birth).slice(0, 10) : '');
    const g = document.getElementById('settingsProfileGender');
    if (g) {
        const gv = user.gender || '';
        g.value = ['Male', 'Female', 'Other', 'Prefer not to say'].includes(gv) ? gv : '';
    }
    setVal('settingsProfileBio', user.bio_graphy || '');
    setVal('settingsProfileLanguages', user.languages_spoken || '');
}

async function loadProfileFromApi() {
    const base = getApiBasePath();
    const res = await fetch(`${base}/api/users/me.php`, { credentials: 'same-origin' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success || !data.user) {
        const snap = getLoginSnapshot();
        if (snap?.user) {
            syncProfileFieldsFromUser({
                ...snap.user,
                phone_number: '',
                date_of_birth: '',
                gender: '',
                bio_graphy: '',
            });
        }
        return;
    }
    syncProfileFieldsFromUser(data.user);
    persistLoginSnapshot(data.user);
}

function updatePasswordMatchUi() {
    const newP = document.getElementById('settingsNewPassword');
    const conf = document.getElementById('settingsNewPasswordConfirm');
    const btn = document.getElementById('settingsSubmitPasswordChange');
    const hint = document.getElementById('settingsPasswordMatchHint');
    if (!newP || !conf || !btn || !hint) return;

    const a = newP.value;
    const b = conf.value;
    if (a.length === 0 && b.length === 0) {
        hint.textContent = '';
        hint.className = 'text-xs text-slate-500';
        btn.disabled = true;
        return;
    }
    if (a.length < 8) {
        hint.textContent = 'New password must be at least 8 characters.';
        hint.className = 'text-xs text-amber-600';
        btn.disabled = true;
        return;
    }
    if (a !== b) {
        hint.textContent = 'New passwords do not match yet.';
        hint.className = 'text-xs text-rose-600';
        btn.disabled = true;
        return;
    }
    hint.textContent = 'Passwords match — you can update.';
    hint.className = 'text-xs text-emerald-600';
    btn.disabled = false;
}

function resetPasswordFlow() {
    const v = document.getElementById('settingsCurrentPasswordVerify');
    const step2 = document.getElementById('settingsPasswordChangeStep2');
    const msg = document.getElementById('settingsPasswordVerifyMsg');
    const newP = document.getElementById('settingsNewPassword');
    const conf = document.getElementById('settingsNewPasswordConfirm');
    const btn = document.getElementById('settingsSubmitPasswordChange');
    if (v) v.value = '';
    if (newP) newP.value = '';
    if (conf) conf.value = '';
    if (step2) step2.classList.add('hidden');
    if (msg) {
        msg.textContent = '';
        msg.className = 'text-sm min-h-[1.25rem]';
    }
    if (btn) btn.disabled = true;
}

export function init() {
    const root = document.getElementById('settingsPageRoot');
    if (!root) return;

    let initial = 'account';
    try {
        const saved = localStorage.getItem(SETTINGS_LAST_PANEL);
        if (saved === 'preferences' || saved === 'data' || saved === 'account') {
            initial = saved;
        }
    } catch { /* ignore */ }
    setPanel(initial);

    document.querySelectorAll('.settings-tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-settings-tab');
            if (tab) setPanel(tab);
        });
    });

    // Language
    const langSel = document.getElementById('settingsUiLanguage');
    if (langSel) {
        try {
            const stored = localStorage.getItem(LANG_KEY);
            if (stored === 'fil' || stored === 'en') {
                langSel.value = stored;
            }
        } catch { /* ignore */ }
        langSel.addEventListener('change', () => {
            applyLanguage(langSel.value);
            toastOk('Language preference saved');
        });
    }
    try {
        const l = localStorage.getItem(LANG_KEY);
        if (l === 'fil' || l === 'en') {
            document.documentElement.lang = l;
        }
    } catch { /* ignore */ }

    // Preferences toggles
    const prefMotion = document.getElementById('settingsPrefReduceMotion');
    const prefClear = document.getElementById('settingsPrefConfirmClear');
    const prefExport = document.getElementById('settingsPrefExportHint');
    if (prefMotion) {
        prefMotion.checked = localStorage.getItem(PREF_REDUCE_MOTION) === '1';
        applyReduceMotion(prefMotion.checked);
        prefMotion.addEventListener('change', () => {
            applyReduceMotion(prefMotion.checked);
            toastOk('Preference saved');
        });
    }
    if (prefClear) {
        prefClear.checked = localStorage.getItem(PREF_CONFIRM_CLEAR) === '1';
        prefClear.addEventListener('change', () => {
            try {
                localStorage.setItem(PREF_CONFIRM_CLEAR, prefClear.checked ? '1' : '0');
            } catch { /* ignore */ }
            toastOk('Preference saved');
        });
    }
    if (prefExport) {
        prefExport.checked = localStorage.getItem(PREF_EXPORT_HINT) === '1';
        prefExport.addEventListener('change', () => {
            try {
                localStorage.setItem(PREF_EXPORT_HINT, prefExport.checked ? '1' : '0');
            } catch { /* ignore */ }
            toastOk('Preference saved');
        });
    }

    loadProfileFromApi();

    const saveBtn = document.getElementById('settingsProfileSaveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const fullName = document.getElementById('settingsProfileFullName')?.value?.trim() || '';
            const email = document.getElementById('settingsProfileEmail')?.value?.trim() || '';
            const phone = document.getElementById('settingsProfilePhone')?.value?.trim() || '';
            const dob = document.getElementById('settingsProfileDob')?.value || '';
            const gender = document.getElementById('settingsProfileGender')?.value || '';
            const bio = document.getElementById('settingsProfileBio')?.value?.trim() || '';

            saveBtn.disabled = true;
            try {
                const base = getApiBasePath();
                const res = await fetch(`${base}/api/users/update-me.php`, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        full_name: fullName,
                        email,
                        phone_number: phone || null,
                        date_of_birth: dob || null,
                        gender: gender || null,
                        bio_graphy: bio || null,
                        languages_spoken: languages || null,
                    }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.success) {
                    toastErr(data.message || 'Could not save profile');
                    return;
                }
                if (data.user) {
                    persistLoginSnapshot(data.user);
                    syncProfileFieldsFromUser(data.user);
                }
                const hint = document.getElementById('settingsProfileSaveHint');
                if (hint) hint.textContent = 'Saved just now.';
                toastOk('Profile saved');
            } catch {
                toastErr('Network error');
            } finally {
                saveBtn.disabled = false;
            }
        });
    }

    const verifyBtn = document.getElementById('settingsVerifyPasswordBtn');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', async () => {
            const pwd = document.getElementById('settingsCurrentPasswordVerify')?.value || '';
            const msg = document.getElementById('settingsPasswordVerifyMsg');
            const step2 = document.getElementById('settingsPasswordChangeStep2');
            if (!pwd) {
                if (msg) {
                    msg.textContent = 'Enter your current password.';
                    msg.className = 'text-sm text-rose-600 min-h-[1.25rem]';
                }
                return;
            }
            verifyBtn.disabled = true;
            try {
                const base = getApiBasePath();
                const res = await fetch(`${base}/api/auth/verify-password.php`, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: pwd }),
                });
                const data = await res.json().catch(() => ({}));
                if (!data.success) {
                    if (msg) {
                        msg.textContent = data.message || 'Could not verify';
                        msg.className = 'text-sm text-rose-600 min-h-[1.25rem]';
                    }
                    return;
                }
                if (!data.valid) {
                    if (msg) {
                        msg.textContent = 'Current password does not match.';
                        msg.className = 'text-sm text-rose-600 min-h-[1.25rem]';
                    }
                    if (step2) step2.classList.add('hidden');
                    return;
                }
                if (msg) {
                    msg.textContent = 'Verified — you can set a new password below.';
                    msg.className = 'text-sm text-emerald-600 min-h-[1.25rem]';
                }
                if (step2) {
                    step2.classList.remove('hidden');
                    document.getElementById('settingsNewPassword')?.focus();
                }
                updatePasswordMatchUi();
            } catch {
                if (msg) {
                    msg.textContent = 'Network error';
                    msg.className = 'text-sm text-rose-600 min-h-[1.25rem]';
                }
            } finally {
                verifyBtn.disabled = false;
            }
        });
    }

    document.getElementById('settingsNewPassword')?.addEventListener('input', updatePasswordMatchUi);
    document.getElementById('settingsNewPasswordConfirm')?.addEventListener('input', updatePasswordMatchUi);

    const changeBtn = document.getElementById('settingsSubmitPasswordChange');
    if (changeBtn) {
        changeBtn.addEventListener('click', async () => {
            const current = document.getElementById('settingsCurrentPasswordVerify')?.value || '';
            const newP = document.getElementById('settingsNewPassword')?.value || '';
            const conf = document.getElementById('settingsNewPasswordConfirm')?.value || '';
            if (newP.length < 8 || newP !== conf) {
                toastErr('Fix password fields before submitting');
                return;
            }
            changeBtn.disabled = true;
            try {
                const base = getApiBasePath();
                const res = await fetch(`${base}/api/auth/change-password.php`, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        current_password: current,
                        new_password: newP,
                    }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.success) {
                    toastErr(data.message || 'Could not change password');
                    return;
                }
                toastOk('Password updated');
                resetPasswordFlow();
            } catch {
                toastErr('Network error');
            } finally {
                updatePasswordMatchUi();
            }
        });
    }

    document.getElementById('settingsCurrentPasswordVerify')?.addEventListener('input', () => {
        const step2 = document.getElementById('settingsPasswordChangeStep2');
        if (step2 && !step2.classList.contains('hidden')) {
            step2.classList.add('hidden');
            const msg = document.getElementById('settingsPasswordVerifyMsg');
            if (msg) {
                msg.textContent = 'Current password changed — verify again to continue.';
                msg.className = 'text-sm text-amber-600 min-h-[1.25rem]';
            }
        }
    });

    const on = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
    };

    on('settingsClearDashboardCache', async () => {
        if (!(await confirmDestructive('Clear dashboard cache on this device?'))) return;
        try {
            localStorage.removeItem(DASHBOARD_CACHE_KEY);
        } catch { /* ignore */ }
        toastOk('Dashboard cache cleared');
    });

    on('settingsClearExportConfig', async () => {
        if (!(await confirmDestructive('Clear saved export filters?'))) return;
        try {
            localStorage.removeItem(EXPORT_CONFIG_KEY);
        } catch { /* ignore */ }
        toastOk('Export filters cleared');
    });

    on('settingsClearUserSnapshot', async () => {
        if (!(await confirmDestructive('Clear offline profile snapshot?'))) return;
        clearLoginSnapshot();
        await loadProfileFromApi();
        toastOk('Offline profile snapshot cleared');
    });

    on('settingsClearAiChat', async () => {
        if (!(await confirmDestructive('Clear AI chat history?'))) return;
        try {
            localStorage.removeItem(AI_CHAT_KEY);
        } catch { /* ignore */ }
        toastOk('AI chat history cleared');
    });

    on('settingsClearVoucherSeq', async () => {
        if (!(await confirmDestructive('Clear voucher sequence counters?'))) return;
        const n = clearVoucherSequenceKeys();
        toastOk(n ? `Cleared ${n} voucher key(s)` : 'No voucher keys to clear');
    });

    on('settingsResetNavState', async () => {
        if (!(await confirmDestructive('Reset sidebar and menu state?'))) return;
        try {
            localStorage.removeItem(NAV_STATE_KEY);
        } catch { /* ignore */ }
        toastOk('Navigation state reset — reload for full effect');
    });
}
