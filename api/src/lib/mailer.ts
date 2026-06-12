import nodemailer from "nodemailer";
import { env } from "../env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: env.SMTP_SECURE === "true",
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

type SendMailOptions = {
  to: string;
  title: string;
  body: string;
};

export async function sendMail({ to, title, body }: SendMailOptions) {
  await transporter.sendMail({
    from: env.SMTP_USER,
    to,
    subject: title,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:40px 16px;background:#0a0a0a;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;max-width:520px;width:100%;">
        <tr><td style="padding:28px 36px;border-bottom:1px solid #222;text-align:center;">
          <span style="font-size:20px;font-weight:bold;color:#fff;letter-spacing:0.05em;">Laïla Music</span>
        </td></tr>
        <tr><td style="padding:36px;">
          <h1 style="margin:0 0 20px;font-size:20px;color:#fff;">${title}</h1>
          <div style="font-size:15px;line-height:1.7;color:#aaa;">${body}</div>
        </td></tr>
        <tr><td style="padding:20px 36px;border-top:1px solid #222;text-align:center;">
          <p style="margin:0;font-size:12px;color:#555;">© ${new Date().getFullYear()} Laïla Music</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendMailSafe(options: SendMailOptions): Promise<void> {
  try {
    console.log("🚀🚀🚀 sendMailSafe -> ", options);
    const res = await sendMail(options);
    console.log("🚀🚀🚀 res -> ", res);
  } catch (err) {
    console.error(`[mailer] Échec envoi à ${options.to}:`, err);
  }
}
