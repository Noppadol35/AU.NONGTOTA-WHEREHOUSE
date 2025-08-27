"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const session_1 = require("../middleware/session");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// GET /users?page=&pageSize=
router.get("/", session_1.sessionRequired, (0, session_1.requireRole)(["OWNER"]), async (req, res) => {
    try {
        const page = Number(req.query.page ?? 1);
        const pageSize = Number(req.query.pageSize ?? 50);
        const skip = Math.max((page - 1) * pageSize, 0);
        const take = Math.min(Math.max(pageSize, 1), 100);
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take,
                select: {
                    id: true,
                    username: true,
                    fullName: true,
                    role: true,
                    createdAt: true,
                    branchId: true,
                    branch: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.user.count(),
        ]);
        return res.json({
            items: users,
            total,
            page,
            pageSize: take,
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: "Failed to fetch users" });
    }
});
// POST /users
router.post("/", session_1.sessionRequired, (0, session_1.requireRole)(["OWNER"]), async (req, res) => {
    try {
        const { username, fullName, role, branchId, password } = req.body;
        // Validation
        if (!username || !fullName || !role || !branchId || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });
        if (existingUser) {
            return res.status(409).json({ message: "Username already exists" });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                fullName,
                role,
                branchId,
                password: hashedPassword,
            },
            select: {
                id: true,
                username: true,
                fullName: true,
                role: true,
                createdAt: true,
                branchId: true,
                branch: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        return res.status(201).json({ item: user });
    }
    catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ message: "Failed to create user" });
    }
});
// PUT /users/:id
router.put("/:id", session_1.sessionRequired, (0, session_1.requireRole)(["OWNER"]), async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const { fullName, role, branchId } = req.body;
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        // Update user
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(fullName && { fullName }),
                ...(role && { role }),
                ...(branchId && { branchId }),
            },
            select: {
                id: true,
                username: true,
                fullName: true,
                role: true,
                createdAt: true,
                branchId: true,
                branch: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        return res.json({ item: updatedUser });
    }
    catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ message: "Failed to update user" });
    }
});
// DELETE /users/:id
router.delete("/:id", session_1.sessionRequired, (0, session_1.requireRole)(["OWNER"]), async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        // Prevent deleting own account
        if (existingUser.id === req.user?.id) {
            return res.status(400).json({ message: "Cannot delete your own account" });
        }
        // Delete user
        await prisma.user.delete({
            where: { id },
        });
        return res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ message: "Failed to delete user" });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map