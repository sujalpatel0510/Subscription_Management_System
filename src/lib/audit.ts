import prisma from './prisma';

export async function logAuditEvent({
  actorUserId,
  action,
  entityType,
  entityId,
  beforeJson,
  afterJson,
  requestId,
}: {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  beforeJson?: any;
  afterJson?: any;
  requestId?: string;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        action,
        entityType,
        entityId,
        beforeJson: beforeJson ? JSON.stringify(beforeJson) : null,
        afterJson: afterJson ? JSON.stringify(afterJson) : null,
        requestId: requestId ?? null,
      },
    });
  } catch (error) {
    console.error('Audit log write error:', error);
  }
}
