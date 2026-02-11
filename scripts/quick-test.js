const http = require('http');

const PORT = process.env.PORT || 3001;

const endpoints = [
  { path: '/api/banners', name: 'Public Banners' },
  { path: '/api/products', name: 'Public Products' },
  { path: '/api/admin/dashboard', name: 'Admin Dashboard' },
  { path: '/api/admin/products', name: 'Admin Products' },
  { path: '/api/rewards/tiers', name: 'Rewards Tiers' },
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${PORT}${endpoint.path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const contentType = res.headers['content-type'] || 'unknown';
        const isJson = contentType.includes('application/json');
        let preview = '';
        if (isJson) {
          try {
            const json = JSON.parse(data);
            preview = JSON.stringify(json).substring(0, 100);
          } catch (e) {
            preview = data.substring(0, 100);
          }
        } else {
          preview = data.includes('Page Not Found') ? '404 HTML Page' : 'HTML content';
        }
        resolve({
          name: endpoint.name,
          path: endpoint.path,
          status: res.statusCode,
          contentType: contentType.split(';')[0],
          isJson,
          preview
        });
      });
    });
    req.on('error', (e) => {
      resolve({
        name: endpoint.name,
        path: endpoint.path,
        status: 'ERROR',
        error: e.message
      });
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        name: endpoint.name,
        path: endpoint.path,
        status: 'TIMEOUT'
      });
    });
  });
}

async function runTests() {
  console.log('Testing API Endpoints...\n');
  console.log('='.repeat(80));
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    console.log(`\n${result.name} (${result.path})`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Content-Type: ${result.contentType || 'N/A'}`);
    console.log(`  Is JSON: ${result.isJson || false}`);
    if (result.preview) console.log(`  Preview: ${result.preview}`);
    if (result.error) console.log(`  Error: ${result.error}`);
  }
  
  console.log('\n' + '='.repeat(80));
}

runTests();
