import { Drawer } from 'flowbite';
import { attachNumberFormatter, formatWithCommas, parseFormattedNumber } from './number-input.js';

const DEFAULT_PASSWORD = 'mjUgtong2026!';

let adminDrawerInstance = null;
let adminDrawerOnConfirm = null;
let adminDrawerValidationError = null;
let budgetDrawerInstance = null;
let budgetDrawerOnConfirm = null;
let budgetCalculateDrawerInstance = null;
let budgetCalculateCachedCsv = "";
let monthlyDrawerInstance = null;
let monthlyDrawerOnConfirm = null;
let fundDownloadedDrawerInstance = null;
let fundDownloadedDrawerOnConfirm = null;
let fundDownloadedCalculateDrawerInstance = null;
let fundDownloadedCalculateCachedCsv = "";

function hideFloatingUI() {
    const chatbotRoot = document.getElementById('ai-chatbot-root');
    const aiButton = document.getElementById('aiChatButton');
    const aiContainer = document.getElementById('aiChatContainer');
    const scrollTopBtn = document.getElementById('scrollToTopBtn');

    if (chatbotRoot) chatbotRoot.classList.add('hidden');
    if (aiButton) {
        aiButton.classList.add('hidden');
        aiButton.style.display = 'none';
    }
    if (aiContainer) {
        aiContainer.classList.add('hidden');
        aiContainer.style.display = 'none';
    }
    if (scrollTopBtn) {
        scrollTopBtn.classList.add('hidden');
        scrollTopBtn.style.display = 'none';
    }
}

function showFloatingUI() {
    const chatbotRoot = document.getElementById('ai-chatbot-root');
    const aiButton = document.getElementById('aiChatButton');
    const aiContainer = document.getElementById('aiChatContainer');
    const scrollTopBtn = document.getElementById('scrollToTopBtn');

    if (chatbotRoot) chatbotRoot.classList.remove('hidden');
    if (aiButton) {
        aiButton.classList.remove('hidden');
        aiButton.style.display = 'inline-flex';
    }
    if (aiContainer) {
        aiContainer.classList.add('hidden');
        aiContainer.style.display = 'none';
    }
    if (scrollTopBtn) {
        scrollTopBtn.classList.remove('hidden');
        scrollTopBtn.style.display = 'flex';
    }
}

function ensureAdminDrawer() {
    if (document.getElementById('adminCreateUserDrawer')) return;

    const sections = [
        ['dashboard', 'Dashboard', true, false],
        ['budget', 'Budget Summary', true, true],
        ['expenses', 'Expenses', true, true],
        ['export', 'Export', true, false],
    ];
    const permissionRows = sections.map(([key, label, readDefault, editAvailable]) => `
        <tr class="border-t border-slate-100">
            <th class="px-3 py-2 font-medium text-slate-800">${label}</th>
            <td class="px-3 py-2">${permissionSwitch(`permission-${key}-read`, readDefault)}</td>
            <td class="px-3 py-2">${editAvailable ? permissionSwitch(`permission-${key}-edit`, false) : '-'}</td>
            <td class="px-3 py-2">${key === 'export' ? permissionSwitch(`permission-${key}-export`, true) : '-'}</td>
        </tr>`).join('');

    const drawerHTML = `
        <div id="adminCreateUserDrawer" class="fixed top-0 right-0 z-[80] h-screen w-full max-w-3xl p-4 sm:p-6 lg:p-8 overflow-y-auto bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.28)] border-l border-slate-200/80 transform translate-x-full transition-transform flex flex-col justify-between" tabindex="-1" aria-labelledby="adminCreateUserDrawerLabel">
            <div class="flex-1 flex flex-col justify-between">
                <div>
                    <div class="flex items-start justify-between border-b border-slate-200 pb-4 mb-5">
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600 mb-1">User management</p>
                            <h2 id="adminCreateUserDrawerLabel" class="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">Add User</h2>
                            <p class="mt-1 text-sm text-slate-500">Create or delete new users for this account.</p>
                        </div>
                        <button type="button" id="adminDrawerCloseBtn" aria-controls="adminCreateUserDrawer" class="inline-flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shrink-0 ml-3">
                            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12"/>
                            </svg>
                            <span class="sr-only">Close panel</span>
                        </button>
                    </div>
                    <div id="adminDrawerValidationError" class="hidden mb-4 p-3 text-xs md:text-sm text-rose-800 bg-rose-50 rounded-lg border border-rose-200"></div>
                    <form id="adminCreateUserDrawerForm" class="flex flex-col gap-5">
                        <section>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${field('admin-full-name','full-name','Name','Enter your full name','text')}
                                ${field('admin-username','username','Username','Enter your username | e.g., maria.santos','text')}
                                ${field('admin-email','email','Email','e.g., maria.santos@cho.gov.ph','email')}
                                <div>
                                    <label for="admin-role" class="block mb-1.5 text-sm font-semibold text-slate-800">Role</label>
                                    <select id="admin-role" name="role" required class="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:ring-cyan-500">
                                        <option value="">Select role...</option>
                                        <option>Administrator</option>
                                        <option>CEO</option>
                                        <option>Manager</option>
                                        <option>Workmate</option>
                                        <option>Staff</option>
                                    </select>
                                </div>
                                <div class="md:col-span-2">
                                    <label for="admin-password" class="flex items-center justify-between mb-1.5 text-sm font-semibold text-slate-800">
                                        <span>Password</span>
                                        <button type="button" id="adminClearPassword" class="text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer">Clear</button>
                                    </label>
                                    <div class="relative">
                                        <input id="admin-password" name="password" type="password" class="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-11 text-sm tracking-[0.25em] text-slate-900 focus:border-cyan-500 focus:ring-cyan-500" placeholder="Default password" value="${DEFAULT_PASSWORD}" />
                                        <button type="button" id="adminPasswordEye" aria-label="Hold to show password" class="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-500 hover:text-cyan-600 cursor-pointer">
                                            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7Z"/>
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section>
                            <div class="border-b border-slate-200 pb-2 mb-3">
                                <h3 class="text-base sm:text-lg font-semibold text-slate-900">User Permissions</h3>
                                <p class="mt-0.5 text-xs sm:text-sm text-slate-500">Select what a user can see or do in the app.</p>
                            </div>
                            <div class="overflow-x-auto rounded-lg border border-slate-200">
                                <table class="w-full min-w-[560px] text-sm text-left">
                                    <thead class="bg-slate-50 text-slate-600">
                                        <tr>
                                            <th class="px-3 py-2.5 font-medium">Section</th>
                                            <th class="px-3 py-2.5 font-medium">Read</th>
                                            <th class="px-3 py-2.5 font-medium">Edit</th>
                                            <th class="px-3 py-2.5 font-medium">Export</th>
                                        </tr>
                                    </thead>
                                    <tbody>${permissionRows}</tbody>
                                </table>
                            </div>
                        </section>
                        <section>
                            <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                                <p class="text-xs font-semibold text-emerald-900"><strong>Default password:</strong> <span>${DEFAULT_PASSWORD}</span></p>
                                <p class="mt-0.5 text-xs text-emerald-700">The user can change this after signing in.</p>
                            </div>
                        </section>
                    </form>
                </div>
                <div class="mt-6 border-t border-slate-200 pt-4 pb-1 bg-white sticky bottom-0 z-10">
                    <div class="flex items-center gap-3.5">
                        <button type="button" id="adminDrawerCancelBtn" class="inline-flex items-center justify-center rounded-xl border border-rose-600 bg-transparent w-1/2 px-4 py-3 text-sm font-semibold text-rose-600 shadow-xs hover:bg-rose-600 hover:border-rose-600 hover:text-white active:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-200 cursor-pointer transition-all duration-200">Discard</button>
                        <button type="submit" form="adminCreateUserDrawerForm" class="inline-flex items-center justify-center rounded-xl bg-cyan-600 w-1/2 px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-cyan-700 active:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-200 cursor-pointer transition-all duration-200">
                            <svg class="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5"/>
                            </svg>
                            <span>Create User</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', drawerHTML);
    const drawerEl = document.getElementById('adminCreateUserDrawer');
    const form = document.getElementById('adminCreateUserDrawerForm');
    adminDrawerInstance = new Drawer(drawerEl, { placement: 'right', backdrop: 'dynamic', backdropClasses: 'bg-slate-900/40 backdrop-blur-sm fixed inset-0 z-[70]' });
    const hideDrawer = () => { adminDrawerInstance?.hide(); adminDrawerOnConfirm = null; adminDrawerValidationError = null; showFloatingUI(); };
    document.getElementById('adminDrawerCancelBtn')?.addEventListener('click', hideDrawer);
    document.getElementById('adminDrawerCloseBtn')?.addEventListener('click', hideDrawer);
    document.getElementById('adminClearPassword')?.addEventListener('click', () => { const input = document.getElementById('admin-password'); if (input) input.value = ''; });
    const eye = document.getElementById('adminPasswordEye');
    const password = document.getElementById('admin-password');
    const reveal = () => { if (password) password.type = 'text'; };
    const conceal = () => { if (password) password.type = 'password'; };
    eye?.addEventListener('pointerdown', reveal); eye?.addEventListener('pointerup', conceal); eye?.addEventListener('pointerleave', conceal); eye?.addEventListener('pointercancel', conceal);
    form?.addEventListener('submit', (e) => { e.preventDefault(); handleAdminDrawerSubmit(); });
}

function field(id, name, label, placeholder, type) {
    return `<div><label for="${id}" class="block mb-1.5 text-sm font-semibold text-slate-800">${label}</label><input id="${id}" name="${name}" type="${type}" required class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:ring-cyan-500" placeholder="${placeholder}" /></div>`;
}

