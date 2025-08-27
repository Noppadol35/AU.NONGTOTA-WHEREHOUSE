import express from "express";
import { PrismaClient } from "@prisma/client";
import { sessionRequired, requireRole } from "../middleware/session";
import bcrypt from "bcryptjs";

const router = express.Router();
const prisma = new PrismaClient();

// GET /users?page=&pageSize=
router.get("/", sessionRequired, requireRole(["OWNER"]), async (req, res) => {
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
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
});

// POST /users
router.post("/", sessionRequired, requireRole(["OWNER"]), async (req, res) => {
  try {
    const { username, fullName, role, branchId, password } = req.body as {
      username: string;
      fullName: string;
      role: "OWNER" | "MANAGER" | "WORKER";
      branchId: number;
      password: string;
    };

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
    const hashedPassword = await bcrypt.hash(password, 10);

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
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Failed to create user" });
  }
});

// PUT /users/:id
router.put("/:id", sessionRequired, requireRole(["OWNER"]), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const { fullName, role, branchId } = req.body as {
      fullName?: string;
      role?: "OWNER" | "MANAGER" | "WORKER";
      branchId?: number;
    };

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
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Failed to update user" });
  }
});

// DELETE /users/:id
router.delete("/:id", sessionRequired, requireRole(["OWNER"]), async (req, res) => {
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
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
