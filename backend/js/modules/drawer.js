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
let accountTitlesDrawerInstance = null;
let accountTitlesDrawerOnConfirm = null;
let itemizedDrawerInstance = null;
let itemizedDrawerOnConfirm = null;

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
                            <input id="monthly-accountTitle" type="text" placeholder="Type to search account title or G/L code..." autocomplete="off"
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
                        <button type="button"
                                id="monthlyDrawerCancelBtn"
                                class="inline-flex items-center justify-center rounded-lg border border-rose-400 bg-white px-5 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-400/40 cursor-pointer w-full sm:w-[48%] md:w-[48%] transition-all">
                            Cancel
                        </button>
                        <button type="submit"
                                class="inline-flex items-center justify-center rounded-lg border border-emerald-600 bg-emerald-600 px-5 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold text-white hover:bg-emerald-700 hover:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 cursor-pointer w-full sm:w-[48%] md:w-[48%] transition-all">
                            Add Entry
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

// START: ensureAccountTitlesDrawer - Initializes and mounts the Account Titles Flowbite off-canvas drawer
function ensureAccountTitlesDrawer() {
    if (document.getElementById('accountTitlesDrawer')) return;

    const drawerHTML = `
        <div id="accountTitlesDrawer"
             class="fixed top-0 right-0 z-[80] h-screen w-full max-w-lg p-5 sm:p-6 overflow-y-auto bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.28)] border-l border-slate-200/80 transform translate-x-full transition-transform flex flex-col justify-between"
             tabindex="-1"
             aria-labelledby="accountTitlesDrawerLabel">
            <div class="flex-1 flex flex-col justify-between">
                <div>
                    <!-- Header -->
                    <div class="flex items-start justify-between border-b border-slate-200 pb-4 mb-5">
                        <div>
                            <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 border border-blue-200">
                                Chart of Accounts
                            </span>
                            <h2 id="accountTitlesDrawerLabel" class="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mt-1.5">
                                Add Account Title
                            </h2>
                            <p id="accountTitlesDrawerSublabel" class="mt-1 text-xs sm:text-sm text-slate-500">
                                Enter the G/L Code and descriptive title for this account entry.
                            </p>
                        </div>
                        <button type="button"
                                id="accountTitlesDrawerCloseBtn"
                                aria-controls="accountTitlesDrawer"
                                class="inline-flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shrink-0 ml-3">
                            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12"/>
                            </svg>
                            <span class="sr-only">Close panel</span>
                        </button>
                    </div>

                    <!-- Validation Error Box -->
                    <div id="accountTitlesDrawerValidationError" class="hidden mb-4 p-3 text-xs sm:text-sm text-rose-800 bg-rose-50 rounded-xl border border-rose-200"></div>

                    <!-- Form Content -->
                    <form id="accountTitlesDrawerForm" class="flex-1 flex flex-col justify-between">
                        <div class="space-y-4">
                            <input type="hidden" id="at-id" value="" />

                            <!-- G/L Code Field -->
                            <div class="space-y-1.5">
                                <label for="at-glCode" class="block text-sm font-bold text-slate-800">
                                    G/L Code <span class="text-rose-500">*</span>
                                </label>
                                <input type="text"
                                       id="at-glCode"
                                       placeholder="e.g. 1000 or 50201010"
                                       required
                                       class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm sm:text-base font-mono font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-hidden transition-all shadow-xs" />
                                <p id="at-glCode-tooltip" class="hidden text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                                    <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                                    <span>G/L Code must be numbers only (no letters or text allowed).</span>
                                </p>
                            </div>

                            <!-- Account Title Field -->
                            <div class="space-y-1.5">
                                <label for="at-accountTitle" class="block text-sm font-bold text-slate-800">
                                    Account Title <span class="text-rose-500">*</span>
                                </label>
                                <input type="text"
                                       id="at-accountTitle"
                                       placeholder="e.g. Office Supplies Expenses"
                                       required
                                       class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm sm:text-base font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-hidden transition-all shadow-xs" />
                                <p id="at-accountTitle-tooltip" class="hidden text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                                    <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                                    <span>Account Title must contain letters only (no numbers allowed).</span>
                                </p>
                            </div>

                            <!-- Category / Fund Dropdown with Search (Combined Search Input & Dropdown) -->
                            <div class="space-y-1.5 relative" id="at-categoryDropdownContainer">
                                <label for="at-categoryBtn" class="block text-sm font-bold text-slate-800">
                                    Fund Category <span class="text-rose-500">*</span>
                                </label>
                                <input type="hidden" id="at-category" name="category" value="" />

                                <!-- Search Text-field as Main Selector with Moved Search Icon -->
                                <div class="relative w-full">
                                    <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"></path>
                                        </svg>
                                    </div>
                                    <input type="text"
                                           id="at-categoryBtn"
                                           placeholder="Search or select category..."
                                           autocomplete="off"
                                           class="w-full pl-10 pr-10 py-3 bg-white border border-slate-300 rounded-xl text-sm sm:text-base font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-hidden transition-all shadow-xs cursor-text" />
                                    <button type="button"
                                            id="at-categoryDropdownArrowBtn"
                                            class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                                        <svg id="at-categoryDropdownArrow" class="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                </div>
                                
                                <!-- Dropdown Menu (Full Width, Perfectly Matches at-categoryBtn) -->
                                <div id="at-categoryDropdown" class="z-50 hidden absolute left-0 right-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                                    <ul id="at-categoryList" class="p-2 text-sm text-slate-700 max-h-52 overflow-y-auto space-y-1">
                                        <!-- Categories dynamically rendered -->
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- Footer Actions pinned at bottom -->
                        <div class="mt-8 pt-5 pb-1 border-t border-slate-100 bg-white sticky bottom-0">
                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <button type="button"
                                        id="accountTitlesDrawerCancelBtn"
                                        class="inline-flex items-center justify-center rounded-lg border border-rose-400 bg-white px-5 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-400/40 cursor-pointer w-full sm:w-[48%] md:w-[48%] transition-all">
                                    Cancel
                                </button>
                                <button type="submit"
                                        id="accountTitlesDrawerSubmitBtn"
                                        class="inline-flex items-center justify-center rounded-lg border border-emerald-600 bg-emerald-600 px-5 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold text-white hover:bg-emerald-700 hover:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 cursor-pointer w-full sm:w-[48%] md:w-[48%] transition-all">
                                    <svg id="accountTitlesDrawerSubmitIcon" class="mr-2 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5"/>
                                    </svg>
                                    <span id="accountTitlesDrawerSubmitText">Add Account</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    const drawerEl = document.getElementById('accountTitlesDrawer');
    const cancelBtn = document.getElementById('accountTitlesDrawerCancelBtn');
    const closeBtn = document.getElementById('accountTitlesDrawerCloseBtn');
    const form = document.getElementById('accountTitlesDrawerForm');
    const glCodeInput = document.getElementById('at-glCode');
    const accountTitleInput = document.getElementById('at-accountTitle');
    const idInput = document.getElementById('at-id');

    if (!drawerEl) return;

    accountTitlesDrawerInstance = new Drawer(drawerEl, {
        placement: 'right',
        backdrop: 'dynamic',
        backdropClasses: 'bg-slate-900/40 backdrop-blur-sm fixed inset-0 z-[70]'
    });

    const hideDrawer = () => {
        accountTitlesDrawerInstance?.hide();
        showFloatingUI();
    };

    cancelBtn?.addEventListener('click', hideDrawer);
    closeBtn?.addEventListener('click', hideDrawer);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && accountTitlesDrawerInstance?.isVisible()) {
            hideDrawer();
        }
    });

    const getApiBasePath = () => {
        const path = window.location.pathname || '/';
        const idx = path.indexOf('/frontend/');
        return idx !== -1 ? path.substring(0, idx) : path.substring(0, path.lastIndexOf('/')) || '';
    };

    const submitBtn = document.getElementById('accountTitlesDrawerSubmitBtn');
    const errEl = document.getElementById('accountTitlesDrawerValidationError');
    const glTooltip = document.getElementById('at-glCode-tooltip');
    const titleTooltip = document.getElementById('at-accountTitle-tooltip');

    // Category elements
    const categoryHiddenInput = document.getElementById('at-category');
    const categorySearchInput = document.getElementById('at-categoryBtn');
    const categoryDropdown = document.getElementById('at-categoryDropdown');
    const categoryArrowBtn = document.getElementById('at-categoryDropdownArrowBtn');
    const categoryArrow = document.getElementById('at-categoryDropdownArrow');
    const categoryList = document.getElementById('at-categoryList');

    let loadedCategories = [];

    // Draft storage key & 60-second timeout configuration
    const DRAFT_STORAGE_KEY = 'cho_account_titles_drawer_draft';
    const DRAFT_MAX_AGE_MS = 60 * 1000; // 60 seconds timeframe

    const clearDraftCache = () => {
        try {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            document.cookie = `${DRAFT_STORAGE_KEY}=; path=/; max-age=0; SameSite=Lax`;
        } catch (e) {
            console.warn('Failed to clear draft cache:', e);
        }
    };

    const saveDraftCache = () => {
        // Only save draft when in create mode (no ID)
        if (idInput?.value) return;

        const draft = {
            glCode: glCodeInput?.value || '',
            accountTitle: accountTitleInput?.value || '',
            category: categoryHiddenInput?.value || '',
            categoryName: categorySearchInput?.value || '',
            savedAt: Date.now()
        };

        // Don't save if all fields are completely empty
        if (!draft.glCode && !draft.accountTitle && !draft.category && !draft.categoryName) {
            clearDraftCache();
            return;
        }

        try {
            const serialized = JSON.stringify(draft);
            localStorage.setItem(DRAFT_STORAGE_KEY, serialized);
            // Also store in cookie with 60 seconds max-age
            document.cookie = `${DRAFT_STORAGE_KEY}=${encodeURIComponent(serialized)}; path=/; max-age=60; SameSite=Lax`;
        } catch (e) {
            console.warn('Failed to save draft cache:', e);
        }
    };

    const getDraftCache = () => {
        try {
            let dataStr = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (!dataStr) {
                // Check cookies fallback
                const match = document.cookie.match(new RegExp('(^|;\\s*)' + DRAFT_STORAGE_KEY + '=([^;]+)'));
                if (match) {
                    dataStr = decodeURIComponent(match[2]);
                }
            }

            if (!dataStr) return null;

            const draft = JSON.parse(dataStr);
            const age = Date.now() - (draft.savedAt || 0);

            if (age > DRAFT_MAX_AGE_MS) {
                // Expired after 60 seconds, destroy it
                clearDraftCache();
                return null;
            }

            return draft;
        } catch (e) {
            clearDraftCache();
            return null;
        }
    };

    const loadCategoryOptions = async (selectedCode = '') => {
        try {
            if (!loadedCategories.length) {
                const apiBase = getApiBasePath();
                const res = await fetch(`${apiBase}/api/account-titles/categories.php`, { credentials: 'same-origin' });
                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    loadedCategories = json.data;
                }
            }
        } catch (err) {
            console.warn('Failed to load categories:', err);
        }

        if (!loadedCategories.length) {
            loadedCategories = [
                { code: 'mooe', name: 'MOOE' },
                { code: 'sp-philhealth', name: 'PhilHealth' },
                { code: 'sp-ntp', name: 'SPF NTP' },
                { code: 'sp-mcp', name: 'MCP Facility' },
                { code: 'sp-konsulta', name: 'Konsulta' }
            ];
        }

        if (selectedCode) {
            const selObj = loadedCategories.find(c => c.code === selectedCode);
            if (selObj && categorySearchInput) {
                categorySearchInput.value = selObj.name;
            }
            if (categoryHiddenInput) {
                categoryHiddenInput.value = selectedCode;
            }
        }

        renderCategoryList(selectedCode, '');
    };

    const renderCategoryList = (selectedCode = '', filterQuery = '') => {
        if (!categoryList) return;
        const currentSelected = selectedCode || categoryHiddenInput?.value || '';
        const q = filterQuery.trim().toLowerCase();

        const filtered = loadedCategories.filter(c => 
            c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
        );

        if (filtered.length === 0) {
            categoryList.innerHTML = `<li class="px-3 py-2 text-xs text-slate-400 text-center">No categories matching "${filterQuery}"</li>`;
            return;
        }

        categoryList.innerHTML = filtered.map(c => {
            const isMatch = currentSelected && c.code === currentSelected;
            return `
                <li>
                    <button type="button"
                            data-code="${c.code}"
                            data-name="${c.name}"
                            class="w-full flex items-center justify-between px-3 py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer text-left ${isMatch ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-100'}">
                        <span>${c.name}</span>
                        ${isMatch ? '<svg class="w-4 h-4 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' : ''}
                    </button>
                </li>
            `;
        }).join('');
    };

    const showCategoryDropdown = () => {
        categoryDropdown?.classList.remove('hidden');
        if (categoryArrow) categoryArrow.classList.add('rotate-180');
        renderCategoryList(categoryHiddenInput?.value || '', categorySearchInput?.value || '');
    };

    const hideCategoryDropdown = () => {
        categoryDropdown?.classList.add('hidden');
        if (categoryArrow) categoryArrow.classList.remove('rotate-180');
        const currentCode = categoryHiddenInput?.value || '';
        const selObj = loadedCategories.find(c => c.code === currentCode);
        if (selObj && categorySearchInput) {
            categorySearchInput.value = selObj.name;
        }
    };

    categorySearchInput?.addEventListener('focus', () => {
        showCategoryDropdown();
    });

    categorySearchInput?.addEventListener('input', (e) => {
        const val = e.target.value || '';
        categoryDropdown?.classList.remove('hidden');
        if (categoryArrow) categoryArrow.classList.add('rotate-180');
        
        // Find if typed value exactly matches a category name
        const match = loadedCategories.find(c => c.name.toLowerCase() === val.trim().toLowerCase());
        if (match && categoryHiddenInput) {
            categoryHiddenInput.value = match.code;
        }

        saveDraftCache();
        renderCategoryList(categoryHiddenInput?.value || '', val);
    });

    categoryArrowBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = categoryDropdown?.classList.contains('hidden');
        if (isHidden) {
            categorySearchInput?.focus();
            showCategoryDropdown();
        } else {
            hideCategoryDropdown();
        }
    });

    categoryList?.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-code]');
        if (btn) {
            const code = btn.dataset.code;
            const name = btn.dataset.name;
            if (categoryHiddenInput) categoryHiddenInput.value = code;
            if (categorySearchInput) categorySearchInput.value = name;
            saveDraftCache();
            hideCategoryDropdown();
        }
    });

    document.addEventListener('click', (e) => {
        const container = document.getElementById('at-categoryDropdownContainer');
        if (container && !container.contains(e.target)) {
            hideCategoryDropdown();
        }
    });

    // Cancel button clears draft cache and cookies immediately
    cancelBtn?.addEventListener('click', () => {
        clearDraftCache();
    });

    let duplicateCheckTimer = null;

    // Strict validation: GL Code = numbers only (0-9), Account Title = letters, spaces, hyphens, periods only (no numbers)
    const validateInputs = () => {
        const glVal = glCodeInput?.value || '';
        const titleVal = accountTitleInput?.value || '';

        let isValid = true;
        let glHasError = false;
        let titleHasError = false;

        // Check GL Code: If non-digits exist
        if (glVal && !/^\d+$/.test(glVal.trim())) {
            glHasError = true;
            isValid = false;
        }

        // Check Account Title: If any number exists
        if (titleVal && /\d/.test(titleVal)) {
            titleHasError = true;
            isValid = false;
        }

        // Show/hide tooltips
        if (glTooltip) {
            if (glHasError) {
                glTooltip.classList.remove('hidden');
                glCodeInput?.classList.add('border-rose-400', 'focus:border-rose-500', 'focus:ring-rose-200');
            } else {
                glTooltip.classList.add('hidden');
                glCodeInput?.classList.remove('border-rose-400', 'focus:border-rose-500', 'focus:ring-rose-200');
            }
        }

        if (titleTooltip) {
            if (titleHasError) {
                titleTooltip.classList.remove('hidden');
                accountTitleInput?.classList.add('border-rose-400', 'focus:border-rose-500', 'focus:ring-rose-200');
            } else {
                titleTooltip.classList.add('hidden');
                accountTitleInput?.classList.remove('border-rose-400', 'focus:border-rose-500', 'focus:ring-rose-200');
            }
        }

        if (!isValid) {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.title = glHasError ? 'G/L Code must be numbers only.' : 'Account Title cannot contain numbers.';
                submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }

        return isValid;
    };

    const checkDuplicate = async () => {
        const id = idInput?.value || '';
        const glCode = glCodeInput?.value?.trim() || '';
        const title = accountTitleInput?.value?.trim() || '';

        const formatValid = validateInputs();
        if (!formatValid) return;

        if (!glCode && !title) {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.title = '';
                submitBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-auto');
            }
            if (errEl) errEl.classList.add('hidden');
            return;
        }

        try {
            const apiBase = getApiBasePath();
            const params = new URLSearchParams({
                gl_code: glCode,
                account_title: title,
                exclude_id: id
            });
            const res = await fetch(`${apiBase}/api/account-titles/check-duplicate.php?${params.toString()}`, {
                credentials: 'same-origin'
            });
            const data = await res.json();

            // Re-check format validity before enabling
            if (!validateInputs()) return;

            if (data.success && (data.glExists || data.titleExists)) {
                let errorMsg = '';
                if (data.glExists && data.titleExists) {
                    errorMsg = `G/L Code "${glCode}" and Account Title "${title}" already exist in database.`;
                } else if (data.glExists) {
                    errorMsg = `G/L Code "${glCode}" already exists (Assigned to: "${data.conflictingGlTitle || 'another account'}").`;
                } else {
                    errorMsg = `Account Title "${title}" already exists in database.`;
                }

                if (errEl) {
                    errEl.textContent = errorMsg;
                    errEl.classList.remove('hidden');
                }

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.title = errorMsg;
                    submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
                }
            } else {
                if (errEl && !errEl.textContent.includes('is required')) {
                    errEl.classList.add('hidden');
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.title = '';
                    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            }
        } catch (error) {
            console.warn('Error checking duplicate account title:', error);
        }
    };

    const onInputChange = () => {
        saveDraftCache();

        const formatValid = validateInputs();
        if (!formatValid) return;

        clearTimeout(duplicateCheckTimer);
        duplicateCheckTimer = setTimeout(checkDuplicate, 250);
    };

    glCodeInput?.addEventListener('input', onInputChange);
    accountTitleInput?.addEventListener('input', onInputChange);

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = idInput?.value || null;
        const glCode = glCodeInput?.value?.trim();
        const accountTitle = accountTitleInput?.value?.trim();
        const category = categoryHiddenInput?.value?.trim() || 'mooe';

        if (!validateInputs()) {
            return;
        }

        if (!glCode) {
            if (errEl) {
                errEl.textContent = 'G/L Code is required.';
                errEl.classList.remove('hidden');
            }
            return;
        }

        if (!accountTitle) {
            if (errEl) {
                errEl.textContent = 'Account Title is required.';
                errEl.classList.remove('hidden');
            }
            return;
        }

        if (submitBtn && submitBtn.disabled) {
            return;
        }

        if (errEl) errEl.classList.add('hidden');

        // All validated - clear draft cache and cookies
        clearDraftCache();

        const callback = accountTitlesDrawerOnConfirm;
        hideDrawer();
        if (typeof callback === 'function') {
            callback({
                id: id ? Number(id) : null,
                gl_code: glCode,
                glCode,
                account_title: accountTitle,
                accountTitle,
                category
            });
        }
    });

    // Attach category loader & draft helpers to drawer element for callers
    drawerEl._loadCategories = loadCategoryOptions;
    drawerEl._getDraft = getDraftCache;
    drawerEl._clearDraft = clearDraftCache;
}
// END: ensureAccountTitlesDrawer

// START: showAccountTitlesCreateDrawer - Opens Flowbite drawer for adding a new account title
export function showAccountTitlesCreateDrawer({ onConfirm }) {
    ensureAccountTitlesDrawer();
    accountTitlesDrawerOnConfirm = onConfirm;

    const label = document.getElementById('accountTitlesDrawerLabel');
    if (label) label.textContent = 'Add Account Title';

    const sublabel = document.getElementById('accountTitlesDrawerSublabel');
    if (sublabel) sublabel.textContent = 'Create a new G/L code and account title in the directory.';

    const idInput = document.getElementById('at-id');
    if (idInput) idInput.value = '';

    const glCodeInput = document.getElementById('at-glCode');
    const titleInput = document.getElementById('at-accountTitle');
    const categoryHidden = document.getElementById('at-category');
    const categorySearchInput = document.getElementById('at-categoryBtn');
    const drawerEl = document.getElementById('accountTitlesDrawer');

    // Check for cached draft within 60 seconds
    const draft = typeof drawerEl?._getDraft === 'function' ? drawerEl._getDraft() : null;

    if (glCodeInput) glCodeInput.value = draft ? draft.glCode : '';
    if (titleInput) titleInput.value = draft ? draft.accountTitle : '';
    if (categoryHidden) categoryHidden.value = draft ? draft.category : '';
    if (categorySearchInput) categorySearchInput.value = draft ? draft.categoryName : '';

    if (drawerEl && typeof drawerEl._loadCategories === 'function') {
        drawerEl._loadCategories(draft ? draft.category : '');
    }

    const glTooltip = document.getElementById('at-glCode-tooltip');
    if (glTooltip) glTooltip.classList.add('hidden');

    const titleTooltip = document.getElementById('at-accountTitle-tooltip');
    if (titleTooltip) titleTooltip.classList.add('hidden');

    const submitBtn = document.getElementById('accountTitlesDrawerSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.title = '';
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    const submitText = document.getElementById('accountTitlesDrawerSubmitText');
    if (submitText) submitText.textContent = 'Add Account';

    const submitIcon = document.getElementById('accountTitlesDrawerSubmitIcon');
    if (submitIcon) {
        submitIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5"/>`;
    }

    const errEl = document.getElementById('accountTitlesDrawerValidationError');
    if (errEl) errEl.classList.add('hidden');

    hideFloatingUI();
    accountTitlesDrawerInstance?.show();

    if (glCodeInput) {
        setTimeout(() => {
            glCodeInput.focus();
        }, 100);
    }
}
// END: showAccountTitlesCreateDrawer

