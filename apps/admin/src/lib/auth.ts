export function isAuthConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY,
  );
}

export function isAdmin(
  userId: string | null,
  allowlist = process.env.ADMIN_USER_IDS,
) {
  return Boolean(
    userId &&
      allowlist
        ?.split(",")
        .map((id) => id.trim())
        .filter(Boolean)
        .includes(userId),
  );
}