function permissionSwitch(name, checked) {
    return `<label class="inline-flex items-center gap-2 cursor-pointer"><input type="checkbox" name="${name}" class="sr-only peer" ${checked ? 'checked' : ''}><span class="relative h-5 w-9 rounded-full bg-slate-200 peer-checked:bg-cyan-600 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full"></span><span class="text-xs text-slate-500">Active</span></label>`;
}

// START: ensureBudgetDrawer - Initialize and mount budget entry create/edit drawer
function ensureBudgetDrawer() {
    if (document.getElementById('budgetCreateDrawer')) return;

    const drawerHTML = `
        <!-- Budget Create/Edit Drawer -->
        <div id="budgetCreateDrawer"
             class="fixed top-0 right-0 z-[80] h-screen w-full max-w-xl p-6 sm:p-8 lg:p-10 overflow-y-auto bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.28)] border-l border-slate-200/80 transform translate-x-full transition-transform flex flex-col justify-between"
             tabindex="-1"
             aria-labelledby="budgetCreateDrawerLabel">
            
            <div class="flex-1 flex flex-col">
                <!-- Header -->
                <div class="flex items-start justify-between border-b-dashed-medium pb-5 mb-7">
                    <div>
                        <h2 id="budgetCreateDrawerLabel" class="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">Initialize Budget Entry</h2>
                        <p id="budgetCreateDrawerSublabel" class="mt-1.5 text-sm sm:text-base text-slate-500 leading-relaxed">Configure account allocation and financial details for the selected fiscal year.</p>
                    </div>
                    <button type="button"
                            id="budgetDrawerCloseBtn"
                            aria-controls="budgetCreateDrawer"
                            class="inline-flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shrink-0 ml-3">
                        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12"/>
                        </svg>
                        <span class="sr-only">Close panel</span>
                    </button>
                </div>

                <div id="budgetDrawerValidationError"
                     class="hidden mb-5 p-3.5 text-sm text-rose-800 bg-rose-50 rounded-xl border border-rose-200"></div>

                <form id="budgetCreateDrawerForm" class="flex flex-col flex-1 gap-6">
                    <input type="hidden" id="budget-id" name="id" value="" />

                    <!-- Single Column Vertical Form Fields with generous sizing and line-height -->
                    <div class="space-y-2">
                        <label for="budget-glCode" class="block text-sm sm:text-base font-semibold text-slate-800">
                            G/L Account Code <span class="text-rose-500">*</span>
                        </label>
                        <input type="text" id="budget-glCode" name="gl_code" placeholder="e.g. 1011" required
                               class="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-base sm:text-lg font-mono text-slate-900 focus:ring-4 focus:ring-[#224796]/10 focus:border-[#224796] outline-hidden transition-all shadow-xs" />
                    </div>

                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <label for="budget-accountTitle" class="block text-sm sm:text-base font-semibold text-slate-800">
                                Account Title <span class="text-xs sm:text-sm font-normal text-slate-400 ml-1">(optional)</span>
                            </label>
                        </div>
                        <div class="relative">
                            <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                            </span>
                            <input type="text" id="budget-accountTitle" placeholder="Type to search (e.g. Travel Expenses...)"
                                   autocomplete="off"
                                   class="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-300 rounded-xl text-sm sm:text-base text-slate-900 focus:ring-4 focus:ring-[#224796]/10 focus:border-[#224796] outline-hidden transition-all shadow-xs" />
                            <div id="budget-accountTitle-suggestions"
                                 class="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl hidden"></div>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label for="budget-actual" class="block text-sm sm:text-base font-semibold text-slate-800">
                            Actual (₱)
                        </label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base sm:text-lg font-bold">₱</span>
                            <input type="text" inputmode="decimal" id="budget-actual" placeholder="0.00"
                                   class="w-full pl-9 pr-4 py-3.5 bg-white border border-slate-300 rounded-xl text-base sm:text-lg font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-hidden text-[#224796] font-money transition-all shadow-xs" />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label for="budget-budget" class="block text-sm sm:text-base font-semibold text-slate-800">
                            Budget (₱) <span class="text-rose-500">*</span>
                        </label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base sm:text-lg font-bold">₱</span>
                            <input type="text" inputmode="decimal" id="budget-budget" placeholder="0.00" required
                                   class="w-full pl-9 pr-4 py-3.5 bg-white border border-slate-300 rounded-xl text-base sm:text-lg font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-hidden text-[#224796] font-money transition-all shadow-xs" />
                        </div>
                    </div>

                    <!-- Footer actions -->
                    <div class="mt-8 border-t-dashed-medium pt-5 pb-2 bg-white sticky bottom-0">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
                            <button type="button"
                                    id="budgetDrawerCancelBtn"
                                    class="inline-flex items-center justify-center rounded-xl border border-rose-600 bg-transparent px-6 py-3.5 text-sm sm:text-base font-semibold text-rose-600 shadow-xs hover:bg-rose-600 hover:border-rose-600 hover:text-white active:bg-rose-700 active:border-rose-700 active:text-white focus:outline-none focus:ring-4 focus:ring-rose-200 cursor-pointer w-full sm:w-[48%] transition-all duration-200">
                                Cancel
                            </button>
                            <button type="submit"
                                    id="budgetDrawerSubmitBtn"
                                    class="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-xs hover:bg-emerald-600 active:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 cursor-pointer w-full sm:w-[48%] transition-all duration-200">
                                <svg id="budgetDrawerSubmitIcon" class="mr-2 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5"/>
                                </svg>
                                <span id="budgetDrawerSubmitText">Add Entry</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    const drawerEl = document.getElementById('budgetCreateDrawer');
    const cancelBtn = document.getElementById('budgetDrawerCancelBtn');
    const closeBtn = document.getElementById('budgetDrawerCloseBtn');
    const form = document.getElementById('budgetCreateDrawerForm');
    const budgetInput = document.getElementById('budget-budget');
    const actualInput = document.getElementById('budget-actual');
    const glCodeInput = document.getElementById('budget-glCode');
    const accountTitleInput = document.getElementById('budget-accountTitle');
    const idInput = document.getElementById('budget-id');
    const suggestionsEl = document.getElementById('budget-accountTitle-suggestions');

    if (!drawerEl) return;

    if (budgetInput) attachNumberFormatter(budgetInput);
    if (actualInput) attachNumberFormatter(actualInput);

    budgetDrawerInstance = new Drawer(drawerEl, {
        placement: 'right',
        backdrop: 'dynamic',
        backdropClasses: 'bg-slate-900/40 backdrop-blur-sm fixed inset-0 z-[70]'
    });

    const getApiBasePath = () => {
        const path = window.location.pathname || '/';
        const idx = path.indexOf('/frontend/');
        return idx !== -1 ? path.substring(0, idx) : path.substring(0, path.lastIndexOf('/')) || '';
    };

    const showSuggestions = (q) => {
        if (!suggestionsEl) return;
        const apiBase = getApiBasePath();
        fetch(`${apiBase}/api/account-titles/search.php?q=${encodeURIComponent(q || '')}`)
            .then(r => r.json())
            .then(res => {
                if (!res.success || !res.data) return;
                suggestionsEl.innerHTML = res.data.map(item => {
                    const gl = String(item.gl_code || '');
                    const title = String(item.account_title || '');
                    const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    return `<div class="px-4 py-3 hover:bg-slate-100 cursor-pointer text-sm sm:text-base text-slate-700 border-b border-slate-100 last:border-b-0 transition-colors flex items-center gap-2.5" data-gl="${esc(gl)}" data-title="${esc(title)}">
                                <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                                <span>${gl} - ${esc(title)}</span>
                            </div>`;
                }).join('');
                suggestionsEl.classList.remove('hidden');
                suggestionsEl.querySelectorAll('[data-gl]').forEach(el => {
                    el.addEventListener('click', () => {
                        glCodeInput.value = el.dataset.gl || '';
                        accountTitleInput.value = el.dataset.title || '';
                        suggestionsEl.classList.add('hidden');
                    });
                });
            })
            .catch(() => { suggestionsEl.classList.add('hidden'); });
    };

    let debounceTimer;
    if (accountTitleInput) {
        accountTitleInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => showSuggestions(accountTitleInput.value.trim()), 150);
        });
        accountTitleInput.addEventListener('focus', () => {
            const val = accountTitleInput.value.trim();
            showSuggestions(val || '');
        });
    }
    document.addEventListener('click', (e) => {
        if (suggestionsEl && !suggestionsEl.contains(e.target) && e.target !== accountTitleInput) {
            suggestionsEl.classList.add('hidden');
        }
    });

    const hideDrawer = () => {
        budgetDrawerInstance?.hide();
        budgetDrawerOnConfirm = null;
        showFloatingUI();
    };

    cancelBtn?.addEventListener('click', hideDrawer);
    closeBtn?.addEventListener('click', hideDrawer);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hideDrawer();
    });

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = idInput?.value || null;
        const glCode = glCodeInput?.value?.trim();
        const accountTitle = accountTitleInput?.value?.trim();
        const actualParsed = parseFormattedNumber(actualInput?.value);
        const parsed = parseFormattedNumber(budgetInput?.value);

        if (!glCode) {
            const err = document.getElementById('budgetDrawerValidationError');
            if (err) {
                err.textContent = 'G/L Code is required.';
                err.classList.remove('hidden');
            }
            return;
        }
        if (parsed < 0) {
            const err = document.getElementById('budgetDrawerValidationError');
            if (err) {
                err.textContent = 'Budget cannot be negative.';
                err.classList.remove('hidden');
            }
            return;
        }

        const err = document.getElementById('budgetDrawerValidationError');
        if (err) err.classList.add('hidden');

        const confirmCallback = budgetDrawerOnConfirm;
        hideDrawer();
        if (typeof confirmCallback === 'function') {
            confirmCallback({
                id: id ? Number(id) : null,
                glCode,
                accountTitle: accountTitle || glCode,
                actual: actualParsed,
                budget: parsed,
            });
        }
    });
}
// END: ensureBudgetDrawer

// START: showBudgetCreateDrawer - Displays the budget entry creation drawer
export function showBudgetCreateDrawer({ year, onConfirm }) {
    ensureBudgetDrawer();
    budgetDrawerOnConfirm = onConfirm;

    const label = document.getElementById('budgetCreateDrawerLabel');
    if (label) label.textContent = 'Initialize Budget Entry';

    const sublabel = document.getElementById('budgetCreateDrawerSublabel');
    if (sublabel) sublabel.textContent = 'Configure account allocation and financial details for the selected fiscal year.';

    const idInput = document.getElementById('budget-id');
    if (idInput) idInput.value = '';

    const glCodeInput = document.getElementById('budget-glCode');
    if (glCodeInput) {
        glCodeInput.value = '';
        glCodeInput.readOnly = false;
        glCodeInput.classList.remove('bg-slate-50', 'text-slate-500', 'cursor-not-allowed');
        glCodeInput.classList.add('bg-white', 'text-slate-900');
    }

    const actualInput = document.getElementById('budget-actual');
    if (actualInput) {
        actualInput.value = '';
    }

    const budgetInput = document.getElementById('budget-budget');
    if (budgetInput) {
        budgetInput.value = '';
    }

    const submitText = document.getElementById('budgetDrawerSubmitText');
    if (submitText) submitText.textContent = 'Add Entry';

    const submitIcon = document.getElementById('budgetDrawerSubmitIcon');
    if (submitIcon) {
        submitIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5"/>`;
    }

    const form = document.getElementById('budgetCreateDrawerForm');
    const err = document.getElementById('budgetDrawerValidationError');
    if (form) form.reset();
    if (err) err.classList.add('hidden');

    hideFloatingUI();
    budgetDrawerInstance?.show();

    if (glCodeInput) {
        setTimeout(() => {
            glCodeInput.focus();
            glCodeInput.select();
        }, 50);
    }
}
// END: showBudgetCreateDrawer

