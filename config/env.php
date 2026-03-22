<?php
/**
 * Lightweight .env loader for PHP
 * 
 * - Place your secrets in config/.env (not committed to git)
 * - Use env('KEY', 'default') to read values
 */

if (!function_exists('parseEnvFile')) {
    /**
     * Load KEY=value pairs from a dotenv-style file (not strict INI — avoids parse_ini_file quirks with # comments, unicode, parentheses).
     *
     * @param string $path
     * @return array<string, string>
     */
    function parseEnvFile(string $path): array
    {
        $vars = [];
        if (!is_readable($path)) {
            return $vars;
        }
        $raw = @file_get_contents($path);
        if ($raw === false || $raw === '') {
            return $vars;
        }
        if (strncmp($raw, "\xEF\xBB\xBF", 3) === 0) {
            $raw = substr($raw, 3);
        }
        $lines = preg_split("/\r\n|\n|\r/", $raw);
        if ($lines === false) {
            return $vars;
        }
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#' || $line[0] === ';') {
                continue;
            }
            $eq = strpos($line, '=');
            if ($eq === false) {
                continue;
            }
            $name = trim(substr($line, 0, $eq));
            if ($name === '') {
                continue;
            }
            $value = trim(substr($line, $eq + 1));
            $len = strlen($value);
            if ($len >= 2 && $value[0] === '"' && $value[$len - 1] === '"') {
                $value = substr($value, 1, -1);
            } elseif ($len >= 2 && $value[0] === "'" && $value[$len - 1] === "'") {
                $value = substr($value, 1, -1);
            }
            $vars[$name] = $value;
        }
        return $vars;
    }
}

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
            $rootEnv = dirname(__DIR__) . '/.env';
            $configEnv = __DIR__ . '/.env';
            $envPath = is_readable($rootEnv) ? $rootEnv : $configEnv;
            $vars = parseEnvFile($envPath);
        }

        if (array_key_exists($key, $vars)) {
            return $vars[$key];
        }

        return $default;
    }
}

