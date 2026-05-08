import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { AuditService } from '@/lib/audit';

async function computeNextSku(ctx: any, prefixRaw: string): Promise<string> {
  const prefix = prefixRaw.toUpperCase();
  const candidates = await ctx.prisma.product.findMany({
    where: { sku: { startsWith: prefix } },
    select: { sku: true },
    orderBy: { sku: 'desc' },
    take: 50,
  });
  let maxNum = 0;
  for (const c of candidates) {
    const m = c.sku.match(/^(.*?)(\d{4})$/);
    if (m && m[1] === prefix) {
      const n = Number(m[2]);
      if (Number.isFinite(n)) maxNum = Math.max(maxNum, n);
    }
  }
  const next = Math.min(maxNum + 1, 9999);
  return `${prefix}${String(next).padStart(4, '0')}`;
}

export const productsRouter = router({
  list: protectedProcedure
    .input(z.object({
      q: z.string().optional(),
      categoryId: z.number().optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
      lowStock: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = { isDeleted: false };
      
      if (input.q && input.q.trim().length > 0) {
        where.OR = [
          { name: { contains: input.q, mode: "insensitive" } },
          { sku: { contains: input.q, mode: "insensitive" } },
          { barcode: { contains: input.q, mode: "insensitive" } },
          { description: { contains: input.q, mode: "insensitive" } },
        ];
      }
      if (input.categoryId) {
        where.categoryId = input.categoryId;
      }
      if (input.lowStock) {
        where.stockQuantity = { lte: ctx.prisma.product.fields.minStockLevel };
      }

      const skip = (input.page - 1) * input.pageSize;
      const take = input.pageSize;

      const [rawItems, total] = await Promise.all([
        ctx.prisma.product.findMany({
          where,
          include: {
            category: { select: { id: true, name: true } },
            branch: { select: { id: true, name: true } },
          },
          orderBy: { sku: "asc" },
          skip,
          take,
        }),
        ctx.prisma.product.count({ where }),
      ]);

      const dbUser = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });
      const isOwner = dbUser?.role === "OWNER";
      
      const items = isOwner
        ? rawItems
        : rawItems.map((it: any) => ({ ...it, costPrice: undefined }));

      return { items, total, page: input.page, pageSize: take };
    }),

  create: protectedProcedure
    .input(z.object({
      sku: z.string().optional(),
      barcode: z.string().optional(),
      name: z.string().min(1),
      description: z.string().nullable().optional(),
      categoryId: z.number().nullable().optional(),
      costPrice: z.number().min(0),
      sellPrice: z.number().min(0),
      minStockLevel: z.number().min(0).optional(),
      branchId: z.number(),
      stockQuantity: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      let skuFinal: string | null = null;
      if (input.sku && /^[A-Za-z0-9]{1,6}$/.test(input.sku)) {
        skuFinal = await computeNextSku(ctx, input.sku);
      } else if (input.sku && /^[A-Za-z0-9]{1,6}\d{4}$/.test(input.sku)) {
        skuFinal = input.sku.toUpperCase();
      } else if (!input.sku) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "sku (prefix up to 6 chars) is required" });
      } else {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "invalid sku format" });
      }

      if (input.barcode) {
        const existingBarcode = await ctx.prisma.product.findUnique({
          where: { barcode: input.barcode.trim() }
        });
        if (existingBarcode) {
          throw new TRPCError({ code: 'CONFLICT', message: "barcode already exists" });
        }
      }

      try {
        const created = await ctx.prisma.product.create({
          data: {
            sku: skuFinal,
            barcode: input.barcode?.trim() || null,
            name: input.name,
            description: input.description ?? null,
            categoryId: input.categoryId ?? null,
            costPrice: input.costPrice,
            sellPrice: input.sellPrice,
            minStockLevel: input.minStockLevel ?? 1,
            branchId: input.branchId,
            stockQuantity: input.stockQuantity ?? 0,
          },
          include: {
            category: { select: { id: true, name: true } },
            branch: { select: { id: true, name: true } },
          },
        });

        const dbUser = await ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { role: true, branchId: true },
        });

        await AuditService.logCreate({
          userId: ctx.session.user.id,
          action: "CREATE_PRODUCT",
          entityType: "Product",
          entityId: created.id,
          newValues: created,
          details: `Created product: ${created.name} (SKU: ${created.sku})`,
          ipAddress: ctx.req.headers.get('x-forwarded-for') || 'Unknown',
          userAgent: ctx.req.headers.get('user-agent') || 'Unknown',
          branchId: dbUser?.branchId || 1,
        });

        const isOwner = dbUser?.role === "OWNER";
        const item = isOwner ? created : ({ ...created, costPrice: undefined } as any);
        return { item };
      } catch (err: any) {
        if (err?.code === "P2002") {
          throw new TRPCError({ code: 'CONFLICT', message: "sku already exists" });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "failed to create product" });
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      sku: z.string().optional(),
      barcode: z.string().nullable().optional(),
      name: z.string().optional(),
      description: z.string().nullable().optional(),
      categoryId: z.number().nullable().optional(),
      costPrice: z.number().min(0).optional(),
      sellPrice: z.number().min(0).optional(),
      minStockLevel: z.number().min(0).optional(),
      branchId: z.number().optional(),
      stockQuantity: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      if (data.barcode && data.barcode.trim()) {
        const existingBarcode = await ctx.prisma.product.findFirst({
          where: { 
            barcode: data.barcode.trim(),
            id: { not: id }
          }
        });
        if (existingBarcode) {
          throw new TRPCError({ code: 'CONFLICT', message: "barcode already exists" });
        }
      }

      try {
        const updated = await ctx.prisma.product.update({
          where: { id },
          data: {
            ...data,
            barcode: data.barcode === null ? null : (data.barcode?.trim() || undefined),
          },
          include: {
            category: { select: { id: true, name: true } },
            branch: { select: { id: true, name: true } },
          },
        });

        const dbUser = await ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { role: true },
        });

        const isOwner = dbUser?.role === "OWNER";
        const item = isOwner ? updated : ({ ...updated, costPrice: undefined } as any);
        return { item };
      } catch (err: any) {
        if (err?.code === "P2025") throw new TRPCError({ code: 'NOT_FOUND', message: "product not found" });
        if (err?.code === "P2002") throw new TRPCError({ code: 'CONFLICT', message: "sku already exists" });
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "failed to update product" });
      }
    }),

  search: protectedProcedure
    .input(z.object({ barcode: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { barcode: input.barcode.trim() },
        include: {
          category: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
      });

      if (!product) return { product: null };

      const dbUser = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      const isOwner = dbUser?.role === "OWNER";
      const item = isOwner ? product : ({ ...product, costPrice: undefined } as any);
      return { product: item };
    }),

  nextSku: protectedProcedure
    .input(z.object({ prefix: z.string().regex(/^[A-Za-z0-9]{1,6}$/) }))
    .query(async ({ ctx, input }) => {
      const nextSku = await computeNextSku(ctx, input.prefix);
      return { nextSku };
    }),

  stockIn: protectedProcedure
    .input(z.object({
      id: z.number(),
      quantity: z.number().positive(),
      costPrice: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.id },
      });

      if (!product) {
        throw new TRPCError({ code: 'NOT_FOUND', message: "product not found" });
      }

      const updatedProduct = await ctx.prisma.product.update({
        where: { id: input.id },
        data: {
          stockQuantity: { increment: input.quantity },
          costPrice: input.costPrice || product.costPrice,
        },
        include: {
          category: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
      });

      await ctx.prisma.stockTransaction.create({
        data: {
          productId: input.id,
          branchId: product.branchId,
          qtyChange: input.quantity,
          type: "PURCHASE",
          reference: `STOCK-IN-${Date.now()}`,
          note: input.notes || `Stock in: +${input.quantity}`,
          createdBy: ctx.session.user.id,
          balanceAfter: updatedProduct.stockQuantity,
        },
      });

      const dbUser = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      const isOwner = dbUser?.role === "OWNER";
      const item = isOwner ? updatedProduct : ({ ...updatedProduct, costPrice: undefined } as any);

      return {
        message: "Stock updated successfully",
        item,
        transaction: {
          quantity: input.quantity,
          type: "PURCHASE",
          notes: input.notes || `Stock in: +${input.quantity}`,
        }
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.product.update({
          where: { id: input.id },
          data: { 
            isDeleted: true,
            deletedAt: new Date()
          }
        });
        return { success: true };
      } catch (err: any) {
        if (err?.code === "P2025") throw new TRPCError({ code: 'NOT_FOUND', message: "product not found" });
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "failed to delete product" });
      }
    }),
});
