const WAVESPEED_API_KEY = '11ebcec02cb7387e06f5056f7e46223c075b477de48711cd506d62a5d1dea9a5';

const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const imageUrl = `data:image/png;base64,${testImageBase64}`;

const domains = [
  'https://api.wavespeed.ai',
  'https://api.wavespeedai.com',
  'https://wavespeed.ai',
  'https://api.replicate.com',
  'https://api.cloudflare.com'
];

async function testDomain(domain) {
  console.log(`\n测试域名：${domain}`);
  try {
    // 先测试根路径
    const response = await fetch(`${domain}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WAVESPEED_API_KEY}`
      }
    });
    
    const text = await response.text();
    console.log(`根路径状态：${response.status}`);
    console.log(`响应：${text.substring(0, 200)}`);
    
  } catch (error) {
    console.log(`错误：${error.message}`);
  }
}

async function testAll() {
  for (const domain of domains) {
    await testDomain(domain);
  }
}

testAll();
