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

      // 4. 获取发信人地址，如果未配置环境变量则抛出明显错误提示
      const fromEmail = env.FROM_EMAIL;
      if (!fromEmail) {
        return new Response(JSON.stringify({ error: "Configuration Error: FROM_EMAIL environment variable is not defined." }), { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      // 5. 转发请求给 Resend API
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail, // 动态使用环境变量
          to: Array.isArray(to) ? to : [to],
          subject: subject,
          text: text,
          html: html
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
