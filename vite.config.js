import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        tailwindcss(),
        {
            name: 'php-refresh',
            handleHotUpdate({ file, server }) {
                if (file.endsWith('.php')) {
                    server.ws.send({ type: 'full-reload', path: '*' });
                }
            },
        },
    ],
    server: {
        host: true, // Listen on all addresses, including LAN and public
        cors: true,
        strictPort: true,
        // Watch PHP files and frontend directory for changes
        watch: {
            usePolling: true,
            include: ['frontend/**/*', 'backend/**/*'],
        },
    },
    build: {
        // Generate manifest.json in outDir
        manifest: true,
        rollupOptions: {
            // Overwrite default .html entry
            input: './backend/js/main.js',
        },
    },
});
