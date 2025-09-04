import express from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { SessionManager } from "../lib/session";
import { AuditService } from "../lib/audit";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         fullName:
 *           type: string
 *         role:
 *           type: string
 *           enum: [OWNER, MANAGER, WORKER]
 *         branchId:
 *           type: integer
 *         branch:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         rememberMe:
 *           type: boolean
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - fullName
 *         - branchId
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         fullName:
 *           type: string
 *         branchId:
 *           type: integer
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     description: Create a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields or invalid data
 *       409:
 *         description: Username already exists
 *       500:
 *         description: Internal server error
 */
// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password, fullName, branchId } = req.body;

    if (!username || !password || !fullName || !branchId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate branch existence first to avoid FK error
    const targetBranchId = Number(branchId);
    if (!Number.isInteger(targetBranchId)) {
      return res.status(400).json({ message: "Invalid branchId" });
    }

    const branch = await prisma.branch.findUnique({ where: { id: targetBranchId } });
    if (!branch) {
      return res.status(400).json({ message: "Branch not found" });
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
        branchId: targetBranchId,
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
    // Prisma known errors handling
    if (error.code === 'P2002') {
      // Unique constraint failed
      return res.status(409).json({ message: "Username already exists" });
    }
    if (error.code === 'P2003') {
      // FK constraint failed
      return res.status(400).json({ message: "Invalid reference data (branchId)" });
    }
    return res.status(500).json({ message: "Registration failed" });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and create session
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 session:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
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
      sameSite: 'none' as const, // Allow cross-site cookies
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined, // 30 days if remember me
      domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined, // Allow subdomains
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

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user info
 *     description: Get information about the currently logged in user
 *     tags: [Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No session found or invalid session
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logout user and destroy session
 *     tags: [Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: No session found
 *       500:
 *         description: Internal server error
 */
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
