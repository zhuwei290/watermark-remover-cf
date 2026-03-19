const WAVESPEED_API_KEY = '11ebcec02cb7387e06f5056f7e46223c075b477de48711cd506d62a5d1dea9a5';

const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const imageUrl = `data:image/png;base64,${testImageBase64}`;

async function testReplicate() {
  console.log('测试 Replicate API...');
  
  // Replicate API 格式
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${WAVESPEED_API_KEY}`,
      'Prefer': 'wait'
    },
    body: JSON.stringify({
      version: 'watermark-remover-version',
      input: {
        image: imageUrl
      }
    })
  });
  
  console.log('状态:', response.status);
  const text = await response.text();
  console.log('响应:', text);
}

async function testAlternative() {
  console.log('\n测试备用 API (cleanup.pictures)...');
  
  // 使用 cleanup.pictures API（免费去水印）
  const response = await fetch('https://api.cleanup.pictures/v1/remove', {
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
  
  console.log('状态:', response.status);
  const text = await response.text();
  console.log('响应:', text.substring(0, 500));
}

testReplicate();
setTimeout(testAlternative, 2000);
