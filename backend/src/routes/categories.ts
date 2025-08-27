import express from "express";
import { PrismaClient } from "@prisma/client";
import { sessionRequired } from "../middleware/session";

const router = express.Router();
const prisma = new PrismaClient();

// GET /categories
router.get("/", sessionRequired, async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({ 
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    // Transform data to include product count
    const items = categories.map(category => ({
      id: category.id,
      name: category.name,
      skuPrefix: category.skuPrefix,
      productCount: category._count.products
    }));

    return res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "failed to fetch categories" });
  }
});

// POST /categories
router.post("/", sessionRequired, async (req, res) => {
  try {
    const { name, skuPrefix } = req.body as { name?: string; skuPrefix?: string | null };
    if (!name) return res.status(400).json({ message: "name is required" });
    const created = await prisma.category.create({ data: { name, skuPrefix: skuPrefix ?? null } });
    return res.status(201).json({ item: created });
  } catch (err: any) {
    if (err?.code === "P2002") return res.status(409).json({ message: "category name already exists" });
    console.error(err);
    return res.status(500).json({ message: "failed to create category" });
  }
});

// PUT /categories/:id
router.put("/:id", sessionRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "invalid id" });
    const { name, skuPrefix } = req.body as { name?: string; skuPrefix?: string | null };
    const data: any = {};
    if (typeof name !== "undefined") data.name = name;
    if (typeof skuPrefix !== "undefined") data.skuPrefix = skuPrefix;
    const updated = await prisma.category.update({ where: { id }, data });
    return res.json({ item: updated });
  } catch (err: any) {
    if (err?.code === "P2025") return res.status(404).json({ message: "category not found" });
    if (err?.code === "P2002") return res.status(409).json({ message: "category name already exists" });
    console.error(err);
    return res.status(500).json({ message: "failed to update category" });
  }
});

// DELETE /categories/:id
router.delete("/:id", sessionRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "invalid id" });
    await prisma.category.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    if (err?.code === "P2025") return res.status(404).json({ message: "category not found" });
    if (err?.code === "P2003") return res.status(409).json({ message: "cannot delete category with related products" });
    console.error(err);
    return res.status(500).json({ message: "failed to delete category" });
  }
});

export default router;


