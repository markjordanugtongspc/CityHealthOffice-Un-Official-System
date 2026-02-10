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
    <!-- Left Panel - Brand Area -->
    <div class="hidden md:flex md:w-1/2 bg-[#224796] text-white items-center justify-center p-8">
        <div class="text-center space-y-6">
            <div class="mb-8">
                <!-- Actual round logo -->
                <div class="w-48 h-48 mx-auto rounded-full overflow-hidden bg-transparent flex items-center justify-center mb-6">
                    <img
                        src="<?php echo htmlspecialchars(getImagePath('frontend/images/ch-logo.png')); ?>"
                        alt="City Health Office Logo"
                        class="w-full h-full object-contain"
                    />
                </div>
            </div>
            <h1 class="text-4xl font-bold mb-2">City Health Office</h1>
            <p class="text-xl text-white/90">Ministry of Health - BARMM</p>
        </div>
    </div>

    <!-- Right Panel - Login Form -->
    <div class="flex w-full md:w-1/2 items-center justify-center bg-slate-50 px-4 py-6 sm:px-6 md:p-10">
        <div class="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-slate-200 px-5 py-6 sm:p-8 space-y-5">
            <!-- Mobile Logo (shows only on mobile) -->
                <div class="md:hidden flex justify-center">
                <div class="w-20 h-20 rounded-full overflow-hidden bg-transparent ring-1 ring-slate-200 shadow-sm">
                    <img
                        src="<?php echo htmlspecialchars(getImagePath('frontend/images/ch-logo.png')); ?>"
                        alt="City Health Office Logo"
                        class="w-full h-full object-contain"
                    />
                </div>
            </div>

            <div class="text-center">
                <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                <p class="mt-1.5 text-sm sm:text-base text-slate-600">Sign in to your account</p>
            </div>

            <form id="loginForm" class="space-y-4">
                <!-- Username Field -->
                <div>
                    <label for="username" class="block text-sm font-medium text-slate-700 mb-2">
                        Username
                    </label>
                    <div class="flex shadow-sm rounded-lg">
                        <span class="inline-flex items-center px-3 text-sm text-slate-500 bg-slate-100 border border-slate-300 rounded-l-lg border-r-0">
                            <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                            </svg>
                        </span>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            required
                            autocomplete="username"
                            class="rounded-none rounded-r-lg block w-full px-3 py-2.5 bg-white border border-slate-300 border-l-0 text-slate-900 text-sm focus:ring-2 focus:ring-[#224796] focus:border-[#224796] placeholder:text-slate-400 transition"
                            placeholder="Enter your username"
                        />
                    </div>
                </div>

                <!-- Password Field -->
                <div>
                    <label for="password" class="block text-sm font-medium text-slate-700 mb-2">
                        Password
                    </label>
                    <div class="flex shadow-sm rounded-lg">
                        <span class="inline-flex items-center px-3 text-sm text-slate-500 bg-slate-100 border border-slate-300 rounded-l-lg border-r-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>

                        </span>
                        <div class="relative flex-1">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                autocomplete="current-password"
                                class="rounded-none rounded-r-lg block w-full px-3 pr-10 py-2.5 bg-white border border-slate-300 border-l-0 text-slate-900 text-sm focus:ring-2 focus:ring-[#224796] focus:border-[#224796] placeholder:text-slate-400 transition"
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                id="passwordToggle"
                                class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                                aria-label="Show password"
                            >
                                <!-- Eye (show) -->
                                <svg id="passwordEye" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    <circle cx="12" cy="12" r="3" stroke-width="2" stroke="currentColor" />
                                </svg>
                                <!-- Eye off (hide) -->
                                <svg id="passwordEyeOff" class="w-5 h-5 hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18M10.477 10.48A3 3 0 0113.5 13.5m-2.757-5.008A3.001 3.001 0 0115 12m-3 7c-4.477 0-8.268-2.943-9.542-7a11.955 11.955 0 013.746-5.362M9.88 9.88A3 3 0 0114.12 14.12M17.618 6.382A11.955 11.955 0 0121.542 12c-.694 2.211-2.14 4.093-4.024 5.362" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Remember Me & Forgot Password -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            name="rememberMe"
                            class="w-4 h-4 text-[#224796] border-slate-300 rounded focus:ring-[#224796] cursor-pointer"
                        />
                        <label for="rememberMe" class="ml-2 text-sm text-slate-600 cursor-pointer">
                            Remember me
                        </label>
                    </div>
                    <a href="#" class="text-sm text-[#224796] hover:text-[#163473] font-medium transition">
                        Forgot password?
                    </a>
                </div>

                <!-- Login Button -->
                <button
                    type="submit"
                    class="w-full bg-[#224796] text-white font-medium py-2.5 sm:py-2.5 rounded-lg hover:bg-[#163473] transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#224796] focus:ring-offset-2"
                >
                    Sign In
                </button>
            </form>

            <div class="text-center text-xs sm:text-sm text-slate-500 mt-2">
                <p>&copy; 2026 City Health Office. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>