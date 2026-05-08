import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const categoriesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const categories = await ctx.prisma.category.findMany({ 
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    const items = categories.map(category => ({
      id: category.id,
      name: category.name,
      skuPrefix: category.skuPrefix,
      productCount: category._count.products
    }));

    return { items };
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      skuPrefix: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const created = await ctx.prisma.category.create({ 
          data: { name: input.name, skuPrefix: input.skuPrefix ?? null } 
        });
        return { item: created };
      } catch (err: any) {
        if (err?.code === "P2002") {
          throw new TRPCError({ code: 'CONFLICT', message: "category name already exists" });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "failed to create category" });
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      skuPrefix: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      try {
        const updated = await ctx.prisma.category.update({ where: { id }, data });
        return { item: updated };
      } catch (err: any) {
        if (err?.code === "P2025") throw new TRPCError({ code: 'NOT_FOUND', message: "category not found" });
        if (err?.code === "P2002") throw new TRPCError({ code: 'CONFLICT', message: "category name already exists" });
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "failed to update category" });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.category.delete({ where: { id: input.id } });
        return { success: true };
      } catch (err: any) {
        if (err?.code === "P2025") throw new TRPCError({ code: 'NOT_FOUND', message: "category not found" });
        if (err?.code === "P2003") throw new TRPCError({ code: 'CONFLICT', message: "cannot delete category with related products" });
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "failed to delete category" });
      }
    }),
});
