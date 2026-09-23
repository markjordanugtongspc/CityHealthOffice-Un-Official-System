<?php
/**
 * START: Page Loader Component
 * 
 * Reusable full-screen page loader overlay with pure white 2-grid backdrop,
 * centered transparent medicine GIF, status title, and 3 bouncing dots.
 * Shown during initial asset/module loading or page transitions, and dissolves
 * smoothly once the page and its scripts are fully ready.
 */
require_once __DIR__ . '/../../config/image_helper.php';
$medicineGifSrc = htmlspecialchars(getImagePath('frontend/images/login/medicine.gif'));
?>
<!-- Prevent FOUC: Hide body until CSS loads -->
<style>
    body:not(.loaded) {
        visibility: hidden;
        opacity: 0;
    }
    body.loaded {
        visibility: visible;
        opacity: 1;
        transition: opacity 0.2s ease-in;
    }
    #page-loader {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: opacity 0.4s ease-out, visibility 0.4s ease-out;
    }
</style>

<!-- START: Page Loader Overlay -->
<div id="page-loader" class="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-auto">
    <!-- Inline check: Only show overlay once right after successful login. If user reloads/refreshes, hide immediately. -->
    <script>
        (function() {
            var shouldShow = sessionStorage.getItem('show_connecting_overlay') === 'true';
            if (!shouldShow) {
                var loader = document.getElementById('page-loader');
                if (loader) {
                    loader.style.display = 'none';
                    loader.remove();
                }
                document.body && document.body.classList.add('loaded');
            }
        })();
    </script>
    <!-- 2-Grid White Background Panels (Seamless, No Extra Grey/Borders) -->
    <div class="absolute inset-0 grid grid-cols-1 md:grid-cols-2 w-full h-full pointer-events-none -z-10">
        <div class="bg-white w-full h-full"></div>
        <div class="bg-white w-full h-full"></div>
    </div>

    <!-- Centered Content: Transparent Medicine GIF Logo & 3 Bigger Bouncing Dots -->
    <div class="relative z-10 m-auto flex flex-col items-center justify-center p-6 text-center select-none">
        <img src="<?php echo $medicineGifSrc; ?>"
            alt="Loading..."
            class="w-40 h-40 sm:w-52 sm:h-52 object-contain mx-auto drop-shadow-sm pointer-events-none animate-pulse duration-1000" />
        <p class="mt-4 text-slate-800 font-semibold text-base sm:text-lg tracking-wide">
            Connecting to CHO Marawi Portal...
        </p>
        <!-- 3 Bigger Bouncing Dots -->
        <div class="flex items-center justify-center gap-2.5 mt-3">
            <span class="w-3.5 h-3.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span class="w-3.5 h-3.5 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span class="w-3.5 h-3.5 bg-cyan-400 rounded-full animate-bounce"></span>
        </div>
    </div>
</div>
<!-- END: Page Loader Component -->
