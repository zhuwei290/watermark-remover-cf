const API_KEY = '11ebcec02cb7387e06f5056f7e46223c075b477de48711cd506d62a5d1dea9a5';
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function testV3API() {
  console.log('测试 WaveSpeed v3 API...\n');
  
  const response = await fetch('https://api.wavespeed.ai/api/v3/wavespeed-ai/image-watermark-remover', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      image: `data:image/png;base64,${testImageBase64}`,
      output_format: 'png'
    })
  });
  
  console.log('状态码:', response.status);
  console.log('响应头:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
  
  const text = await response.text();
  console.log('\n响应内容:');
  console.log(text);
  
  if (response.ok) {
    console.log('\n✅ API 调用成功！');
    try {
      const json = JSON.parse(text);
      console.log('输出 URL:', json.output || json.output_url || json.data);
    } catch (e) {}
  } else {
    console.log('\n❌ API 调用失败');
  }
}

testV3API();
