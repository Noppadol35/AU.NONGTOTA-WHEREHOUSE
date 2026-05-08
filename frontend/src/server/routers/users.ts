import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, roleProcedure } from '../trpc';
import bcrypt from 'bcryptjs';
import { TRPCError } from '@trpc/server';

const ownerOnly = roleProcedure(['OWNER']);

export const usersRouter = router({
  /**
   * Called right after BetterAuth signIn to get role, branchId, fullName etc.
   * Role is always fetched from DB server-side — never stored in localStorage.
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const dbUser = await ctx.prisma.user.findUnique({
      where: { email: ctx.session.user.email },
      select: {
        id: true,
        username: true,
        fullName: true,
        name: true,
        email: true,
        role: true,
        branchId: true,
        branch: { select: { id: true, name: true } },
      },
    });

    if (!dbUser) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    return dbUser;
  }),

  /**
   * Public endpoint — used during login flow BEFORE the user has a session.
   * Looks up email for a given username so BetterAuth signIn.email() can be called.
   */
  lookupByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { username: input.username },
        select: { email: true },
      });
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'ไม่พบชื่อผู้ใช้นี้ในระบบ' });
      }
      return { email: user.email };
    }),

  register: publicProcedure
    .input(z.object({
      username: z.string().min(1),
      fullName: z.string().min(1),
      password: z.string().min(6),
      branchId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.prisma.user.findFirst({
        where: {
          OR: [
            { username: input.username },
            { email: input.username },
          ],
        },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'มีชื่อผู้ใช้นี้ในระบบแล้ว',
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      await ctx.prisma.user.create({
        data: {
          username: input.username,
          email: input.username, // Using username as email for BetterAuth compatibility
          name: input.fullName,
          fullName: input.fullName,
          password: hashedPassword,
          branchId: input.branchId,
          role: 'WORKER',
          accounts: {
            create: {
              accountId: input.username,
              providerId: 'credential',
              password: hashedPassword,
            }
          }
        },
      });

      return { success: true };
    }),

  list: ownerOnly
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;
      const take = input.pageSize;

      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          skip,
          take,
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            fullName: true,
            role: true,
            createdAt: true,
            branchId: true,
            branch: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.user.count(),
      ]);

      return {
        items: users,
        total,
        page: input.page,
        pageSize: take,
      };
    }),
    
  create: ownerOnly
    .input(z.object({
      username: z.string().min(1),
      fullName: z.string().min(1),
      name: z.string().optional(),
      email: z.string().email(),
      role: z.enum(["OWNER", "MANAGER", "WORKER"]),
      branchId: z.number(),
      password: z.string().min(6),
    }))
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.prisma.user.findFirst({
        where: {
          OR: [
            { username: input.username },
            { email: input.email },
          ],
        },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Username or Email already exists',
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const user = await ctx.prisma.user.create({
        data: {
          username: input.username,
          fullName: input.fullName,
          name: input.name ?? input.fullName,
          email: input.email,
          role: input.role,
          branchId: input.branchId,
          password: hashedPassword,
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          createdAt: true,
          branchId: true,
          branch: { select: { id: true, name: true } },
        },
      });
      return { item: user };
    }),

  update: ownerOnly
    .input(z.object({
      id: z.string(),
      fullName: z.string().optional(),
      name: z.string().optional(),
      role: z.enum(["OWNER", "MANAGER", "WORKER"]).optional(),
      branchId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const existingUser = await ctx.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      const updatedUser = await ctx.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          createdAt: true,
          branchId: true,
          branch: { select: { id: true, name: true } },
        },
      });

      return { item: updatedUser };
    }),

  delete: ownerOnly
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.prisma.user.findUnique({
        where: { id: input.id },
      });

      if (!existingUser) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      // Prevent self-deletion — look up current user by email
      const currentUser = await ctx.prisma.user.findUnique({
        where: { email: ctx.session.user.email },
        select: { id: true },
      });

      if (currentUser?.id === input.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot delete your own account' });
      }

      await ctx.prisma.user.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
