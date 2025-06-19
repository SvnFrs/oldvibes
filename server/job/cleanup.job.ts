import cron from "node-cron";
import { VibeModel } from "../models/vibe.models";

const vibeModel = new VibeModel();

export const setupCronJobs = () => {
  // Archive expired vibes every hour
  cron.schedule("0 * * * *", async () => {
    try {
      const archivedCount = await vibeModel.archiveExpiredVibes();
      console.log(`✅ Archived ${archivedCount} expired vibes`);
    } catch (error) {
      console.error("❌ Error archiving expired vibes:", error);
    }
  });

  console.log("⏰ Cleanup cron jobs scheduled");
};
