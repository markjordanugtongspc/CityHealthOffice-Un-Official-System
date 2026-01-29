import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        tailwindcss(),
        {
            name: 'php-refresh',
            handleHotUpdate({ file, server }) {
                // Reload page when PHP files change
                if (file.endsWith('.php')) {
                    server.ws.send({ type: 'full-reload', path: '*' });
                }
            },
        },
    ],
    server: {
        host: true, // Allows access via network IP (e.g., 192.168.x.x)
        port: 5173, // Force port to stay constant
        strictPort: true,
        cors: true, // Allow your PHP server to fetch assets from Vite
        origin: 'http://localhost:5173', // Important for asset URLs
    },
    css: {
        devSourcemap: true, // Enable source maps in dev for debugging
    },
    build: {
        // Output directory for production build
        outDir: 'dist',
        emptyOutDir: true,
        manifest: true, // Required for PHP to map files in production
        cssCodeSplit: false, // Extract all CSS into a single file for faster loading
        rollupOptions: {
            // Your main entry point
            input: './backend/js/main.js',
            output: {
                // Optimize chunk splitting
                manualChunks: undefined, // Single bundle for faster initial load
                // Use relative paths for assets
                assetFileNames: 'assets/[name].[ext]',
                chunkFileNames: 'assets/[name].js',
                entryFileNames: 'assets/[name].js',
            },
        },
        // Optimize build performance
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: false, // Keep console logs in dev
            },
        },
        // Ensure assets are copied correctly
        assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
    },
});