<?php
// ----------------------------------------------------------------------
// VITE CONFIGURATION
// ----------------------------------------------------------------------
// DEV: run `npm run dev` (optional `-- --host`). If 127.0.0.1:VITE_PORT responds, this file emits @vite/client + entry → HMR for JS/CSS; PHP/HTML edits trigger full reload via vite.config.js.
// PROD: stop the dev server, run `npm run build`, then this file serves hashed assets from dist/.vite/manifest.json (see vite.config.js build.*).
// Mirror logic lives in config/vite.php (class Vite) if you use that API elsewhere.
// ----------------------------------------------------------------------
require_once __DIR__ . '/env.php';

// Browser loads HMR from the same host as the PHP app (localhost or LAN); `npm run dev -- --host` binds 0.0.0.0
$requestHost = $_SERVER['HTTP_HOST'] ?? 'localhost';
$cleanHost = explode(':', $requestHost)[0];
$vitePort = (int) env('VITE_PORT', '5173');
if ($vitePort < 1 || $vitePort > 65535) {
    $vitePort = 5173;
}
define('VITE_PORT', $vitePort);
define('VITE_HOST', 'http://' . $cleanHost . ':' . VITE_PORT);

/**
 * Vite Asset Loader
 * @param string $entry  The path to your main entry point (e.g., 'backend/js/main.js')
 * @param bool $preloadOnly  If true, only output preload links without script tags
 */
function vite($entry, $preloadOnly = false)
{
    // Check dev server on loopback — reliable when the site is opened via LAN IP or hostname
    $handle = @fsockopen('127.0.0.1', VITE_PORT, $errno, $errstr, 0.15);
    $isDev = $handle !== false;
    if ($handle) {
        fclose($handle);
    }

    if ($isDev) {
        // [DEV MODE] In dev mode, CSS is injected via JS modules
        // We can't load CSS separately, but we can preload modules
        if ($preloadOnly) {
            echo '<link rel="modulepreload" href="' . VITE_HOST . '/@vite/client" crossorigin>';
            echo '<link rel="modulepreload" href="' . VITE_HOST . '/' . ltrim($entry, './') . '" crossorigin>';
        } else {
            // Load Vite client and entry point
            // CSS will be injected by Vite's HMR system
            echo '<script type="module" src="' . VITE_HOST . '/@vite/client"></script>';
            echo '<script type="module" src="' . VITE_HOST . '/' . ltrim($entry, './') . '"></script>';
        }
    } else {
        // [PROD MODE] Read from manifest.json
        $manifestPath = __DIR__ . '/../dist/.vite/manifest.json';

        if (file_exists($manifestPath)) {
            $manifest = json_decode(file_get_contents($manifestPath), true);
            $entryKey = ltrim($entry, './');

            // Calculate base path dynamically based on current request
            $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
            // Remove 'frontend/pages/...' or 'frontend/components' from path
            $basePath = preg_replace('#/frontend/(pages|components)/.*$#', '', $scriptDir);
            $basePath = rtrim($basePath, '/') . '/';
            // Ensure basePath starts with /
            if (!str_starts_with($basePath, '/')) {
                $basePath = '/' . $basePath;
            }

            // Global style.css when cssCodeSplit: false
            static $globalCssLoaded = false;
            if (!$globalCssLoaded && isset($manifest['style.css'])) {
                $cssFile = $manifest['style.css']['file'] ?? null;
                if ($cssFile) {
                    $href = htmlspecialchars($basePath . 'dist/' . $cssFile);
                    if ($preloadOnly) {
                        echo '<link rel="preload" href="' . $href . '" as="style">';
                    }
                    echo '<link rel="stylesheet" href="' . $href . '">';
                    $globalCssLoaded = true;
                }
            }

            if (isset($manifest[$entryKey])) {
                $file = $manifest[$entryKey]['file'];

                if ($preloadOnly) {
                    // Preload CSS files first
                    if (isset($manifest[$entryKey]['css'])) {
                        foreach ($manifest[$entryKey]['css'] as $cssFile) {
                            echo '<link rel="preload" href="' . htmlspecialchars($basePath . 'dist/' . $cssFile) . '" as="style">';
                        }
                    }
                    // Preload JS module
                    echo '<link rel="modulepreload" href="' . htmlspecialchars($basePath . 'dist/' . $file) . '" crossorigin>';
                } else {
                    // Load CSS files synchronously first to prevent FOUC
                    if (isset($manifest[$entryKey]['css'])) {
                        foreach ($manifest[$entryKey]['css'] as $cssFile) {
                            echo '<link rel="stylesheet" href="' . htmlspecialchars($basePath . 'dist/' . $cssFile) . '">';
                        }
                    }
                    // Then load JS module
                    echo '<script type="module" src="' . htmlspecialchars($basePath . 'dist/' . $file) . '"></script>';
                }
            }
        }
    }
}

