import { Drawer } from 'flowbite';

const DEFAULT_PASSWORD = 'mjUgtong2026!';

let adminDrawerInstance = null;
let adminDrawerOnConfirm = null;
let adminDrawerValidationError = null;
let budgetDrawerInstance = null;
let budgetDrawerOnConfirm = null;
let monthlyDrawerInstance = null;
let monthlyDrawerOnConfirm = null;

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

    const drawerHTML = `
        <!-- Admin Create User Drawer -->
        <div id="adminCreateUserDrawer"
             class="fixed top-0 right-0 z-50 h-screen w-full max-w-xl md:max-w-lg lg:max-w-xl p-4 md:p-6 overflow-y-auto bg-white shadow-[0_20px_60px_rgba(15,23,42,0.45)] border-l border-slate-200/80 transform translate-x-full transition-transform"
             tabindex="-1"
             aria-labelledby="adminCreateUserDrawerLabel">
            <div class="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">User profile</p>
                    <h2 id="adminCreateUserDrawerLabel" class="text-xl font-bold text-slate-900 leading-tight">Create new user</h2>
                </div>
                <button type="button"
                        id="adminDrawerCloseBtn"
                        aria-controls="adminCreateUserDrawer"
                        class="inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12"/>
                    </svg>
                    <span class="sr-only">Close panel</span>
                </button>
            </div>

            <div id="adminDrawerValidationError"
                 class="hidden mb-4 p-3 text-xs md:text-sm text-rose-800 bg-rose-50 rounded-lg border border-rose-200"></div>

            <form id="adminCreateUserDrawerForm" class="flex flex-col gap-6 pb-32 max-md:pb-40 md:pb-4">
                <!-- Account section -->
                <section class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div class="md:col-span-4">
                            <p class="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-400 mb-1.5">Account</p>
                            <p class="text-sm text-slate-500">Basic credentials used to sign in.</p>
                        </div>
                        <div class="md:col-span-8 space-y-3">
                            <div>
                                <label for="admin-username" class="block mb-1 text-xs font-semibold text-slate-600">Username<span class="text-rose-500">*</span></label>
                                <input id="admin-username" name="username" type="text" required
                                       class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#224796] focus:border-[#224796]"
                                       placeholder="e.g., jdoe" />
                            </div>
                            <div>
                                <label for="admin-full-name" class="block mb-1 text-xs font-semibold text-slate-600">Full name<span class="text-rose-500">*</span></label>
                                <input id="admin-full-name" name="full-name" type="text" required
                                       class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#224796] focus:border-[#224796]"
                                       placeholder="e.g., John Doe" />
                            </div>
                            <div>
                                <label for="admin-email" class="block mb-1 text-xs font-semibold text-slate-600">Email<span class="text-rose-500">*</span></label>
                                <input id="admin-email" name="email" type="email" required
                                       class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#224796] focus:border-[#224796]"
                                       placeholder="e.g., john.doe@example.com" />
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Role & details -->
                <section class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div class="md:col-span-4">
                            <p class="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-400 mb-1.5">Role & details</p>
                            <p class="text-sm text-slate-500">Assign access level and basic profile details.</p>
                        </div>
                        <div class="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="sm:col-span-2">
                                <label for="admin-role" class="block mb-1 text-xs font-semibold text-slate-600">Role<span class="text-rose-500">*</span></label>
                                <select id="admin-role" required
                                        class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#224796] focus:border-[#224796] cursor-pointer">
                                    <option value="">Select role...</option>
                                    <option value="Administrator">Administrator</option>
                                    <option value="CEO">CEO</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Workmate">Workmate</option>
                                    <option value="Staff">Staff</option>
                                </select>
                            </div>
                            <div>
                                <label for="admin-phone" class="block mb-1 text-xs font-semibold text-slate-600">Mobile</label>
                                <div class="flex rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#224796] focus-within:border-[#224796]">
                                    <span class="inline-flex items-center px-3 text-xs font-semibold text-slate-600 bg-slate-50 border-r border-slate-200 select-none">+64</span>
                                    <input id="admin-phone" name="phone" type="tel" inputmode="tel"
                                           class="block w-full border-0 bg-transparent px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-0"
                                           placeholder="9XXXXXXXX" />
                                </div>
                            </div>
                            <div>
                                <label for="admin-dob" class="block mb-1 text-xs font-semibold text-slate-600">Birthday</label>
                                <input id="admin-dob" name="dob" type="date"
                                       class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#224796] focus:border-[#224796]" />
                            </div>
                            <div>
                                <label for="admin-gender" class="block mb-1 text-xs font-semibold text-slate-600">Gender</label>
                                <select id="admin-gender"
                                        class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#224796] focus:border-[#224796] cursor-pointer">
                                    <option value="">Select gender...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div class="sm:col-span-2">
                                <label for="admin-bio" class="block mb-1 text-xs font-semibold text-slate-600">Short bio</label>
                                <textarea id="admin-bio" rows="3"
                                          class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#224796] focus:border-[#224796]"
                                          placeholder="Brief description about the user..."></textarea>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Default password info -->
                <section>
                    <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                        <p class="text-[11px] md:text-xs font-semibold text-emerald-900">
                            <strong>Default password:</strong> <span id="admin-default-password-label">${DEFAULT_PASSWORD}</span>
                        </p>
                        <p class="mt-1 text-[11px] md:text-xs text-emerald-700">
                            The user will be asked to change this on their first login.
                        </p>
                    </div>
                </section>

                <!-- Footer actions -->
                <div class="mt-4 border-t border-slate-200 pt-3 pb-3 bg-white max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:px-4 md:sticky md:bottom-0 md:left-0 md:right-0">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <button type="submit"
                                class="inline-flex items-center justify-center rounded-lg bg-[#224796] px-5 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold text-white shadow-sm hover:bg-[#163473] focus:outline-none focus:ring-4 focus:ring-[#224796]/45 cursor-pointer w-full sm:w-[48%] md:w-[48%]">
                            <svg class="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M12 5v14m7-7H5" />
                            </svg>
                            Create user
                        </button>
                        <button type="button"
                                id="adminDrawerCancelBtn"
                                class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-medium text-slate-800 hover:bg-red-50 hover:text-red-600 hover:border-red-300 focus:outline-none focus:ring-4 focus:ring-red-200 cursor-pointer w-full sm:w-[48%] md:w-[48%]">
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    const drawerEl = document.getElementById('adminCreateUserDrawer');
    const cancelBtn = document.getElementById('adminDrawerCancelBtn');
    const closeBtn = document.getElementById('adminDrawerCloseBtn');
    const form = document.getElementById('adminCreateUserDrawerForm');
    const phoneInput = document.getElementById('admin-phone');

    if (!drawerEl) return;

    adminDrawerInstance = new Drawer(drawerEl, {
        placement: 'right',
        backdrop: 'dynamic',
        backdropClasses: 'bg-slate-900/30 fixed inset-0 z-40'
    });

    const hideDrawer = () => {
        adminDrawerInstance?.hide();
        adminDrawerOnConfirm = null;
        adminDrawerValidationError = null;
        showFloatingUI();
    };

    cancelBtn?.addEventListener('click', hideDrawer);
    closeBtn?.addEventListener('click', hideDrawer);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hideDrawer();
    });

    // Phone normalization on blur
    phoneInput?.addEventListener('blur', () => {
        let value = phoneInput.value || '';
        let digits = value.replace(/[^0-9]/g, '');
        if (digits.startsWith('0')) {
            digits = digits.slice(1);
        }
        phoneInput.value = digits;
    });

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAdminDrawerSubmit();
    });
}

function ensureBudgetDrawer() {
    if (document.getElementById('budgetCreateDrawer')) return;

    const drawerHTML = `
        <!-- Budget Create Drawer -->
        <div id="budgetCreateDrawer"
             class="fixed top-0 right-0 z-50 h-screen w-full max-w-xl md:max-w-lg lg:max-w-xl p-4 md:p-6 overflow-y-auto bg-white shadow-[0_20px_60px_rgba(15,23,42,0.45)] border-l border-slate-200/80 transform translate-x-full transition-transform"
             tabindex="-1"
             aria-labelledby="budgetCreateDrawerLabel">
            <div class="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">Budget</p>
                    <h2 id="budgetCreateDrawerLabel" class="text-xl font-bold text-slate-900 leading-tight">Initialize Budget Entry</h2>
                </div>
                <button type="button"
                        id="budgetDrawerCloseBtn"
                        aria-controls="budgetCreateDrawer"
                        class="inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12"/>
                    </svg>
                    <span class="sr-only">Close panel</span>
                </button>
            </div>

            <div id="budgetDrawerValidationError"
                 class="hidden mb-4 p-3 text-xs md:text-sm text-rose-800 bg-rose-50 rounded-lg border border-rose-200"></div>

            <form id="budgetCreateDrawerForm" class="flex flex-col gap-6 pb-28 md:pb-4">
                <!-- Account Identification -->
                <section class="space-y-4">
                    <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div class="w-2 h-6 bg-[#224796] rounded-full"></div>
                        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">Account Identification</h3>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div class="space-y-1.5">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                                G/L Account Code <span class="text-rose-500">*</span>
                            </label>
                            <input type="text" id="budget-glCode" placeholder="e.g. 1011"
                                   class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-[#224796]/10 focus:border-[#224796] outline-hidden font-mono" />
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                                Account Title <span class="text-slate-400">(optional)</span>
                            </label>
                            <div class="relative">
                                <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                                </span>
                                <input type="text" id="budget-accountTitle" placeholder="Type to search (e.g. Trave...)"
                                       autocomplete="off"
                                       class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-[#224796]/10 focus:border-[#224796] outline-hidden" />
                                <div id="budget-accountTitle-suggestions"
                                     class="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg hidden"></div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Financial Allocation -->
                <section class="space-y-4">
                    <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div class="w-2 h-6 bg-emerald-500 rounded-full"></div>
                        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">Financial Allocation</h3>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div class="space-y-1.5 md:col-span-2">
                            <p class="text-[10px] text-slate-500">Actual is computed from Monthly Expenses</p>
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                                Budget Allocation (₱) <span class="text-rose-500">*</span>
                            </label>
                            <div class="relative">
                                <span class="absolute left-4 top-2.5 text-slate-400 text-sm font-bold">₱</span>
                                <input type="number" step="0.01" id="budget-budget" placeholder="0.00"
                                       class="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-hidden text-[#224796]" />
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Live Summary -->
                <section>
                    <div class="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl space-y-4 shadow-xl border border-white/5">
                        <div class="flex items-center gap-2">
                            <div class="w-1.5 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
                            <h3 class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Real-time Utilization Summary</h3>
                        </div>
                        <div class="grid grid-cols-2 gap-8">
                            <div class="space-y-1">
                                <p class="text-[9px] font-bold text-emerald-400 uppercase tracking-widest opacity-80">Remaining Balance</p>
                                <p id="budget-remaining-amount" class="text-2xl font-black text-white tracking-tight">₱0.00</p>
                            </div>
                            <div class="space-y-1">
                                <p class="text-[9px] font-bold text-emerald-400 uppercase tracking-widest opacity-80">Utilization Efficiency</p>
                                <p id="budget-remaining-percent" class="text-2xl font-black text-white tracking-tight">0.00%</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Footer actions -->
                <div class="mt-4 border-t border-slate-200 pt-3 pb-3 bg-white md:sticky md:bottom-0 md:left-0 md:right-0">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <button type="submit"
                                class="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold text-white shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/40 cursor-pointer w-full sm:w-[48%] md:w-[48%]">
                            Add Entry
                        </button>
                        <button type="button"
                                id="budgetDrawerCancelBtn"
                                class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-medium text-slate-800 hover:bg-slate-50 hover:text-slate-900 hover:border-red-300 focus:outline-none focus:ring-4 focus:ring-slate-200 cursor-pointer w-full sm:w-[48%] md:w-[48%]">
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    const drawerEl = document.getElementById('budgetCreateDrawer');
    const cancelBtn = document.getElementById('budgetDrawerCancelBtn');
    const closeBtn = document.getElementById('budgetDrawerCloseBtn');
    const form = document.getElementById('budgetCreateDrawerForm');
    const budgetInput = document.getElementById('budget-budget');
    const remainingAmountEl = document.getElementById('budget-remaining-amount');
    const remainingPercentEl = document.getElementById('budget-remaining-percent');
    const glCodeInput = document.getElementById('budget-glCode');
    const accountTitleInput = document.getElementById('budget-accountTitle');
    const suggestionsEl = document.getElementById('budget-accountTitle-suggestions');

    if (!drawerEl) return;

    budgetDrawerInstance = new Drawer(drawerEl, {
        placement: 'right',
        backdrop: 'dynamic',
        backdropClasses: 'bg-slate-900/30 fixed inset-0 z-40'
    });

    const calculateRemaining = (actual, budget) => {
        const remainingAmount = budget - actual;
        const remainingPercent = budget !== 0 ? (remainingAmount / budget) * 100 : 0;
        return { remainingAmount, remainingPercent };
    };

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);
    const formatPercent = (val) =>
        `${new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0)}%`;

    const updateRemaining = () => {
        const actual = 0;
        const budget = parseFloat(budgetInput?.value) || 0;
        const { remainingAmount, remainingPercent } = calculateRemaining(actual, budget);
        remainingAmountEl.textContent = formatCurrency(remainingAmount);
        remainingPercentEl.textContent = formatPercent(remainingPercent);
        const cls = remainingAmount < 0 ? 'text-2xl font-black text-rose-400 tracking-tight'
                                        : 'text-2xl font-black text-white tracking-tight';
        remainingAmountEl.className = cls;
        remainingPercentEl.className = cls;
    };
    budgetInput?.addEventListener('input', updateRemaining);

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
                    return `<div class="px-4 py-2.5 hover:bg-slate-100 cursor-pointer text-sm text-slate-700 border-b border-slate-100 last:border-b-0 transition-colors flex items-center gap-2" data-gl="${esc(gl)}" data-title="${esc(title)}">
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
        const budgetRaw = budgetInput?.value;
        const parsed = parseFloat(budgetRaw || '0') || 0;

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

        hideDrawer();
        if (budgetDrawerOnConfirm) {
            budgetDrawerOnConfirm({
                glCode,
                accountTitle: accountTitle || glCode,
                budget: parsed,
            });
        }
    });
}

export function showBudgetCreateDrawer({ year, onConfirm }) {
    ensureBudgetDrawer();
    budgetDrawerOnConfirm = onConfirm;

    const label = document.getElementById('budgetCreateDrawerLabel');
    if (label) label.textContent = `Initialize Budget Entry [${year}]`;

    const form = document.getElementById('budgetCreateDrawerForm');
    const err = document.getElementById('budgetDrawerValidationError');
    if (form) form.reset();
    if (err) err.classList.add('hidden');

    hideFloatingUI();
    budgetDrawerInstance?.show();

    const glCodeInput = document.getElementById('budget-glCode');
    if (glCodeInput) {
        glCodeInput.focus();
        glCodeInput.select();
    }
}

export function hideBudgetCreateDrawer() {
    if (budgetDrawerInstance) {
        budgetDrawerInstance.hide();
    }
    budgetDrawerOnConfirm = null;
    showFloatingUI();
}

function ensureMonthlyDrawer() {
    if (document.getElementById('monthlyExpensesDrawer')) return;

    const drawerHTML = `
        <!-- Monthly Expenses Drawer -->
        <div id="monthlyExpensesDrawer"
             class="fixed top-0 right-0 z-50 h-screen w-full max-w-3xl p-4 md:p-6 overflow-y-auto bg-white shadow-[0_20px_60px_rgba(15,23,42,0.45)] border-l border-slate-200/80 transform translate-x-full transition-transform"
             tabindex="-1"
             aria-labelledby="monthlyExpensesDrawerLabel">
            <div class="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">Monthly expenses</p>
                    <h2 id="monthlyExpensesDrawerLabel" class="text-xl font-bold text-slate-900 leading-tight">Add Monthly Expense Entry</h2>
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

            <form id="monthlyExpensesDrawerForm" class="flex flex-col gap-6 pb-28 md:pb-4">
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
                type="number"
                step="0.01"
                min="0"
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
            if (input) total += parseFloat(input.value) || 0;
        });
        totalAmountEl.textContent = formatCurrency(total);
    };

    monthKeys.forEach((key) => {
        const input = document.getElementById(`monthly-${key}`);
        if (input) input.addEventListener('input', updateTotal);
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
            months[key] = parseFloat(input?.value) || 0;
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

function handleAdminDrawerSubmit() {
    const form = document.getElementById('adminCreateUserDrawerForm');
    const errorEl = document.getElementById('adminDrawerValidationError');
    if (!form) return;

    const formData = new FormData(form);
    const userData = {
        username: (formData.get('username') || '').toString().trim(),
        fullName: (formData.get('full-name') || '').toString().trim(),
        email: (formData.get('email') || '').toString().trim(),
        role: document.getElementById('admin-role')?.value || '',
        phone: (formData.get('phone') || '').toString().trim(),
        dob: (formData.get('dob') || '').toString(),
        gender: document.getElementById('admin-gender')?.value || '',
        bio: document.getElementById('admin-bio')?.value || '',
    };

    if (!userData.username || !userData.fullName || !userData.email || !userData.role) {
        if (errorEl) {
            errorEl.textContent = 'Please fill in all required fields.';
            errorEl.classList.remove('hidden');
        }
        adminDrawerValidationError = 'Validation error';
        return;
    }

    if (errorEl) {
        errorEl.classList.add('hidden');
    }

    adminDrawerInstance?.hide();

    if (adminDrawerOnConfirm) {
        adminDrawerOnConfirm(userData);
    }
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

