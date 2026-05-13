import "server-only";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail({
  to,
  name,
  inviterName,
  role,
  token,
}: {
  to: string;
  name: string;
  inviterName: string;
  role: string;
  token: string;
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const inviteUrl = `${appUrl}/invite/${token}`;
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  await resend.emails.send({
    from: "QiQ Portal <noreply@bedsxml.com>",
    to,
    subject: `You've been invited to the QiQ Quality Portal`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0e1a;color:#fff;padding:40px;border-radius:16px;">
        <div style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#f4a261;margin-bottom:24px;">
          Beds XML · QiQ Portal
        </div>
        <h1 style="font-size:24px;font-weight:600;margin:0 0 16px;">
          You've been invited
        </h1>
        <p style="color:#94a3b8;line-height:1.7;margin:0 0 8px;">
          Hi ${name},
        </p>
        <p style="color:#94a3b8;line-height:1.7;margin:0 0 24px;">
          <strong style="color:#fff;">${inviterName}</strong> has invited you to join the
          QiQ Operations Quality Portal as a <strong style="color:#fff;">${roleLabel}</strong>.
          Click below to set up your account — this link expires in 48 hours.
        </p>
        <a
          href="${inviteUrl}"
          style="display:inline-block;background:linear-gradient(135deg,#cd1f8d,#f4703a);color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;"
        >
          Accept Invitation
        </a>
        <p style="color:#475569;font-size:12px;margin-top:32px;">
          If you weren't expecting this invitation, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}