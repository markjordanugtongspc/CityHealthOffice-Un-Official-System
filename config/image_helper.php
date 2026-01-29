<?php
/**
 * Image Path Helper
 * Calculates correct image paths for production and development
 */

/**
 * Get base path for images based on current script location
 * @return string Base path (e.g., '/Project/' or '/')
 */
function getImageBasePath() {
    $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
    
    // Remove 'frontend/pages/...' or 'frontend/components' from path
    $basePath = preg_replace('#/frontend/(pages|components)/.*$#', '', $scriptDir);
    $basePath = rtrim($basePath, '/') . '/';
    
    // Ensure basePath starts with /
    if (!str_starts_with($basePath, '/')) {
        $basePath = '/' . $basePath;
    }
    
    return $basePath;
}

/**
 * Get image path
 * @param string $imagePath Relative path from project root (e.g., 'frontend/images/ch-logo.png')
 * @return string Full image path
 */
function getImagePath($imagePath) {
    $basePath = getImageBasePath();
    return $basePath . ltrim($imagePath, '/');
}
