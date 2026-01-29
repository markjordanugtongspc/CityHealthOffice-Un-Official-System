<?php
// ----------------------------------------------------------------------
// VITE CONFIGURATION
// ----------------------------------------------------------------------
// IMPORTANT: Update this IP to match your computer's LAN IP (e.g., 192.168.1.5)
// Find this by running 'npm run dev' and looking at the "Network" output.
define('VITE_HOST', 'http://192.168.1.6:5173');
// VITE_BUILD_DIR will be calculated dynamically based on current request

/**
 * Vite Asset Loader
 * @param string $entry  The path to your main entry point (e.g., 'backend/js/main.js')
 * @param bool $preloadOnly  If true, only output preload links without script tags
 */
function vite($entry, $preloadOnly = false) {
    // Extract the Hostname and Port from VITE_HOST to check connection
    $parsedUrl = parse_url(VITE_HOST);
    $host = $parsedUrl['host'] ?? 'localhost';
    $port = $parsedUrl['port'] ?? 5173;

    // Check if Vite Dev Server is running
    // We suppress errors with @ to avoid warnings if server is off
    $handle = @fsockopen($host, $port, $errno, $errstr, 0.1);
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

            if (isset($manifest[$entryKey])) {
                // Calculate base path dynamically based on current request
                $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
                // Remove 'frontend/pages/...' or 'frontend/components' from path
                $basePath = preg_replace('#/frontend/(pages|components)/.*$#', '', $scriptDir);
                $basePath = rtrim($basePath, '/') . '/';
                // Ensure basePath starts with /
                if (!str_starts_with($basePath, '/')) {
                    $basePath = '/' . $basePath;
                }
                
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

