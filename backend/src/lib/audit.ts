import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogData {
  userId: number;
  action: string;
  entityType: string;
  entityId?: number | null;
  oldValues?: any;
  newValues?: any;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  branchId: number;
}

export class AuditService {
  // เก็บ log การสร้าง entity ใหม่
  static async logCreate(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId ?? null,
          newValues: data.newValues ?? null,
          details: data.details ?? null,
          ipAddress: data.ipAddress ?? null,
          userAgent: data.userAgent ?? null,
          branchId: data.branchId,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // ไม่ throw error เพื่อไม่ให้กระทบการทำงานหลัก
    }
  }

  // เก็บ log การอัพเดท entity
  static async logUpdate(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId ?? null,
          oldValues: data.oldValues ?? null,
          newValues: data.newValues ?? null,
          details: data.details ?? null,
          ipAddress: data.ipAddress ?? null,
          userAgent: data.userAgent ?? null,
          branchId: data.branchId,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  // เก็บ log การลบ entity
  static async logDelete(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId ?? null,
          oldValues: data.oldValues ?? null,
          details: data.details ?? null,
          ipAddress: data.ipAddress ?? null,
          userAgent: data.userAgent ?? null,
          branchId: data.branchId,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  // เก็บ log การทำงานทั่วไป
  static async logAction(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId ?? null,
          details: data.details ?? null,
          ipAddress: data.ipAddress ?? null,
          userAgent: data.userAgent ?? null,
          branchId: data.branchId,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  // เก็บ log การ login/logout
  static async logAuth(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: 'AUTH',
          details: data.details ?? null,
          ipAddress: data.ipAddress ?? null,
          userAgent: data.userAgent ?? null,
          branchId: data.branchId,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }
}
