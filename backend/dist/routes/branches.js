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
// GET /branches
router.get("/", session_1.sessionRequired, async (_req, res) => {
    try {
        const branches = await prisma.branch.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: { name: "asc" },
        });
        return res.json({ items: branches });
    }
    catch (error) {
        console.error("Error fetching branches:", error);
        return res.status(500).json({ message: "Failed to fetch branches" });
    }
});
exports.default = router;
//# sourceMappingURL=branches.js.map