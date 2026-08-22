import { Resend } from "resend";
import { env } from "@/lib/env";

const resendKey = env.RESEND_API_KEY;
const resend = resendKey && resendKey !== "re_placeholder" ? new Resend(resendKey) : null;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendLeadNotification(lead: {
  customerName: string;
  customerEmail: string;
  moveFromCity: string;
  moveFromState: string;
  moveToCity: string;
  moveToState: string;
  agreedQuote?: number;
}) {
  // Email is best-effort: skip until a real RESEND_API_KEY is configured.
  if (!resend) {
    console.log("[Email] Skipping — RESEND_API_KEY not configured");
    return;
  }

  const name = escapeHtml(lead.customerName);
  const fromCity = escapeHtml(lead.moveFromCity);
  const fromState = escapeHtml(lead.moveFromState);
  const toCity = escapeHtml(lead.moveToCity);
  const toState = escapeHtml(lead.moveToState);
  const subject = `Your Moving Quote: ${fromCity} → ${toCity}`;

  try {
    await resend.emails.send({
      from: "Movers.help <notifications@movers.help>",
      to: lead.customerEmail,
      subject,
      html: `
        <h1>Your Moving Quote is Ready</h1>
        <p>Hi ${name},</p>
        <p>Here's a summary of your move from <strong>${fromCity}, ${fromState}</strong> to <strong>${toCity}, ${toState}</strong>:</p>
        ${lead.agreedQuote ? `<p><strong>Estimated Quote:</strong> $${lead.agreedQuote.toLocaleString()}</p>` : ""}
        <p>We'll connect you with verified movers in your area shortly.</p>
        <p>— The Movers.help Team</p>
      `,
    });
    console.log("[Email] Lead notification sent to", lead.customerEmail);
  } catch (error) {
    console.error("[Email] Failed to send notification:", error);
  }
}
