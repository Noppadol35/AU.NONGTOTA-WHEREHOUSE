import express from "express";
import { PrismaClient } from "@prisma/client";
import { sessionRequired } from "../middleware/session";

const router = express.Router();
const prisma = new PrismaClient();

// GET /stock-transactions?jobOrderId=&type=
router.get("/", sessionRequired, async (req, res) => {
  try {
    const jobOrderId = (req.query.jobOrderId as string | undefined)?.trim();
    const type = (req.query.type as string | undefined)?.trim();

    console.log("Stock transactions query params:", { jobOrderId, type });

    const where: any = {};
    if (jobOrderId && jobOrderId.length > 0) {
      where.jobOrderId = parseInt(jobOrderId, 10);
    }
    if (type && type.length > 0) {
      where.type = type;
    }

    console.log("Prisma where clause:", where);

    const transactions = await prisma.stockTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        productId: true,
        qtyChange: true,
        type: true,
        createdAt: true,
        product: {
          select: {
            name: true,
            sku: true,
            sellPrice: true,
          },
        },
      },
    });

    console.log("Found transactions:", transactions.length);
    console.log("Sample transaction:", transactions[0]);
    
    return res.json(transactions);
  } catch (err: any) {
    console.error("Stock transactions error:", err);
    return res
      .status(500)
      .json({ message: "failed to fetch stock transactions", error: err?.message || "Unknown error" });
  }
});

export default router;