// START: showBudgetEditDrawer - Displays the budget entry edit drawer
export function showBudgetEditDrawer(row, { onConfirm }) {
    ensureBudgetDrawer();
    budgetDrawerOnConfirm = onConfirm;

    const label = document.getElementById('budgetCreateDrawerLabel');
    if (label) label.textContent = 'Edit Budget Entry';

    const sublabel = document.getElementById('budgetCreateDrawerSublabel');
    if (sublabel) sublabel.textContent = `Update account allocation and financial details for G/L Account ${row.glCode || ''}.`;

    const idInput = document.getElementById('budget-id');
    if (idInput) idInput.value = row.id || '';

    const glCodeInput = document.getElementById('budget-glCode');
    if (glCodeInput) {
        glCodeInput.value = row.glCode || '';
        glCodeInput.readOnly = false;
        glCodeInput.classList.remove('bg-slate-50', 'text-slate-500', 'cursor-not-allowed');
        glCodeInput.classList.add('bg-white', 'text-slate-900');
    }

    const accountTitleInput = document.getElementById('budget-accountTitle');
    if (accountTitleInput) {
        accountTitleInput.value = row.accountTitle || '';
    }

    const actualInput = document.getElementById('budget-actual');
    if (actualInput) {
        actualInput.value = row.actual !== undefined && row.actual !== null ? formatWithCommas(row.actual) : '';
    }

    const budgetInput = document.getElementById('budget-budget');
    if (budgetInput) {
        budgetInput.value = row.budget !== undefined && row.budget !== null ? formatWithCommas(row.budget) : '';
    }

    const submitText = document.getElementById('budgetDrawerSubmitText');
    if (submitText) submitText.textContent = 'Save Changes';

    const submitIcon = document.getElementById('budgetDrawerSubmitIcon');
    if (submitIcon) {
        submitIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
    }

    const err = document.getElementById('budgetDrawerValidationError');
    if (err) err.classList.add('hidden');

    hideFloatingUI();
    budgetDrawerInstance?.show();

    if (glCodeInput) {
        setTimeout(() => {
            glCodeInput.focus();
            glCodeInput.select();
        }, 50);
    }
}
// END: showBudgetEditDrawer


