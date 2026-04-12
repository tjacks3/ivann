import { db } from "@/db";
import { notifications } from "@/db/schema";
import { resend } from "@/lib/email";
import { getEmailHtml } from "./email-templates";

interface NotificationData {
  userId: string;
  type: "collab_request" | "collab_update" | "message" | "system";
  title: string;
  body?: string;
  actionUrl?: string;
  referenceId?: string;
  referenceType?: string;
}

/**
 * Create an in-app notification.
 */
export async function createNotification(data: NotificationData) {
  await db.insert(notifications).values({
    userId: data.userId,
    type: data.type,
    title: data.title,
    body: data.body ?? null,
    actionUrl: data.actionUrl ?? null,
    referenceId: data.referenceId ?? null,
    referenceType: data.referenceType ?? null,
  });
}

/**
 * Create an in-app notification and send an email.
 * Email is fire-and-forget — failures are logged but don't block.
 */
export async function createAndEmail(
  data: NotificationData & { email: string; emailSubject?: string },
) {
  // Create in-app notification
  await createNotification(data);

  // Send email (non-blocking)
  const html = getEmailHtml(data.type, { title: data.title, body: data.body });
  resend
    .emails.send({
      from: "ivann <notifications@ivann.app>",
      to: data.email,
      subject: data.emailSubject ?? data.title,
      html,
    })
    .catch((err) => {
      console.error("Failed to send notification email:", err);
    });
}
