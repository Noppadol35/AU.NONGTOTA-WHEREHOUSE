import { router, publicProcedure } from '../trpc';
import { branchesRouter } from './branches';
import { usersRouter } from './users';
import { categoriesRouter } from './categories';
import { productsRouter } from './products';
import { jobOrdersRouter } from './jobOrders';
import { dashboardRouter } from './dashboard';
import { reportsRouter } from './reports';
import { stockTransactionsRouter } from './stockTransactions';
import { auditLogsRouter } from './auditLogs';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok' };
  }),
  branches: branchesRouter,
  users: usersRouter,
  categories: categoriesRouter,
  products: productsRouter,
  jobOrders: jobOrdersRouter,
  dashboard: dashboardRouter,
  reports: reportsRouter,
  stockTransactions: stockTransactionsRouter,
  auditLogs: auditLogsRouter,
});

export type AppRouter = typeof appRouter;
