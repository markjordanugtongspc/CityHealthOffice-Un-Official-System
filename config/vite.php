<?php

/**
 * Vite Asset Helper
 * This API provides a way to include Vite assets in any PHP file.
 */

class Vite
{
    private static $vite_port = 5173;
    private static $manifest = null;

    /**
     * Gets the Vite host based on the current request.
     */
    private static function getViteHost()
    {
        $host = $_SERVER['HTTP_HOST'];
        // Remove port if exists
        $host = explode(':', $host)[0];
        return "http://$host:" . self::$vite_port;
    }

    /**
     * Injects the necessary tags to load a Vite entry point.
     * 
     * @param string $entry The path to the entry point (e.g., 'frontend/main.js')
     */
    public static function assets($entry)
    {
        $vite_host = self::getViteHost();
        if (self::isDev($vite_host)) {
            return '
                <script type="module" src="' . $vite_host . '/@vite/client"></script>
                <script type="module" src="' . $vite_host . '/' . $entry . '"></script>
            ';
        }

        return self::getProductionAssets($entry);
    }

    /**
     * Checks if Vite dev server is running (Public version for debug)
     */
    public static function isDevMode()
    {
        return self::isDev(self::getViteHost());
    }

    /**
     * Checks if Vite dev server is running.
     */
    private static function isDev($vite_host)
    {
        // Cache the check for the current request
        static $is_dev = null;
        if ($is_dev !== null)
            return $is_dev;

        // PHP check: Always check against localhost internally
        // This bypasses firewall issues when the server checks itself
        $internal_check = "http://127.0.0.1:" . self::$vite_port;

        $ctx = stream_context_create([
            'http' => [
                'timeout' => 0.5,
                'ignore_errors' => true
            ]
        ]);

        $is_dev = (@file_get_contents($internal_check, false, $ctx) !== false);
        return $is_dev;
    }

    private static function getProductionAssets($entry)
    {
        // Calculate the base path dynamically
        $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
        // Remove 'frontend/pages/...' or 'frontend/components' from path to get project root
        $basePath = preg_replace('#/frontend/(pages|components)/.*$#', '', $scriptDir);
        $basePath = rtrim($basePath, '/') . '/';
        // Ensure basePath starts with /
        if (!str_starts_with($basePath, '/')) {
            $basePath = '/' . $basePath;
        }

        if (self::$manifest === null) {
            $manifestPath = __DIR__ . '/../dist/.vite/manifest.json';
            if (file_exists($manifestPath)) {
                self::$manifest = json_decode(file_get_contents($manifestPath), true);
            } else {
                return "<!-- Vite manifest not found at $manifestPath -->";
            }
        }

        if (!isset(self::$manifest[$entry])) {
            return "<!-- Vite entry $entry not found in manifest -->";
        }

        $item = self::$manifest[$entry];
        $html = '';

        // Load CSS
        if (isset($item['css'])) {
            foreach ($item['css'] as $cssFile) {
                $html .= '<link rel="stylesheet" href="' . htmlspecialchars($basePath . 'dist/' . $cssFile) . '">';
            }
        }

        // Load JS
        $html .= '<script type="module" src="' . htmlspecialchars($basePath . 'dist/' . $item['file']) . '"></script>';

        return $html;
    }
}
