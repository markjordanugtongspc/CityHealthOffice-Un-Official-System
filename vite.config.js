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
        host: true, // Allows access via localhost and LAN IP automatically
        port: 5173, // Force port to stay constant
        strictPort: true,
        cors: true, // Allow your PHP server to fetch assets from Vite
        // No hard-coded origin so it works on any machine/network
    },
    css: {
        devSourcemap: true, // Enable source maps in dev for debugging
    },
    build: {
        // Output directory for production build
        outDir: 'dist',
        emptyOutDir: true,
        manifest: true, // Required for PHP to map files in production
        // Keep all CSS in a single style.css so PHP helpers can preload once
        cssCodeSplit: false,
        rollupOptions: {
            // Single explicit entry point; other modules are imported from main.js
            input: [
                './backend/js/main.js',
            ],
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
