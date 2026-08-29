import http from 'http';

const req = http.request({
  hostname: 'localhost',
  port: 4000,
  path: '/api/conversations',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
    // Without auth, it should return 401 Unauthorized, but let's test what happens
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});
req.write(JSON.stringify({ productId: "1" }));
req.end();
