"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const session_1 = require("../lib/session");
const audit_1 = require("../lib/audit");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
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
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
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
    }
    catch (error) {
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
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // Create session
        const session = await session_1.SessionManager.createSession(user.id, rememberMe || false);
        // Set cookie
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'lax',
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
        await audit_1.AuditService.logAuth({
            userId: user.id,
            action: "LOGIN_SUCCESS",
            entityType: "AUTH",
            details: `User ${user.username} logged in successfully`,
            ipAddress: req.ip || 'Unknown',
            userAgent: req.get('User-Agent') || 'Unknown',
            branchId: user.branchId,
        });
    }
    catch (error) {
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
        const session = await session_1.SessionManager.validateSession(sessionId);
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
    }
    catch (error) {
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
            await session_1.SessionManager.deleteSession(sessionId);
        }
        // Clear cookie
        res.clearCookie('sid');
        res.json({ message: "Logout successful" });
        // Log logout
        if (sessionId) {
            const session = await session_1.SessionManager.validateSession(sessionId);
            if (session) {
                await audit_1.AuditService.logAuth({
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
    }
    catch (error) {
        console.error("Logout error:", error);
        // Still clear cookie even if session deletion fails
        res.clearCookie('sid');
        res.json({ message: "Logout successful" });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map