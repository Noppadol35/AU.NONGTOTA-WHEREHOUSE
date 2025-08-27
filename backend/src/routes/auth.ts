import express from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { SessionManager } from "../lib/session";
import { AuditService } from "../lib/audit";

const router = express.Router();
const prisma = new PrismaClient();

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password, fullName, branchId } = req.body;

    if (!username || !password || !fullName || !branchId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        branchId: parseInt(branchId),
        role: "WORKER", // Default role
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        branchId: true,
      },
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
      include: { branch: true },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create session
    const session = await SessionManager.createSession(user.id, rememberMe || false);

    // Set cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax' as const,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined, // 30 days if remember me
    };

    res.cookie('sid', session.id, cookieOptions);

    // Return user info (without password)
    const userInfo = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId,
      branch: user.branch,
    };

    res.json({ 
      message: "Login successful", 
      user: userInfo,
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      }
    });

    // Log successful login
    await AuditService.logAuth({
      userId: user.id,
      action: "LOGIN_SUCCESS",
      entityType: "AUTH",
      details: `User ${user.username} logged in successfully`,
      ipAddress: req.ip || 'Unknown',
      userAgent: req.get('User-Agent') || 'Unknown',
      branchId: user.branchId,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// GET /auth/me
router.get("/me", async (req, res) => {
  try {
    const sessionId = req.cookies?.sid;
    
    if (!sessionId) {
      return res.status(401).json({ message: "No session found" });
    }

    const session = await SessionManager.validateSession(sessionId);
    
    if (!session) {
      res.clearCookie('sid');
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    // Return user info
    const userInfo = {
      id: session.user.id,
      username: session.user.username,
      fullName: session.user.fullName,
      role: session.user.role,
      branchId: session.user.branchId,
    };

    res.json({ user: userInfo });
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to get user info" });
  }
});

// POST /auth/logout
router.post("/logout", async (req, res) => {
  try {
    const sessionId = req.cookies?.sid;
    
    if (sessionId) {
      // Delete session from database
      await SessionManager.deleteSession(sessionId);
    }

    // Clear cookie
    res.clearCookie('sid');
    
    res.json({ message: "Logout successful" });

    // Log logout
    if (sessionId) {
      const session = await SessionManager.validateSession(sessionId);
      if (session) {
        await AuditService.logAuth({
          userId: session.user.id,
          action: "LOGOUT",
          entityType: "AUTH",
          details: `User logged out`,
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          branchId: session.user.branchId,
        });
      }
    }
  } catch (error: any) {
    console.error("Logout error:", error);
    // Still clear cookie even if session deletion fails
    res.clearCookie('sid');
    res.json({ message: "Logout successful" });
  }
});

export default router;
