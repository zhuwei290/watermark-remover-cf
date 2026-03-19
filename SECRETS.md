# GitHub Secrets 配置说明

## 需要设置的 Secrets

访问：https://github.com/zhuwei290/watermark-remover-cf/settings/secrets/actions

### 必须设置的 Secrets：

#### 1. CF_API_TOKEN
- **Name**: `CF_API_TOKEN`
- **Value**: 你的 Cloudflare API Token
- **获取方式**:
  1. 访问 https://dash.cloudflare.com/profile/api-tokens
  2. 点击 "Create Token"
  3. 选择 "Edit Cloudflare Workers" 模板
  4. 复制 Token（格式：`vss_xxxxxxxxxxxx`）

#### 2. CF_ACCOUNT_ID
- **Name**: `CF_ACCOUNT_ID`
- **Value**: `13e550aaade65849c7388c426644d2a4`
- **获取方式**: Cloudflare Dashboard 右侧显示

#### 3. WAVESPEED_API_KEY
- **Name**: `WAVESPEED_API_KEY`
- **Value**: `11ebcec02cb7387e06f5056f7e46223c075b477de48711cd506d62a5d1dea9a5`

---

## 检查步骤

### 1. 验证 Secrets 已设置
在 GitHub 仓库 → Settings → Secrets and variables → Actions
确认以下 Secret 存在：
- ✅ CF_API_TOKEN
- ✅ CF_ACCOUNT_ID
- ✅ WAVESPEED_API_KEY

### 2. 查看失败的构建日志
访问：https://github.com/zhuwei290/watermark-remover-cf/actions/runs/23294969123

查看具体错误信息

### 3. 重新触发部署
- 点击 "Re-run jobs"
- 或者推送新的 commit

---

## 常见问题

### ❌ 错误：Authentication failed
**原因**: CF_API_TOKEN 不正确或权限不足
**解决**: 重新创建 Token，确保选择 "Edit Cloudflare Workers" 权限

### ❌ 错误：Account not found
**原因**: 缺少 CF_ACCOUNT_ID 或 ID 错误
**解决**: 添加 CF_ACCOUNT_ID Secret，值为 `13e550aaade65849c7388c426644d2a4`

### ❌ 错误：wrangler not found
**原因**: wrangler 未正确安装
**解决**: 使用 cloudflare/wrangler-action@v3

---

## 测试部署

推送测试 commit：
```bash
echo "test" >> test.txt
git add test.txt
git commit -m "test: trigger deploy"
git push
```

查看 Actions 状态：
https://github.com/zhuwei290/watermark-remover-cf/actions
