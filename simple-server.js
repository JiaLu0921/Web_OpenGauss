#!/usr/bin/env node

const http = require('http');
const path = require('path');
const fs = require('fs');

// 简单的静态文件服务 + API 代理
const PORT = 3000;

// 读取前端HTML
const indexPath = path.join(__dirname, 'public', 'index.html');
const appJsPath = path.join(__dirname, 'public', 'app.js');

const server = http.createServer((req, res) => {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 前端路由
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(indexPath, 'utf8'));
    return;
  }

  if (req.url === '/app.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(fs.readFileSync(appJsPath, 'utf8'));
    return;
  }

  // API 代理到 Express 服务器（假设在 3001）
  if (req.url.startsWith('/api/')) {
    const forwardUrl = `http://localhost:3001${req.url}`;
    console.log(`[代理] ${req.method} ${req.url} -> ${forwardUrl}`);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: req.url,
      method: req.method,
      headers: req.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('[代理错误]', err.message);
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Backend unavailable' }));
    });

    if (req.method !== 'GET') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`简单服务器运行在 http://localhost:${PORT}`);
  console.log(`前端将代理 API 请求到后端 (localhost:3001)`);
});
