# Cloudflare 部署环境变量配置

## GitHub Secrets 设置

在 GitHub 仓库中设置以下 Secrets：

### 1. 访问 GitHub 仓库
https://github.com/zhuwei290/watermark-remover-cf/settings/secrets/actions

### 2. 添加 Secrets

#### CF_API_TOKEN
- **Name**: `CF_API_TOKEN`
- **Value**: (你的 Cloudflare API Token)
- **获取方式**: 
  1. 访问 https://dash.cloudflare.com/profile/api-tokens
  2. 创建 Token → 选择 "Edit Cloudflare Workers" 模板
  3. 复制 Token

#### WAVESPEED_API_KEY
- **Name**: `WAVESPEED_API_KEY`
- **Value**: `11ebcec02cb7387e06f5056f7e46223c075b477de48711cd506d62a5d1dea9a5`

---

## Cloudflare Dashboard 环境变量

如果使用 Cloudflare Pages/Dashboard 部署：

### Workers 环境变量
1. 访问 https://dash.cloudflare.com
2. Workers & Pages → watermark-remover
3. Settings → Variables → Add Variable
4. 添加：
   - Variable: `WAVESPEED_API_KEY`
   - Value: `11ebcec02cb7387e06f5056f7e46223c075b477de48711cd506d62a5d1dea9a5`

### Pages 环境变量
1. 访问 https://dash.cloudflare.com
2. Workers & Pages → watermark-remover-cf
3. Settings → Environment Variables
4. 添加生产环境变量

---

## 自动部署流程

```
GitHub 推送 → GitHub Actions → Cloudflare API → 自动部署
```

### 触发条件
- 推送到 `main` 分支
- 自动触发部署

### 部署日志
在 GitHub Actions 中查看：
https://github.com/zhuwei290/watermark-remover-cf/actions
