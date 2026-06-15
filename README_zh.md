# Cloudflare Email Gateway (中文文档)

[English](./README.md) | [中文](#cloudflare-email-gateway-中文文档)

---

一个运行在 Cloudflare Workers 边缘节点的轻量级邮件发信网关。基于 **Resend API** 构建，支持通过自定义域名安全、快速地对外发送交易或通知邮件。

## ✨ 项目特性
- **超低延迟**：部署在 Cloudflare 全球边缘节点，响应极快。
- **安全鉴权**：内置 Client Token 机制，防止接口被他人恶意盗刷。
- **配置分离**：完全通过环境变量控制发信人身份，代码无任何硬编码，方便开源复用。
- **全栈通用**：同时支持纯文本（Text）和富文本（HTML）混合格式。

---

## ⚙️ ☁️ 云端环境变量配置

代码成功部署到 Cloudflare Workers 后，需要在后台的 **Settings -> Variables（设置 -> 变量）** 中配置以下三个变量：

| 变量名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `RESEND_API_KEY` | **Secret (加密)** | 填写从 Resend 后台申请的 API 密钥。 |
| `CLIENT_TOKEN` | **Secret (加密)** | 自定义一个高强度的随机字符串，作为调用此接口时的 Bearer 鉴权令牌。 |
| `FROM_EMAIL` | **Variable (文本)** | 你的发信人展示文本与真实邮箱（例如：`通知机器人 <i@mydomain.com>`）。 |

---

## 🚀 API 调用示例

向你的 Worker 地址发送 `POST` 请求进行发信：

- **请求地址 (URL):** `https://<你的Worker名称>.<你的子域名>.workers.dev`
- **请求头 (Headers):**
  - `Content-Type: application/json`
  - `Authorization: Bearer <你配置的 CLIENT_TOKEN>`

- **请求体 (Body JSON):**
```json
{
  "to": "target_user@gmail.com",
  "subject": "系统报警通知",
  "text": "服务器运行状态正常。",
  "html": "<h1>系统通知</h1><p>服务器运行状态<strong>正常</strong>。</p>"
}
