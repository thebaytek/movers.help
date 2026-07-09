import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export async function sendLeadNotification(lead: {
  customerName: string;
  customerEmail: string;
  moveFromCity: string;
  moveFromState: string;
  moveToCity: string;
  moveToState: string;
  agreedQuote?: number;
}) {
  // Only send if Resend is configured
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_placeholder") {
    console.log("[Email] Skipping — no RESEND_API_KEY configured");
    return;
  }

  try {
    await resend.emails.send({
      from: "Movers.help <notifications@movers.help>",
      to: lead.customerEmail,
      subject: `Your Moving Quote: ${lead.moveFromCity} → ${lead.moveToCity}`,
      html: `
        <h1>Your Moving Quote is Ready</h1>
        <p>Hi ${lead.customerName},</p>
        <p>Here's a summary of your move from <strong>${lead.moveFromCity}, ${lead.moveFromState}</strong> to <strong>${lead.moveToCity}, ${lead.moveToState}</strong>:</p>
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