// START: ensureBudgetCalculateDrawer - Initialize and mount budget summary calculation drawer
function ensureBudgetCalculateDrawer() {
    if (document.getElementById('budgetCalculateDrawer')) return;

    const drawerHTML = `
        <!-- Budget Summary Calculation Drawer -->
        <div id="budgetCalculateDrawer"
             class="fixed top-0 right-0 z-[80] h-screen w-full max-w-lg p-5 sm:p-6 overflow-y-auto bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.28)] border-l border-slate-200/80 transform translate-x-full transition-transform flex flex-col justify-between"
             tabindex="-1"
             aria-labelledby="budgetCalculateDrawerLabel">
            
            <div class="flex-1 flex flex-col">
                <!-- Header -->
                <div class="flex items-start justify-between border-b-dashed-medium pb-4 mb-4">
                    <div>
                        <h2 id="budgetCalculateDrawerLabel" class="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">Budget Summary Calculation</h2>
                        <p id="budgetCalculateDrawerSubtitle" class="mt-1 text-xs sm:text-sm text-slate-500 leading-normal">Comprehensive totals and allocation efficiency for the fiscal year.</p>
                    </div>
                    <button type="button"
                            id="budgetCalculateDrawerCloseBtn"
                            aria-controls="budgetCalculateDrawer"
                            class="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shrink-0 ml-2">
                        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12"/>
                        </svg>
                        <span class="sr-only">Close panel</span>
                    </button>
                </div>

                <!-- Financial Calculation Items -->
                <div class="space-y-2.5 mb-5">
                    <!-- Total Actual -->
                    <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span class="text-xs sm:text-sm font-semibold text-slate-600">Total Actual</span>
                        <span id="budgetCalcTotalActual" class="text-sm sm:text-base font-bold text-slate-900 font-money">₱0.00</span>
                    </div>

                    <!-- Total Budget -->
                    <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span class="text-xs sm:text-sm font-semibold text-slate-600">Total Budget</span>
                        <span id="budgetCalcTotalBudget" class="text-sm sm:text-base font-bold text-[#224796] font-money">₱0.00</span>
                    </div>

                    <!-- Remaining Balance -->
                    <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span class="text-xs sm:text-sm font-semibold text-slate-600">Remaining Balance</span>
                        <span id="budgetCalcTotalRemaining" class="text-sm sm:text-base font-bold text-emerald-600 font-money">₱0.00</span>
                    </div>

                    <!-- Utilization Efficiency -->
                    <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span class="text-xs sm:text-sm font-semibold text-slate-600">Remaining %</span>
                        <span id="budgetCalcRemainingPercent" class="text-sm sm:text-base font-bold text-emerald-600 font-money">0.00%</span>
                    </div>
                </div>

                <!-- CSV Preview Card with Copy Action -->
                <div class="space-y-2 flex-1 flex flex-col mb-4">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs sm:text-sm font-semibold text-slate-800">
                            CSV Data Preview
                        </label>
                        <button type="button"
                                id="budgetCalcCopyCsvBtn"
                                class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 cursor-pointer transition-all shadow-xs">
                            <svg id="budgetCalcCopyIcon" class="w-3.5 h-3.5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                            </svg>
                            <span id="budgetCalcCopyText">Copy CSV</span>
                        </button>
                    </div>

                    <!-- Compact height card with medium broken line container -->
                    <div class="relative flex-1 min-h-[160px] max-h-[220px] overflow-hidden rounded-xl border border-dashed-medium border-slate-300 bg-slate-50/80 p-3 shadow-xs">
                        <pre id="budgetCalcCsvPreview"
                             class="h-full w-full overflow-auto text-[11px] sm:text-xs font-mono text-slate-800 leading-relaxed pr-1"></pre>
                    </div>
                    <p class="text-[11px] text-slate-400">Contains all account entries and financial metrics for export.</p>
                </div>

                <!-- Footer actions -->
                <div class="mt-auto border-t-dashed-medium pt-4 pb-1 bg-white sticky bottom-0">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <button type="button"
                                id="budgetCalcCloseFooterBtn"
                                class="inline-flex items-center justify-center rounded-xl border border-rose-600 bg-transparent px-5 py-2.5 text-xs sm:text-sm font-semibold text-rose-600 shadow-xs hover:bg-rose-600 hover:border-rose-600 hover:text-white active:bg-rose-700 active:border-rose-700 active:text-white focus:outline-none focus:ring-4 focus:ring-rose-200 cursor-pointer w-full sm:w-[48%] transition-all duration-200">
                            Cancel
                        </button>
                        <button type="button"
                                id="budgetCalcCopyMainBtn"
                                class="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-emerald-600 active:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 cursor-pointer w-full sm:w-[48%] transition-all duration-200">
                            <svg class="mr-1.5 h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                            </svg>
                            Copy CSV
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    const drawerEl = document.getElementById('budgetCalculateDrawer');
    const closeBtn = document.getElementById('budgetCalculateDrawerCloseBtn');
    const cancelBtn = document.getElementById('budgetCalcCloseFooterBtn');
    const copySmallBtn = document.getElementById('budgetCalcCopyCsvBtn');
    const copyMainBtn = document.getElementById('budgetCalcCopyMainBtn');

    if (!drawerEl) return;

    budgetCalculateDrawerInstance = new Drawer(drawerEl, {
        placement: 'right',
        backdrop: 'dynamic',
        backdropClasses: 'bg-slate-900/40 backdrop-blur-sm fixed inset-0 z-[70]'
    });

    const hideDrawer = () => {
        budgetCalculateDrawerInstance?.hide();
        showFloatingUI();
    };

    closeBtn?.addEventListener('click', hideDrawer);
    cancelBtn?.addEventListener('click', hideDrawer);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && budgetCalculateDrawerInstance) hideDrawer();
    });

    const handleCopy = async () => {
        if (!budgetCalculateCachedCsv) return;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(budgetCalculateCachedCsv);
            }
            const copyText = document.getElementById('budgetCalcCopyText');
            const copyIcon = document.getElementById('budgetCalcCopyIcon');
            if (copyText) copyText.textContent = 'Copied!';
            if (copyIcon) {
                copyIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>';
            }
            setTimeout(() => {
                if (copyText) copyText.textContent = 'Copy CSV';
                if (copyIcon) {
                    copyIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>';
                }
            }, 2500);
        } catch {
            /* ignore */
        }
    };

    copySmallBtn?.addEventListener('click', handleCopy);
    copyMainBtn?.addEventListener('click', handleCopy);
}
// END: ensureBudgetCalculateDrawer

// START: showBudgetCalculateDrawer - Opens budget calculation summary drawer
export function showBudgetCalculateDrawer({ year, csvString, totals }) {
    ensureBudgetCalculateDrawer();
    budgetCalculateCachedCsv = csvString || '';

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);
    const formatPercent = (val) =>
        `${new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0)}%`;

    const subtitle = document.getElementById('budgetCalculateDrawerSubtitle');
    if (subtitle) {
        subtitle.textContent = `Comprehensive totals and allocation efficiency for fiscal year ${year}.`;
    }

    const totalActualEl = document.getElementById('budgetCalcTotalActual');
    const totalBudgetEl = document.getElementById('budgetCalcTotalBudget');
    const totalRemainingEl = document.getElementById('budgetCalcTotalRemaining');
    const remainingPercentEl = document.getElementById('budgetCalcRemainingPercent');
    const csvPreviewEl = document.getElementById('budgetCalcCsvPreview');

    if (totalActualEl) totalActualEl.textContent = formatCurrency(totals?.totalActual);
    if (totalBudgetEl) totalBudgetEl.textContent = formatCurrency(totals?.totalBudget);

    if (totalRemainingEl) {
        const rem = Number(totals?.totalRemaining) || 0;
        totalRemainingEl.textContent = formatCurrency(rem);
        totalRemainingEl.className = rem < 0
            ? 'text-sm sm:text-base font-bold text-rose-600 font-money'
            : rem > 0
                ? 'text-sm sm:text-base font-bold text-emerald-600 font-money'
                : 'text-sm sm:text-base font-bold text-slate-900 font-money';
    }

    if (remainingPercentEl) {
        const pct = Number(totals?.overallRemainingPercent) || 0;
        remainingPercentEl.textContent = formatPercent(pct);
        remainingPercentEl.className = pct < 0
            ? 'text-sm sm:text-base font-bold text-rose-600 font-money'
            : pct > 0
                ? 'text-sm sm:text-base font-bold text-emerald-600 font-money'
                : 'text-sm sm:text-base font-bold text-slate-900 font-money';
    }

    if (csvPreviewEl) {
        csvPreviewEl.textContent = csvString || '';
    }

    hideFloatingUI();
    budgetCalculateDrawerInstance?.show();
}
// END: showBudgetCalculateDrawer

// START: hideBudgetCalculateDrawer - Closes budget calculation summary drawer
export function hideBudgetCalculateDrawer() {
    if (budgetCalculateDrawerInstance) {
        budgetCalculateDrawerInstance.hide();
    }
    showFloatingUI();
}
// END: hideBudgetCalculateDrawer

// START: hideBudgetCreateDrawer - Dismisses and resets the budget creation drawer
export function hideBudgetCreateDrawer() {
    if (budgetDrawerInstance) {
        budgetDrawerInstance.hide();
    }
    budgetDrawerOnConfirm = null;
    showFloatingUI();
}
// END: hideBudgetCreateDrawer
// END: hideBudgetCreateDrawer

function ensureMonthlyDrawer() {
    if (document.getElementById('monthlyExpensesDrawer')) return;

    const drawerHTML = `
        <!-- Monthly Expenses Drawer -->
        <div id="monthlyExpensesDrawer"
             class="fixed top-0 right-0 z-50 h-screen w-full max-w-3xl p-4 md:p-6 overflow-y-auto bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.28)] border-l border-slate-200/80 transform translate-x-full transition-transform"
             tabindex="-1"
             aria-labelledby="monthlyExpensesDrawerLabel">
            <div class="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600 mb-1">Monthly expenses</p>
                    <h2 id="monthlyExpensesDrawerLabel" class="text-2xl font-bold text-slate-900 leading-tight">Add Monthly Expense Entry</h2>
                </div>
                <button type="button"
                        id="monthlyDrawerCloseBtn"
                        aria-controls="monthlyExpensesDrawer"
                        class="inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12"/>
                    </svg>
                    <span class="sr-only">Close panel</span>
                </button>
            </div>

            <form id="monthlyExpensesDrawerForm" class="flex flex-col gap-6 pb-28">
                <!-- Account Title with G/L Code -->
                <section class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-[136px_1fr] gap-2 md:gap-3 items-start">
                        <label class="text-sm font-medium text-slate-700 pt-1 md:pt-2">Account Title <span class="text-rose-500">*</span></label>
                        <div class="relative w-full">
                            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                            </span>
                            <input id="monthly-accountTitle" type="text" placeholder="Type to search (e.g. Trave...)" autocomplete="off"
                                   class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796] transition-colors" />
                            <input id="monthly-glCode" type="hidden" value="">
                            <div id="monthly-accountTitle-suggestions" class="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-300 bg-white shadow-lg hidden"></div>
                        </div>
                    </div>
                </section>

                <!-- Monthly Values Grid -->
                <section class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-[136px_1fr] gap-2 md:gap-3 items-start">
                        <label class="text-sm font-medium text-slate-700 pt-1 md:pt-2">Monthly Values (₱)</label>
                        <div class="w-full">
                            <div id="monthly-months-grid" class="grid max-h-[360px] grid-cols-2 gap-3 overflow-y-auto pr-1 pb-2 sm:grid-cols-3 md:max-h-[320px] md:grid-cols-4 lg:grid-cols-3">
                                <!-- Month inputs injected by JS -->
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Total Summary -->
                <section class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-[136px_1fr] gap-2 md:gap-3 items-start">
                        <label class="text-sm font-medium text-slate-700 pt-1 md:pt-2">Total</label>
                        <div class="w-full rounded-lg border border-slate-200 bg-linear-to-br from-slate-50 to-slate-100 p-4">
                            <p class="mb-1.5 text-xs font-medium text-slate-500">Total Amount</p>
                            <p id="monthly-total-amount" class="text-lg font-semibold text-slate-900 md:text-xl">₱0.00</p>
                        </div>
                    </div>
                </section>

                <!-- Footer actions -->
                <div class="mt-4 border-t border-slate-200 pt-3 pb-3 bg-white md:sticky md:bottom-0 md:left-0 md:right-0">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <button type="submit"
                                class="inline-flex items-center justify-center rounded-lg border border-emerald-500 bg-white px-5 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold text-emerald-600 hover:bg-emerald-500 hover:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/30 cursor-pointer w-full sm:w-[48%] md:w-[48%]">
                            Add Entry
                        </button>
                        <button type="button"
                                id="monthlyDrawerCancelBtn"
                                class="inline-flex items-center justify-center rounded-lg border border-rose-400 bg-white px-5 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-400/40 cursor-pointer w-full sm:w-[48%] md:w-[48%]">
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    const drawerEl = document.getElementById('monthlyExpensesDrawer');
    const cancelBtn = document.getElementById('monthlyDrawerCancelBtn');
    const closeBtn = document.getElementById('monthlyDrawerCloseBtn');
    const form = document.getElementById('monthlyExpensesDrawerForm');
    const accountTitleInput = document.getElementById('monthly-accountTitle');
    const glCodeInput = document.getElementById('monthly-glCode');
    const suggestionsContainer = document.getElementById('monthly-accountTitle-suggestions');
    const monthsGrid = document.getElementById('monthly-months-grid');
    const totalAmountEl = document.getElementById('monthly-total-amount');

    if (!drawerEl || !monthsGrid || !totalAmountEl) return;

    // build month inputs (same order as monthly-expenses.js)
    const monthKeys = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    monthsGrid.innerHTML = monthKeys.map((key, index) => `
        <div class="flex flex-col">
            <label class="mb-1.5 block text-xs font-medium text-slate-600">${monthNames[index]}</label>
            <input
                id="monthly-${key}"
                type="text" inputmode="decimal"


                placeholder="0.00"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796] transition-colors"
            />
        </div>
    `).join('');

    monthlyDrawerInstance = new Drawer(drawerEl, {
        placement: 'right',
        backdrop: 'dynamic',
        backdropClasses: 'bg-slate-900/30 fixed inset-0 z-40'
    });

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

    const updateTotal = () => {
        let total = 0;
        monthKeys.forEach((key) => {
            const input = document.getElementById(`monthly-${key}`);
            if (input) total += parseFormattedNumber(input.value) || 0;
        });
        totalAmountEl.textContent = formatCurrency(total);
    };

    monthKeys.forEach((key) => {
        const input = document.getElementById(`monthly-${key}`);
        if (input) {
            attachNumberFormatter(input);
            input.addEventListener('input', updateTotal);
        }
    });

    const getApiBasePath = () => {
        const path = window.location.pathname || '/';
        const idx = path.indexOf('/frontend/');
        return idx !== -1 ? path.substring(0, idx) : path.substring(0, path.lastIndexOf('/')) || '';
    };

    const showSuggestions = (q) => {
        if (!suggestionsContainer) return;
        const apiBase = getApiBasePath();
        fetch(`${apiBase}/api/account-titles/search.php?q=${encodeURIComponent(q || '')}`)
            .then(r => r.json())
            .then(res => {
                if (!res.success || !res.data) return;
                const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                suggestionsContainer.innerHTML = res.data.map(item => {
                    const gl = esc(item.gl_code || '');
                    const title = esc(item.account_title || '');
                    return `<div class="px-4 py-2.5 hover:bg-slate-100 cursor-pointer text-sm text-slate-700 border-b border-slate-100 last:border-b-0 flex items-center gap-2" data-gl="${gl}" data-title="${title}">
                                <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                                <span>${gl} - ${title}</span>
                            </div>`;
                }).join('');
                suggestionsContainer.classList.remove('hidden');
                suggestionsContainer.querySelectorAll('[data-gl]').forEach(el => {
                    el.addEventListener('click', () => {
                        glCodeInput.value = el.dataset.gl || '';
                        accountTitleInput.value = el.dataset.title || '';
                        suggestionsContainer.classList.add('hidden');
                    });
                });
            })
            .catch(() => { suggestionsContainer.classList.add('hidden'); });
    };

    let debounceTimer;
    if (accountTitleInput) {
        accountTitleInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => showSuggestions(accountTitleInput.value.trim()), 150);
        });
        accountTitleInput.addEventListener('focus', () => showSuggestions(accountTitleInput.value.trim()));
    }

    document.addEventListener('click', (e) => {
        if (suggestionsContainer && !suggestionsContainer.contains(e.target) && e.target !== accountTitleInput) {
            suggestionsContainer.classList.add('hidden');
        }
    });

    const hideDrawer = () => {
        monthlyDrawerInstance?.hide();
        monthlyDrawerOnConfirm = null;
        showFloatingUI();
    };

    cancelBtn?.addEventListener('click', hideDrawer);
    closeBtn?.addEventListener('click', hideDrawer);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hideDrawer();
    });

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const glCode = glCodeInput?.value?.trim();
        const accountTitle = accountTitleInput?.value?.trim();
        const months = {};
        monthKeys.forEach((key) => {
            const input = document.getElementById(`monthly-${key}`);
            months[key] = parseFormattedNumber(input?.value);
        });

        if (!glCode || !accountTitle) {
            // simple inline error via alert; validation errors are re-handled in caller via Swal
            return;
        }

        hideDrawer();
        if (monthlyDrawerOnConfirm) {
            monthlyDrawerOnConfirm({ glCode, accountTitle, months });
        }
    });
}

