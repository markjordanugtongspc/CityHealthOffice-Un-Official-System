<?php
/**
 * Lightweight .env loader for PHP
 * 
 * - Place your secrets in config/.env (not committed to git)
 * - Use env('KEY', 'default') to read values
 */

if (!function_exists('env')) {
    /**
     * Get environment value from config/.env
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    function env(string $key, $default = null)
    {
        static $vars = null;

        if ($vars === null) {
            $vars = [];
            // Check root first, then config
            $rootEnv = dirname(__DIR__) . '/.env';
            $configEnv = __DIR__ . '/.env';
            $envPath = is_readable($rootEnv) ? $rootEnv : $configEnv;

            if (is_readable($envPath)) {
                // Use INI parser in raw mode (no type casting)
                $parsed = parse_ini_file($envPath, false, INI_SCANNER_RAW);
                if (is_array($parsed)) {
                    $vars = $parsed;
                }
            }
        }

        if (array_key_exists($key, $vars)) {
            return $vars[$key];
        }

        return $default;
    }
}

