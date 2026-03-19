const http = require('http');
const fs = require('fs');
const path = require('path');

const WAVESPEED_API_KEY = '11ebcec02cb7387e06f5056f7e46223c075b477de48711cd506d62a5d1dea9a5';

// 读取 HTML 文件
const htmlPath = path.join(__dirname, 'index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:8080');
  
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // API 路由：处理去水印请求
  if (url.pathname === '/api/remove' && req.method === 'POST') {
    await handleRemoveWatermark(req, res);
    return;
  }
  
  // 前端页面
  if (url.pathname === '/' || url.pathname === '') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(htmlContent);
    return;
  }
  
  // 404
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('Not Found');
});

async function handleRemoveWatermark(req, res) {
  try {
    console.log('收到去水印请求');
    
    const boundary = req.headers['content-type'].match(/boundary=(.*$)/);
    if (!boundary) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: '无效的请求格式'}));
      return;
    }
    
    const body = await readStream(req);
    console.log('接收数据:', body.length, 'bytes');
    
    const imageFile = parseMultipart(body, boundary[1]);
    
    if (!imageFile || !imageFile.data) {
      console.log('解析 multipart 失败');
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: '请上传图片文件'}));
      return;
    }
    
    console.log('图片类型:', imageFile.type, '大小:', imageFile.data.length, 'bytes');
    
    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(imageFile.type)) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: '不支持的图片格式，请上传 JPG/PNG/WebP/GIF'}));
      return;
    }
    
    // 验证文件大小（最大 10MB）
    if (imageFile.data.length > 10 * 1024 * 1024) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: '图片大小不能超过 10MB'}));
      return;
    }
    
    // 转换为 base64
    const base64 = imageFile.data.toString('base64');
    const imageUrl = `data:${imageFile.type};base64,${base64}`;
    
    console.log('正在调用 WaveSpeed API v3...');
    
    // 1. 提交任务
    const submitResponse = await fetch('https://api.wavespeed.ai/api/v3/wavespeed-ai/image-watermark-remover', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WAVESPEED_API_KEY}`
      },
      body: JSON.stringify({
        image: imageUrl,
        output_format: 'png'
      })
    });
    
    console.log('提交任务状态:', submitResponse.status);
    
    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error('API 错误:', errorText);
      res.writeHead(submitResponse.status, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: errorText || `API 请求失败：${submitResponse.status}`}));
      return;
    }
    
    const submitResult = await submitResponse.json();
    console.log('任务已提交:', submitResult.data?.id);
    
    const taskId = submitResult.data?.id;
    if (!taskId) {
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: '未获取到任务 ID', detail: submitResult}));
      return;
    }
    
    // 2. 轮询任务状态（最多等待 60 秒）
    console.log('等待任务完成...');
    let outputUrl = null;
    const maxAttempts = 30; // 30 * 2 秒 = 60 秒
    const resultUrl = `https://api.wavespeed.ai/api/v3/predictions/${taskId}/result`;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await sleep(2000); // 等待 2 秒
      
      const statusResponse = await fetch(resultUrl, {
        headers: {
          'Authorization': `Bearer ${WAVESPEED_API_KEY}`
        }
      });
      
      if (statusResponse.ok) {
        const statusResult = await statusResponse.json();
        const status = statusResult.data?.status || statusResult.status;
        
        console.log(`轮询 ${attempt}/${maxAttempts}: 状态=${status}`);
        
        if (status === 'succeeded' || status === 'completed') {
          outputUrl = statusResult.data?.outputs?.[0] || 
                      statusResult.outputs?.[0] || 
                      statusResult.data?.output ||
                      statusResult.output;
          
          if (outputUrl) {
            console.log('任务完成，输出 URL:', outputUrl);
            break;
          }
        } else if (status === 'failed' || status === 'error') {
          const errorMsg = statusResult.data?.error || statusResult.error || '任务失败';
          throw new Error(errorMsg);
        }
      } else {
        console.log('轮询失败:', statusResponse.status);
      }
    }
    
    if (!outputUrl) {
      throw new Error('任务超时，未能获取处理结果');
    }
    
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ 
      success: true,
      output_url: outputUrl,
      taskId: taskId
    }));
    
  } catch (error) {
    console.error('去水印失败:', error);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: error.message || '处理失败，请稍后重试'}));
  }
}

function readStream(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

function parseMultipart(body, boundary) {
  try {
    const boundaryStr = `--${boundary}`;
    const parts = body.toString('binary').split(boundaryStr);
    
    for (const part of parts) {
      if (part.includes('name="image"')) {
        const headersEnd = part.indexOf('\r\n\r\n');
        if (headersEnd === -1) continue;
        
        const headers = part.substring(0, headersEnd);
        let data = part.substring(headersEnd + 4);
        
        // 提取 content-type
        const typeMatch = headers.match(/Content-Type: (.*)/i);
        const type = typeMatch ? typeMatch[1].trim().split('\r\n')[0] : 'image/png';
        
        // 去掉末尾的\r\n
        data = data.replace(/\r\n$/, '');
        
        return {
          type,
          data: Buffer.from(data, 'binary')
        };
      }
    }
  } catch (e) {
    console.error('解析 multipart 出错:', e);
  }
  
  return null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 API 密钥已配置`);
  console.log(`🌐 访问 http://localhost:${PORT} 测试`);
});