export function showMonthlyExpensesDrawer({ year, onConfirm }) {
    ensureMonthlyDrawer();
    monthlyDrawerOnConfirm = onConfirm;

    const label = document.getElementById('monthlyExpensesDrawerLabel');
    if (label) label.textContent = `Add Monthly Expense Entry (${year})`;

    const form = document.getElementById('monthlyExpensesDrawerForm');
    if (form) form.reset();

    hideFloatingUI();
    monthlyDrawerInstance?.show();

    const accountTitleInput = document.getElementById('monthly-accountTitle');
    if (accountTitleInput) {
        accountTitleInput.focus();
        accountTitleInput.select();
    }
}

function ensureFundDownloadedDrawer() {
    if (document.getElementById('fundDownloadedDrawer')) return;

    const drawerHTML = `
        <!-- Fund Downloaded Drawer -->
        <div id="fundDownloadedDrawer"
             class="fixed top-0 right-0 z-[80] h-screen w-full max-w-xl sm:max-w-2xl p-6 sm:p-8 lg:p-10 overflow-y-auto bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.28)] border-l border-slate-200/80 transform translate-x-full transition-transform flex flex-col justify-between"
             tabindex="-1"
             aria-labelledby="fundDownloadedDrawerLabel">
            
            <div class="flex-1 flex flex-col justify-between">
                <div>
                    <!-- Header -->
                    <div class="flex items-start justify-between border-b-dashed-medium pb-5 mb-6">
                        <div>
                            <h2 id="fundDownloadedDrawerLabel" class="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">Add Downloaded Fund Entry</h2>
                            <p class="mt-1.5 text-sm sm:text-base text-slate-500 leading-relaxed">Configure category, program details, and monthly allotments for the selected fiscal year.</p>
                        </div>
                        <button type="button"
                                id="fundDownloadedDrawerCloseBtn"
                                aria-controls="fundDownloadedDrawer"
                                class="inline-flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shrink-0 ml-3">
                            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12"/>
                            </svg>
                            <span class="sr-only">Close panel</span>
                        </button>
                    </div>

                    <form id="fundDownloadedDrawerForm" class="flex flex-col gap-6">
                        <!-- Program Category Selector -->
                        <div class="space-y-2">
                            <label for="funddl-category" class="block text-sm sm:text-base font-semibold text-slate-800">
                                Program Category <span class="text-rose-500">*</span>
                            </label>
                            <select id="funddl-category" class="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-sm sm:text-base text-slate-900 focus:ring-4 focus:ring-[#224796]/10 focus:border-[#224796] outline-hidden cursor-pointer transition-all shadow-xs">
                                <option value="mooe">MOOE (Maintenance & Other Operating Expenses)</option>
                                <option value="sp-philhealth">PhilHealth (Primary Care / Capitation)</option>
                                <option value="sp-ntp">SPF NTP (National TB Program)</option>
                                <option value="sp-mcp">MCP Facility (Maternal & Child Package)</option>
                                <option value="sp-konsulta">PhilHealth Konsulta & Diagnostic Fund</option>
                            </select>
                        </div>

                        <!-- G/L Code with Live Dropdown Search -->
                        <div class="space-y-2 relative">
                            <label for="funddl-glCode" class="block text-sm sm:text-base font-semibold text-slate-800">
                                G/L Account Code <span class="text-rose-500">*</span>
                            </label>
                            <div class="relative">
                                <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                </span>
                                <input id="funddl-glCode" type="text" placeholder="Type G/L code or account name (e.g. 50203990-01)..." required
                                       autocomplete="off"
                                       class="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-300 rounded-xl text-base sm:text-lg font-mono text-slate-900 focus:ring-4 focus:ring-[#224796]/10 focus:border-[#224796] outline-hidden transition-all shadow-xs" />
                                <div id="funddl-glCode-suggestions"
                                     class="absolute z-50 left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl hidden divide-y divide-slate-100"></div>
                            </div>
                        </div>

                        <!-- Fund / Program Title -->
                        <div class="space-y-2 relative">
                            <label for="funddl-programTitle" class="block text-sm sm:text-base font-semibold text-slate-800">
                                Fund / Program Title <span class="text-rose-500">*</span>
                            </label>
                            <div class="relative">
                                <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                </span>
                                <input id="funddl-programTitle" type="text" placeholder="e.g. Supplementary Nutrition & Immunization Fund" required
                                       autocomplete="off"
                                       class="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-300 rounded-xl text-sm sm:text-base text-slate-900 focus:ring-4 focus:ring-[#224796]/10 focus:border-[#224796] outline-hidden transition-all shadow-xs" />
                                <div id="funddl-programTitle-suggestions"
                                     class="absolute z-50 left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl hidden divide-y divide-slate-100"></div>
                            </div>
                        </div>

                        <!-- Monthly Values Grid -->
                        <div class="space-y-2">
                            <label class="block text-sm sm:text-base font-semibold text-slate-800">
                                Monthly Allocations (₱)
                            </label>
                            <div id="funddl-months-grid" class="grid max-h-[300px] grid-cols-2 gap-3 overflow-y-auto pr-1 pb-1 sm:grid-cols-3 md:grid-cols-4 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 shadow-inner">
                                <!-- Month inputs injected by JS -->
                            </div>
                        </div>

                        <!-- Total Summary -->
                        <div class="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-5 flex items-center justify-between shadow-xs">
                            <div>
                                <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Downloaded Fund</p>
                                <p class="text-xs text-slate-400 mt-0.5">Sum of all monthly allocations</p>
                            </div>
                            <p id="funddl-total-amount" class="text-xl sm:text-2xl font-bold text-[#224796] font-money tabular-nums">₱0.00</p>
                        </div>
                    </form>
                </div>

                <!-- Footer actions at the bottom -->
                <div class="mt-8 border-t-dashed-medium pt-5 pb-2 bg-white sticky bottom-0">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
                        <button type="button"
                                id="funddlDrawerCancelBtn"
                                class="inline-flex items-center justify-center rounded-xl border border-rose-600 bg-transparent px-6 py-3.5 text-sm sm:text-base font-semibold text-rose-600 shadow-xs hover:bg-rose-600 hover:border-rose-600 hover:text-white active:bg-rose-700 active:border-rose-700 active:text-white focus:outline-none focus:ring-4 focus:ring-rose-200 cursor-pointer w-full sm:w-[48%] transition-all duration-200">
                            Cancel
                        </button>
                        <button type="submit"
                                form="fundDownloadedDrawerForm"
                                id="funddlDrawerSubmitBtn"
                                class="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-xs hover:bg-emerald-600 active:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 cursor-pointer w-full sm:w-[48%] transition-all duration-200">
                            <svg class="mr-2 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5"/>
                            </svg>
                            <span>Save Entry</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    const drawerEl = document.getElementById('fundDownloadedDrawer');
    const cancelBtn = document.getElementById('funddlDrawerCancelBtn');
    const closeBtn = document.getElementById('fundDownloadedDrawerCloseBtn');
    const form = document.getElementById('fundDownloadedDrawerForm');
    const categorySelect = document.getElementById('funddl-category');
    const glCodeInput = document.getElementById('funddl-glCode');
    const suggestionsEl = document.getElementById('funddl-glCode-suggestions');
    const programTitleInput = document.getElementById('funddl-programTitle');
    const monthsGrid = document.getElementById('funddl-months-grid');
    const totalAmountEl = document.getElementById('funddl-total-amount');

    if (!drawerEl || !monthsGrid || !totalAmountEl) return;

    const monthKeys = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    monthsGrid.innerHTML = monthKeys.map((key, index) => `
        <div class="flex flex-col">
            <label class="mb-1 block text-xs font-semibold text-slate-700">${monthNames[index]}</label>
            <input
                id="funddl-${key}"
                type="text" inputmode="decimal"
                placeholder="0.00"
                class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs sm:text-sm font-mono text-right text-slate-900 placeholder-slate-400 focus:border-[#224796] focus:outline-none focus:ring-2 focus:ring-[#224796]/20 transition-all shadow-xs"
            />
        </div>
    `).join('');

    fundDownloadedDrawerInstance = new Drawer(drawerEl, {
        placement: 'right',
        backdrop: 'dynamic',
        backdropClasses: 'bg-slate-900/40 backdrop-blur-xs fixed inset-0 z-[70]'
    });

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

    const CACHE_KEY = 'fundDownloaded_drawer_draft';
    const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

    const saveDraftCache = () => {
        const months = {};
        monthKeys.forEach((key) => {
            const input = document.getElementById(`funddl-${key}`);
            months[key] = input?.value || '';
        });
        const draft = {
            category: categorySelect?.value || 'mooe',
            glCode: glCodeInput?.value || '',
            programTitle: programTitleInput?.value || '',
            months,
            savedAt: Date.now()
        };
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(draft));
        } catch {}
    };

    const restoreDraftCache = () => {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return false;
            const draft = JSON.parse(raw);
            if (!draft || !draft.savedAt || Date.now() - draft.savedAt > CACHE_TTL) {
                localStorage.removeItem(CACHE_KEY);
                return false;
            }
            if (categorySelect && draft.category) categorySelect.value = draft.category;
            if (glCodeInput && draft.glCode) glCodeInput.value = draft.glCode;
            if (programTitleInput && draft.programTitle) programTitleInput.value = draft.programTitle;
            if (draft.months) {
                monthKeys.forEach((key) => {
                    const input = document.getElementById(`funddl-${key}`);
                    if (input && draft.months[key]) input.value = draft.months[key];
                });
            }
            updateTotal();
            return true;
        } catch {
            return false;
        }
    };

    const clearDraftCache = () => {
        try {
            localStorage.removeItem(CACHE_KEY);
        } catch {}
    };

    const updateTotal = () => {
        let total = 0;
        monthKeys.forEach((key) => {
            const input = document.getElementById(`funddl-${key}`);
            if (input) total += parseFormattedNumber(input.value) || 0;
        });
        totalAmountEl.textContent = formatCurrency(total);
        saveDraftCache();
    };

    monthKeys.forEach((key) => {
        const input = document.getElementById(`funddl-${key}`);
        if (input) {
            attachNumberFormatter(input);
            input.addEventListener('input', updateTotal);
        }
    });

    categorySelect?.addEventListener('change', saveDraftCache);
    programTitleInput?.addEventListener('input', saveDraftCache);

    const getApiBasePath = () => {
        const path = window.location.pathname || '/';
        const idx = path.indexOf('/frontend/');
        return idx !== -1 ? path.substring(0, idx) : path.substring(0, path.lastIndexOf('/')) || '';
    };

    const programSuggestionsEl = document.getElementById('funddl-programTitle-suggestions');

    // Live search suggestions for GL Code & Account Title overlapping
    const renderSuggestionsHtml = (data, container) => {
        const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return data.map((item) => {
            const gl = String(item.gl_code || '');
            const title = String(item.account_title || '');
            return `
                <div class="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm text-slate-800 transition-colors flex items-center justify-between gap-3 group" data-gl="${esc(gl)}" data-title="${esc(title)}">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <span class="font-mono font-bold text-xs bg-slate-100 text-[#224796] px-2 py-0.5 rounded group-hover:bg-[#224796] group-hover:text-white transition-colors">${esc(gl)}</span>
                        <span class="font-medium text-slate-900 truncate">${esc(title)}</span>
                    </div>
                    <svg class="w-4 h-4 text-slate-400 group-hover:text-[#224796] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </div>
            `;
        }).join('');
    };

    const attachSuggestionClicks = (container) => {
        container.querySelectorAll('[data-gl]').forEach((el) => {
            el.addEventListener('click', () => {
                if (glCodeInput) glCodeInput.value = el.dataset.gl || '';
                if (programTitleInput) programTitleInput.value = el.dataset.title || '';
                suggestionsEl?.classList.add('hidden');
                programSuggestionsEl?.classList.add('hidden');
                saveDraftCache();
            });
        });
    };

    const fetchAndShowSuggestions = (q, targetContainer) => {
        if (!targetContainer) return;
        const apiBase = getApiBasePath();
        fetch(`${apiBase}/api/account-titles/search.php?q=${encodeURIComponent(q || '')}&limit=50`)
            .then((r) => r.json())
            .then((res) => {
                if (!res.success || !res.data || !res.data.length) {
                    targetContainer.classList.add('hidden');
                    return;
                }
                targetContainer.innerHTML = renderSuggestionsHtml(res.data, targetContainer);
                targetContainer.classList.remove('hidden');
                attachSuggestionClicks(targetContainer);
            })
            .catch(() => {
                targetContainer.classList.add('hidden');
            });
    };

    let glSearchTimer = null;
    glCodeInput?.addEventListener('input', (e) => {
        saveDraftCache();
        clearTimeout(glSearchTimer);
        const query = e.target.value.trim();
        glSearchTimer = setTimeout(() => {
            fetchAndShowSuggestions(query, suggestionsEl);
        }, 150);
    });

    // GL Code click: show all if clicked
    glCodeInput?.addEventListener('click', (e) => {
        fetchAndShowSuggestions(e.target.value.trim(), suggestionsEl);
    });

    let programSearchTimer = null;
    programTitleInput?.addEventListener('input', (e) => {
        saveDraftCache();
        clearTimeout(programSearchTimer);
        const query = e.target.value.trim();
        programSearchTimer = setTimeout(() => {
            fetchAndShowSuggestions(query, programSuggestionsEl);
        }, 150);
    });

    // Program title click: immediately show all so user can scroll or search
    programTitleInput?.addEventListener('click', (e) => {
        fetchAndShowSuggestions(e.target.value.trim(), programSuggestionsEl);
    });

    document.addEventListener('click', (e) => {
        if (suggestionsEl && !suggestionsEl.contains(e.target) && e.target !== glCodeInput) {
            suggestionsEl.classList.add('hidden');
        }
        if (programSuggestionsEl && !programSuggestionsEl.contains(e.target) && e.target !== programTitleInput) {
            programSuggestionsEl.classList.add('hidden');
        }
    });

    const hideDrawer = () => {
        saveDraftCache();
        suggestionsEl?.classList.add('hidden');
        programSuggestionsEl?.classList.add('hidden');
        fundDownloadedDrawerInstance?.hide();
        fundDownloadedDrawerOnConfirm = null;
        showFloatingUI();
    };

    const handleCancel = () => {
        clearDraftCache();
        if (form) form.reset();
        if (totalAmountEl) totalAmountEl.textContent = '₱0.00';
        suggestionsEl?.classList.add('hidden');
        programSuggestionsEl?.classList.add('hidden');
        fundDownloadedDrawerInstance?.hide();
        fundDownloadedDrawerOnConfirm = null;
        showFloatingUI();
    };

    cancelBtn?.addEventListener('click', handleCancel);
    closeBtn?.addEventListener('click', hideDrawer);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hideDrawer();
    });

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = categorySelect?.value || 'mooe';
        const glCode = glCodeInput?.value?.trim();
        const programTitle = programTitleInput?.value?.trim();
        const months = {};
        monthKeys.forEach((key) => {
            const input = document.getElementById(`funddl-${key}`);
            months[key] = parseFormattedNumber(input?.value);
        });

        if (!glCode || !programTitle) return;

        const confirmCallback = fundDownloadedDrawerOnConfirm;
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }
        hideDrawer();
        if (confirmCallback) {
            confirmCallback({ category, glCode, programTitle, months, clearCache: clearDraftCache });
        }
    });
}

export function showFundDownloadedDrawer({ year, onConfirm, reopenWithData = null }) {
    ensureFundDownloadedDrawer();
    fundDownloadedDrawerOnConfirm = onConfirm;

    const label = document.getElementById('fundDownloadedDrawerLabel');
    if (label) label.textContent = `Add Downloaded Fund Entry (${year})`;

    const form = document.getElementById('fundDownloadedDrawerForm');
    const categorySelect = document.getElementById('funddl-category');
    const glCodeInput = document.getElementById('funddl-glCode');
    const programTitleInput = document.getElementById('funddl-programTitle');
    const totalAmountEl = document.getElementById('funddl-total-amount');
    const suggestionsEl = document.getElementById('funddl-glCode-suggestions');
    const monthKeys = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

    if (form) form.reset();
    if (suggestionsEl) suggestionsEl.classList.add('hidden');

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

    const CACHE_KEY = 'fundDownloaded_drawer_draft';
    const CACHE_TTL = 15 * 60 * 1000;

    if (reopenWithData) {
        if (categorySelect && reopenWithData.category) categorySelect.value = reopenWithData.category;
        if (glCodeInput && reopenWithData.glCode) glCodeInput.value = reopenWithData.glCode;
        if (programTitleInput && reopenWithData.programTitle) programTitleInput.value = reopenWithData.programTitle;
        if (reopenWithData.months) {
            let total = 0;
            monthKeys.forEach((key) => {
                const input = document.getElementById(`funddl-${key}`);
                const v = reopenWithData.months[key];
                if (input && v !== undefined && v !== null) {
                    input.value = v ? formatWithCommas(v) : '';
                    total += Number(v) || 0;
                }
            });
            if (totalAmountEl) totalAmountEl.textContent = formatCurrency(total);
        }
    } else {
        // Restore from temporary cache if valid (< 15 mins)
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (raw) {
                const draft = JSON.parse(raw);
                if (draft && draft.savedAt && Date.now() - draft.savedAt <= CACHE_TTL) {
                    if (categorySelect && draft.category) categorySelect.value = draft.category;
                    if (glCodeInput && draft.glCode) glCodeInput.value = draft.glCode;
                    if (programTitleInput && draft.programTitle) programTitleInput.value = draft.programTitle;
                    if (draft.months) {
                        let total = 0;
                        monthKeys.forEach((key) => {
                            const input = document.getElementById(`funddl-${key}`);
                            if (input && draft.months[key]) {
                                input.value = draft.months[key];
                                total += parseFormattedNumber(draft.months[key]) || 0;
                            }
                        });
                        if (totalAmountEl) totalAmountEl.textContent = formatCurrency(total);
                    }
                } else {
                    localStorage.removeItem(CACHE_KEY);
                }
            }
        } catch {}
    }

    hideFloatingUI();
    fundDownloadedDrawerInstance?.show();
}

function ensureFundDownloadedCalculateDrawer() {
    if (document.getElementById('fundDownloadedCalculateDrawer')) return;

    const drawerHTML = `
        <div id="fundDownloadedCalculateDrawer"
             class="fixed top-0 right-0 z-[80] h-screen w-full max-w-lg p-5 sm:p-6 overflow-y-auto bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.28)] border-l border-slate-200/80 transform translate-x-full transition-transform flex flex-col justify-between"
             tabindex="-1"
             aria-labelledby="fundDownloadedCalculateDrawerLabel">
            
            <div class="flex-1 flex flex-col">
                <!-- Header -->
                <div class="flex items-start justify-between border-b-dashed-medium pb-4 mb-4">
                    <div>
                        <h2 id="fundDownloadedCalculateDrawerLabel" class="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">Fund Downloaded Summary</h2>
                        <p id="fundDownloadedCalculateDrawerSubtitle" class="mt-1 text-xs sm:text-sm text-slate-500 leading-normal">Full breakdown of downloaded funds, disbursements, and zero-balance progress.</p>
                    </div>
                    <button type="button"
                            id="fundDownloadedCalculateDrawerCloseBtn"
                            aria-controls="fundDownloadedCalculateDrawer"
                            class="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shrink-0 ml-2">
                        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12"/>
                        </svg>
                        <span class="sr-only">Close panel</span>
                    </button>
                </div>

                <!-- Financial Calculation Items -->
                <div class="space-y-2.5 mb-5">
                    <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span class="text-xs sm:text-sm font-semibold text-slate-600">Total Downloaded Funds</span>
                        <span id="funddlCalcTotalDownloaded" class="text-sm sm:text-base font-bold text-[#224796] font-money">₱0.00</span>
                    </div>
                    <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span class="text-xs sm:text-sm font-semibold text-slate-600">Total Disbursed / Spent</span>
                        <span id="funddlCalcTotalSpent" class="text-sm sm:text-base font-bold text-slate-900 font-money">₱0.00</span>
                    </div>
                    <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span class="text-xs sm:text-sm font-semibold text-slate-600">Remaining Balance (Goal: ₱0.00)</span>
                        <span id="funddlCalcTotalRemaining" class="text-sm sm:text-base font-bold text-rose-600 font-money">₱0.00</span>
                    </div>
                    <div class="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span class="text-xs sm:text-sm font-semibold text-slate-600">Fund Utilization Rate</span>
                        <span id="funddlCalcUtilizationRate" class="text-sm sm:text-base font-bold text-emerald-600 font-money">0.00%</span>
                    </div>
                </div>

                <!-- CSV Preview Card with Copy Action -->
                <div class="space-y-2 flex-1 flex flex-col mb-4">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs sm:text-sm font-semibold text-slate-800">
                            CSV Data Preview
                        </label>
                        <button type="button"
                                id="funddlCalcCopyCsvBtn"
                                class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 cursor-pointer transition-all shadow-xs">
                            <svg id="funddlCalcCopyIcon" class="w-3.5 h-3.5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                            </svg>
                            <span id="funddlCalcCopyText">Copy CSV</span>
                        </button>
                    </div>

                    <div class="relative flex-1 min-h-[160px] max-h-[220px] overflow-hidden rounded-xl border border-dashed-medium border-slate-300 bg-slate-50/80 p-3 shadow-xs">
                        <pre id="funddlCalcCsvPreview"
                             class="h-full w-full overflow-auto text-[11px] sm:text-xs font-mono text-slate-800 leading-relaxed pr-1"></pre>
                    </div>
                    <p class="text-[11px] text-slate-400">Contains all downloaded fund entries, allocations, and spent metrics.</p>
                </div>

                <!-- Footer actions -->
                <div class="mt-auto border-t-dashed-medium pt-4 pb-1 bg-white sticky bottom-0">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <button type="button"
                                id="funddlCalcCloseFooterBtn"
                                class="inline-flex items-center justify-center rounded-xl border border-rose-600 bg-transparent px-5 py-2.5 text-xs sm:text-sm font-semibold text-rose-600 shadow-xs hover:bg-rose-600 hover:border-rose-600 hover:text-white active:bg-rose-700 active:border-rose-700 active:text-white focus:outline-none focus:ring-4 focus:ring-rose-200 cursor-pointer w-full sm:w-[48%] transition-all duration-200">
                            Close
                        </button>
                        <button type="button"
                                id="funddlCalcCopyMainBtn"
                                class="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-emerald-600 active:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 cursor-pointer w-full sm:w-[48%] transition-all duration-200">
                            <svg class="mr-1.5 h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                            </svg>
                            Copy CSV
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    const drawerEl = document.getElementById('fundDownloadedCalculateDrawer');
    const closeBtn = document.getElementById('fundDownloadedCalculateDrawerCloseBtn');
    const cancelBtn = document.getElementById('funddlCalcCloseFooterBtn');
    const copySmallBtn = document.getElementById('funddlCalcCopyCsvBtn');
    const copyMainBtn = document.getElementById('funddlCalcCopyMainBtn');

    if (!drawerEl) return;

    fundDownloadedCalculateDrawerInstance = new Drawer(drawerEl, {
        placement: 'right',
        backdrop: 'dynamic',
        backdropClasses: 'bg-slate-900/40 backdrop-blur-sm fixed inset-0 z-[70]'
    });

    const hideDrawer = () => {
        fundDownloadedCalculateDrawerInstance?.hide();
        showFloatingUI();
    };

    closeBtn?.addEventListener('click', hideDrawer);
    cancelBtn?.addEventListener('click', hideDrawer);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fundDownloadedCalculateDrawerInstance) hideDrawer();
    });

    const handleCopy = async () => {
        if (!fundDownloadedCalculateCachedCsv) return;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(fundDownloadedCalculateCachedCsv);
            }
            const copyText = document.getElementById('funddlCalcCopyText');
            const copyIcon = document.getElementById('funddlCalcCopyIcon');
            if (copyText) copyText.textContent = 'Copied!';
            if (copyIcon) {
                copyIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>';
            }
            setTimeout(() => {
                if (copyText) copyText.textContent = 'Copy CSV';
                if (copyIcon) {
                    copyIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>';
                }
            }, 2500);
        } catch {
            /* ignore */
        }
    };

    copySmallBtn?.addEventListener('click', handleCopy);
    copyMainBtn?.addEventListener('click', handleCopy);
}

