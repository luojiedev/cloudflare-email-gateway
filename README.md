# Cloudflare Email Gateway

一个运行在 Cloudflare Workers 边缘节点的轻量级邮件发信网关。基于 **Resend API** 构建，支持通过自定义域名安全、快速地对外发送交易或通知邮件。

## ✨ 特性
- **超低延迟**：部署在 Cloudflare 全球边缘节点。
- **安全鉴权**：内置 Client Token 机制，防止接口被恶意盗刷。
- **全栈通用**：支持纯文本（Text）和富文本（HTML）混合格式。

## ⚙️ 部署与配置

### 1. 云端环境变量配置
代码成功部署到 Cloudflare Workers 后，需要在 Worker 的 **Settings -> Variables** 中配置以下两个环境变量：

| 变量名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `RESEND_API_KEY` | **Secret (加密)** | 填写从 Resend 后台申请的 API 密钥 |
| `CLIENT_TOKEN` | **Secret (加密)** | 自定义一个高强度的随机字符串，作为调用你此 Worker 时的鉴权令牌 |

### 2. API 调用方式

向你的 Worker 地址发送 `POST` 请求：

- **URL:** `https://email-gateway.<你的子域名>.workers.dev`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <你配置的 CLIENT_TOKEN>`

- **Body 示例 (JSON):**
```json
{
  "to": "target_user@gmail.com",
  "subject": "系统报警通知",
  "text": "服务器运行状态正常。",
  "html": "<h1>系统通知</h1><p>服务器运行状态<strong>正常</strong>。</p>"
}
