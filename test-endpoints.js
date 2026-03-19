const WAVESPEED_API_KEY = '11ebcec02cb7387e06f5056f7e46223c075b477de48711cd506d62a5d1dea9a5';

// 创建一个测试图片（1x1 像素的 PNG）
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const imageUrl = `data:image/png;base64,${testImageBase64}`;

const endpoints = [
  'https://api.wavespeed.ai/v1/run',
  'https://api.wavespeed.ai/v1/image-watermark-remover',
  'https://api.wavespeed.ai/v1/models/wavespeed-ai/image-watermark-remover/run',
  'https://api.wavespeed.ai/run',
  'https://api.wavespeed.ai/v1/predictions'
];

async function testEndpoint(url) {
  console.log(`\n测试端点：${url}`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WAVESPEED_API_KEY}`
      },
      body: JSON.stringify({
        model: 'wavespeed-ai/image-watermark-remover',
        input: { image: imageUrl }
      })
    });
    
    const text = await response.text();
    console.log(`状态：${response.status} - ${text.substring(0, 100)}`);
    
    if (response.status !== 404) {
      console.log('✅ 这个端点可能有效！');
      return url;
    }
  } catch (error) {
    console.log(`错误：${error.message}`);
  }
  return null;
}

async function testAll() {
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
}

testAll();