export function showFundDownloadedCalculateDrawer({ year, csvString, totals }) {
    ensureFundDownloadedCalculateDrawer();
    fundDownloadedCalculateCachedCsv = csvString || '';

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);
    const formatPercent = (val) =>
        `${new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0)}%`;

    const subtitle = document.getElementById('fundDownloadedCalculateDrawerSubtitle');
    if (subtitle) {
        subtitle.textContent = `Full breakdown of downloaded funds, disbursements, and zero-balance progress for fiscal year ${year}.`;
    }

    const totalDownloadedEl = document.getElementById('funddlCalcTotalDownloaded');
    const totalSpentEl = document.getElementById('funddlCalcTotalSpent');
    const totalRemainingEl = document.getElementById('funddlCalcTotalRemaining');
    const utilizationRateEl = document.getElementById('funddlCalcUtilizationRate');
    const csvPreviewEl = document.getElementById('funddlCalcCsvPreview');

    if (totalDownloadedEl) totalDownloadedEl.textContent = formatCurrency(totals?.totalDownloaded);
    if (totalSpentEl) totalSpentEl.textContent = formatCurrency(totals?.totalSpent);

    if (totalRemainingEl) {
        const rem = Number(totals?.totalRemaining) || 0;
        totalRemainingEl.textContent = formatCurrency(rem);
        totalRemainingEl.className = rem <= 0
            ? 'text-sm sm:text-base font-bold text-emerald-600 font-money'
            : 'text-sm sm:text-base font-bold text-rose-600 font-money';
    }

    if (utilizationRateEl) {
        const rate = Number(totals?.utilizationRate) || 0;
        utilizationRateEl.textContent = formatPercent(rate);
        utilizationRateEl.className = rate >= 100
            ? 'text-sm sm:text-base font-bold text-emerald-600 font-money'
            : 'text-sm sm:text-base font-bold text-amber-600 font-money';
    }

    if (csvPreviewEl) {
        csvPreviewEl.textContent = csvString || '';
    }

    hideFloatingUI();
    fundDownloadedCalculateDrawerInstance?.show();
}

