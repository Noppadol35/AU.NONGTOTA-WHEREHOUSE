"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const session_1 = require("../middleware/session");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// GET /stock-transactions?jobOrderId=&type=
router.get("/", session_1.sessionRequired, async (req, res) => {
    try {
        const jobOrderId = req.query.jobOrderId?.trim();
        const type = req.query.type?.trim();
        console.log("Stock transactions query params:", { jobOrderId, type });
        const where = {};
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
    }
    catch (err) {
        console.error("Stock transactions error:", err);
        return res
            .status(500)
            .json({ message: "failed to fetch stock transactions", error: err?.message || "Unknown error" });
    }
});
exports.default = router;
//# sourceMappingURL=stockTransactions.js.map