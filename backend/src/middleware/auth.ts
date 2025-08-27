import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload as JwtStdPayload } from "jsonwebtoken";
import { Role } from "@prisma/client";

type JwtPayload = {
  sub: number;
  role: Role;
  username: string;
  iat?: number;
  exp?: number;
};

function getTokenFromHeader(req: Request): string | null {
  const header = req.headers["authorization"] || req.headers["Authorization"];
  if (!header || Array.isArray(header)) return null;
  const parts = header.split(" ");
  if (parts.length !== 2) return null;
  const scheme = parts[0] ?? "";
  const bearerToken = parts[1] ?? "";
  if (!/^Bearer$/i.test(scheme) || !bearerToken) return null;
  return bearerToken;
}

export function authRequired(req: Request, res: Response, next: NextFunction): void {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      res.status(401).json({ message: "missing bearer token" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: "server misconfigured: JWT_SECRET not set" });
      return;
    }

    const decoded = jwt.verify(token, secret);
    if (typeof decoded !== "object" || decoded === null) {
      res.status(401).json({ message: "invalid token" });
      return;
    }

    const payload = decoded as JwtStdPayload & {
      sub?: unknown;
      role?: unknown;
      username?: unknown;
    };

    const subValue =
      typeof payload.sub === "string"
        ? Number(payload.sub)
        : typeof payload.sub === "number"
        ? payload.sub
        : NaN;
    const roleValue = typeof payload.role === "string" ? payload.role : null;
    const usernameValue = typeof payload.username === "string" ? payload.username : null;

    if (!Number.isFinite(subValue) || !roleValue || !usernameValue) {
      res.status(401).json({ message: "invalid token" });
      return;
    }

    req.user = { 
      id: subValue as number, 
      role: roleValue as Role, 
      username: usernameValue,
      fullName: null,
      branchId: 1
    };
    next();
  } catch (err) {
    res.status(401).json({ message: "invalid or expired token" });
  }
}

export function requireRole(roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ message: "forbidden" });
      return;
    }
    next();
  };
}


