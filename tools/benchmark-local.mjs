import { performance } from 'node:perf_hooks';

const projectUrl = process.argv[2] || 'http://localhost/Project';
const targets = [
    ['PHP home', `${projectUrl}/`],
    ['Dashboard route', `${projectUrl}/frontend/pages/dashboard/`],
    ['Vite client', 'http://localhost:5173/@vite/client'],
    ['Vite main module', 'http://localhost:5173/backend/js/main.js'],
    ['Vite charts module', 'http://localhost:5173/backend/js/charts.js'],
    ['Built main asset', `${projectUrl}/dist/assets/main.js`],
];

async function measure(name, url) {
    const startedAt = performance.now();
    try {
        const response = await fetch(url, { redirect: 'manual', cache: 'no-store' });
        const body = await response.arrayBuffer();
        return {
            target: name,
            status: response.status,
            ms: Math.round((performance.now() - startedAt) * 10) / 10,
            kb: Math.round((body.byteLength / 1024) * 10) / 10,
            location: response.headers.get('location') || '',
        };
    } catch (error) {
        return { target: name, status: 'ERROR', ms: Math.round((performance.now() - startedAt) * 10) / 10, kb: 0, location: error.message };
    }
}

const results = await Promise.all(targets.map(([name, url]) => measure(name, url)));
console.table(results);
console.log('Dashboard redirects are expected while no authenticated PHP session is supplied.');
