// Envio de email pelo Resend (API HTTP, sem SDK).
// Envs: RESEND_API_KEY, EMAIL_FROM (ex.: "Yumi Mix <pedidos@yumimix.com.br>", domínio verificado no Resend).

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(msg: { to: string; subject: string; html: string; text: string }): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend respondeu ${res.status}: ${body.slice(0, 200)}`);
  }
}

/** Link universal de rastreio (Correios, Jadlog e outras). */
export function trackingUrl(code: string): string {
  return `https://www.melhorrastreio.com.br/rastreio/${encodeURIComponent(code)}`;
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Email "seu pedido foi enviado", no visual da loja (cartão branco sobre névoa, botão grafite em pílula). */
export function trackingEmail(o: {
  customerName: string;
  number: number;
  code: string;
  service: string | null;
  orderUrl: string | null;
}) {
  const firstName = o.customerName.trim().split(/\s+/)[0] ?? "";
  const url = trackingUrl(o.code);
  const subject = `Seu pedido #${o.number} foi enviado`;
  const text = [
    `Oi, ${firstName}!`,
    "",
    `Seu pedido #${o.number} da Yumi Mix já está a caminho${o.service ? ` (${o.service})` : ""}.`,
    `Código de rastreio: ${o.code}`,
    `Acompanhe: ${url}`,
    ...(o.orderUrl ? ["", `Detalhes do pedido: ${o.orderUrl}`] : []),
    "",
    "Obrigada pela compra!",
    "Yumi Mix",
  ].join("\n");

  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f5f5f3;font-family:Figtree,Helvetica,Arial,sans-serif;color:#17181c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f3;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:28px;padding:36px 32px">
<tr><td>
<p style="margin:0 0 24px;font-size:20px;font-weight:800;letter-spacing:-0.02em">Yumi <span style="color:#b8955a">Mix</span></p>
<h1 style="margin:0 0 12px;font-size:28px;line-height:1.1;font-weight:800;letter-spacing:-0.03em">Seu pedido está a caminho</h1>
<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#5c606a">Oi, ${escape(firstName)}! O pedido #${o.number} saiu daqui${o.service ? ` pela ${escape(o.service)}` : ""}. Use o código abaixo para acompanhar a entrega.</p>
<div style="background:#f5f5f3;border-radius:16px;padding:16px 20px;margin:0 0 24px">
<p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#5c606a">Código de rastreio</p>
<p style="margin:0;font-size:22px;font-weight:800;letter-spacing:0.04em;font-family:Menlo,Consolas,monospace">${escape(o.code)}</p>
</div>
<a href="${escape(url)}" style="display:inline-block;background:#17181c;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 26px;border-radius:999px">Acompanhar entrega</a>
${o.orderUrl ? `<p style="margin:24px 0 0;font-size:14px;color:#5c606a"><a href="${escape(o.orderUrl)}" style="color:#17181c">Ver detalhes do pedido</a></p>` : ""}
<p style="margin:32px 0 0;font-size:14px;color:#5c606a">Obrigada pela compra!<br>Yumi Mix</p>
</td></tr></table>
</td></tr></table></body></html>`;

  return { subject, text, html };
}
