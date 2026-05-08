import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { AuditService } from '@/lib/audit';
import { CustomerService } from '@/lib/customerService';

export const jobOrdersRouter = router({
  list: protectedProcedure
    .input(z.object({
      customer: z.string().optional(),
      status: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input.customer && input.customer.trim().length > 0) {
        where.customerName = { contains: input.customer.trim(), mode: "insensitive" };
      }
      if (input.status && input.status.trim().length > 0) {
        where.status = input.status.trim();
      }
      
      const items = await ctx.prisma.jobOrder.findMany({
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
            select: { name: true }
          }
        },
      });
      return items;
    }),

  consumers: protectedProcedure
    .query(async ({ ctx }) => {
      const rows = await ctx.prisma.jobOrder.findMany({
        distinct: ["customerName"],
        select: { customerName: true },
        orderBy: { customerName: "asc" },
      });
      const consumers = rows
        .map(r => r.customerName)
        .filter((v): v is string => typeof v === "string" && v.length > 0);
      return { consumers };
    }),

  nextSequence: protectedProcedure
    .input(z.object({ licensePlate: z.string() }))
    .query(async ({ ctx, input }) => {
      const cleanLicensePlate = input.licensePlate.replace(/[^a-zA-Z0-9ก-๙]/g, '');
      const existingJobs = await ctx.prisma.jobOrder.findMany({
        where: {
          jobNumber: {
            contains: `JOB-${cleanLicensePlate}-`,
            mode: "insensitive"
          }
        },
        select: { jobNumber: true }
      });

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

      return { nextSequence: maxSequence + 1 };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const jobOrder = await ctx.prisma.jobOrder.findUnique({
        where: { id: input.id },
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
          branch: { select: { name: true } },
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
      if (!jobOrder) throw new TRPCError({ code: 'NOT_FOUND', message: 'job order not found' });
      return jobOrder;
    }),

  create: protectedProcedure
    .input(z.object({
      jobNumber: z.string().min(1),
      customerName: z.string().min(1),
      phoneNumber: z.string().min(1),
      carType: z.string().min(1),
      licensePlate: z.string().min(1),
      issueDetail: z.string().optional(),
      jobDetail: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const customer = await CustomerService.findOrCreateCustomer({
        name: input.customerName,
        licensePlate: input.licensePlate,
        carType: input.carType,
        phoneNumber: input.phoneNumber,
      });

      try {
        const created = await ctx.prisma.jobOrder.create({
          data: {
            ...input,
            issueDetail: input.issueDetail ?? "",
            jobDetail: input.jobDetail ?? "",
            branchId: 1, // default branch
            customerId: customer.id,
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

        await AuditService.logCreate({
          userId: ctx.session.user.id,
          action: "CREATE_JOB_ORDER",
          entityType: "JobOrder",
          entityId: created.id,
          newValues: created,
          details: `Created job order: ${input.jobNumber} for ${input.customerName} (${input.licensePlate})`,
          ipAddress: ctx.req.headers.get('x-forwarded-for') || 'Unknown',
          userAgent: ctx.req.headers.get('user-agent') || 'Unknown',
          branchId: 1,
        });

        return { item: created };
      } catch (err: any) {
        if (err?.code === "P2002" && err.meta?.target?.includes('jobNumber')) {
          throw new TRPCError({ code: 'CONFLICT', message: "jobNumber already exists" });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "failed to create job order" });
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      jobNumber: z.string().optional(),
      customerName: z.string().optional(),
      phoneNumber: z.string().optional(),
      carType: z.string().optional(),
      licensePlate: z.string().optional(),
      issueDetail: z.string().optional(),
      jobDetail: z.string().optional(),
      status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      if (data.customerName !== undefined || data.licensePlate !== undefined || 
          data.carType !== undefined || data.phoneNumber !== undefined) {
        
        const currentJobOrder = await ctx.prisma.jobOrder.findUnique({
          where: { id },
          select: { customerName: true, licensePlate: true, carType: true, phoneNumber: true }
        });

        if (currentJobOrder) {
          const customer = await CustomerService.findOrCreateCustomer({
            name: data.customerName ?? currentJobOrder.customerName ?? '',
            licensePlate: data.licensePlate ?? currentJobOrder.licensePlate ?? '',
            carType: data.carType ?? currentJobOrder.carType ?? '',
            phoneNumber: data.phoneNumber ?? currentJobOrder.phoneNumber ?? '',
          });
          (data as any).customerId = customer.id;
        }
      }

      try {
        const updated = await ctx.prisma.jobOrder.update({
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
            branch: { select: { name: true } },
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
        return { item: updated };
      } catch (err: any) {
        if (err?.code === "P2002" && err.meta?.target?.includes('jobNumber')) {
          throw new TRPCError({ code: 'CONFLICT', message: "jobNumber already exists" });
        }
        if (err?.code === "P2025") {
          throw new TRPCError({ code: 'NOT_FOUND', message: "job order not found" });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "failed to update job order" });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.jobOrder.delete({ where: { id: input.id } });
        return { success: true };
      } catch (err: any) {
        if (err?.code === "P2025") throw new TRPCError({ code: 'NOT_FOUND', message: "job order not found" });
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "failed to delete job order" });
      }
    }),

  stockOut: protectedProcedure
    .input(z.object({
      id: z.number(),
      items: z.array(z.object({
        productId: z.number(),
        qty: z.number().positive(),
      })).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.prisma.$transaction(async (tx) => {
          const jobOrder = await tx.jobOrder.findUnique({ where: { id: input.id } });
          if (!jobOrder) throw new Error("job order not found");
          
          const affectedProducts: any[] = [];
          
          for (const item of input.items) {
            const product = await tx.product.findUnique({ where: { id: item.productId } });
            if (!product) throw new Error(`product ${item.productId} not found`);
            if (product.stockQuantity < item.qty) throw new Error(`not enough stock for ${product.sku}`);
            
            await tx.stockTransaction.create({
              data: {
                productId: item.productId,
                branchId: product.branchId,
                qtyChange: -item.qty,
                type: "SALE",
                reference: jobOrder.jobNumber,
                note: `Stock out for job order #${jobOrder.jobNumber}`,
                createdBy: ctx.session.user.id,
                jobOrderId: input.id,
                balanceAfter: product.stockQuantity - item.qty,
              },
            });

            const existing = await tx.jobOrderItem.findFirst({ where: { jobOrderId: input.id, productId: item.productId } });
            if (existing) {
              await tx.jobOrderItem.update({ where: { id: existing.id }, data: { qty: existing.qty + item.qty } });
            } else {
              await tx.jobOrderItem.create({
                data: {
                  jobOrderId: input.id,
                  productId: item.productId,
                  qty: item.qty,
                  unitPrice: product.sellPrice,
                },
              });
            }

            const updatedProduct = await tx.product.update({
              where: { id: item.productId },
              data: { stockQuantity: { decrement: item.qty } },
            });
            affectedProducts.push(updatedProduct);
          }

          if (jobOrder.status !== "IN_PROGRESS") {
            await tx.jobOrder.update({ where: { id: input.id }, data: { status: "IN_PROGRESS" } });
          }
          
          const updatedJobOrder = await tx.jobOrder.findUnique({ 
            where: { id: input.id },
            include: {
              items: { include: { product: { select: { id: true, name: true, sku: true, stockQuantity: true } } } }
            }
          });
          
          const issuedProducts = input.items.map(item => {
            const product = affectedProducts.find(p => p.id === item.productId);
            return {
              productId: item.productId,
              qtyIssued: item.qty,
              remainingStock: product ? product.stockQuantity : 0,
              product: product ? { sku: product.sku, name: product.name } : null,
            };
          });
          
          return { jobOrder: updatedJobOrder, products: affectedProducts, issuedProducts };
        });
        return result;
      } catch (err: any) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: err.message || "stock out failed" });
      }
    }),

  removeItem: protectedProcedure
    .input(z.object({
      id: z.number(),
      itemId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.prisma.$transaction(async (tx) => {
          const jobOrder = await tx.jobOrder.findUnique({ where: { id: input.id } });
          if (!jobOrder) throw new Error("job order not found");

          const jobItem = await tx.jobOrderItem.findUnique({
            where: { id: input.itemId },
            select: { id: true, qty: true, productId: true },
          });
          if (!jobItem) throw new Error("job order item not found");

          const belongs = await tx.jobOrderItem.findFirst({ where: { id: input.itemId, jobOrderId: input.id } });
          if (!belongs) throw new Error("item does not belong to this job order");

          const product = await tx.product.findUnique({ where: { id: jobItem.productId } });
          if (!product) throw new Error("product not found");

          const restored = await tx.product.update({
            where: { id: product.id },
            data: { stockQuantity: { increment: jobItem.qty } },
          });

          await tx.stockTransaction.create({
            data: {
              productId: product.id,
              branchId: product.branchId,
              qtyChange: jobItem.qty,
              type: "ADJUST",
              reference: jobOrder.jobNumber,
              note: `Remove consumed item from job order #${jobOrder.jobNumber}`,
              createdBy: ctx.session.user.id,
              jobOrderId: input.id,
              balanceAfter: restored.stockQuantity,
            },
          });

          await tx.jobOrderItem.delete({ where: { id: input.itemId } });

          const updatedJob = await tx.jobOrder.findUnique({
            where: { id: input.id },
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
        return result;
      } catch (err: any) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: err.message || "failed to remove item" });
      }
    }),

  complete: protectedProcedure
    .input(z.object({
      id: z.number(),
      paymentMethod: z.string(),
      totalAmount: z.number(),
      completedAt: z.string(),
      subtotal: z.number().optional(),
      laborCost: z.number().optional(),
      vatAmount: z.number().optional(),
      grandTotal: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const jobOrder = await ctx.prisma.jobOrder.findUnique({
          where: { id: input.id },
          select: { id: true, jobNumber: true, customerName: true, status: true, createdAt: true, branchId: true, customerId: true }
        });

        if (!jobOrder) throw new TRPCError({ code: 'NOT_FOUND', message: "Job order not found" });

        const bill = await ctx.prisma.bill.create({
          data: {
            billNumber: `BILL-${jobOrder.jobNumber}-${Date.now()}`,
            jobOrderId: input.id,
            customerId: jobOrder.customerId,
            branchId: jobOrder.branchId,
            status: "PAID",
            subtotal: input.subtotal || 0,
            laborCost: input.laborCost || 0,
            vatAmount: input.vatAmount || 0,
            grandTotal: input.grandTotal || input.totalAmount,
            paymentMethod: input.paymentMethod === 'PROMPTPAY' ? 'PROMPTPAY' : input.paymentMethod === 'CASH' ? 'CASH' : 'OTHER',
            paymentAmount: input.grandTotal || input.totalAmount,
            paymentStatus: "PAID",
            paidAt: new Date(),
            createdBy: ctx.session.user.id,
            notes: `Payment completed via ${input.paymentMethod}`,
          }
        });

        const updatedJobOrder = await ctx.prisma.jobOrder.update({
          where: { id: input.id },
          data: { status: "COMPLETED" },
          select: { id: true, jobNumber: true, customerName: true, status: true, createdAt: true }
        });

        return {
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
            method: input.paymentMethod,
            amount: input.grandTotal || input.totalAmount,
            completedAt: input.completedAt
          }
        };
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "failed to complete job order" });
      }
    }),

  getBill: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const bill = await ctx.prisma.bill.findFirst({
        where: { jobOrderId: input.id, status: "PAID" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true, billNumber: true, subtotal: true, laborCost: true,
          vatAmount: true, grandTotal: true, paymentMethod: true,
          paymentStatus: true, paidAt: true, createdAt: true
        }
      });
      if (!bill) throw new TRPCError({ code: 'NOT_FOUND', message: "No billing information found" });
      return { bill };
    }),
});
