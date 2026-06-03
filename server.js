const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY env variable is not set');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      let parsed;
      try { parsed = JSON.parse(body); } catch (e) {
        console.error('Bad JSON from client:', e.message);
        res.writeHead(400); res.end(JSON.stringify({ error: 'Bad JSON' })); return;
      }

      if (!parsed.messages || !Array.isArray(parsed.messages) || parsed.messages.length === 0) {
        res.writeHead(400); res.end(JSON.stringify({ error: 'messages array is empty or missing' })); return;
      }

      const payload = JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 2000,
        system: parsed.system || '',
        messages: parsed.messages,
      });

      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const proxy = https.request(options, (apiRes) => {
        let data = '';
        apiRes.on('data', d => data += d);
        apiRes.on('end', () => {
          if (apiRes.statusCode !== 200) {
            console.error('Anthropic API error', apiRes.statusCode, data);
          }
          res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
          res.end(data);
        });
      });

      proxy.on('error', (e) => {
        console.error('Proxy error:', e.message);
        res.writeHead(502); res.end(JSON.stringify({ error: e.message }));
      });

      proxy.write(payload);
      proxy.end();
    });
    return;
  }

  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, 'public', filePath);

  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(content);
  });
});

server.listen(PORT, () => console.log(`Roistat AI Bot running on port ${PORT}`));
