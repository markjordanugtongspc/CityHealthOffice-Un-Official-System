<?php
require_once __DIR__ . '/config/vite_helper.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/image_helper.php';
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - City Health Office</title>

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
    </style>

    <!-- Vite Assets -->
    <?php vite('backend/js/main.js'); ?>
</head>

<body class="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden">
    <!-- Left Panel - Brand Area with Flowbite Carousel (Expanded) -->
    <div
        id="landing-carousel-container"
        class="relative hidden md:flex md:w-7/12 lg:w-3/5 h-screen overflow-hidden flex-col justify-between bg-[#224796] shadow-xl z-20">
        <!-- Flowbite Carousel Background Slider -->
        <div id="landing-carousel" class="absolute inset-0 w-full h-full z-0" data-carousel="slide">
            <!-- Carousel wrapper -->
            <div class="relative h-full w-full overflow-hidden">
                <?php
                // START: Scan and loop through landing webp images
                $landingDir = __DIR__ . '/frontend/images/landing';
                $landingImages = glob($landingDir . '/*.webp');
                if (!empty($landingImages)) {
                    // Natural sorting to keep cho, cho1, cho2, ... in clean order
                    natsort($landingImages);
                    foreach ($landingImages as $index => $imagePath) {
                        $filename = basename($imagePath);
                        $relativeImagePath = 'frontend/images/landing/' . $filename;
                        $webPath = htmlspecialchars(getImagePath($relativeImagePath));
                        ?>
                        <div class="hidden duration-1000 ease-in-out transition-transform" data-carousel-item>
                            <img src="<?php echo $webPath; ?>" class="absolute block w-full h-full object-cover object-center"
                                alt="City Health Office Facility <?php echo $index + 1; ?>" />
                        </div>
                        <?php
                    }
                }
                // END: Scan and loop through landing webp images
                ?>
            </div>
        </div>

        <!-- Subtle Brand Tint Overlay: Increased opacity for richer brand presence and clear contrast -->
        <div class="absolute inset-0 bg-[#224796]/45 backdrop-blur-[0.5px] shadow-[inset_0_0_80px_rgba(0,0,0,0.4)] pointer-events-none z-10"></div>

        <!-- Brand Header: Upper-Left Placed -->
        <div class="relative z-20 p-6 sm:p-8 lg:p-10 text-white max-w-2xl space-y-3">
            <div class="flex items-center gap-3">
                <!-- Smaller Circular logo frame -->
                <div
                    class="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full overflow-hidden ring-2 ring-white/50 shadow-lg flex items-center justify-center bg-transparent transition transform hover:scale-105 duration-300">
                    <img src="<?php echo htmlspecialchars(getImagePath('frontend/images/ch-logo.png')); ?>"
                        alt="City Health Office Logo"
                        class="w-full h-full object-cover scale-105 rounded-full drop-shadow-sm" />
                </div>
                <div class="space-y-0.5">
                    <!-- Bolder All-Caps CITY HEALTH OFFICE without wrapper div container -->
                    <p class="text-xs sm:text-sm font-black tracking-widest uppercase text-white drop-shadow-sm">
                        CITY HEALTH OFFICE
                    </p>
                    <p class="text-[11px] sm:text-xs text-white/80 font-normal tracking-wide drop-shadow-sm">
                        Ministry of Health - BARMM • Islamic City of Marawi
                    </p>
                </div>
            </div>
        </div>

        <!-- Middle Centered Content Area: CHO Marawi Portal Hero Title, Subtitle, and Official Badge (Shifted higher up) -->
        <div class="relative z-20 p-8 text-center text-white max-w-3xl mx-auto space-y-3 sm:space-y-4 mt-8 sm:mt-12 md:mt-16 lg:mt-20 mb-auto">
            <h1 class="hero-title text-4xl sm:text-6xl lg:text-7xl font-black text-white drop-shadow-xl tracking-tight leading-tight">
                CHO Marawi Portal
            </h1>
            <p class="text-xs sm:text-sm text-white/85 font-normal leading-relaxed max-w-lg mx-auto drop-shadow-md">
                Official integrated healthcare administration, budget allocation, and fund monitoring system.
            </p>
            <div class="flex items-center justify-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest text-white/80 pt-1">
                <span class="inline-block w-8 h-px bg-white/50"></span>
                <span>Official Healthcare Management System</span>
                <span class="inline-block w-8 h-px bg-white/50"></span>
            </div>
        </div>

        <!-- Bottom Accent Spacer -->
        <div class="relative z-20 p-4"></div>
    </div>

    <!-- Right Panel - Login Form (Content directly on panel with rounded top and bottom edges) -->
    <div
        class="flex w-full md:w-5/12 lg:w-2/5 min-h-screen items-center justify-center bg-slate-50 md:rounded-l-2xl lg:rounded-l-3xl px-6 py-8 sm:px-10 md:px-10 lg:px-14 z-10 overflow-y-auto">
        <div class="w-full max-w-sm sm:max-w-md space-y-6">
            <!-- Mobile Logo (shows only on mobile) -->
            <div class="md:hidden flex justify-start mb-2">
                <div
                    class="w-14 h-14 rounded-full overflow-hidden ring-2 ring-slate-200 shadow-md flex items-center justify-center bg-transparent">
                    <img src="<?php echo htmlspecialchars(getImagePath('frontend/images/ch-logo.png')); ?>"
                        alt="City Health Office Logo" class="w-full h-full object-cover scale-105 rounded-full" />
                </div>
            </div>

            <!-- Left-aligned Header -->
            <div class="text-start">
                <h2 class="section-title text-slate-900 tracking-tight">Welcome Back</h2>
                <p class="mt-1.5 text-sm sm:text-base text-slate-600">Sign in to your account</p>
            </div>

            <form id="loginForm" class="space-y-4">
                <!-- Username Field -->
                <div>
                    <label for="username" class="block text-sm font-medium text-slate-700 mb-2">
                        Username
                    </label>
                    <div id="username-field-wrapper" class="flex shadow-sm rounded-lg transition-colors">
                        <span id="username-icon-wrapper"
                            class="inline-flex items-center px-3 text-sm text-slate-500 bg-slate-100 border border-slate-300 rounded-l-lg border-r-0 transition-colors">
                            <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24"
                                height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                        </span>
                        <input type="text" id="username" name="username" required autocomplete="username"
                            class="rounded-none rounded-r-lg block w-full px-3 py-2.5 bg-white border border-slate-300 border-l-0 text-slate-900 text-sm focus:ring-2 focus:ring-[#224796] focus:border-[#224796] placeholder:text-slate-400 transition"
                            placeholder="Enter your username" />
                    </div>
                    <!-- Username Inline Error -->
                    <p id="username-error" class="hidden text-xs font-semibold text-rose-600 mt-1.5 flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        <span id="username-error-text"></span>
                    </p>
                </div>

                <!-- Password Field -->
                <div>
                    <label for="password" class="block text-sm font-medium text-slate-700 mb-2">
                        Password
                    </label>
                    <div id="password-field-wrapper" class="flex shadow-sm rounded-lg transition-colors">
                        <span id="password-icon-wrapper"
                            class="inline-flex items-center px-3 text-sm text-slate-500 bg-slate-100 border border-slate-300 rounded-l-lg border-r-0 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>

                        </span>
                        <div class="relative flex-1">
                            <input type="password" id="password" name="password" required
                                autocomplete="current-password"
                                class="rounded-none rounded-r-lg block w-full px-3 pr-10 py-2.5 bg-white border border-slate-300 border-l-0 text-slate-900 text-sm focus:ring-2 focus:ring-[#224796] focus:border-[#224796] placeholder:text-slate-400 transition"
                                placeholder="Enter your password" />
                            <button type="button" id="passwordToggle"
                                class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                                aria-label="Show password">
                                <!-- Eye (show) -->
                                <svg id="passwordEye" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    <circle cx="12" cy="12" r="3" stroke-width="2" stroke="currentColor" />
                                </svg>
                                <!-- Eye off (hide) -->
                                <svg id="passwordEyeOff" class="w-5 h-5 hidden" xmlns="http://www.w3.org/2000/svg"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 3l18 18M10.477 10.48A3 3 0 0113.5 13.5m-2.757-5.008A3.001 3.001 0 0115 12m-3 7c-4.477 0-8.268-2.943-9.542-7a11.955 11.955 0 013.746-5.362M9.88 9.88A3 3 0 0114.12 14.12M17.618 6.382A11.955 11.955 0 0121.542 12c-.694 2.211-2.14 4.093-4.024 5.362" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <!-- Password Inline Error -->
                    <p id="password-error" class="hidden text-xs font-semibold text-rose-600 mt-1.5 flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        <span id="password-error-text"></span>
                    </p>
                </div>

                <!-- Remember Me & Forgot Password -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input type="checkbox" id="rememberMe" name="rememberMe"
                            class="w-4 h-4 text-[#224796] border-slate-300 rounded focus:ring-[#224796] cursor-pointer" />
                        <label for="rememberMe" class="ml-2 text-sm text-slate-600 cursor-pointer">
                            Remember me
                        </label>
                    </div>
                    <a href="#"
                        class="text-sm text-[#224796] hover:text-[#163473] font-medium transition cursor-pointer animated-underline">
                        Forgot password?
                    </a>
                </div>

                <!-- Login Button Container (supports button with centered animated gif) -->
                <div id="login-button-container">
                    <button type="submit" id="loginSubmitBtn"
                        class="w-full bg-[#224796] text-white font-medium h-[46px] max-h-[46px] rounded-lg hover:bg-[#163473] transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#224796] focus:ring-offset-2 shadow-md flex items-center justify-center overflow-hidden">
                        <span>Sign In</span>
                    </button>
                </div>
            </form>

            <!-- Legal & Privacy Links with Sky Blue Color and Left-to-Right Animated Underline -->
            <div class="pt-2 flex items-center justify-center gap-4 text-xs font-semibold">
                <a href="#" class="cursor-pointer text-sky-500 hover:text-sky-600 transition-colors animated-underline">
                    Data Privacy Act
                </a>
                <span class="text-slate-300">•</span>
                <a href="#" class="cursor-pointer text-sky-500 hover:text-sky-600 transition-colors animated-underline">
                    Terms &amp; Conditions
                </a>
            </div>

            <div class="text-center text-xs text-slate-400 mt-2">
                <p>&copy; 2026 City Health Office. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>

</html>