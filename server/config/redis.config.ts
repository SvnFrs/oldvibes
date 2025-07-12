import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || "0"),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (error) => {
  console.error("❌ Redis connection error:", error);
});

export { redis };
