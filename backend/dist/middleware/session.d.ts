import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            id: number;
            username: string;
            fullName: string | null;
            role: Role;
            branchId: number;
        };
        sessionId?: string;
    }
}
export declare const sessionRequired: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const requireRole: (allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=session.d.ts.map