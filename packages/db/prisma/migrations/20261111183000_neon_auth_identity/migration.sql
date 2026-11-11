-- Rename the identity field without deleting application data.
-- Legacy development records are reset separately, only on the migration branch.
ALTER TABLE "User" RENAME COLUMN "clerkUserId" TO "neonUserId";
ALTER INDEX "User_clerkUserId_key" RENAME TO "User_neonUserId_key";
