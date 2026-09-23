<?php
require_once __DIR__ . '/../config/vite_helper.php';
require_once __DIR__ . '/../config/db.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - City Health Office</title>

    <!-- Vite Assets -->
    <?php vite('backend/js/main.js'); ?>

</head>
<body class="min-h-screen flex flex-col bg-slate-100">
    <?php require_once __DIR__ . '/components/sidebar.php'; ?>

    <!-- Main Content Container (Expandable and Scrollable) -->
    <div id="spaContentContainer" class="main-content ml-64 min-h-screen transition-all duration-300 flex-1 flex flex-col">
            <!-- Page Content (Scrollable) -->
            <main id="pageMain" class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
                <!-- Page-specific content goes here -->
            </main>
        </div>
    </div>

</body>
</html>