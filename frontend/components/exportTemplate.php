<?php
/**
 * Global Export Template for City Health Office
 * Designed for high-fidelity printing.
 */
?>
<!-- Tailwind v4.1 Print Utilities -->
<div id="export-template"
    class="hidden print:block print:absolute print:inset-0 print:w-full print:m-0 print:p-0 font-serif text-slate-900 bg-white z-[9999]">
    <!-- Header with Watermark Container -->
    <div class="relative overflow-hidden print:p-8">
        <!-- Center Watermark (Blurry & Faint) -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] select-none">
            <img src="../../images/cityhealth-logo.png" alt="Watermark" class="w-[500px] blur-[3px]">
        </div>

        <!-- Official Header -->
        <div
            class="relative z-10 flex items-center justify-between border-b-3 border-[#224796] pb-6 mb-8 [print-color-adjust:exact]">
            <div class="flex items-center gap-6">
                <div class="flex items-center gap-2">
                    <img src="../../images/auto-rginm-moh.png" alt="MOH Logo" class="w-16 h-16 object-contain">
                </div>
                <div class="border-l-2 border-slate-200 pl-6 h-14 flex flex-col justify-center">
                    <h1 class="text-2xl font-black uppercase text-[#224796] leading-none mb-1">City Health Office</h1>
                    <p class="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Official
                        Transaction Report</p>
                    <p class="text-[9px] text-slate-400 font-medium leading-none">Republic of the Philippines |
                        Autonomous Region in Muslim Mindanao</p>
                </div>
            </div>
            <div class="flex items-center gap-5 text-right">
                <div class="pr-5 border-r border-slate-200 h-10 flex flex-col justify-center">
                    <p class="text-[9px] font-mono text-slate-400 uppercase tracking-tighter leading-none mb-1">Report
                        Reference</p>
                    <p class="text-[10px] font-mono font-bold text-slate-800 leading-none">
                        CHO-ERP-<?php echo date('Ymd'); ?></p>
                </div>
                <img src="../../images/islamic-logo.png" alt="Islamic Logo" class="w-14 h-14 object-contain">
                <img src="../../images/ch-logo.png" alt="CHO Logo"
                    class="w-20 h-20 object-contain drop-shadow-sm rounded-full">
            </div>
        </div>

        <!-- Report Content -->
        <div class="relative z-10 min-h-[600px]">
            <div class="mb-4 flex items-center justify-between">
                <h2 id="print-report-title" class="text-lg font-bold text-slate-800 italic uppercase tracking-wider">
                    Summary Report</h2>
                <div class="text-[10px] font-medium text-slate-500">
                    Generated on: <span id="print-timestamp" class="text-slate-900 font-bold"></span>
                </div>
            </div>

            <!-- The Table -->
            <div class="rounded-lg border border-slate-400 overflow-hidden shadow-sm bg-white">
                <table class="w-full text-xs leading-tight border-collapse [print-color-adjust:exact]">
                    <thead id="printTableHeader" class="bg-slate-50 [print-color-adjust:exact]"></thead>
                    <tbody id="printTableBody"></tbody>
                </table>
            </div>
        </div>

        <!-- Footer -->
        <div class="mt-12 border-t border-slate-300 pt-6 flex justify-between items-end relative z-10">
            <div class="space-y-1">
                <p class="text-[10px] font-bold text-[#224796] uppercase">Certified Correct By:</p>
                <div class="w-48 border-b-2 border-slate-400 h-8"></div>
                <p class="text-[9px] text-slate-500 italic">Authorized Signature over Printed Name</p>
            </div>

            <div class="text-right">
                <p class="text-[10px] font-black text-slate-800 uppercase tracking-tighter mb-1">CITY HEALTH OFFICE
                    MANAGEMENT SYSTEM</p>
                <div class="flex items-center justify-end gap-2 text-[9px] font-bold text-slate-400">
                    <span class="opacity-25">DEVELOPED BY MARK JORDAN UGTONG</span>
                    <span class="text-slate-300 opacity-30">|</span>
                    <span>&copy; <?php echo date('Y'); ?> ALL RIGHTS RESERVED</span>
                </div>
            </div>
        </div>
    </div>
</div>