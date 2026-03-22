import path from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

/**
 * Full page reload when PHP (or other non-Vite) files change.
 * handleHotUpdate() only runs for files Vite tracks as modules; PHP often is not, so we also hook the dev watcher.
 * JS/CSS still use native HMR from @vite/client — this does not break production (plugins are dev-only).
 */
function phpAndTemplateFullReload() {
    const trigger = (server) => {
        server.ws.send({ type: 'full-reload', path: '*' });
    };
    const isTracked = (file) =>
        file.endsWith('.php') ||
        file.endsWith('.html') ||
        file.endsWith('.htm');

    return {
        name: 'php-template-full-reload',
        configureServer(server) {
            const root = server.config.root;
            // Ensure repo PHP is watched (Windows + nested folders)
            server.watcher.add(path.join(root, '**/*.php'));
            const onFs = (file) => {
                if (typeof file === 'string' && isTracked(file)) {
                    trigger(server);
                }
            };
            server.watcher.on('change', onFs);
            server.watcher.on('add', onFs);
            server.watcher.on('unlink', onFs);
        },
        handleHotUpdate({ file, server }) {
            if (isTracked(file)) {
                trigger(server);
                return [];
            }
        },
    };
}

export default defineConfig({
    plugins: [
        tailwindcss(),
        phpAndTemplateFullReload(),
    ],
    server: {
        host: true, // `npm run dev` / `--host`: LAN + localhost
        port: 5173,
        strictPort: true,
        cors: true,
        watch: {
            // Do not ignore PHP at project root (some setups ignore non-JS by default patterns)
            ignored: ['**/node_modules/**', '**/dist/**'],
        },
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
