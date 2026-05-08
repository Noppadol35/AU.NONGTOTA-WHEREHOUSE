import { initTRPC, TRPCError } from '@trpc/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

// Create context for tRPC
export const createContext = async (opts: { req: NextRequest }) => {
  const session = await auth.api.getSession({
    headers: opts.req.headers,
  });

  return {
    session,
    prisma,
    req: opts.req,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;

/** Public — no auth required (e.g. username→email lookup during login) */
export const publicProcedure = t.procedure;

/** Requires a valid BetterAuth session cookie */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/** Requires a valid session AND the user must have one of the specified roles (checked server-side from DB) */
export const roleProcedure = (roles: string[]) =>
  protectedProcedure.use(async ({ ctx, next }) => {
    const dbUser = await ctx.prisma.user.findUnique({
      where: { email: ctx.session.user.email },
      select: { role: true },
    });

    if (!dbUser || !roles.includes(dbUser.role)) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Insufficient permissions' });
    }

    return next({ ctx });
  });
