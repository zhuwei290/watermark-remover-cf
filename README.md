# AI 去水印工具 - Cloudflare Workers 版

基于 WaveSpeed AI 的智能去水印网站，完全无服务器架构，图片内存处理不存储。

## 🚀 快速部署

### 1. 获取 API 密钥

访问 [WaveSpeed AI](https://wavespeed.ai/accesskey) 获取 API 密钥

### 2. 配置密钥

编辑 `wrangler.toml`，添加你的 API 密钥：

```toml
[vars]
WAVESPEED_API_KEY = "你的 API 密钥"
```

**或者使用环境变量（推荐）：**

```bash
export WAVESPEED_API_KEY="你的 API 密钥"
wrangler deploy
```

### 3. 安装依赖

```bash
npm install
```

### 4. 本地测试

```bash
npm run dev
```

访问 http://localhost:8787 预览

### 5. 部署到 Cloudflare

```bash
npm run deploy
```

部署完成后会获得一个 `*.workers.dev` 域名

## 💰 成本估算

### WaveSpeed API 费用
- 图片去水印：$0.012 / 张
- 100 张/天 ≈ $36/月

### Cloudflare Workers 免费额度
- 每天 100,000 次请求
- 每次请求最多 50ms CPU 时间
- 完全够用！

## 📁 项目结构

```
watermark-remover-cf/
├── worker.js          # 主逻辑（前端 + 后端 API）
├── wrangler.toml      # Cloudflare 配置
├── package.json       # 依赖配置
└── README.md          # 说明文档
```

## 🔧 功能特性

- ✅ AI 智能检测水印区域
- ✅ 支持 JPG/PNG/WebP/GIF
- ✅ 最大 10MB 图片
- ✅ 前后对比预览
- ✅ 一键下载高清图片
- ✅ 响应式设计（手机/电脑）
- ✅ 图片不存储，内存处理

## ⚙️ 自定义配置

### 修改最大文件大小

编辑 `worker.js` 中的 `maxSize` 变量：

```javascript
const maxSize = 10 * 1024 * 1024; // 改为 20MB
```

### 修改输出格式

编辑 `worker.js` 中的 `output_format`：

```javascript
{ 
  image: imageUrl,
  output_format: "jpeg"  // jpeg/png/webp
}
```

## 🔒 安全说明

1. **API 密钥**：不要提交到 Git，使用环境变量
2. **图片处理**：纯内存处理，不存储任何图片
3. **访问控制**：如需限制访问，可添加密码验证

## 📝 常见问题

### Q: 处理速度慢怎么办？
A: WaveSpeed API 通常 5-10 秒完成，如果超时检查网络连接

### Q: 可以处理视频吗？
A: 当前版本仅支持图片，视频需要额外配置

### Q: 如何自定义域名？
A: 在 Cloudflare Dashboard 绑定自定义域名

## 📄 License

MIT
