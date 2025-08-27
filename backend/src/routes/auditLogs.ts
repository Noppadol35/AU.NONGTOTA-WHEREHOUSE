import express from "express";
import { PrismaClient } from "@prisma/client";
import { sessionRequired, requireRole } from "../middleware/session";

const router = express.Router();
const prisma = new PrismaClient();

// GET /audit-logs - ดึง audit logs จริงจาก database
router.get("/", sessionRequired, requireRole(["OWNER"]), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;
    const skip = (page - 1) * pageSize;

    // ดึง audit logs จาก database
    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: {
          branchId: req.user?.branchId || 1,
        },
        include: {
          user: {
            select: {
              username: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      prisma.auditLog.count({
        where: {
          branchId: req.user?.branchId || 1,
        },
      }),
    ]);

    // แปลงข้อมูลให้ตรงกับ frontend
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

    res.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

// POST /audit-logs - สำหรับเก็บ log จากระบบอื่นๆ
router.post("/", sessionRequired, async (req, res) => {
  try {
    const { action, entityType, entityId, details, oldValues, newValues } = req.body;
    
    if (!action || !entityType) {
      return res.status(400).json({ message: "Action and entityType are required" });
    }

    const auditLog = await prisma.auditLog.create({
      data: {
        userId: req.user?.id || 0,
        action,
        entityType,
        entityId,
        oldValues,
        newValues,
        details,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
        branchId: req.user?.branchId || 1,
      },
    });

    res.status(201).json({ message: "Audit log created", id: auditLog.id });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    res.status(500).json({ message: "Failed to create audit log" });
  }
});

// Helper function สำหรับแปลงเวลา
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

export default router;
