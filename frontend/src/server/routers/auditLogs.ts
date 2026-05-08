import { z } from 'zod';
import { router, protectedProcedure, roleProcedure } from '../trpc';

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

const ownerProcedure = roleProcedure(["OWNER"]);

export const auditLogsRouter = router({
  list: ownerProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;
      const dbUser = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { branchId: true },
      });
      const branchId = dbUser?.branchId || 1;

      const [auditLogs, total] = await Promise.all([
        ctx.prisma.auditLog.findMany({
          where: { branchId },
          include: { user: { select: { username: true, fullName: true } } },
          orderBy: { createdAt: 'desc' },
          skip,
          take: input.pageSize,
        }),
        ctx.prisma.auditLog.count({ where: { branchId } }),
      ]);

      const items = auditLogs.map(log => ({
        id: log.id,
        user: log.user.username,
        action: log.action,
        details: log.details || `${log.entityType}${log.entityId ? ` (ID: ${log.entityId})` : ''}`,
        ip: log.ipAddress || 'N/A',
        time: formatTimeAgo(log.createdAt),
        entityType: log.entityType,
        entityId: log.entityId,
        oldValues: log.oldValues,
        newValues: log.newValues,
      }));

      return {
        items,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(total / input.pageSize),
      };
    }),

  create: protectedProcedure
    .input(z.object({
      action: z.string(),
      entityType: z.string(),
      entityId: z.number().optional().nullable(),
      details: z.string().optional().nullable(),
      oldValues: z.any().optional().nullable(),
      newValues: z.any().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbUser = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { branchId: true },
      });

      const auditLog = await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          oldValues: input.oldValues ?? undefined,
          newValues: input.newValues ?? undefined,
          details: input.details,
          ipAddress: ctx.req.headers.get('x-forwarded-for') || null,
          userAgent: ctx.req.headers.get('user-agent') || null,
          branchId: dbUser?.branchId || 1,
        },
      });

      return { message: "Audit log created", id: auditLog.id };
    }),
});
