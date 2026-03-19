const API_KEY = '11ebcec02cb7387e06f5056f7e46223c075b477de48711cd506d62a5d1dea9a5';
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// 根据技能文档，WaveSpeed 使用类似 Replicate 的 API 格式
async function testWaveSpeedAPI() {
  const endpoints = [
    {
      url: 'https://api.wavespeed.ai/v1/predictions',
      body: {
        version: 'wavespeed-ai/image-watermark-remover',
        input: { image: `data:image/png;base64,${testImageBase64}` }
      }
    },
    {
      url: 'https://api.wavespeed.ai/v1/models/wavespeed-ai/image-watermark-remover/predictions',
      body: {
        input: { image: `data:image/png;base64,${testImageBase64}` }
      }
    },
    {
      url: 'https://api.wavespeed.ai/v1/run',
      body: {
        model: 'wavespeed-ai/image-watermark-remover',
        input: { image: `data:image/png;base64,${testImageBase64}` }
      }
    },
    {
      url: 'https://api.wavespeed.ai/v1/inference',
      body: {
        model: 'wavespeed-ai/image-watermark-remover',
        input: { image: `data:image/png;base64,${testImageBase64}` }
      }
    },
    {
      url: 'https://api.wavespeed.ai/inference',
      body: {
        model: 'wavespeed-ai/image-watermark-remover',
        input: { image: `data:image/png;base64,${testImageBase64}` }
      }
    }
  ];
  
  for (const {url, body} of endpoints) {
    console.log(`\n测试：${url}`);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(body)
      });
      
      const text = await response.text();
      console.log(`状态：${response.status}`);
      console.log(`响应：${text.substring(0, 300)}`);
      
      if (response.status === 200 || response.status === 201 || response.status === 202) {
        console.log('✅ 找到有效端点！');
        return url;
      }
    } catch (e) {
      console.log(`错误：${e.message}`);
    }
  }
  
  return null;
}

// 测试获取模型列表
async function testModelsEndpoint() {
  console.log('\n\n测试获取模型列表...');
  const urls = [
    'https://api.wavespeed.ai/v1/models',
    'https://api.wavespeed.ai/models',
    'https://api.wavespeed.ai/v1/catalog'
  ];
  
  for (const url of urls) {
    console.log(`\n测试：${url}`);
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      
      const text = await response.text();
      console.log(`状态：${response.status}`);
      console.log(`响应：${text.substring(0, 300)}`);
    } catch (e) {
      console.log(`错误：${e.message}`);
    }
  }
}

async function main() {
  await testWaveSpeedAPI();
  await testModelsEndpoint();
}

main();
