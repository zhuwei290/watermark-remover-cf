const fs = require('fs');
const path = require('path');

const WAVESPEED_API_KEY = '11ebcec02cb7387e06f5056f7e46223c075b477de48711cd506d62a5d1dea9a5';

// 创建一个测试图片（1x1 像素的 PNG）
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const imageUrl = `data:image/png;base64,${testImageBase64}`;

async function testAPI() {
  console.log('正在测试 WaveSpeed API...');
  console.log('API Key:', WAVESPEED_API_KEY.substring(0, 10) + '...');
  
  try {
    const response = await fetch('https://api.wavespeed.ai/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WAVESPEED_API_KEY}`
      },
      body: JSON.stringify({
        model: 'wavespeed-ai/image-watermark-remover',
        input: {
          image: imageUrl,
          output_format: 'png'
        }
      })
    });
    
    console.log('响应状态:', response.status);
    console.log('响应头:', JSON.stringify(Object.fromEntries(response.headers.entries())));
    
    const text = await response.text();
    console.log('响应内容:', text);
    
    if (response.ok) {
      const json = JSON.parse(text);
      console.log('✅ 成功！输出 URL:', json.outputs?.[0]);
    } else {
      console.log('❌ 失败');
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

testAPI();
