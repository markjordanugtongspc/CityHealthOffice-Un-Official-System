<?php
require_once __DIR__ . '/../../../config/vite_helper.php';
require_once __DIR__ . '/../../../config/db.php';
require_once __DIR__ . '/../../../config/session.php';

requireAuth();
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Settings - City Health Office</title>
    <?php vite('backend/js/main.js'); ?>
</head>

<body class="app-shell min-h-screen flex flex-col bg-[#f8fafc]">
    <?php require_once __DIR__ . '/../../components/page-loader.php'; ?>
    <?php require_once __DIR__ . '/../../components/sidebar.php'; ?>

    <div id="spaContentContainer"
        class="main-content ml-0 w-full max-w-full lg:w-auto lg:ml-80! lg:group-[.sidebar-collapsed]/body:!ml-[4.5rem] min-h-screen transition-all duration-300 flex-1 flex flex-col overflow-hidden!">
        <main id="pageMain" class="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 md:p-6 lg:p-8 xl:px-10 pb-10 md:pb-12 lg:pb-16 w-full min-w-0 max-w-none">
            <div id="settingsPageRoot" class="w-full min-w-0 max-w-none">
                <?php require_once __DIR__ . '/../../components/settings-content.php'; ?>
            </div>
        </main>
    </div>
</body>

</html>
