import express from "express";
import { PrismaClient } from "@prisma/client";
import { sessionRequired } from "../middleware/session";
import { AuditService } from "../lib/audit";
import { CustomerService } from "../services/customerService";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     JobOrder:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         jobNumber:
 *           type: string
 *         customerName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         carType:
 *           type: string
 *         licensePlate:
 *           type: string
 *         issueDetail:
 *           type: string
 *         jobDetail:
 *           type: string
 *         status:
 *           type: string
 *           enum: [OPEN, IN_PROGRESS, COMPLETED, CANCELLED]
 *         createdAt:
 *           type: string
 *         branchId:
 *           type: integer
 *         branch:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/JobOrderItem'
 *     JobOrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         productId:
 *           type: integer
 *         quantity:
 *           type: integer
 *         unitPrice:
 *           type: number
 *         product:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             sku:
 *               type: string
 *     CreateJobOrderRequest:
 *       type: object
 *       required:
 *         - customerName
 *         - phoneNumber
 *         - carType
 *         - licensePlate
 *         - issueDetail
 *         - jobDetail
 *       properties:
 *         customerName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         carType:
 *           type: string
 *         licensePlate:
 *           type: string
 *         issueDetail:
 *           type: string
 *         jobDetail:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               unitPrice:
 *                 type: number
 *     UpdateJobOrderRequest:
 *       type: object
 *       properties:
 *         customerName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         carType:
 *           type: string
 *         licensePlate:
 *           type: string
 *         issueDetail:
 *           type: string
 *         jobDetail:
 *           type: string
 *         status:
 *           type: string
 *           enum: [OPEN, IN_PROGRESS, COMPLETED, CANCELLED]
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               unitPrice:
 *                 type: number
 */