// START: showAccountTitlesEditDrawer - Opens Flowbite drawer for editing an existing account title
export function showAccountTitlesEditDrawer({ accountTitle, onConfirm }) {
    ensureAccountTitlesDrawer();
    accountTitlesDrawerOnConfirm = onConfirm;

    // Clear any pending create-draft when opening edit drawer
    const drawerEl = document.getElementById('accountTitlesDrawer');
    if (drawerEl && typeof drawerEl._clearDraft === 'function') {
        drawerEl._clearDraft();
    }

    const label = document.getElementById('accountTitlesDrawerLabel');
    if (label) label.textContent = 'Edit Account Title';

    const sublabel = document.getElementById('accountTitlesDrawerSublabel');
    if (sublabel) sublabel.textContent = 'Update the G/L code or account title details.';

    const idInput = document.getElementById('at-id');
    if (idInput) idInput.value = accountTitle?.id || '';

    const glCodeInput = document.getElementById('at-glCode');
    if (glCodeInput) glCodeInput.value = accountTitle?.gl_code || '';

    const titleInput = document.getElementById('at-accountTitle');
    if (titleInput) titleInput.value = accountTitle?.account_title || '';

    const catCode = accountTitle?.category || '';
    const categoryHidden = document.getElementById('at-category');
    if (categoryHidden) categoryHidden.value = catCode;

    if (drawerEl && typeof drawerEl._loadCategories === 'function') {
        drawerEl._loadCategories(catCode);
    }

    const glTooltip = document.getElementById('at-glCode-tooltip');
    if (glTooltip) glTooltip.classList.add('hidden');

    const titleTooltip = document.getElementById('at-accountTitle-tooltip');
    if (titleTooltip) titleTooltip.classList.add('hidden');

    const submitBtn = document.getElementById('accountTitlesDrawerSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.title = '';
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    const submitText = document.getElementById('accountTitlesDrawerSubmitText');
    if (submitText) submitText.textContent = 'Save Changes';

    const submitIcon = document.getElementById('accountTitlesDrawerSubmitIcon');
    if (submitIcon) {
        submitIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
    }

    const errEl = document.getElementById('accountTitlesDrawerValidationError');
    if (errEl) errEl.classList.add('hidden');

    hideFloatingUI();
    accountTitlesDrawerInstance?.show();

    if (glCodeInput) {
        setTimeout(() => {
            glCodeInput.focus();
            glCodeInput.select();
        }, 100);
    }
}
// END: showAccountTitlesEditDrawer

// START: ensureItemizedDrawer - Injects and initializes Flowbite drawer for itemized daily transactions
function ensureItemizedDrawer() {
    if (document.getElementById('itemizedExpensesDrawer')) return;

    const drawerHTML = `
        <div id="itemizedExpensesDrawer"
             class="fixed top-0 right-0 z-[80] h-screen p-4 sm:p-6 overflow-y-auto transition-transform translate-x-full bg-white w-full sm:w-[540px] md:w-[600px] shadow-2xl flex flex-col justify-between"
             tabindex="-1"
             aria-labelledby="itemizedDrawerLabel">
            <div>
                <!-- Header -->
                <div class="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                        <h5 id="itemizedDrawerLabel" class="inline-flex items-center text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-900">
                            Record Daily Expense
                        </h5>
                        <p id="itemizedDrawerSublabel" class="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Track daily personalized expenditure, payee info, and account allocation.
                        </p>
                    </div>
                    <button type="button"
                            id="itemizedDrawerCloseBtn"
                            class="text-slate-400 bg-transparent hover:bg-slate-200 hover:text-slate-900 rounded-lg text-sm w-8 h-8 inline-flex items-center justify-center cursor-pointer transition-colors"
                            aria-label="Close drawer">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 14 14" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                    </button>
                </div>

                <!-- Form Content -->
                <div class="py-4">
                    <div id="itemizedDrawerValidationError" class="hidden mb-4 p-3 text-xs sm:text-sm text-rose-800 bg-rose-50 rounded-xl border border-rose-200"></div>

                    <form id="itemizedExpensesDrawerForm" class="space-y-4">
                        <input type="hidden" id="itemized-drawer-id" value="" />

                        <!-- Date Field -->
                        <div class="space-y-1.5">
                            <label for="itemized-drawer-date" class="block text-sm font-bold text-slate-800">
                                Transaction Date <span class="text-rose-500">*</span>
                            </label>
                            <input type="date"
                                   id="itemized-drawer-date"
                                   required
                                   class="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-hidden transition-all shadow-xs cursor-pointer" />
                        </div>

                        <!-- Payee Field with New Payee detection badge & Dropdown Suggestions -->
                        <div class="space-y-1.5">
                            <div class="flex items-center justify-between">
                                <label for="itemized-drawer-payee" class="block text-sm font-bold text-slate-800">
                                    Individual / Payee <span class="text-rose-500">*</span>
                                </label>
                                <span id="itemizedDrawerPayeeBadge" class="hidden inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
                                    New Individual (Will be added)
                                </span>
                            </div>
                            <div class="relative">
                                <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                </span>
                                <input type="text"
                                       id="itemized-drawer-payee"
                                       placeholder="Type to search or add payee..."
                                       autocomplete="off"
                                       required
                                       class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-hidden transition-all shadow-xs" />
                                <div id="itemized-payee-suggestions"
                                     class="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl hidden"></div>
                            </div>
                        </div>

                        <!-- Account Title / G/L Code Searchable Dropdown -->
                        <div class="space-y-1.5">
                            <label for="itemized-drawer-account" class="block text-sm font-bold text-slate-800">
                                Account Title <span class="text-xs font-normal text-slate-400 ml-1">(optional)</span>
                            </label>
                            <div class="relative">
                                <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                                </span>
                                <input type="text"
                                       id="itemized-drawer-account"
                                       placeholder="Type to search (e.g. Travel Expenses...)"
                                       autocomplete="off"
                                       class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-hidden transition-all shadow-xs" />
                                <input type="hidden" id="itemized-drawer-accountId" value="" />
                                <input type="hidden" id="itemized-drawer-glCode" value="" />
                                <input type="hidden" id="itemized-drawer-accountTitle" value="" />
                                <div id="itemized-drawer-account-suggestions"
                                     class="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl hidden"></div>
                            </div>
                        </div>

                        <!-- DV No. and Check No. in 2-column grid -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="space-y-1.5">
                                <label for="itemized-drawer-dvNo" class="block text-sm font-bold text-slate-800">
                                    DV No.
                                </label>
                                <input type="text"
                                       id="itemized-drawer-dvNo"
                                       placeholder="e.g. 2026-10-001 (auto)"
                                       class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-medium text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-hidden transition-all shadow-xs" />
                            </div>
                            <div class="space-y-1.5">
                                <label for="itemized-drawer-checkNo" class="block text-sm font-bold text-slate-800">
                                    Check / Ref No.
                                </label>
                                <input type="text"
                                       id="itemized-drawer-checkNo"
                                       placeholder="e.g. 000123"
                                       class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-medium text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-hidden transition-all shadow-xs" />
                            </div>
                        </div>

                        <!-- Amount Field -->
                        <div class="space-y-1.5">
                            <label for="itemized-drawer-amount" class="block text-sm font-bold text-slate-800">
                                Total Daily Amount (₱) <span class="text-rose-500">*</span>
                            </label>
                            <div class="relative">
                                <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-base font-bold text-slate-500">₱</span>
                                <input type="text"
                                       id="itemized-drawer-amount"
                                       inputmode="decimal"
                                       placeholder="0.00"
                                       required
                                       class="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-mono font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-hidden transition-all shadow-xs tabular-nums" />
                            </div>
                        </div>

                        <!-- Particulars / Description -->
                        <div class="space-y-1.5">
                            <label for="itemized-drawer-description" class="block text-sm font-bold text-slate-800">
                                Description / Particulars
                            </label>
                            <textarea id="itemized-drawer-description"
                                      rows="2"
                                      placeholder="Daily expense details, purpose, or voucher remarks..."
                                      class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-hidden transition-all shadow-xs resize-none"></textarea>
                        </div>

                        <!-- Footer Actions pinned at bottom -->
                        <div class="mt-6 pt-4 pb-2 border-t border-slate-200 bg-white sticky bottom-0">
                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <button type="button"
                                        id="itemizedDrawerCancelBtn"
                                        class="inline-flex items-center justify-center rounded-lg border border-rose-400 bg-white px-5 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-400/40 cursor-pointer w-full sm:w-[48%] md:w-[48%] transition-all">
                                    Cancel
                                </button>
                                <button type="submit"
                                        id="itemizedDrawerSubmitBtn"
                                        class="inline-flex items-center justify-center rounded-lg border border-emerald-600 bg-emerald-600 px-5 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold text-white hover:bg-emerald-700 hover:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 cursor-pointer w-full sm:w-[48%] md:w-[48%] transition-all">
                                    <svg id="itemizedDrawerSubmitIcon" class="mr-2 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5"/>
                                    </svg>
                                    <span id="itemizedDrawerSubmitText">Record Expense</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    const drawerEl = document.getElementById('itemizedExpensesDrawer');
    const cancelBtn = document.getElementById('itemizedDrawerCancelBtn');
    const closeBtn = document.getElementById('itemizedDrawerCloseBtn');
    const form = document.getElementById('itemizedExpensesDrawerForm');
    const payeeInput = document.getElementById('itemized-drawer-payee');
    const payeeBadge = document.getElementById('itemizedDrawerPayeeBadge');
    const payeeSuggestionsEl = document.getElementById('itemized-payee-suggestions');
    const accountInput = document.getElementById('itemized-drawer-account');
    const accountSuggestionsEl = document.getElementById('itemized-drawer-account-suggestions');
    const accountIdHidden = document.getElementById('itemized-drawer-accountId');
    const glCodeHidden = document.getElementById('itemized-drawer-glCode');
    const accountTitleHidden = document.getElementById('itemized-drawer-accountTitle');
    const amountInput = document.getElementById('itemized-drawer-amount');

    if (!drawerEl) return;

    itemizedDrawerInstance = new Drawer(drawerEl, {
        placement: 'right',
        backdrop: 'dynamic',
        backdropClasses: 'bg-slate-900/40 backdrop-blur-sm fixed inset-0 z-[70]'
    });

    const hideDrawer = () => {
        itemizedDrawerInstance?.hide();
        itemizedDrawerOnConfirm = null;
        showFloatingUI();
    };

    cancelBtn?.addEventListener('click', hideDrawer);
    closeBtn?.addEventListener('click', hideDrawer);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && itemizedDrawerInstance?.isVisible()) {
            hideDrawer();
        }
    });

    if (amountInput) {
        attachNumberFormatter(amountInput);
    }

    const getApiBasePath = () => {
        const path = window.location.pathname || '/';
        const idx = path.indexOf('/frontend/');
        return idx !== -1 ? path.substring(0, idx) : path.substring(0, path.lastIndexOf('/')) || '';
    };

    const escapeHtml = (s) => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Account title search suggestions (matches budget drawer style)
    const showAccountSuggestions = (q) => {
        if (!accountSuggestionsEl) return;
        const apiBase = getApiBasePath();
        fetch(`${apiBase}/api/account-titles/search.php?q=${encodeURIComponent(q || '')}`)
            .then(r => r.json())
            .then(res => {
                if (!res.success || !res.data) return;
                if (res.data.length === 0) {
                    accountSuggestionsEl.innerHTML = `<div class="px-4 py-3 text-xs text-slate-400 italic">No account titles found</div>`;
                    accountSuggestionsEl.classList.remove('hidden');
                    return;
                }
                accountSuggestionsEl.innerHTML = res.data.map(item => {
                    const id = String(item.id || '');
                    const gl = String(item.gl_code || '');
                    const title = String(item.account_title || '');
                    return `<div class="px-4 py-3 hover:bg-slate-100 cursor-pointer text-sm sm:text-base text-slate-700 border-b border-slate-100 last:border-b-0 transition-colors flex items-center gap-2.5" data-acc-id="${escapeHtml(id)}" data-gl="${escapeHtml(gl)}" data-title="${escapeHtml(title)}">
                                <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                                <span>${escapeHtml(gl)} - ${escapeHtml(title)}</span>
                            </div>`;
                }).join('');
                accountSuggestionsEl.classList.remove('hidden');
                accountSuggestionsEl.querySelectorAll('[data-acc-id]').forEach(el => {
                    el.addEventListener('click', () => {
                        if (accountIdHidden) accountIdHidden.value = el.dataset.accId || '';
                        if (glCodeHidden) glCodeHidden.value = el.dataset.gl || '';
                        if (accountTitleHidden) accountTitleHidden.value = el.dataset.title || '';
                        if (accountInput) accountInput.value = `${el.dataset.gl || ''} - ${el.dataset.title || ''}`;
                        accountSuggestionsEl.classList.add('hidden');
                    });
                });
            })
            .catch(() => {
                if (accountSuggestionsEl) accountSuggestionsEl.classList.add('hidden');
            });
    };

    let accountDebounceTimer;
    if (accountInput) {
        accountInput.addEventListener('input', () => {
            clearTimeout(accountDebounceTimer);
            accountDebounceTimer = setTimeout(() => showAccountSuggestions(accountInput.value.trim()), 150);
        });
        accountInput.addEventListener('focus', () => {
            showAccountSuggestions(accountInput.value.trim() || '');
        });
    }

    // Payee search suggestions & new badge
    const showPayeeSuggestions = (q) => {
        if (!payeeSuggestionsEl) return;
        const apiBase = getApiBasePath();
        fetch(`${apiBase}/api/itemized/payees.php`, { credentials: 'same-origin' })
            .then(r => r.json())
            .then(res => {
                if (!res.success || !Array.isArray(res.payees)) return;
                const query = (q || '').trim().toLowerCase();
                const matched = res.payees.filter(p => !query || p.toLowerCase().includes(query));

                // Check exact match for "New Individual" badge
                const isExact = res.payees.some(p => p.toLowerCase() === query);
                if (payeeBadge) {
                    if (query && !isExact) payeeBadge.classList.remove('hidden');
                    else payeeBadge.classList.add('hidden');
                }

                if (matched.length === 0) {
                    payeeSuggestionsEl.classList.add('hidden');
                    return;
                }

                payeeSuggestionsEl.innerHTML = matched.map(p => {
                    return `<div class="px-4 py-2.5 hover:bg-slate-100 cursor-pointer text-sm text-slate-700 border-b border-slate-100 last:border-b-0 transition-colors flex items-center gap-2.5" data-payee-val="${escapeHtml(p)}">
                                <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                <span>${escapeHtml(p)}</span>
                            </div>`;
                }).join('');
                payeeSuggestionsEl.classList.remove('hidden');
                payeeSuggestionsEl.querySelectorAll('[data-payee-val]').forEach(el => {
                    el.addEventListener('click', () => {
                        if (payeeInput) payeeInput.value = el.dataset.payeeVal || '';
                        if (payeeBadge) payeeBadge.classList.add('hidden');
                        payeeSuggestionsEl.classList.add('hidden');
                    });
                });
            })
            .catch(() => {
                if (payeeSuggestionsEl) payeeSuggestionsEl.classList.add('hidden');
            });
    };

    let payeeDebounceTimer;
    if (payeeInput) {
        payeeInput.addEventListener('input', () => {
            clearTimeout(payeeDebounceTimer);
            payeeDebounceTimer = setTimeout(() => showPayeeSuggestions(payeeInput.value.trim()), 150);
        });
        payeeInput.addEventListener('focus', () => {
            showPayeeSuggestions(payeeInput.value.trim() || '');
        });
    }

    // Dismiss suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (accountSuggestionsEl && !accountSuggestionsEl.contains(e.target) && e.target !== accountInput) {
            accountSuggestionsEl.classList.add('hidden');
        }
        if (payeeSuggestionsEl && !payeeSuggestionsEl.contains(e.target) && e.target !== payeeInput) {
            payeeSuggestionsEl.classList.add('hidden');
        }
    });

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('itemized-drawer-id')?.value || null;
        const date = document.getElementById('itemized-drawer-date')?.value || '';
        const payee = payeeInput?.value?.trim() || '';
        let accountId = accountIdHidden?.value ? Number(accountIdHidden.value) : null;
        let glCode = glCodeHidden?.value?.trim() || '';
        let accountTitle = accountTitleHidden?.value?.trim() || '';

        // Fallback: parse account from input text if user typed directly
        if (!glCode && accountInput?.value) {
            const rawVal = accountInput.value.trim();
            const dashIdx = rawVal.indexOf('-');
            if (dashIdx !== -1) {
                glCode = rawVal.substring(0, dashIdx).trim();
                accountTitle = rawVal.substring(dashIdx + 1).trim();
            } else {
                accountTitle = rawVal;
            }
        }

        const dvNo = document.getElementById('itemized-drawer-dvNo')?.value?.trim() || '';
        const checkNo = document.getElementById('itemized-drawer-checkNo')?.value?.trim() || '';
        const rawAmount = parseFormattedNumber(amountInput?.value);
        const description = document.getElementById('itemized-drawer-description')?.value?.trim() || '';
        const errEl = document.getElementById('itemizedDrawerValidationError');

        if (!date) {
            if (errEl) { errEl.textContent = 'Date is required.'; errEl.classList.remove('hidden'); }
            return;
        }
        if (!payee) {
            if (errEl) { errEl.textContent = 'Payee / Individual name is required.'; errEl.classList.remove('hidden'); }
            return;
        }
        if (isNaN(rawAmount) || rawAmount <= 0) {
            if (errEl) { errEl.textContent = 'Amount must be greater than ₱0.00.'; errEl.classList.remove('hidden'); }
            return;
        }

        if (errEl) errEl.classList.add('hidden');

        const callback = itemizedDrawerOnConfirm;
        hideDrawer();
        if (typeof callback === 'function') {
            callback({
                id: id ? Number(id) : null,
                date,
                payee,
                accountId,
                account_id: accountId,
                glCode,
                gl_code: glCode,
                accountTitle,
                account_title: accountTitle,
                dvNo,
                dv_no: dvNo,
                checkNo,
                check_no: checkNo,
                amount: rawAmount,
                checkAmount: rawAmount,
                check_amount: rawAmount,
                description,
                particulars: description
            });
        }
    });
}
// END: ensureItemizedDrawer

// START: populateItemizedDrawerAccountsAndPayees - Pre-caches accounts and payees for itemized drawer
async function populateItemizedDrawerAccountsAndPayees() {
    ensureItemizedDrawer();
}
// END: populateItemizedDrawerAccountsAndPayees

// START: showItemizedCreateDrawer - Opens Flowbite drawer for recording a daily transaction
export async function showItemizedCreateDrawer({ date, payee, onConfirm } = {}) {
    ensureItemizedDrawer();
    itemizedDrawerOnConfirm = onConfirm;

    const label = document.getElementById('itemizedDrawerLabel');
    if (label) label.textContent = 'Record Daily Expense';

    const sublabel = document.getElementById('itemizedDrawerSublabel');
    if (sublabel) sublabel.textContent = 'Record everyday daily expenditure by individual payee.';

    const idInput = document.getElementById('itemized-drawer-id');
    if (idInput) idInput.value = '';

    const dateInput = document.getElementById('itemized-drawer-date');
    if (dateInput) dateInput.value = date || new Date().toISOString().split('T')[0];

    const payeeInput = document.getElementById('itemized-drawer-payee');
    if (payeeInput) payeeInput.value = payee || '';

    const payeeBadge = document.getElementById('itemizedDrawerPayeeBadge');
    if (payeeBadge) payeeBadge.classList.add('hidden');

    const accountInput = document.getElementById('itemized-drawer-account');
    if (accountInput) accountInput.value = '';

    const accountIdHidden = document.getElementById('itemized-drawer-accountId');
    if (accountIdHidden) accountIdHidden.value = '';

    const glCodeHidden = document.getElementById('itemized-drawer-glCode');
    if (glCodeHidden) glCodeHidden.value = '';

    const accountTitleHidden = document.getElementById('itemized-drawer-accountTitle');
    if (accountTitleHidden) accountTitleHidden.value = '';

    const dvInput = document.getElementById('itemized-drawer-dvNo');
    if (dvInput) dvInput.value = '';

    const checkInput = document.getElementById('itemized-drawer-checkNo');
    if (checkInput) checkInput.value = '';

    const amountInput = document.getElementById('itemized-drawer-amount');
    if (amountInput) amountInput.value = '';

    const descInput = document.getElementById('itemized-drawer-description');
    if (descInput) descInput.value = '';

    const submitText = document.getElementById('itemizedDrawerSubmitText');
    if (submitText) submitText.textContent = 'Record Expense';

    const submitIcon = document.getElementById('itemizedDrawerSubmitIcon');
    if (submitIcon) {
        submitIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5"/>`;
    }

    const errEl = document.getElementById('itemizedDrawerValidationError');
    if (errEl) errEl.classList.add('hidden');

    await populateItemizedDrawerAccountsAndPayees();

    hideFloatingUI();
    itemizedDrawerInstance?.show();

    setTimeout(() => {
        if (!payee) payeeInput?.focus();
        else amountInput?.focus();
    }, 100);
}
// END: showItemizedCreateDrawer