function handleAdminDrawerSubmit() {
    const form = document.getElementById('adminCreateUserDrawerForm');
    const errorEl = document.getElementById('adminDrawerValidationError');
    if (!form) return;
    const formData = new FormData(form);
    const permissions = {};
    ['dashboard','budget','expenses','export'].forEach((key) => { permissions[key] = { read: formData.get(`permission-${key}-read`) !== null, edit: formData.get(`permission-${key}-edit`) !== null, export: formData.get(`permission-${key}-export`) !== null }; });
    const userData = { username: (formData.get('username') || '').toString().trim(), fullName: (formData.get('full-name') || '').toString().trim(), email: (formData.get('email') || '').toString().trim(), role: (formData.get('role') || '').toString(), password: (formData.get('password') || '').toString(), permissions };
    if (!userData.username || !userData.fullName || !userData.email || !userData.role) { if (errorEl) { errorEl.textContent = 'Please fill in all required fields.'; errorEl.classList.remove('hidden'); } return; }
    if (errorEl) errorEl.classList.add('hidden');
    adminDrawerInstance?.hide();
    if (adminDrawerOnConfirm) adminDrawerOnConfirm(userData);
}
/**
 * Public API used by admin.js
 */
export function showAdminCreateUserDrawer(onConfirm) {
    ensureAdminDrawer();
    adminDrawerOnConfirm = onConfirm;

    const form = document.getElementById('adminCreateUserDrawerForm');
    const errorEl = document.getElementById('adminDrawerValidationError');

    form?.reset();
    document.getElementById('adminCreateUserDrawerLabel').textContent = 'Add User';
    document.getElementById('admin-username').readOnly = false;
    const submitButton = document.querySelector('#adminCreateUserDrawerForm button[type="submit"]');
    if (submitButton) submitButton.lastChild.textContent = 'Create User';
    if (errorEl) {
        errorEl.classList.add('hidden');
    }

    hideFloatingUI();
    adminDrawerInstance?.show();

    // Focus username
    const usernameInput = document.getElementById('admin-username');
    if (usernameInput) {
        usernameInput.focus();
        usernameInput.select();
    }
}









