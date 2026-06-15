export default {
  async fetch(request, env, ctx) {
    // 1. 限制只允许 POST 请求
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      // 2. 安全鉴权：检查请求头中的 Authorization 令牌
      const authHeader = request.headers.get("Authorization");
      // 本地开发如果没有配置 CLIENT_TOKEN，则跳过鉴权方便调试
      if (env.CLIENT_TOKEN && authHeader !== `Bearer ${env.CLIENT_TOKEN}`) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }

      // 3. 解析请求体
      const { to, subject, text, html } = await request.json();
      if (!to || !subject || (!text && !html)) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // 4. 转发请求给 Resend API
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Notification <i@mydomain.com>", // 替换为你的真实发信地址
          to: Array.isArray(to) ? to : [to],
          subject: subject,
          text: text,
          html: html // 支持发送富文本 HTML 邮件
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return new Response(JSON.stringify({ success: true, id: data.id }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response(JSON.stringify({ success: false, error: data }), {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        });
      }

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
};
