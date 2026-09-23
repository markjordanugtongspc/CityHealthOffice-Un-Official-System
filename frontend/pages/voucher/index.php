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
    <title>Generate Voucher - City Health Office</title>
    <?php vite('backend/js/main.js'); ?>
</head>
<body class="app-shell page-voucher min-h-screen flex flex-col bg-slate-100 print:block print:h-auto print:min-h-0 print:bg-white">
    <?php require_once __DIR__ . '/../../components/page-loader.php'; ?>
    <?php require_once __DIR__ . '/../../components/sidebar.php'; ?>

    <div id="spaContentContainer" class="main-content ml-0 w-full max-w-full lg:w-auto lg:ml-80! lg:group-[.sidebar-collapsed]/body:!ml-[4.5rem] min-h-screen transition-all duration-300 flex-1 flex flex-col overflow-hidden!">
        <main class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
            <?php require_once __DIR__ . '/../../components/generateVoucher.php'; ?>
        </main>
    </div>
</body>
</html>
