import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

/**
 * Auto-increments project version on production build (`npm run build`).
 * Rollover rule: patch increments until 9 (e.g. 2.0.9 -> 2.1.0, 2.1.9 -> 2.2.0).
 */
function autoVersionIncrement() {
    return {
        name: 'auto-version-increment',
        apply: 'build', // Only run during build (not dev server)
        buildStart() {
            const pkgPath = path.resolve(process.cwd(), 'package.json');
            try {
                if (!fs.existsSync(pkgPath)) return;
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
                const currentVersion = pkg.version || '3.0.0';
                const parts = currentVersion.split('.').map(n => parseInt(n, 10));

                let major = isNaN(parts[0]) ? 3 : parts[0];
                let minor = isNaN(parts[1]) ? 0 : parts[1];
                let patch = isNaN(parts[2]) ? 0 : parts[2];

                // Increment patch; when reaching > 9 rollover to next minor
                if (patch >= 9) {
                    patch = 0;
                    minor += 1;
                } else {
                    patch += 1;
                }

                const newVersion = `${major}.${minor}.${patch}`;
                pkg.version = newVersion;
                fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
                console.log(`\n[version-control] Incremented version: ${currentVersion} -> ${newVersion}\n`);
            } catch (err) {
                console.warn('[version-control] Failed to auto-increment version:', err);
            }
        },
    };
}

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
        autoVersionIncrement(),
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
        devSourcemap: false, // Avoid generating large CSS maps during local HMR.
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
