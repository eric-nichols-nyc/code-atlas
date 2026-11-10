import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "./generated/prisma/client.js";

const globalForDb = globalThis as unknown as { prisma?: PrismaClient };

/** Call from server code only. No connection is made at import or build time. */
export function getDb(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Set DATABASE_URL to your Neon pooled connection string before using the database.",
    );
  }
  if (!globalForDb.prisma) {
    globalForDb.prisma = new PrismaClient({
      adapter: new PrismaNeon({
        connectionString,
        connectionTimeoutMillis: 4000,
        query_timeout: 4000,
        max: 5,
      }),
    });
  }
  return globalForDb.prisma;
}

export { PrismaClient } from "./generated/prisma/client.js";
