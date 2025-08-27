import express from "express";
import { PrismaClient } from "@prisma/client";
import { sessionRequired } from "../middleware/session";

const router = express.Router();
const prisma = new PrismaClient();

// GET /branches
router.get("/", sessionRequired, async (_req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return res.json({ items: branches });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return res.status(500).json({ message: "Failed to fetch branches" });
  }
});

export default router;
