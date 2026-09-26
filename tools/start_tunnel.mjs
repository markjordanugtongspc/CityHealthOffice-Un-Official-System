import { startTunnel } from 'untun';

console.log('Starting Cloudflare tunnel for http://localhost:80 ...');

try {
    const tunnel = await startTunnel({
        url: 'http://localhost:80',
        acceptCloudflareNotice: true,
    });
    const url = await tunnel.getURL();
    console.log('\n======================================================');
    console.log('✔ CLOUDFLARE TUNNEL IS ACTIVE AND UNLIMITED!');
    console.log(`✔ Public Tunnel URL: ${url}`);
    console.log(`✔ CHO System URL:    ${url}/CityHealthOffice-Un-Official-System/`);
    console.log('======================================================\n');
} catch (err) {
    console.error('Failed to start untun tunnel:', err);
}
