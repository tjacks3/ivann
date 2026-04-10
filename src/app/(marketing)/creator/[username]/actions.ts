"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getPublicCreatorProfile(username: string) {
  const profile = await db.query.users.findFirst({
    where: and(
      eq(users.username, username),
      eq(users.role, "creator"),
      eq(users.profileStatus, "published"),
    ),
    with: {
      socialAccounts: true,
      packages: true,
    },
  });

  return profile ?? null;
}