// START: showItemizedEditDrawer - Opens Flowbite drawer for editing an existing daily transaction
export async function showItemizedEditDrawer({ transaction, onConfirm } = {}) {
    ensureItemizedDrawer();
    itemizedDrawerOnConfirm = onConfirm;

    const label = document.getElementById('itemizedDrawerLabel');
    if (label) label.textContent = 'Edit Daily Expense';

    const sublabel = document.getElementById('itemizedDrawerSublabel');
    if (sublabel) sublabel.textContent = 'Modify daily individual transaction details.';

    const idInput = document.getElementById('itemized-drawer-id');
    if (idInput) idInput.value = transaction?.id || '';

    const dateInput = document.getElementById('itemized-drawer-date');
    if (dateInput) dateInput.value = transaction?.date || transaction?.dvDate || new Date().toISOString().split('T')[0];

    const payeeInput = document.getElementById('itemized-drawer-payee');
    if (payeeInput) payeeInput.value = transaction?.payee || '';

    const payeeBadge = document.getElementById('itemizedDrawerPayeeBadge');
    if (payeeBadge) payeeBadge.classList.add('hidden');

    const accountInput = document.getElementById('itemized-drawer-account');
    const accountIdHidden = document.getElementById('itemized-drawer-accountId');
    const glCodeHidden = document.getElementById('itemized-drawer-glCode');
    const accountTitleHidden = document.getElementById('itemized-drawer-accountTitle');

    const accId = transaction?.accountId || transaction?.account_id || '';
    const glCode = transaction?.glCode || transaction?.gl_code || '';
    const accTitle = transaction?.accountTitle || transaction?.account_title || '';

    if (accountIdHidden) accountIdHidden.value = accId ? String(accId) : '';
    if (glCodeHidden) glCodeHidden.value = glCode || '';
    if (accountTitleHidden) accountTitleHidden.value = accTitle || '';
    if (accountInput) {
        if (glCode && accTitle) {
            accountInput.value = `${glCode} - ${accTitle}`;
        } else if (accTitle) {
            accountInput.value = accTitle;
        } else if (glCode) {
            accountInput.value = glCode;
        } else {
            accountInput.value = '';
        }
    }

    const dvInput = document.getElementById('itemized-drawer-dvNo');
    if (dvInput) dvInput.value = transaction?.dvNo || transaction?.dv_no || '';

    const checkInput = document.getElementById('itemized-drawer-checkNo');
    if (checkInput) checkInput.value = transaction?.checkNo || transaction?.check_no || '';

    const amountInput = document.getElementById('itemized-drawer-amount');
    if (amountInput) {
        const val = Number(transaction?.amount ?? transaction?.checkAmount ?? 0);
        amountInput.value = isNaN(val) ? '' : formatWithCommas(val.toFixed(2));
    }

    const descInput = document.getElementById('itemized-drawer-description');
    if (descInput) descInput.value = transaction?.description || transaction?.particulars || '';

    const submitText = document.getElementById('itemizedDrawerSubmitText');
    if (submitText) submitText.textContent = 'Save Changes';

    const submitIcon = document.getElementById('itemizedDrawerSubmitIcon');
    if (submitIcon) {
        submitIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
    }

    const errEl = document.getElementById('itemizedDrawerValidationError');
    if (errEl) errEl.classList.add('hidden');

    await populateItemizedDrawerAccountsAndPayees();

    hideFloatingUI();
    itemizedDrawerInstance?.show();

    setTimeout(() => {
        amountInput?.focus();
    }, 100);
}
// END: showItemizedEditDrawer




