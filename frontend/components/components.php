<?php
/**
 * Shared application footer.
 * Include this component once inside each page content container.
 */
?>
<footer class="app-footer relative static <?php echo htmlspecialchars($footerSpacingClass ?? 'mt-0', ENT_QUOTES, 'UTF-8'); ?> mb-[-2.5rem] shrink-0 md:mb-[-3rem] lg:mb-[-4rem] border-t border-slate-200 bg-white px-4 py-3 text-left text-xs text-slate-500 sm:px-6 lg:px-8" aria-label="Site footer">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p class="leading-5">
            Copyright &copy; <span data-footer-year><?php echo htmlspecialchars((string) date('Y'), ENT_QUOTES, 'UTF-8'); ?></span>
            City Health Office Marawi System. All rights reserved.
            <span class="text-slate-400/60">Developed by Mark Jordan C. Ugtong.</span>
        </p>
        <nav class="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Footer links">
            <a href="../privacy/" class="transition-colors hover:text-slate-900 hover:underline">Privacy</a>
            <a href="../terms/" class="transition-colors hover:text-slate-900 hover:underline">Terms of Use</a>
            <button type="button" class="cursor-pointer transition-colors hover:text-slate-900 hover:underline" data-cookie-preferences>
                Cookie preferences
            </button>
        </nav>
    </div>
</footer>