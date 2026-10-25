import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

const SENDER_EMAIL = process.env.GMAIL_USER || "inkless.onboarding@gmail.com";

export function getEmailTransporter(): Transporter | null {
  const user = SENDER_EMAIL;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!pass) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass: pass.replace(/\s+/g, ""), // strip any accidental spaces
      },
    });
  }

  return transporter;
}

export async function sendOtpEmail(to: string, otp: string): Promise<{ success: boolean; messageId?: string }> {
  const mailer = getEmailTransporter();

  // Development Fallback: if App Password is not yet set in .env.local, print in terminal so testing is never blocked
  if (!mailer) {
    console.warn(`\n[INKLESS OTP DEV FALLBACK] To: ${to} | Verification Code: ${otp}\n(Add GMAIL_APP_PASSWORD to .env.local to send live emails via ${SENDER_EMAIL})\n`);
    return { success: true, messageId: "dev-fallback" };
  }

  const info = await mailer.sendMail({
    from: `"Inkless Notebook" <${SENDER_EMAIL}>`,
    to,
    subject: "Inkless • Your Verification Code",
    text: `Your Inkless verification code is: ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="background-color: #f6efe2; padding: 40px 20px; font-family: 'Georgia', serif; color: #2c2520;">
        <div style="max-width: 480px; margin: 0 auto; background: #fffcf7; border: 1px solid #d4c5b0; border-radius: 12px; padding: 32px 28px; box-shadow: 0 4px 14px rgba(60,30,10,0.06);">
          <div style="text-align: center; border-bottom: 1px solid #e7dccf; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; color: #784628;">Inkless</h1>
            <p style="margin: 4px 0 0; font-size: 12px; color: #8c7b6c; font-style: italic;">The Living Notebook of Ephemeral Thoughts</p>
          </div>
          
          <h2 style="font-size: 18px; margin: 0 0 12px; color: #2c2520; font-weight: normal;">Confirm Your Quill</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #5c4f42; margin: 0 0 24px;">
            Enter the 6-digit verification code below to authenticate your identity and begin penning your thoughts:
          </p>

          <div style="text-align: center; margin: 28px 0; padding: 18px; background: #fbf5ea; border: 1.5px dashed #a8947f; border-radius: 8px;">
            <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2c2520;">
              ${otp}
            </span>
          </div>

          <p style="font-size: 12px; color: #8c7b6c; margin: 0 0 8px; text-align: center;">
            ⏳ This code will expire in <strong>5 minutes</strong>.
          </p>
          <p style="font-size: 11px; color: #a49483; margin: 0; text-align: center; font-style: italic;">
            If you did not request this verification code, you can safely disregard this scrap.
          </p>
        </div>
      </div>
    `,
  });

  return { success: true, messageId: info.messageId };
}
