export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/remove' && request.method === 'POST') {
      return await handleRemoveWatermark(request, env);
    }
    
    return new Response(getHTML(), {
      headers: { 'content-type': 'text/html;charset=UTF-8' }
    });
  }
};

async function handleRemoveWatermark(request, env) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    
    if (!imageFile || imageFile.size === 0) {
      return Response.json({ error: '请上传图片文件' }, { status: 400 });
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(imageFile.type)) {
      return Response.json({ error: '不支持的图片格式' }, { status: 400 });
    }
    
    if (imageFile.size > 10 * 1024 * 1024) {
      return Response.json({ error: '图片大小不能超过 10MB' }, { status: 400 });
    }
    
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);
    const imageUrl = `data:${imageFile.type};base64,${base64}`;
    
    const submitResponse = await fetch('https://api.wavespeed.ai/api/v3/wavespeed-ai/image-watermark-remover', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.WAVESPEED_API_KEY}`
      },
      body: JSON.stringify({
        image: imageUrl,
        output_format: 'png'
      })
    });
    
    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      return Response.json({ error: errorText || `API 错误：${submitResponse.status}` }, { status: submitResponse.status });
    }
    
    const submitResult = await submitResponse.json();
    const taskId = submitResult.data?.id;
    
    if (!taskId) {
      return Response.json({ error: '未获取到任务 ID' }, { status: 500 });
    }
    
    const maxAttempts = 30;
    const resultUrl = `https://api.wavespeed.ai/api/v3/predictions/${taskId}/result`;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await sleep(2000);
      
      const statusResponse = await fetch(resultUrl, {
        headers: { 'Authorization': `Bearer ${env.WAVESPEED_API_KEY}` }
      });
      
      if (statusResponse.ok) {
        const statusResult = await statusResponse.json();
        const status = statusResult.data?.status || statusResult.status;
        
        if (status === 'succeeded' || status === 'completed') {
          const outputUrl = statusResult.data?.outputs?.[0] || statusResult.outputs?.[0] || statusResult.data?.output || statusResult.output;
          if (outputUrl) {
            return Response.json({ success: true, output_url: outputUrl, taskId });
          }
        } else if (status === 'failed' || status === 'error') {
          return Response.json({ error: statusResult.data?.error || statusResult.error || '任务失败' }, { status: 500 });
        }
      }
    }
    
    return Response.json({ error: '任务超时' }, { status: 504 });
    
  } catch (error) {
    return Response.json({ error: error.message || '处理失败' }, { status: 500 });
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI 去水印工具 - 一键去除图片水印</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;padding:20px}
    .container{max-width:900px;margin:0 auto}
    header{text-align:center;color:white;margin-bottom:40px}
    header h1{font-size:2.5rem;margin-bottom:10px;text-shadow:2px 2px 4px rgba(0,0,0,0.2)}
    header p{font-size:1.1rem;opacity:0.9}
    .upload-area{background:white;border-radius:20px;padding:40px;box-shadow:0 20px 60px rgba(0,0,0,0.3);margin-bottom:30px}
    .drop-zone{border:3px dashed #667eea;border-radius:15px;padding:60px 20px;text-align:center;cursor:pointer;transition:all 0.3s ease;background:#f8f9ff}
    .drop-zone:hover,.drop-zone.dragover{border-color:#764ba2;background:#f0f2ff;transform:scale(1.02)}
    .drop-zone-icon{font-size:4rem;margin-bottom:20px}
    .drop-zone-text{font-size:1.2rem;color:#666;margin-bottom:10px}
    .drop-zone-hint{font-size:0.9rem;color:#999}
    #fileInput{display:none}
    .preview-section{display:none;margin-top:30px}
    .preview-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px}
    @media(max-width:600px){.preview-grid{grid-template-columns:1fr}}
    .preview-card{background:#f8f9ff;border-radius:15px;padding:20px;text-align:center}
    .preview-card h3{color:#667eea;margin-bottom:15px;font-size:1.1rem}
    .preview-image{max-width:100%;border-radius:10px;box-shadow:0 4px 15px rgba(0,0,0,0.1)}
    .btn{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;border:none;padding:15px 40px;font-size:1.1rem;border-radius:50px;cursor:pointer;transition:all 0.3s ease;display:inline-block;margin-top:20px;text-decoration:none}
    .btn:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(102,126,234,0.4)}
    .btn:disabled{opacity:0.6;cursor:not-allowed;transform:none}
    .loading{display:none;text-align:center;padding:40px}
    .spinner{width:50px;height:50px;border:4px solid #f3f3f3;border-top:4px solid #667eea;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 20px}
    @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    .loading-text{color:#667eea;font-size:1.1rem}
    .error-message{background:#fee;color:#c00;padding:15px;border-radius:10px;margin-top:20px;display:none}
    .features{background:white;border-radius:20px;padding:30px;box-shadow:0 10px 40px rgba(0,0,0,0.2)}
    .features h2{text-align:center;color:#667eea;margin-bottom:30px}
    .feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px}
    .feature-item{text-align:center;padding:20px}
    .feature-icon{font-size:2.5rem;margin-bottom:15px}
    .feature-title{font-weight:bold;color:#333;margin-bottom:10px}
    .feature-desc{color:#666;font-size:0.9rem}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🪄 AI 去水印工具</h1>
      <p>一键智能去除图片水印、Logo、文字叠加</p>
    </header>
    <div class="upload-area">
      <div class="drop-zone" id="dropZone">
        <div class="drop-zone-icon">📤</div>
        <div class="drop-zone-text">拖拽图片到此处或点击上传</div>
        <div class="drop-zone-hint">支持 JPG/PNG/WebP/GIF，最大 10MB</div>
      </div>
      <input type="file" id="fileInput" accept="image/*">
      <div class="loading" id="loading">
        <div class="spinner"></div>
        <div class="loading-text">正在智能去水印中...</div>
      </div>
      <div class="error-message" id="errorMessage"></div>
      <div class="preview-section" id="previewSection">
        <div class="preview-grid">
          <div class="preview-card">
            <h3>原图</h3>
            <img id="originalImage" class="preview-image" alt="原图">
          </div>
          <div class="preview-card">
            <h3>去水印后</h3>
            <img id="processedImage" class="preview-image" alt="处理后">
          </div>
        </div>
        <div style="text-align:center">
          <a id="downloadBtn" class="btn" href="#" download="removed-watermark.png">⬇️ 下载高清图片</a>
        </div>
      </div>
      <div style="text-align:center">
        <button class="btn" id="processBtn" style="display:none" onclick="processImage()">✨ 开始去水印</button>
      </div>
    </div>
    <div class="features">
      <h2>✨ 核心特性</h2>
      <div class="feature-grid">
        <div class="feature-item">
          <div class="feature-icon">🤖</div>
          <div class="feature-title">AI 智能识别</div>
          <div class="feature-desc">自动检测水印区域，无需手动标注</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">⚡</div>
          <div class="feature-title">快速处理</div>
          <div class="feature-desc">通常 5-10 秒完成处理</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🎨</div>
          <div class="feature-title">高质量输出</div>
          <div class="feature-desc">保持原图纹理和背景质量</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🔒</div>
          <div class="feature-title">隐私安全</div>
          <div class="feature-desc">图片不存储，内存处理</div>
        </div>
      </div>
    </div>
  </div>
  <script>
    const dropZone=document.getElementById('dropZone'),fileInput=document.getElementById('fileInput'),previewSection=document.getElementById('previewSection'),processBtn=document.getElementById('processBtn'),loading=document.getElementById('loading'),errorMessage=document.getElementById('errorMessage'),originalImage=document.getElementById('originalImage'),processedImage=document.getElementById('processedImage'),downloadBtn=document.getElementById('downloadBtn');
    let selectedFile=null;
    dropZone.addEventListener('click',()=>fileInput.click());
    dropZone.addEventListener('dragover',e=>{e.preventDefault();dropZone.classList.add('dragover')});
    dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop',e=>{e.preventDefault();dropZone.classList.remove('dragover');if(e.dataTransfer.files.length>0)handleFile(e.dataTransfer.files[0])});
    fileInput.addEventListener('change',e=>{if(e.target.files.length>0)handleFile(e.target.files[0])});
    function handleFile(file){
      const validTypes=['image/jpeg','image/png','image/webp','image/gif'];
      if(!validTypes.includes(file.type)){showError('不支持的图片格式，请上传 JPG/PNG/WebP/GIF');return}
      if(file.size>10*1024*1024){showError('图片大小不能超过 10MB');return}
      selectedFile=file;hideError();
      const reader=new FileReader();
      reader.onload=e=>{originalImage.src=e.target.result;previewSection.style.display='block';processBtn.style.display='inline-block';processedImage.src=''};
      reader.readAsDataURL(file)
    }
    async function processImage(){
      if(!selectedFile)return;
      loading.style.display='block';processBtn.style.display='none';hideError();
      try{
        const formData=new FormData();formData.append('image',selectedFile);
        const response=await fetch('/api/remove',{method:'POST',body:formData});
        const data=await response.json();
        if(!response.ok)throw new Error(data.error||'处理失败');
        processedImage.src=data.output_url;downloadBtn.href=data.output_url
      }catch(error){showError(error.message);previewSection.style.display='none'}
      finally{loading.style.display='none';if(selectedFile&&processedImage.src){processBtn.style.display='inline-block';processBtn.textContent='🔄 重新处理'}}
    }
    function showError(msg){errorMessage.textContent=msg;errorMessage.style.display='block'}
    function hideError(){errorMessage.style.display='none'}
  </script>
</body>
</html>`;
}
