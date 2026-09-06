const localtunnel = require('localtunnel');
const fs = require('fs');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 5000 });
    console.log(`\n======================================================`);
    console.log(`SWASTHYASETU PUBLIC LIVE URL: ${tunnel.url}`);
    console.log(`======================================================\n`);
    fs.writeFileSync('tunnel_url.txt', tunnel.url, 'utf8');

    tunnel.on('close', () => {
      console.log('Tunnel closed');
    });
    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
    });
  } catch (err) {
    console.error('Failed to establish tunnel:', err);
  }
})();