/**
 * @swagger
 * /job-orders:
 *   get:
 *     summary: Get job orders list
 *     description: Retrieve job orders with optional filtering
 *     tags: [Job Orders]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: customer
 *         schema:
 *           type: string
 *         description: Filter by customer name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by job order status
 *     responses:
 *       200:
 *         description: Job orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobOrder'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// GET /job-orders?customer=&status=
router.get("/", sessionRequired, async (req, res) => {
  try {
    const customer = (req.query.customer as string | undefined)?.trim();
    const status = (req.query.status as string | undefined)?.trim();
    
    const where: any = {};
    if (customer && customer.length > 0) {
      where.customerName = { contains: customer, mode: "insensitive" };
    }
    if (status && status.length > 0) {
      where.status = status;
    }
    
    const items = await prisma.jobOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        jobNumber: true,
        customerName: true,
        phoneNumber: true,
        carType: true,
        licensePlate: true,
        issueDetail: true,
        jobDetail: true,
        status: true,
        createdAt: true,
        branchId: true,
        branch: {
          select: {
            name: true
          }
        }
      },
    });
    return res.json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "failed to fetch job orders" });
  }
});

// GET /job-orders/consumers  → distinct customerName for dropdown
router.get("/consumers", sessionRequired, async (_req, res) => {
  try {
    const rows = await prisma.jobOrder.findMany({
      distinct: ["customerName"],
      select: { customerName: true },
      orderBy: { customerName: "asc" },
    });
    const consumers = rows
      .map((r: { customerName: string | null }) => r.customerName)
      .filter((v: string | null): v is string => typeof v === "string" && v.length > 0);
    return res.json({ consumers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "failed to fetch consumers" });
  }
});

// GET /job-orders/next-sequence?licensePlate=abc123
router.get("/next-sequence", sessionRequired, async (req, res) => {
  try {
    const licensePlate = (req.query.licensePlate as string | undefined)?.trim();
    
    if (!licensePlate) {
      return res.status(400).json({ message: "licensePlate parameter is required" });
    }

    // Clean license plate (remove spaces and special characters)
    const cleanLicensePlate = licensePlate.replace(/[^a-zA-Z0-9ก-๙]/g, '');

    // Find all job orders with job numbers that match the pattern JOB-{licensePlate}-{number}
    const existingJobs = await prisma.jobOrder.findMany({
      where: {
        jobNumber: {
          contains: `JOB-${cleanLicensePlate}-`,
          mode: "insensitive"
        }
      },
      select: {
        jobNumber: true
      }
    });

    // Extract sequence numbers and find the highest one
    let maxSequence = 0;
    const pattern = new RegExp(`^JOB-${cleanLicensePlate}-(\\d+)$`, 'i');
    
    existingJobs.forEach(job => {
      const match = job.jobNumber.match(pattern);
      if (match) {
        const sequence = parseInt(match[1] ?? '0', 10);
        if (sequence > maxSequence) {
          maxSequence = sequence;
        }
      }
    });

    const nextSequence = maxSequence + 1;

    return res.json({ nextSequence });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "failed to generate next sequence" });
  }
});

// GET /job-orders/:id
router.get("/:id", sessionRequired, async (req, res) => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({ message: "missing id parameter" });
    }
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "invalid id" });
    }
    const jobOrder = await prisma.jobOrder.findUnique({
      where: { id },
      select: {
        id: true,
        jobNumber: true,
        customerName: true,
        phoneNumber: true,
        carType: true,
        licensePlate: true,
        issueDetail: true,
        jobDetail: true,
        status: true,
        createdAt: true,
        branchId: true,
        branch: {
          select: {
            name: true
          }
        },
        items: {
          select: {
            id: true,
            qty: true,
            product: { select: { id: true, name: true, sku: true } },
          },
          orderBy: { id: "asc" },
        },
      },
    });
    if (!jobOrder) {
      return res.status(404).json({ message: "job order not found" });
    }
    return res.json(jobOrder);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "failed to fetch job order detail" });
  }
});

// POST /job-orders
router.post("/", sessionRequired, async (req, res) => {
  try {
    const {
      jobNumber,
      customerName,
      phoneNumber,
      carType,
      licensePlate,
      issueDetail,
      jobDetail,
    } = req.body as {
      jobNumber: string;
      customerName: string;
      phoneNumber: string;
      carType: string;
      licensePlate: string;
      issueDetail?: string;
      jobDetail?: string;
    };

    if (!jobNumber || !customerName || !phoneNumber || !carType || !licensePlate) {
      return res.status(400).json({ message: "missing required fields" });
    }

    // หาหรือสร้างลูกค้าใหม่อัตโนมัติ
    const customer = await CustomerService.findOrCreateCustomer({
      name: customerName,
      licensePlate: licensePlate,
      carType: carType,
      phoneNumber: phoneNumber,
    });

    console.log(`🔍 JobOrder ใหม่: ลูกค้า ${customer.name} (${customer.licensePlate}) - Customer ID: ${customer.id}`);

    const created = await prisma.jobOrder.create({
      data: {
        jobNumber,
        customerName,
        phoneNumber,
        carType,
        licensePlate,
        issueDetail: issueDetail ?? "",
        jobDetail: jobDetail ?? "",
        branchId: 1, // default branch
        customerId: customer.id, // ใช้ customer ID ที่ถูกต้อง
      },
      select: {
        id: true,
        jobNumber: true,
        customerName: true,
        phoneNumber: true,
        carType: true,
        licensePlate: true,
        status: true,
        createdAt: true,
      },
    });

    // Log job order creation
    await AuditService.logCreate({
      userId: req.user?.id || 0,
      action: "CREATE_JOB_ORDER",
      entityType: "JobOrder",
      entityId: created.id,
      newValues: created,
      details: `Created job order: ${jobNumber} for ${customerName} (${licensePlate})`,
      ipAddress: req.ip || 'Unknown',
      userAgent: req.get('User-Agent') || 'Unknown',
      branchId: 1, // default branch for job orders
    });

    return res.status(201).json({ item: created });
  } catch (err: any) {
    if (err?.code === "P2002") {
      // Check which field caused the unique constraint violation
      if (err.meta?.target?.includes('jobNumber')) {
        return res.status(409).json({ message: "jobNumber already exists" });
      }
      // licensePlate is no longer unique, so this shouldn't happen
      return res.status(500).json({ message: "unexpected unique constraint violation" });
    }
    console.error(err);
    return res.status(500).json({ message: "failed to create job order" });
  }
});

// PUT /job-orders/:id
router.put("/:id", sessionRequired, async (req, res) => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({ message: "missing id parameter" });
    }
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "invalid id" });
    }

    console.log(`🔄 Backend: Updating JobOrder ID ${id}`);
    console.log(`🔄 Backend: Request body:`, req.body);

    const {
      jobNumber,
      customerName,
      phoneNumber,
      carType,
      licensePlate,
      issueDetail,
      jobDetail,
      status,
    } = req.body as {
      jobNumber?: string;
      customerName?: string;
      phoneNumber?: string;
      carType?: string;
      licensePlate?: string;
      issueDetail?: string;
      jobDetail?: string;
      status?: string;
    };

    const data: any = {};
    if (jobNumber !== undefined) data.jobNumber = jobNumber;
    if (customerName !== undefined) data.customerName = customerName;
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
    if (carType !== undefined) data.carType = carType;
    if (licensePlate !== undefined) data.licensePlate = licensePlate;
    if (issueDetail !== undefined) data.issueDetail = issueDetail;
    if (jobDetail !== undefined) data.jobDetail = jobDetail;
    if (status !== undefined) data.status = status;

    // ถ้ามีการเปลี่ยนแปลงข้อมูลลูกค้า ให้อัพเดท customerId
    if (customerName !== undefined || licensePlate !== undefined || 
        carType !== undefined || phoneNumber !== undefined) {
      
      // ดึงข้อมูล JobOrder ปัจจุบัน
      const currentJobOrder = await prisma.jobOrder.findUnique({
        where: { id },
        select: { customerName: true, licensePlate: true, carType: true, phoneNumber: true }
      });

      if (currentJobOrder) {
        const customer = await CustomerService.findOrCreateCustomer({
          name: customerName ?? currentJobOrder.customerName ?? '',
          licensePlate: licensePlate ?? currentJobOrder.licensePlate ?? '',
          carType: carType ?? currentJobOrder.carType ?? '',
          phoneNumber: phoneNumber ?? currentJobOrder.phoneNumber ?? '',
        });
        
        data.customerId = customer.id;
        console.log(`🔄 อัพเดท JobOrder ${id}: Customer ID -> ${customer.id} (${customer.name})`);
      }
    }

    console.log(`🔄 Backend: Data to update:`, data);
    
    const updated = await prisma.jobOrder.update({
      where: { id },
      data,
      select: {
        id: true,
        jobNumber: true,
        customerName: true,
        phoneNumber: true,
        carType: true,
        licensePlate: true,
        issueDetail: true,
        jobDetail: true,
        status: true,
        createdAt: true,
        branchId: true,
        branch: {
          select: {
            name: true
          }
        },
        items: {
          select: {
            id: true,
            qty: true,
            product: { select: { id: true, name: true, sku: true } },
          },
          orderBy: { id: "asc" },
        },
      },
    });
    
    console.log(`🔄 Backend: JobOrder updated successfully:`, updated);
    console.log(`🔄 Backend: Updated issueDetail:`, updated.issueDetail);
    console.log(`🔄 Backend: Updated jobDetail:`, updated.jobDetail);
    console.log(`🔄 Backend: Full response data:`, { item: updated });
    return res.json({ item: updated });
  } catch (err: any) {
    if (err?.code === "P2002") {
      // Check which field caused the unique constraint violation
      if (err.meta?.target?.includes('jobNumber')) {
        return res.status(409).json({ message: "jobNumber already exists" });
      }
      // licensePlate is no longer unique, so this shouldn't happen
      return res.status(500).json({ message: "unexpected unique constraint violation" });
    }
    if (err?.code === "P2025") {
      return res.status(404).json({ message: "job order not found" });
    }
    console.error(err);
    return res.status(500).json({ message: "failed to update job order" });
  }
});

// DELETE /job-orders/:id
router.delete("/:id", sessionRequired, async (req, res) => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({ message: "missing id parameter" });
    }
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "invalid id" });
    }

    await prisma.jobOrder.delete({
      where: { id },
    });
    return res.json({ message: "job order deleted" });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return res.status(404).json({ message: "job order not found" });
    }
    console.error(err);
    return res.status(500).json({ message: "failed to delete job order" });
  }
});

// POST /job-orders/:id/stock-out
router.post("/:id/stock-out", sessionRequired, async (req, res) => {
  const idParam = req.params.id;
  if (!idParam) return res.status(400).json({ message: "missing id parameter" });
  const jobOrderId = parseInt(idParam, 10);
  if (isNaN(jobOrderId)) return res.status(400).json({ message: "invalid id" });
  const items = req.body?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items required" });
  }
  try {
    const result = await prisma.$transaction(async (tx) => {
      const jobOrder = await tx.jobOrder.findUnique({ where: { id: jobOrderId } });
      if (!jobOrder) throw new Error("job order not found");
      const affectedProducts: Array<{ id: number; stockQuantity: number }> = [];
      for (const item of items) {
        const { productId, qty } = item;
        if (!productId || typeof qty !== "number" || qty <= 0) {
          throw new Error("invalid productId or qty");
        }
        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product) throw new Error(`product ${productId} not found`);
        if (product.stockQuantity < qty) throw new Error(`not enough stock for ${product.sku}`);
        // Create StockTransaction
        try {
          await tx.stockTransaction.create({
            data: {
              productId,
              branchId: product.branchId,
              qtyChange: -qty,
              type: "SALE",
              reference: jobOrder.jobNumber,
              note: `Stock out for job order #${jobOrder.jobNumber}`,
              createdBy: req.user?.id ?? null,
              jobOrderId,
              balanceAfter: product.stockQuantity - qty,
            },
          });
        } catch (error: any) {
          console.error("Error creating StockTransaction:", {
            productId,
            branchId: product.branchId,
            qtyChange: -qty,
            type: "SALE",
            reference: jobOrder.jobNumber,
            note: `Stock out for job order #${jobOrder.jobNumber}`,
            createdBy: req.user?.id ?? null,
            jobOrderId,
            balanceAfter: product.stockQuantity - qty,
            error: error
          });
          throw new Error(`Failed to create stock transaction: ${error.message}`);
        }
        // Create or update JobOrderItem
        const existing = await tx.jobOrderItem.findFirst({ where: { jobOrderId, productId } });
        if (existing) {
          await tx.jobOrderItem.update({ where: { id: existing.id }, data: { qty: existing.qty + qty } });
        } else {
          try {
            await tx.jobOrderItem.create({
              data: {
                jobOrderId,
                productId,
                qty,
                unitPrice: product.sellPrice,
              },
            });
          } catch (error: any) {
            console.error("Error creating JobOrderItem:", {
              jobOrderId,
              productId,
              qty,
              unitPrice: product.sellPrice,
              error: error
            });
            throw new Error(`Failed to create job order item: ${error.message}`);
          }
        }
        // Update product stock
        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: { stockQuantity: { decrement: qty } },
        });
        affectedProducts.push(updatedProduct);
      }
      // Update job order status if not IN_PROGRESS
      if (jobOrder.status !== "IN_PROGRESS") {
        await tx.jobOrder.update({ where: { id: jobOrderId }, data: { status: "IN_PROGRESS" } });
      }
      
      // Get updated job order with items
      const updatedJobOrder = await tx.jobOrder.findUnique({ 
        where: { id: jobOrderId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  stockQuantity: true,
                }
              }
            }
          }
        }
      });
      
      // Create issuedProducts array with remaining stock info
      const issuedProducts = items.map(item => {
        const product = affectedProducts.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          qtyIssued: item.qty,
          remainingStock: product ? product.stockQuantity : 0
        };
      });
      
      return { 
        jobOrder: updatedJobOrder, 
        products: affectedProducts,
        issuedProducts 
      };
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "stock out failed" });
  }
});

// DELETE /job-orders/:id/items/:itemId
router.delete("/:id/items/:itemId", sessionRequired, async (req, res) => {
  const idParam = req.params.id;
  const itemIdParam = req.params.itemId;
  if (!idParam || !itemIdParam) return res.status(400).json({ message: "missing id parameter" });
  const jobOrderId = parseInt(idParam, 10);
  const itemId = parseInt(itemIdParam, 10);
  if (isNaN(jobOrderId) || isNaN(itemId)) return res.status(400).json({ message: "invalid id" });
  try {
    const result = await prisma.$transaction(async (tx) => {
      const jobOrder = await tx.jobOrder.findUnique({ where: { id: jobOrderId } });
      if (!jobOrder) throw new Error("job order not found");

      const jobItem = await tx.jobOrderItem.findUnique({
        where: { id: itemId },
        select: { id: true, qty: true, productId: true },
      });
      if (!jobItem) throw new Error("job order item not found");

      // Ensure item belongs to this job order
      const belongs = await tx.jobOrderItem.findFirst({ where: { id: itemId, jobOrderId } });
      if (!belongs) throw new Error("item does not belong to this job order");

      const product = await tx.product.findUnique({ where: { id: jobItem.productId } });
      if (!product) throw new Error("product not found");

      // Restore stock
      const restored = await tx.product.update({
        where: { id: product.id },
        data: { stockQuantity: { increment: jobItem.qty } },
      });

      // Record adjustment transaction
      await tx.stockTransaction.create({
        data: {
          productId: product.id,
          branchId: product.branchId,
          qtyChange: jobItem.qty, // add back
          type: "ADJUST",
          reference: jobOrder.jobNumber,
          note: `Remove consumed item from job order #${jobOrder.jobNumber}`,
          createdBy: req.user?.id ?? null,
          jobOrderId,
          balanceAfter: restored.stockQuantity,
        },
      });

      // Delete the job order item
      await tx.jobOrderItem.delete({ where: { id: itemId } });

      // Return updated job order with items for history refresh
      const updatedJob = await tx.jobOrder.findUnique({
        where: { id: jobOrderId },
        select: {
          id: true,
          jobNumber: true,
          items: {
            select: { id: true, qty: true, product: { select: { id: true, name: true, sku: true } } },
            orderBy: { id: "asc" },
          },
        },
      });

      return { jobOrder: updatedJob, product: restored };
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "failed to remove item" });
  }
});

// PATCH /job-orders/:id/complete
router.patch("/:id/complete", sessionRequired, async (req, res) => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({ message: "missing id parameter" });
    }
    
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "invalid id" });
    }

    const { 
      paymentMethod, 
      totalAmount, 
      completedAt,
      subtotal,
      laborCost,
      vatAmount,
      grandTotal
    } = req.body as {
      paymentMethod: string;
      totalAmount: number;
      completedAt: string;
      subtotal?: number;
      laborCost?: number;
      vatAmount?: number;
      grandTotal?: number;
    };

    console.log("Completing job order:", { 
      id, 
      paymentMethod, 
      totalAmount, 
      completedAt,
      subtotal,
      laborCost,
      vatAmount,
      grandTotal
    });

    // Get job order details first to get branchId
    const jobOrder = await prisma.jobOrder.findUnique({
      where: { id },
      select: {
        id: true,
        jobNumber: true,
        customerName: true,
        status: true,
        createdAt: true,
        branchId: true
      }
    });

    if (!jobOrder) {
      return res.status(404).json({ message: "Job order not found" });
    }

    // Get customer and branch info for creating bill
    const jobOrderWithDetails = await prisma.jobOrder.findUnique({
      where: { id },
      select: {
        id: true,
        customerId: true,
        branchId: true,
        customerName: true,
        jobNumber: true
      }
    });

    if (!jobOrderWithDetails) {
      return res.status(404).json({ message: "Job order not found" });
    }

    // Create Bill with financial data
    const bill = await prisma.bill.create({
      data: {
        billNumber: `BILL-${jobOrderWithDetails.jobNumber}-${Date.now()}`,
        jobOrderId: id,
        customerId: jobOrderWithDetails.customerId,
        branchId: jobOrderWithDetails.branchId,
        status: "PAID",
        subtotal: subtotal || 0,
        laborCost: laborCost || 0,
        vatAmount: vatAmount || 0,
        grandTotal: grandTotal || totalAmount,
        paymentMethod: paymentMethod === 'PROMPTPAY' ? 'PROMPTPAY' : paymentMethod === 'CASH' ? 'CASH' : 'OTHER',
        paymentAmount: grandTotal || totalAmount,
        paymentStatus: "PAID",
        paidAt: new Date(),
        createdBy: (req as any).user?.id || 1, // Get user ID from session
        notes: `Payment completed via ${paymentMethod}`,
      }
    });

    // Update job order status to COMPLETED
    const updatedJobOrder = await prisma.jobOrder.update({
      where: { id },
      data: {
        status: "COMPLETED",
      },
      select: {
        id: true,
        jobNumber: true,
        customerName: true,
        status: true,
        createdAt: true
      }
    });

    console.log("Job order completed:", updatedJobOrder);

    // Note: Removed StockTransaction creation to avoid potential issues
    // The job order completion is sufficient for tracking purposes

    return res.json({
      message: "Job order completed successfully",
      jobOrder: updatedJobOrder,
      bill: {
        id: bill.id,
        billNumber: bill.billNumber,
        subtotal: bill.subtotal,
        laborCost: bill.laborCost,
        vatAmount: bill.vatAmount,
        grandTotal: bill.grandTotal,
        paymentMethod: bill.paymentMethod,
        paymentStatus: bill.paymentStatus,
        paidAt: bill.paidAt
      },
      paymentInfo: {
        method: paymentMethod,
        amount: grandTotal || totalAmount,
        completedAt: completedAt
      }
    });

  } catch (err: any) {
    console.error("Error completing job order:", err);
    return res.status(500).json({ message: "failed to complete job order", error: err?.message || "Unknown error" });
  }
});

// GET /job-orders/:id/bill - Get billing information for a job order
router.get("/:id/bill", sessionRequired, async (req, res) => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({ message: "missing id parameter" });
    }
    
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "invalid id" });
    }

    // Get the latest bill for this job order
    const bill = await prisma.bill.findFirst({
      where: { 
        jobOrderId: id,
        status: "PAID" // Only get paid bills
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        billNumber: true,
        subtotal: true,
        laborCost: true,
        vatAmount: true,
        grandTotal: true,
        paymentMethod: true,
        paymentStatus: true,
        paidAt: true,
        createdAt: true
      }
    });

    if (!bill) {
      return res.status(404).json({ message: "No billing information found for this job order" });
    }

    return res.json({ bill });
  } catch (err: any) {
    console.error("Error fetching job order billing:", err);
    return res.status(500).json({ message: "failed to fetch billing information", error: err?.message || "Unknown error" });
  }
});

export default router;


