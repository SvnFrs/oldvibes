import crypto from "crypto";
import { redis } from "../config/redis.config";
import { emailService } from "./email.services";

class VerificationService {
  private readonly VERIFICATION_PREFIX = "verification:";
  private readonly EXPIRY_HOURS = 24;

  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  async storeVerificationToken(
    email: string,
    token: string,
    userData: { userId: string; name: string },
  ): Promise<void> {
    const key = `${this.VERIFICATION_PREFIX}${token}`;
    const data = JSON.stringify({ email, ...userData });

    // Store with 24 hour expiry
    await redis.setex(key, this.EXPIRY_HOURS * 60 * 60, data);
  }

  async getVerificationData(token: string): Promise<{
    email: string;
    userId: string;
    name: string;
  } | null> {
    const key = `${this.VERIFICATION_PREFIX}${token}`;
    const data = await redis.get(key);

    if (!data) return null;

    return JSON.parse(data);
  }

  async deleteVerificationToken(token: string): Promise<void> {
    const key = `${this.VERIFICATION_PREFIX}${token}`;
    await redis.del(key);
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    userId: string,
  ): Promise<string> {
    const token = this.generateVerificationToken();

    await this.storeVerificationToken(email, token, { userId, name });
    await emailService.sendVerificationEmail(email, name, token);

    return token;
  }

  async verifyEmail(token: string): Promise<{
    success: boolean;
    userId?: string;
    email?: string;
    message: string;
  }> {
    const verificationData = await this.getVerificationData(token);

    if (!verificationData) {
      return {
        success: false,
        message: "Invalid or expired verification token",
      };
    }

    // Delete the token after successful verification
    await this.deleteVerificationToken(token);

    return {
      success: true,
      userId: verificationData.userId,
      email: verificationData.email,
      message: "Email verified successfully",
    };
  }
}

export const verificationService = new VerificationService();
