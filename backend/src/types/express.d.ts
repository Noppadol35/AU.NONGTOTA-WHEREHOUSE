import "express-serve-static-core";
import { Role } from "@prisma/client";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      username: string;
      role: Role;
    };
  }
}


