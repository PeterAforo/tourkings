import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function logAdminAction(
  adminId: string,
  action: string,
  entity?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await db.adminActivityLog.create({
      data: {
        adminId,
        action,
        entity,
        entityId,
        metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (e) {
    logger.error("Admin activity log failed", "admin-log", e);
  }
}
