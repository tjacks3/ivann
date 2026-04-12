function layout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8f8f8;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;">
    <div style="background:#248232;padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">ivann</h1>
    </div>
    <div style="padding:32px;">
      ${content}
    </div>
    <div style="padding:16px 32px;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;color:#999;font-size:12px;">&copy; ${new Date().getFullYear()} ivann. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

const templates: Record<string, (params: { title: string; body?: string }) => string> = {
  collab_request: ({ title, body }) =>
    layout(`
      <h2 style="margin:0 0 12px;color:#040f0f;font-size:18px;">${title}</h2>
      ${body ? `<p style="margin:0 0 20px;color:#333;font-size:14px;line-height:1.5;">${body}</p>` : ""}
      <a href="https://ivann.app/collaborations" style="display:inline-block;background:#248232;color:#fff;text-decoration:none;padding:10px 24px;border-radius:20px;font-size:14px;font-weight:600;">View Request</a>
    `),

  collab_update: ({ title, body }) =>
    layout(`
      <h2 style="margin:0 0 12px;color:#040f0f;font-size:18px;">${title}</h2>
      ${body ? `<p style="margin:0 0 20px;color:#333;font-size:14px;line-height:1.5;">${body}</p>` : ""}
      <a href="https://ivann.app/collaborations" style="display:inline-block;background:#248232;color:#fff;text-decoration:none;padding:10px 24px;border-radius:20px;font-size:14px;font-weight:600;">View Collaborations</a>
    `),

  message: ({ title, body }) =>
    layout(`
      <h2 style="margin:0 0 12px;color:#040f0f;font-size:18px;">${title}</h2>
      ${body ? `<p style="margin:0 0 20px;color:#333;font-size:14px;line-height:1.5;">${body}</p>` : ""}
      <a href="https://ivann.app/messages" style="display:inline-block;background:#248232;color:#fff;text-decoration:none;padding:10px 24px;border-radius:20px;font-size:14px;font-weight:600;">View Messages</a>
    `),

  system: ({ title, body }) =>
    layout(`
      <h2 style="margin:0 0 12px;color:#040f0f;font-size:18px;">${title}</h2>
      ${body ? `<p style="margin:0 0 20px;color:#333;font-size:14px;line-height:1.5;">${body}</p>` : ""}
    `),
};

export function getEmailHtml(
  type: string,
  params: { title: string; body?: string },
): string {
  const template = templates[type] ?? templates.system;
  return template(params);
}
