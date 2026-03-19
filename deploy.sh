#!/bin/bash

echo "🚀 开始部署到 Cloudflare Workers..."

# 检查是否安装 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "📦 安装 wrangler..."
    npm install -g wrangler
fi

# 检查是否登录
echo "🔐 检查 Cloudflare 登录状态..."
if ! wrangler whoami &> /dev/null; then
    echo "👉 请先登录 Cloudflare:"
    wrangler login
fi

# 设置 API 密钥
export WAVESPEED_API_KEY="11ebcec02cb7387e06f5056f7e46223c075b477de48711cd506d62a5d1dea9a5"

# 部署
echo "📤 开始部署..."
wrangler deploy

echo ""
echo "✅ 部署完成！"
echo "🌐 访问你的 Worker 进行测试"
