import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    verificationToken: string,
  ): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button {
            display: inline-block;
            background: #4f46e5;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Old Vibes! 🌊</h1>
          </div>
          <div class="content">
            <h2>Hi ${name}!</h2>
            <p>Thanks for joining Old Vibes - the community for sharing and discovering amazing secondhand items.</p>
            <p>To start posting vibes, liking items, and connecting with other users, please verify your email address by clicking the button below:</p>

            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>

            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${verificationUrl}
            </p>

            <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>

            <p>If you didn't create an account with Old Vibes, you can safely ignore this email.</p>

            <p>Happy vibing!<br>The Old Vibes Team</p>
          </div>
          <div class="footer">
            <p>This email was sent from Old Vibes. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Welcome to Old Vibes!

      Hi ${name}!

      Thanks for joining Old Vibes - the community for sharing and discovering amazing secondhand items.

      To start posting vibes, liking items, and connecting with other users, please verify your email address by visiting this link:

      ${verificationUrl}

      Important: This verification link will expire in 24 hours for security reasons.

      If you didn't create an account with Old Vibes, you can safely ignore this email.

      Happy vibing!
      The Old Vibes Team
    `;

    await this.transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Verify your Old Vibes account",
      text: textContent,
      html: htmlContent,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verified! 🎉</h1>
          </div>
          <div class="content">
            <h2>Welcome to Old Vibes, ${name}!</h2>
            <p>Your email has been successfully verified. You can now:</p>
            <ul>
              <li>📸 Post your old vibes for sale</li>
              <li>❤️ Like amazing secondhand finds</li>
              <li>💬 Comment on items you're interested in</li>
              <li>👥 Follow other vintage enthusiasts</li>
            </ul>
            <p>Start exploring and sharing your old vibes today!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Welcome to Old Vibes - Email Verified!",
      html: htmlContent,
    });
  }
}

export const emailService = new EmailService();
