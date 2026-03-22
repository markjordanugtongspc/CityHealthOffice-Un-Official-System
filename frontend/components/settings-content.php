<div class="w-full min-w-0">
    <!-- Pill tabs: same interaction model as dashboard chart pages; no outer card — transparent track, scroll on small screens -->
    <div class="mb-6 md:mb-8 flex items-center gap-2 overflow-x-auto overflow-y-hidden pb-1 md:pb-0 md:flex-wrap w-full min-w-0 -mx-0.5 px-0.5 [scrollbar-width:thin]"
        role="tablist" aria-label="Settings sections">
        <button type="button" role="tab" data-settings-tab="account" aria-selected="true"
            class="settings-tab-btn px-5 py-2 md:px-6 md:py-2 text-[10px] md:text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-500 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 bg-linear-to-br from-[#224796] to-[#1e3a8a] text-white shadow-[0_4px_15px_rgba(34,71,150,0.3)] hover:shadow-[0_8px_25px_rgba(34,71,150,0.4)]">
            Account
        </button>
        <button type="button" role="tab" data-settings-tab="preferences" aria-selected="false"
            class="settings-tab-btn px-5 py-2 md:px-6 md:py-2 text-[10px] md:text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-500 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 text-slate-500 hover:text-slate-900 hover:bg-white/70">
            Preferences
        </button>
        <button type="button" role="tab" data-settings-tab="data" aria-selected="false"
            class="settings-tab-btn px-5 py-2 md:px-6 md:py-2 text-[10px] md:text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-500 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 text-slate-500 hover:text-slate-900 hover:bg-white/70">
            Data &amp; storage
        </button>
    </div>

    <div class="w-full min-w-0 space-y-6 lg:space-y-8">
        <!-- Panel: Account -->
        <div id="settingsPanelAccount" data-settings-panel="account" class="space-y-6 lg:space-y-8">
            <section
                class="rounded-2xl border border-slate-200/80 bg-white p-5 md:p-7 lg:p-8 shadow-sm bg-linear-to-br from-white via-slate-50/40 to-blue-50/30">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-5 lg:mb-6">
                    <div>
                        <h2 class="text-lg lg:text-xl font-bold text-slate-900 tracking-tight">Profile</h2>
                        <p class="text-sm text-slate-600 mt-1">Update your details in the database. Username and role are read-only.</p>
                    </div>
                </div>

                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div class="sm:col-span-2 lg:col-span-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label class="block text-xs font-semibold uppercase tracking-wider text-[#224796]/80 mb-1.5">Username</label>
                            <input type="text" id="settingsProfileUsername" readonly
                                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 cursor-not-allowed">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase tracking-wider text-[#224796]/80 mb-1.5">Role</label>
                            <input type="text" id="settingsProfileRole" readonly
                                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 cursor-not-allowed">
                        </div>
                    </div>
                    <div class="sm:col-span-2 lg:col-span-2">
                        <label for="settingsProfileFullName" class="block text-xs font-semibold uppercase tracking-wider text-[#224796]/80 mb-1.5">Full name</label>
                        <input type="text" id="settingsProfileFullName" name="full_name" autocomplete="name"
                            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#224796] focus:ring-2 focus:ring-[#224796]/20 outline-none">
                    </div>
                    <div class="sm:col-span-2 lg:col-span-2">
                        <label for="settingsProfileEmail" class="block text-xs font-semibold uppercase tracking-wider text-[#224796]/80 mb-1.5">Email</label>
                        <input type="email" id="settingsProfileEmail" name="email" autocomplete="email"
                            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#224796] focus:ring-2 focus:ring-[#224796]/20 outline-none">
                    </div>
                    <div>
                        <label for="settingsProfilePhone" class="block text-xs font-semibold uppercase tracking-wider text-[#224796]/80 mb-1.5">Phone</label>
                        <input type="tel" id="settingsProfilePhone" name="phone_number" autocomplete="tel"
                            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#224796] focus:ring-2 focus:ring-[#224796]/20 outline-none"
                            placeholder="09xx xxx xxxx">
                    </div>
                    <div>
                        <label for="settingsProfileDob" class="block text-xs font-semibold uppercase tracking-wider text-[#224796]/80 mb-1.5">Date of birth</label>
                        <input type="date" id="settingsProfileDob" name="date_of_birth"
                            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#224796] focus:ring-2 focus:ring-[#224796]/20 outline-none cursor-pointer">
                    </div>
                    <div class="sm:col-span-2 lg:col-span-1">
                        <label for="settingsProfileGender" class="block text-xs font-semibold uppercase tracking-wider text-[#224796]/80 mb-1.5">Gender</label>
                        <select id="settingsProfileGender" name="gender"
                            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#224796] focus:ring-2 focus:ring-[#224796]/20 outline-none cursor-pointer">
                            <option value="">—</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>
                    <div class="sm:col-span-2 lg:col-span-3">
                        <label for="settingsProfileBio" class="block text-xs font-semibold uppercase tracking-wider text-[#224796]/80 mb-1.5">Bio</label>
                        <textarea id="settingsProfileBio" name="bio_graphy" rows="4"
                            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#224796] focus:ring-2 focus:ring-[#224796]/20 outline-none resize-y min-h-[5rem]"></textarea>
                    </div>
                    <div class="sm:col-span-2 lg:col-span-3">
                        <label for="settingsProfileLanguages" class="block text-xs font-semibold uppercase tracking-wider text-[#224796]/80 mb-1.5">Languages you speak</label>
                        <input type="text" id="settingsProfileLanguages" name="languages_spoken" autocomplete="off"
                            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#224796] focus:ring-2 focus:ring-[#224796]/20 outline-none"
                            placeholder="e.g. English, Filipino, Cebuano">
                        <p class="text-xs text-slate-500 mt-1.5">Optional personal note — list languages you use, separated by commas. Saved with your profile.</p>
                    </div>
                </div>

                <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <p id="settingsProfileSaveHint" class="text-xs text-slate-500 sm:mr-auto"></p>
                    <button type="button" id="settingsProfileSaveBtn"
                        class="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-[#224796] to-[#163473] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#224796]/25 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        Save profile
                    </button>
                </div>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 lg:p-8 shadow-sm">
                <h2 class="text-lg lg:text-xl font-bold text-slate-900 tracking-tight mb-1">Password</h2>
                <p class="text-sm text-slate-600 mb-5">Verify your current password first, then set a new one.</p>

                <div class="grid gap-8 lg:grid-cols-2 lg:gap-10 lg:items-start">
                <div class="space-y-4 min-w-0">
                    <div>
                        <label for="settingsCurrentPasswordVerify" class="block text-xs font-semibold text-slate-600 mb-1.5">Current password</label>
                        <input type="password" id="settingsCurrentPasswordVerify" autocomplete="current-password"
                            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#224796] focus:ring-2 focus:ring-[#224796]/20 outline-none">
                    </div>
                    <button type="button" id="settingsVerifyPasswordBtn"
                        class="inline-flex items-center justify-center rounded-xl border border-[#224796]/30 bg-[#224796]/5 px-5 py-2.5 text-sm font-bold text-[#224796] hover:bg-[#224796]/10 transition-colors cursor-pointer">
                        Verify current password
                    </button>
                    <p id="settingsPasswordVerifyMsg" class="text-sm min-h-[1.25rem]" role="status"></p>
                </div>

                <div id="settingsPasswordChangeStep2"
                    class="hidden space-y-4 min-w-0 mt-8 pt-8 border-t border-slate-200 lg:mt-0 lg:pt-0 lg:border-t-0 lg:border-l lg:border-slate-200 lg:pl-10">
                    <div>
                        <label for="settingsNewPassword" class="block text-xs font-semibold text-slate-600 mb-1.5">New password</label>
                        <input type="password" id="settingsNewPassword" autocomplete="new-password"
                            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#224796] focus:ring-2 focus:ring-[#224796]/20 outline-none">
                    </div>
                    <div>
                        <label for="settingsNewPasswordConfirm" class="block text-xs font-semibold text-slate-600 mb-1.5">Confirm new password</label>
                        <input type="password" id="settingsNewPasswordConfirm" autocomplete="new-password"
                            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#224796] focus:ring-2 focus:ring-[#224796]/20 outline-none">
                    </div>
                    <p id="settingsPasswordMatchHint" class="text-xs text-slate-500"></p>
                    <button type="button" id="settingsSubmitPasswordChange" disabled
                        class="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-md hover:opacity-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                        Update password
                    </button>
                </div>
                </div>
            </section>
        </div>

        <!-- Panel: Preferences -->
        <div id="settingsPanelPreferences" data-settings-panel="preferences" class="hidden space-y-6 lg:space-y-8">
            <section class="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 lg:p-8 shadow-sm">
                <h2 class="text-lg lg:text-xl font-bold text-slate-900 tracking-tight mb-1">Preferences</h2>
                <p class="text-sm text-slate-600 mb-6">These options are saved in this browser only.</p>
                <ul class="space-y-4">
                    <li class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-4">
                        <div>
                            <p class="text-sm font-semibold text-slate-900">Reduce motion</p>
                            <p class="text-xs text-slate-500">Tones down transitions where the app respects this flag.</p>
                        </div>
                        <label class="inline-flex items-center gap-2 cursor-pointer shrink-0">
                            <input type="checkbox" id="settingsPrefReduceMotion" class="w-4 h-4 rounded border-slate-300 text-[#224796] focus:ring-[#224796] cursor-pointer">
                            <span class="text-sm text-slate-700">Enabled</span>
                        </label>
                    </li>
                    <li class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-4">
                        <div>
                            <p class="text-sm font-semibold text-slate-900">Confirm before clearing storage</p>
                            <p class="text-xs text-slate-500">Extra confirmation on the Data &amp; storage page (coming from button actions).</p>
                        </div>
                        <label class="inline-flex items-center gap-2 cursor-pointer shrink-0">
                            <input type="checkbox" id="settingsPrefConfirmClear" class="w-4 h-4 rounded border-slate-300 text-[#224796] focus:ring-[#224796] cursor-pointer">
                            <span class="text-sm text-slate-700">Enabled</span>
                        </label>
                    </li>
                    <li class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-4">
                        <div>
                            <p class="text-sm font-semibold text-slate-900">Open Export after login</p>
                            <p class="text-xs text-slate-500">Reminder only — use the shortcut below when you need Export.</p>
                        </div>
                        <label class="inline-flex items-center gap-2 cursor-pointer shrink-0">
                            <input type="checkbox" id="settingsPrefExportShortcutHint" class="w-4 h-4 rounded border-slate-300 text-[#224796] focus:ring-[#224796] cursor-pointer">
                            <span class="text-sm text-slate-700">Show hint</span>
                        </label>
                    </li>
                </ul>
            </section>
        </div>

        <!-- Panel: Data -->
        <div id="settingsPanelData" data-settings-panel="data" class="hidden space-y-6 lg:space-y-8">
            <section class="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 lg:p-8 shadow-sm">
                <h2 class="text-lg lg:text-xl font-bold text-slate-900 tracking-tight mb-1">Shortcuts</h2>
                <p class="text-sm text-slate-600 mb-4">Jump to areas where more options live.</p>
                <div class="flex flex-wrap gap-3">
                    <a href="../export/"
                        class="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-[#224796] to-[#163473] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#224796]/25 hover:opacity-95 transition-opacity cursor-pointer">
                        Export &amp; saved filters
                    </a>
                    <a href="../dashboard/"
                        class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer">
                        Dashboard
                    </a>
                </div>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 lg:p-8 shadow-sm">
                <h2 class="text-lg lg:text-xl font-bold text-slate-900 tracking-tight mb-1">Local data on this device</h2>
                <p class="text-sm text-slate-600 mb-4">Clears browser storage only; it does not delete server records.</p>
                <ul class="space-y-3">
                    <li class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                        <div>
                            <p class="text-sm font-semibold text-slate-900">Dashboard cache</p>
                            <p class="text-xs text-slate-500">Cached stat card values for faster load.</p>
                        </div>
                        <button type="button" id="settingsClearDashboardCache"
                            class="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer">
                            Clear
                        </button>
                    </li>
                    <li class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                        <div>
                            <p class="text-sm font-semibold text-slate-900">Export saved filters</p>
                            <p class="text-xs text-slate-500">Remembered source, columns, and sort on the Export page.</p>
                        </div>
                        <button type="button" id="settingsClearExportConfig"
                            class="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer">
                            Clear
                        </button>
                    </li>
                    <li class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                        <div>
                            <p class="text-sm font-semibold text-slate-900">Offline profile snapshot</p>
                            <p class="text-xs text-slate-500">Cached user info used before the network responds.</p>
                        </div>
                        <button type="button" id="settingsClearUserSnapshot"
                            class="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer">
                            Clear
                        </button>
                    </li>
                    <li class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                        <div>
                            <p class="text-sm font-semibold text-slate-900">AI chat history</p>
                            <p class="text-xs text-slate-500">Messages stored in this browser for the assistant.</p>
                        </div>
                        <button type="button" id="settingsClearAiChat"
                            class="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer">
                            Clear
                        </button>
                    </li>
                    <li class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                        <div>
                            <p class="text-sm font-semibold text-slate-900">Voucher DV sequence counters</p>
                            <p class="text-xs text-slate-500">Local next-sequence numbers per fund/month.</p>
                        </div>
                        <button type="button" id="settingsClearVoucherSeq"
                            class="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer">
                            Clear
                        </button>
                    </li>
                    <li class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-amber-200/80 bg-amber-50/50 px-4 py-3">
                        <div>
                            <p class="text-sm font-semibold text-slate-900">Sidebar &amp; menu state</p>
                            <p class="text-xs text-slate-500">Collapse and open dropdown preferences (reload recommended).</p>
                        </div>
                        <button type="button" id="settingsResetNavState"
                            class="shrink-0 rounded-xl border border-amber-300 bg-amber-100/80 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-200/80 transition-colors cursor-pointer">
                            Reset
                        </button>
                    </li>
                </ul>
            </section>
        </div>
    </div>
</div>
