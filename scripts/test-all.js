const http = require('http');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';

// Pages to test
const pages = [
  '/',
  '/shop',
  '/cart',
  '/checkout',
  '/wishlist',
  '/about',
  '/contact',
  '/faq',
  '/blog',
  '/salon',
  '/rewards',
  '/account/login',
  '/account/register',
  '/account',
  '/salon/booking',
  '/admin',
  '/admin/products',
  '/admin/orders',
  '/admin/appointments',
  '/admin/customers',
  '/admin/banners',
  '/admin/faq',
  '/admin/testimonials',
  '/admin/stylists',
  '/admin/content-blocks',
  '/admin/settings'
];

// API endpoints to test
const apis = [
  { method: 'GET', path: '/api/products' },
  { method: 'GET', path: '/api/categories' },
  { method: 'GET', path: '/api/banners' },
  { method: 'GET', path: '/api/faq' },
  { method: 'GET', path: '/api/testimonials' },
  { method: 'GET', path: '/api/stylists' },
  { method: 'GET', path: '/api/content-blocks' },
  { method: 'GET', path: '/api/rewards/tiers' },
  { method: 'GET', path: '/api/blog' },
  { method: 'GET', path: '/api/admin/dashboard' },
  { method: 'GET', path: '/api/admin/products' },
  { method: 'GET', path: '/api/admin/orders' },
  { method: 'GET', path: '/api/admin/banners' },
  { method: 'GET', path: '/api/admin/faq' },
  { method: 'GET', path: '/api/admin/testimonials' },
  { method: 'GET', path: '/api/admin/stylists' },
  { method: 'GET', path: '/api/admin/content-blocks' }
];

function testUrl(url, method = 'GET') {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: method,
      timeout: 30000
    };

    const req = http.request(options, (res) => {
      resolve({ status: res.statusCode, url: urlObj.pathname });
    });

    req.on('error', (e) => {
      resolve({ status: 'ERR', url: urlObj.pathname, error: e.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'TIMEOUT', url: urlObj.pathname });
    });

    req.end();
  });
}

async function runTests() {
  const results = {
    timestamp: new Date().toISOString(),
    pages: [],
    apis: [],
    summary: { total: 0, passed: 0, failed: 0 }
  };

  console.log('Testing Pages...');
  for (const page of pages) {
    const result = await testUrl(`${BASE_URL}${page}`);
    const passed = result.status === 200 || result.status === 307 || result.status === 308;
    results.pages.push({
      path: page,
      status: result.status,
      passed: passed
    });
    results.summary.total++;
    if (passed) results.summary.passed++;
    else results.summary.failed++;
    console.log(`  ${passed ? '✓' : '✗'} ${result.status} ${page}`);
  }

  console.log('\nTesting APIs...');
  for (const api of apis) {
    const result = await testUrl(`${BASE_URL}${api.path}`, api.method);
    const passed = result.status === 200 || result.status === 401; // 401 is OK for protected routes
    results.apis.push({
      method: api.method,
      path: api.path,
      status: result.status,
      passed: passed
    });
    results.summary.total++;
    if (passed) results.summary.passed++;
    else results.summary.failed++;
    console.log(`  ${passed ? '✓' : '✗'} ${result.status} ${api.method} ${api.path}`);
  }

  // Write results to file
  fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
  
  // Write summary
  const summary = `
# Test Results - ${results.timestamp}

## Summary
- Total Tests: ${results.summary.total}
- Passed: ${results.summary.passed}
- Failed: ${results.summary.failed}
- Pass Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%

## Page Tests
${results.pages.map(p => `- ${p.passed ? '✅' : '❌'} ${p.status} ${p.path}`).join('\n')}

## API Tests
${results.apis.map(a => `- ${a.passed ? '✅' : '❌'} ${a.status} ${a.method} ${a.path}`).join('\n')}
`;

  fs.writeFileSync('TEST_RESULTS.md', summary);
  
  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${results.summary.total} | Passed: ${results.summary.passed} | Failed: ${results.summary.failed}`);
  console.log(`Pass Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);
  console.log('Results saved to test-results.json and TEST_RESULTS.md');
}

runTests().catch(console.error);