export async function showAdminEditUserDrawer(username, onConfirm) {
    ensureAdminDrawer();
    const path = window.location.pathname;
    const base = path.substring(0, path.indexOf('/frontend/') !== -1 ? path.indexOf('/frontend/') : path.lastIndexOf('/'));
    const response = await fetch(`${base}/api/users/get.php?username=${encodeURIComponent(username)}`, { credentials: 'same-origin' });
    const data = await response.json();
    if (!response.ok || !data.user) throw new Error(data.message || 'Unable to load user');
    const user = data.user;
    adminDrawerOnConfirm = onConfirm;
    document.getElementById('adminCreateUserDrawerLabel').textContent = 'Edit User';
    document.getElementById('adminCreateUserDrawerLabel')?.nextElementSibling?.replaceChildren(document.createTextNode('Update this user account and access.'));
    document.getElementById('admin-full-name').value = user.full_name || '';
    document.getElementById('admin-username').value = user.username || '';
    document.getElementById('admin-username').readOnly = true;
    document.getElementById('admin-email').value = user.email || '';
    document.getElementById('admin-role').value = user.role || '';
    document.getElementById('admin-password').value = '';
    document.querySelector('#adminCreateUserDrawerForm button[type="submit"]').lastChild.textContent = 'Save Changes';
    document.getElementById('adminDrawerValidationError')?.classList.add('hidden');
    hideFloatingUI();
    adminDrawerInstance?.show();
}


