// 测试不同的 API 服务

const API_KEY = '11ebcec02cb7387e06f5056f7e46223c075b477de48711cd506d62a5d1dea9a5';
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function testRemoveBg() {
  console.log('测试 remove.bg API...');
  try {
    const formData = new URLSearchParams();
    formData.append('image_file', `data:image/png;base64,${testImageBase64}`);
    formData.append('size', 'auto');
    
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    console.log('状态:', response.status);
    if (response.status === 200) {
      console.log('✅ remove.bg 有效！');
    } else {
      const text = await response.text();
      console.log('响应:', text.substring(0, 200));
    }
  } catch (e) {
    console.log('错误:', e.message);
  }
}

async function testWatermarkRemover() {
  console.log('\n测试 watermarkremover.com API...');
  try {
    const formData = new URLSearchParams();
    formData.append('image', `data:image/png;base64,${testImageBase64}`);
    
    const response = await fetch('https://api.watermarkremover.com/v1/remove', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    console.log('状态:', response.status);
    const text = await response.text();
    console.log('响应:', text.substring(0, 200));
  } catch (e) {
    console.log('错误:', e.message);
  }
}

async function testAiliPy() {
  console.log('\n测试 aihubmix/ailipay API...');
  try {
    const response = await fetch('https://api.ainewbox.com/v1/remove-watermark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        image: `data:image/png;base64,${testImageBase64}`
      })
    });
    
    console.log('状态:', response.status);
    const text = await response.text();
    console.log('响应:', text.substring(0, 200));
  } catch (e) {
    console.log('错误:', e.message);
  }
}

testRemoveBg();
setTimeout(testWatermarkRemover, 2000);
setTimeout(testAiliPy, 4000);
