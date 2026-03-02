<?php
/**
 * Disbursement Voucher Template Component
 * Single-page print-ready layout. Use with backend/js/modules/voucher.js for logic.
 */
if (!function_exists('getImagePath')) {
    require_once __DIR__ . '/../../config/image_helper.php';
}
?>
<div id="voucher-app" class="voucher-wrapper print:p-0">
    <div class="voucher-desk print:p-0 print:bg-white">
        <!-- Screen: toolbar -->
        <div
            class="voucher-toolbar-row flex flex-wrap items-center justify-between gap-3 mb-8 max-w-[8.5in] mx-auto print:hidden">
            <div>
                <h2 class="text-2xl font-black text-[#224796] uppercase tracking-tighter">Voucher Designer</h2>
                <div class="flex items-center gap-2 mt-1">
                    <span class="px-2 py-0.5 bg-[#224796] text-[10px] text-white font-bold rounded uppercase">Legal
                        Size</span>
                    <span class="text-[11px] text-slate-500 font-bold uppercase tracking-widest">8.5" x 14.0" • High
                        Precision</span>
                </div>
            </div>
            <button type="button" id="voucherPrintBtn"
                class="inline-flex items-center gap-2 px-6 py-3 bg-[#224796] text-white rounded-xl text-sm font-bold hover:bg-[#1e3a8a] transition-all hover:scale-105 active:scale-95 shadow-2xl cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z">
                    </path>
                </svg>
                Deploy to Printer
            </button>
        </div>

        <!-- Voucher sheet: single page for print -->
        <div id="voucher-print-area" class="voucher-preview-container rounded-sm [print-color-adjust:exact]">
            <div class="p-6 md:p-10 print:p-0 text-slate-900 font-serif text-sm h-full flex flex-col">

                <!-- Appendix (top right) -->
                <div class="text-right text-xs text-slate-500 mb-1 print:mb-0">Appendix 31</div>

                <!-- Header: logos + center text (enhanced logo sizes) -->
                <div
                    class="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-3 border-b border-slate-300 pb-2 mb-2">
                    <div class="flex items-center gap-2 shrink-0">
                        <?php $imgAutoMoh = __DIR__ . '/../images/auto-rginm-moh.png';
                        if (file_exists($imgAutoMoh)) { ?>
                            <img src="<?php echo htmlspecialchars(getImagePath('frontend/images/auto-rginm-moh.png')); ?>"
                                alt="BARMM MOH" class="w-10 h-10 md:w-12 md:h-12 object-contain">
                        <?php } ?>
                    </div>
                    <div class="flex-1 text-center">
                        <p class="text-xs md:text-sm font-bold text-slate-900">Republic of the Philippines</p>
                        <p class="text-xs md:text-sm font-bold text-slate-900">Bangsamoro Autonomous Region of Muslim
                            Mindanao</p>
                        <p class="text-sm md:text-base font-black text-slate-900 uppercase tracking-wide mt-0.5">City
                            Health
                            Office</p>
                        <p class="text-[10px] md:text-xs text-slate-600">City Hall Compound, Barrio Fort, Marawi City
                        </p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <?php $imgIslamic = __DIR__ . '/../images/islamic-logo.png';
                        if (file_exists($imgIslamic)) { ?>
                            <img src="<?php echo htmlspecialchars(getImagePath('frontend/images/islamic-logo.png')); ?>"
                                alt="Islamic City" class="w-10 h-10 md:w-12 md:h-12 object-contain">
                        <?php } ?>
                        <img src="<?php echo htmlspecialchars(getImagePath('frontend/images/cityhealth-logo.png')); ?>"
                            alt="City Health" class="w-10 h-10 md:w-12 md:h-12 object-contain">
                    </div>
                </div>

                <!-- Two-grid: left = title block (own container), right = Fund / DV No / Date -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:items-start">
                    <!-- Left: Disbursement Voucher title (own container, compact) -->
                    <div class="border border-slate-300 rounded-lg p-2 bg-slate-50/30">
                        <h1 class="text-base md:text-lg font-black uppercase text-slate-900 text-center">
                            Disbursement Voucher
                        </h1>
                        <p class="text-xs md:text-sm font-bold text-slate-700 italic uppercase mt-0.5 text-center">
                            City Health Office
                        </p>
                        <div class="text-center mt-2">
                            <div class="border-t border-slate-300 w-48 mx-auto mb-0.5"></div>
                            <p class="text-xs md:text-sm text-slate-600 italic uppercase">Marawi City</p>
                        </div>
                    </div>

                    <!-- Right: Fund, DV No, Date — labels and values left-aligned (compact) -->
                    <div class="border border-slate-300 rounded-lg p-2 bg-slate-50/50">
                        <div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-2 items-center">

                            <!-- Fund -->
                            <span class="text-xs font-bold text-slate-600">Fund:</span>
                            <div class="relative min-w-0">
                                <input type="text" id="voucherFund" placeholder="MOOE" autocomplete="off"
                                    class="w-full px-2 py-1 border border-slate-300 rounded text-sm font-medium bg-white focus:ring-2 focus:ring-[#224796] focus:border-[#224796] outline-none">
                                <button type="button" id="voucherFundToggle"
                                    class="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-200 cursor-pointer"
                                    aria-label="Select fund">
                                    <!-- Normal icon -->
                                    <svg id="voucherFundIconNormal" class="w-5 h-5 text-slate-600"
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M18.5 12A2.5 2.5 0 0 1 21 9.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v2.5a2.5 2.5 0 0 1 0 5V17a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                                    </svg>
                                    <!-- Hover icon -->
                                    <svg id="voucherFundIconHover" class="w-5 h-5 text-slate-800 hidden"
                                        xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path
                                            d="M4 5a2 2 0 0 0-2 2v2.5a1 1 0 0 0 1 1 1.5 1.5 0 1 1 0 3 1 1 0 0 0-1 1V17a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2.5a1 1 0 0 0-1-1 1.5 1.5 0 1 1 0-3 1 1 0 0 0 1-1V7a2 2 0 0 0-2-2H4Z" />
                                    </svg>
                                </button>
                                <div id="voucherFundSuggestions"
                                    class="absolute left-0 right-0 top-full mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg z-50 hidden">
                                </div>
                            </div>

                            <!-- DV No -->
                            <span class="text-xs font-bold text-slate-600">DV No:</span>
                            <input type="text" id="voucherDvNo" placeholder="MOOE2026-01-0003"
                                class="w-full px-2 py-1 border border-slate-300 rounded text-sm font-mono bg-white focus:ring-2 focus:ring-[#224796] focus:border-[#224796] outline-none">

                            <!-- Date -->
                            <span class="text-xs font-bold text-slate-600">Date:</span>
                            <input type="date" id="voucherDate"
                                class="w-full px-2 py-1 border border-slate-300 rounded text-sm bg-white focus:ring-2 focus:ring-[#224796] focus:border-[#224796] outline-none">
                        </div>
                    </div>
                </div>

                <!-- Mode of Payment (table) - dynamic: show MDS/Commercial/ADA by default, hide Others input; when Others checked, hide others and show Others checkbox + input -->
                <div class="border border-slate-300 rounded mb-3 overflow-hidden">
                    <table class="w-full text-xs border-collapse border border-slate-300">
                        <tbody>
                            <tr>
                                <td class="border border-slate-300 px-2 py-1.5 w-32 font-bold text-slate-600 align-top">
                                    Mode
                                    of Payment:</td>
                                <td class="border border-slate-300 px-2 py-1.5">
                                    <div id="voucherModeContainer" class="flex flex-wrap items-center gap-x-4 gap-y-1">
                                        <label id="voucherModeMds"
                                            class="inline-flex items-center gap-1.5 cursor-pointer"><input
                                                type="checkbox" name="voucherMode" value="mds"
                                                class="rounded border-slate-300"> MDS
                                            Check</label>
                                        <label id="voucherModeCommercial"
                                            class="inline-flex items-center gap-1.5 cursor-pointer"><input
                                                type="checkbox" name="voucherMode" value="commercial"
                                                class="rounded border-slate-300">
                                            Commercial Check</label>
                                        <label id="voucherModeAda"
                                            class="inline-flex items-center gap-1.5 cursor-pointer"><input
                                                type="checkbox" name="voucherMode" value="ada"
                                                class="rounded border-slate-300"> ADA</label>
                                        <label id="voucherModeOthersLabel"
                                            class="inline-flex items-center gap-1.5 cursor-pointer"><input
                                                type="checkbox" name="voucherMode" value="others"
                                                id="voucherModeOthersCheck" class="rounded border-slate-300"> Others
                                            (Please Specify)</label>
                                        <input type="text" id="voucherModeOthers" placeholder=""
                                            class="hidden w-40 min-w-32 px-2 py-0.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-[#224796] outline-none"
                                            aria-label="Specify other mode">
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Payee + Address | ID/TIN/CAFOA merged, Responsibility Center (table, same-size fields) -->
                <div class="border border-slate-300 rounded mb-3 overflow-hidden">
                    <table class="w-full text-xs border-collapse border border-slate-300">
                        <tbody>
                            <tr>
                                <td
                                    class="border border-slate-300 px-2 py-1 w-36 font-bold text-slate-600 align-middle">
                                    Payee:</td>
                                <td class="border border-slate-300 p-0">
                                    <div class="flex items-center gap-1">
                                        <input type="text" id="voucherPayee" placeholder="Mohamad Sameem Hadji Faizal"
                                            class="flex-[3] min-h-[28px] px-2 py-1 border-0 rounded-none text-sm bg-white focus:ring-2 focus:ring-inset focus:ring-[#224796] outline-none box-border"
                                            style="min-height: 28px;">
                                        <input type="text" id="voucherPayeeEtAl" placeholder="(Et'Al)"
                                            class="flex-[1] min-h-[28px] px-2 py-1 border-0 rounded-none text-sm bg-white text-center focus:ring-2 focus:ring-inset focus:ring-[#224796] outline-none box-border max-w-24"
                                            style="min-height: 28px;">
                                    </div>
                                </td>
                                <td class="border border-slate-300 px-2 py-1 font-bold text-slate-600 align-middle"
                                    rowspan="2">ID No./TIN:<br>CAFOA No.:</td>
                                <td class="border border-slate-300 p-0 w-44"><input type="text" id="voucherTin"
                                        class="w-full min-h-[28px] px-2 py-1 border-0 rounded-none text-sm bg-white focus:ring-2 focus:ring-inset focus:ring-[#224796] outline-none box-border"
                                        style="min-height: 28px;"></td>
                            </tr>
                            <tr>
                                <td class="border border-slate-300 px-2 py-1 font-bold text-slate-600 align-middle">
                                </td>
                                <td class="border border-slate-300 p-0"></td>
                                <td class="border border-slate-300 p-0"><input type="text" id="voucherCafoa"
                                        class="w-full min-h-[28px] px-2 py-1 border-0 rounded-none text-sm bg-white focus:ring-2 focus:ring-inset focus:ring-[#224796] outline-none box-border"
                                        style="min-height: 28px;"></td>
                            </tr>
                            <tr>
                                <td class="border border-slate-300 px-2 py-1 font-bold text-slate-600 align-middle">
                                    Address:
                                </td>
                                <td class="border border-slate-300 p-0"><input type="text" id="voucherAddress"
                                        placeholder="CITY HALL COMPOUND, BARRIO FORT, MARAWI CITY"
                                        class="w-full min-h-[28px] px-2 py-1 border-0 rounded-none text-sm bg-white focus:ring-2 focus:ring-inset focus:ring-[#224796] outline-none box-border"
                                        style="min-height: 28px;"></td>
                                <td class="border border-slate-300 px-2 py-1 font-bold text-slate-600 align-middle">
                                    Responsibility Center:</td>
                                <td class="border border-slate-300 p-0"><input type="text" id="voucherRespCenter"
                                        class="w-full min-h-[28px] px-2 py-1 border-0 rounded-none text-sm bg-white focus:ring-2 focus:ring-inset focus:ring-[#224796] outline-none box-border"
                                        style="min-height: 28px;"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Particulars + Amount (table); shows below Mode of Payment when Others is selected -->
                <div class="border border-slate-300 rounded mb-3 overflow-hidden">
                    <table class="w-full text-xs border-collapse border border-slate-300">
                        <tbody>
                            <tr>
                                <td class="border border-slate-300 px-2 py-1 text-center font-bold text-slate-600 bg-slate-50"
                                    colspan="2">Particulars</td>
                            </tr>
                            <tr>
                                <td class="border border-slate-300 p-0 align-top">
                                    <textarea id="voucherParticulars" rows="4"
                                        class="w-full px-2 py-1 border-0 rounded-none text-sm bg-white focus:ring-2 focus:ring-inset focus:ring-[#224796] outline-none resize-none min-h-[80px]"
                                        placeholder="Cash advance payment for the TEV such as perdiem, transportation and miscellaneous expenses incurred to attend the BUDGET CYCLE MANAGEMENT (BCM) CONSULTATION WORKSHOP held on &lt;January 27-31, 2026&gt; at General Santos as per supporting papers hereto attached, or in amount of"></textarea>
                                </td>
                                <td class="border border-slate-300 w-28 px-2 py-1 bg-slate-50/50 align-top">
                                    <div class="flex items-center gap-1 justify-end">
                                        <span class="text-sm font-bold">₱</span>
                                        <input type="text" id="voucherAmountInput" inputmode="decimal"
                                            placeholder="0.00"
                                            class="flex-1 text-right text-sm font-bold border-0 bg-transparent focus:ring-0 focus:outline-none focus:bg-white rounded px-1 min-h-[28px]">
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Amount Due (own container) -->
                <div class="border border-slate-300 rounded mb-3 overflow-hidden">
                    <div class="flex justify-end items-center gap-2 px-3 py-2 bg-slate-50/50">
                        <span class="text-sm font-bold text-slate-700">Amount Due</span>
                        <span class="text-sm font-bold border-l border-slate-400 pl-2">₱</span>
                        <span id="voucherAmountDue"
                            class="text-sm font-bold text-slate-900 min-w-[100px] text-right">0.00</span>
                    </div>
                </div>

                <!-- Section A: Certified (table-style) -->
                <div class="border border-slate-300 rounded mb-3 overflow-hidden">
                    <table class="w-full text-xs border-collapse border border-slate-300">
                        <tbody>
                            <tr>
                                <td class="border border-slate-300 px-2 py-2" colspan="2">
                                    <p class="font-bold text-slate-800">
                                        A. Certified: Expenses/Cash Advance necessary, lawful and incurred under my
                                        direct
                                        supervision
                                    </p>
                                    <p class="text-slate-700 mt-0.5">
                                        Expenses/Cash Advance necessary, lawful and incurred under my direct supervision
                                    </p>

                                    <!-- Empty space for signature line -->
                                    <div class="h-10"></div>

                                    <!-- Direct underline on the name -->
                                    <p class="font-bold text-slate-900 mt-2 text-center underline">
                                        DR. ALI G. DALIDIG
                                    </p>

                                    <!-- Centered position title -->
                                    <p class="font-bold text-slate-600 text-center">
                                        CITY HEALTH OFFICER II
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Section B: Accounting Entry (with container label) -->
                <div class="border border-slate-300 rounded mb-3 overflow-hidden">
                    <p class="text-xs font-bold text-slate-800 px-2 py-1 border-b border-slate-300 bg-slate-50">B.
                        Accounting Entry:</p>
                    <table class="w-full text-xs border-collapse border border-slate-300">
                        <thead>
                            <tr class="bg-slate-100">
                                <th class="border border-slate-300 px-2 py-1 text-center font-bold">Account Title</th>
                                <th class="border border-slate-300 px-2 py-1 text-center font-bold">UACS Code</th>
                                <th class="border border-slate-300 px-2 py-1 text-center font-bold">Debit</th>
                                <th class="border border-slate-300 px-2 py-1 text-center font-bold">Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="border border-slate-300 px-2 py-1 text-center">Travel Expenses-Local</td>
                                <td class="border border-slate-300 px-2 py-1 font-mono text-center">5020101000</td>
                                <td class="border border-slate-300 px-2 py-1 font-mono" id="voucherDebit"><span>₱</span>
                                    <span class="float-right">0.00</span>
                                </td>
                                <td class="border border-slate-300 px-2 py-1 w-24"></td>
                            </tr>
                            <tr>
                                <td class="border border-slate-300 px-2 py-1 text-center">CASH IN BANK</td>
                                <td class="border border-slate-300 px-2 py-1 font-mono text-center">1010102000</td>
                                <td class="border border-slate-300 px-2 py-1 w-24"></td>
                                <td class="border border-slate-300 px-2 py-1 text-right font-mono" id="voucherCredit">₱
                                    0.00
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- C. Certified | D. Approved for Payment (2-grid layout) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <!-- C. Certified (left grid) -->
                    <div class="border border-slate-300 rounded overflow-hidden">
                        <table class="w-full text-xs border-collapse border border-slate-300">
                            <tbody>
                                <tr>
                                    <td class="border border-slate-300 px-2 py-2 align-top">
                                        <p class="font-bold text-slate-800 mb-2">C. Certified</p>
                                        <table class="w-full border-0">
                                            <tbody class="text-slate-700">
                                                <tr>
                                                    <td class="py-0.5"><span class="inline-flex items-center gap-1">[ ]
                                                            Cash
                                                            available</span></td>
                                                </tr>
                                                <tr>
                                                    <td class="py-0.5"><span class="inline-flex items-center gap-1">[ ]
                                                            Subject to Authority to Debit Account (When
                                                            applicable)</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="py-0.5"><span class="inline-flex items-center gap-1">[ ]
                                                            Supporting documents complete and amount claimed</span></td>
                                                </tr>
                                                <tr>
                                                    <td class="py-0.5"><span class="inline-flex items-center gap-1">[
                                                            ]</span></td>
                                                </tr>
                                                <tr>
                                                    <td class="pt-1">
                                                        <div class="flex items-center gap-2">
                                                            <span
                                                                class="font-bold text-slate-800 whitespace-nowrap">Signature</span>
                                                            <div
                                                                class="border-b border-slate-400 h-5 w-full min-w-[120px]">
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="py-0.5">
                                                        <span class="font-bold text-slate-800">Printed Name:</span>
                                                        <span class="font-bold text-slate-900 float-right">JUNAID B.
                                                            IBRAHIM</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="py-0.5">
                                                        <span class="font-bold text-slate-800">Position:</span>
                                                        <span class="font-bold text-slate-600 float-right">CITY
                                                            ACCOUNTANT</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="py-0.5"><span
                                                            class="font-bold text-slate-800">Date:</span>
                                                        <input type="date" id="voucherCertifiedDate"
                                                            class="ml-1 px-2 py-0.5 border border-slate-300 rounded text-xs bg-white focus:ring-2 focus:ring-[#224796] outline-none">
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- D. Approved for Payment (right grid) -->
                    <div class="border border-slate-300 rounded overflow-hidden">
                        <table class="w-full text-xs border-collapse border border-slate-300">
                            <tbody>
                                <tr>
                                    <td class="border border-slate-300 px-2 py-2 align-top">
                                        <p class="font-bold text-slate-800 mb-2">D. Approved for Payment</p>
                                        <div class="h-16 md:h-20"></div>
                                        <table class="w-full border-0">
                                            <tbody>
                                                <tr>
                                                    <td class="pt-1">
                                                        <div class="flex items-center gap-2">
                                                            <span
                                                                class="font-bold text-slate-800 whitespace-nowrap">Signature</span>
                                                            <div
                                                                class="border-b border-slate-400 h-5 w-full min-w-[120px]">
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="py-0.5">
                                                        <span class="font-bold text-slate-800">Printed Name:</span>
                                                        <span class="font-bold text-slate-900 float-right">Hon. Shariff
                                                            Zain
                                                            Lanto Gandamra</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="py-0.5">
                                                        <span class="font-bold text-slate-800">Position:</span>
                                                        <span class="font-bold text-slate-600 float-right">CITY
                                                            MAYOR</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="py-0.5">
                                                        <span class="font-bold text-slate-800">Date:</span>
                                                        <input type="date" id="voucherApprovedDate"
                                                            class="ml-1 px-2 py-0.5 border border-slate-300 rounded text-xs bg-white focus:ring-2 focus:ring-[#224796] outline-none">
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- D. Receipt of Payment (table: Check/ADA, Date, Bank, Signature, Printed Name) -->
                <div class="border border-slate-300 rounded mb-3 overflow-hidden">
                    <p class="text-xs font-bold text-slate-800 px-2 py-1 border-b border-slate-300 bg-slate-50">D.
                        Receipt
                        of Payment</p>
                    <table class="w-full text-xs border-collapse border border-slate-300">
                        <tbody>
                            <tr>
                                <td
                                    class="border border-slate-300 px-2 py-1 w-32 font-bold text-slate-600 align-middle">
                                    Check/ADA No.</td>
                                <td class="border border-slate-300 p-0 w-28 relative">
                                    <input type="text" id="voucherCheckNo" placeholder="2317608"
                                        class="voucher-field w-full min-h-[28px] px-2 py-1 border-0 rounded-none text-sm bg-white focus:ring-2 focus:ring-inset focus:ring-[#224796] outline-none"
                                        style="min-height: 28px;">
                                    <p id="voucher-check-no-error"
                                        class="hidden absolute top-full left-0 z-10 w-48 text-[10px] bg-rose-50 text-rose-500 border border-rose-200 mt-1 p-1 rounded font-bold shadow-lg">
                                        There is an already duplicated data.</p>
                                </td>
                                <td
                                    class="border border-slate-300 px-2 py-1 w-16 font-bold text-slate-600 align-middle">
                                    Date:</td>
                                <td class="border border-slate-300 p-0 w-28"><input type="date" id="voucherReceiptDate"
                                        class="voucher-field w-full min-h-[28px] px-2 py-1 border-0 rounded-none text-sm bg-white focus:ring-2 focus:ring-inset focus:ring-[#224796] outline-none"
                                        style="min-height: 28px;"></td>
                                <td class="border border-slate-300 px-2 py-1 font-bold text-slate-600 align-middle">Bank
                                    Name & Account No.</td>
                                <td class="border border-slate-300 p-0"><input type="text" id="voucherBankAccount"
                                        placeholder="CITY HEALTH OFFICE MARAWI-BARMM-1262-1333-85"
                                        class="voucher-field w-full min-h-[28px] px-2 py-1 border-0 rounded-none text-sm bg-white focus:ring-2 focus:ring-inset focus:ring-[#224796] outline-none"
                                        style="min-height: 28px;"></td>
                            </tr>
                            <tr>
                                <td class="border border-slate-300 px-2 py-1 font-bold text-slate-600 align-middle">
                                    Signature</td>
                                <td class="border border-slate-300 px-2 py-1">
                                    <div class="border-b border-slate-400 h-5 w-full min-w-[100px]"></div>
                                </td>
                                <td class="border border-slate-300 px-2 py-1 font-bold text-slate-600 align-middle">
                                    Date:
                                </td>
                                <td class="border border-slate-300 p-0 w-28"><input type="date"
                                        id="voucherReceiptSignatureDate"
                                        class="voucher-field w-full min-h-[28px] px-2 py-1 border-0 rounded-none text-sm bg-white focus:ring-2 focus:ring-inset focus:ring-[#224796] outline-none"
                                        style="min-height: 28px;"></td>
                                <td class="border border-slate-300 px-2 py-1 font-bold text-slate-600 align-middle">
                                    Printed
                                    Name</td>
                                <td class="border border-slate-300 p-0"><input type="text"
                                        id="voucherReceiptPrintedName"
                                        class="voucher-field w-full min-h-[28px] px-2 py-1 border-0 rounded-none text-sm bg-white focus:ring-2 focus:ring-inset focus:ring-[#224796] outline-none"
                                        style="min-height: 28px;"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Official Receipt No. & Date/Other Documents (table row, same-size field) -->
                <div class="border border-slate-300 rounded mb-3 overflow-hidden">
                    <table class="w-full text-xs border-collapse border border-slate-300">
                        <tbody>
                            <tr>
                                <td
                                    class="border border-slate-300 px-2 py-1 font-bold text-slate-600 align-middle whitespace-nowrap w-64">
                                    Official Receipt No. & Date/Other Documents:</td>
                                <td class="border border-slate-300 p-0"><input type="text" id="voucherOfficialReceipt"
                                        class="voucher-field w-full min-h-[28px] px-2 py-1 border-0 rounded-none text-sm bg-white focus:ring-2 focus:ring-inset focus:ring-[#224796] outline-none"
                                        style="min-height: 28px;" placeholder=""></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>