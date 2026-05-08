import { router, protectedProcedure } from '../trpc';

export const branchesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const branches = await ctx.prisma.branch.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });
    return { items: branches };
  }),
});
