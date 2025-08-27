import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
export declare function authRequired(req: Request, res: Response, next: NextFunction): void;
export declare function requireRole(roles: Role[]): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map