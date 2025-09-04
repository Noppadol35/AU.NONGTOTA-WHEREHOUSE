import { Request, Response, NextFunction } from 'express';
import { SessionManager } from '../lib/session';
import { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Extend Express Request interface
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

export const sessionRequired = async (req: Request, res: Response, next: NextFunction) => {
  // Try JWT token first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      req.user = {
        id: decoded.userId,
        username: decoded.username,
        fullName: null,
        role: decoded.role as Role,
        branchId: 1, // Default branch
      };
      
      return next();
    } catch (error) {
      console.error('JWT verification error:', error);
    }
  }

  // Fallback to session authentication
  const sessionId = req.cookies?.sid;
  
  if (!sessionId) {
    return res.status(401).json({ message: 'Session required' });
  }

  try {
    const session = await SessionManager.validateSession(sessionId);
    
    if (!session) {
      // Clear invalid cookie
      res.clearCookie('sid');
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Attach user info to request
    req.user = {
      id: session.user.id,
      username: session.user.username,
      fullName: session.user.fullName,
      role: session.user.role as Role,
      branchId: session.user.branchId,
    };
    req.sessionId = sessionId;

    next();
  } catch (error) {
    console.error('Session validation error:', error);
    res.clearCookie('sid');
    return res.status(500).json({ message: 'Session validation failed' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Note: Session cleanup is handled automatically in validateSession method
// when checking for expired sessions
