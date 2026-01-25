<?php
require_once __DIR__ . '/config/vite.php';
require_once __DIR__ . '/config/db.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - City Health Office</title>

    <!-- Vite Assets -->
    <?= Vite::assets('backend/js/main.js') ?>
</head>
<body class="min-h-screen flex flex-col md:flex-row">
    <!-- Left Panel - Brand Area -->
    <div class="hidden md:flex md:w-1/2 bg-[#224796] text-white items-center justify-center p-8">
        <div class="text-center space-y-6">
            <div class="mb-8">
                <!-- Actual round logo -->
                <div class="w-48 h-48 mx-auto rounded-full overflow-hidden bg-transparent flex items-center justify-center mb-6">
                    <img
                        src="frontend/images/ch-logo.png"
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
    <div class="flex w-full md:w-1/2 items-center justify-center bg-slate-50 p-6 md:p-10">
        <div class="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 space-y-6">
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                <p class="text-slate-600">Sign in to your account</p>
            </div>

            <form id="loginForm" class="space-y-6">
                <!-- Username Field -->
                <div>
                    <label for="username" class="block text-sm font-medium text-slate-700 mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        required
                        autocomplete="username"
                        class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#224796] focus:border-transparent transition"
                        placeholder="Enter your username"
                    />
                </div>

                <!-- Password Field -->
                <div>
                    <label for="password" class="block text-sm font-medium text-slate-700 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        autocomplete="current-password"
                        class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#224796] focus:border-transparent transition"
                        placeholder="Enter your password"
                    />
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
                    class="w-full bg-[#224796] text-white font-medium py-2.5 rounded-lg hover:bg-[#163473] transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#224796] focus:ring-offset-2"
                >
                    Sign In
                </button>
            </form>

            <div class="text-center text-sm text-slate-500 mt-6">
                <p>&copy; 2026 City Health Office. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>