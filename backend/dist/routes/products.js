"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const session_1 = require("../middleware/session");
const audit_1 = require("../lib/audit");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         sku:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         categoryId:
 *           type: integer
 *         costPrice:
 *           type: number
 *         sellPrice:
 *           type: number
 *         minStockLevel:
 *           type: integer
 *         branchId:
 *           type: integer
 *         stockQuantity:
 *           type: integer
 *         version:
 *           type: integer
 *         barcode:
 *           type: string
 *         isDeleted:
 *           type: boolean
 *         deletedAt:
 *           type: string
 *         category:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *         branch:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *     CreateProductRequest:
 *       type: object
 *       required:
 *         - name
 *         - costPrice
 *         - sellPrice
 *         - categoryId
 *       properties:
 *         sku:
 *           type: string
 *         barcode:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         categoryId:
 *           type: integer
 *         costPrice:
 *           type: number
 *         sellPrice:
 *           type: number
 *         minStockLevel:
 *           type: integer
 *         barcode:
 *           type: string
 *     UpdateProductRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         categoryId:
 *           type: integer
 *         costPrice:
 *           type: number
 *         sellPrice:
 *           type: number
 *         minStockLevel:
 *           type: integer
 *         barcode:
 *           type: string
 */
// Utility: compute next SKU for a prefix (max 6 chars) with 4-digit suffix
async function computeNextSku(prefixRaw) {
    const prefix = prefixRaw.toUpperCase();
    const candidates = await prisma.product.findMany({
        where: { sku: { startsWith: prefix } },
        select: { sku: true },
        orderBy: { sku: "desc" },
        take: 50,
    });
    let maxNum = 0;
    for (const c of candidates) {
        const m = c.sku.match(/^(.*?)(\d{4})$/);
        if (m && m[1] === prefix) {
            const n = Number(m[2]);
            if (Number.isFinite(n))
                maxNum = Math.max(maxNum, n);
        }
    }
    const next = Math.min(maxNum + 1, 9999);
    return `${prefix}${String(next).padStart(4, "0")}`;
}
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get products list
 *     description: Retrieve a paginated list of products with optional filtering
 *     tags: [Products]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for name, SKU, barcode, or description
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *         description: Filter products with low stock
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// GET /products?q=&categoryId=&page=&pageSize=
router.get("/", session_1.sessionRequired, async (req, res) => {
    try {
        const qRaw = req.query.q?.trim();
        const categoryIdRaw = req.query.categoryId;
        const page = Number(req.query.page ?? 1);
        const pageSize = Number(req.query.pageSize ?? 20);
        const where = {
            isDeleted: false // Only show non-deleted products
        };
        if (qRaw && qRaw.length > 0) {
            where.OR = [
                { name: { contains: qRaw, mode: "insensitive" } },
                { sku: { contains: qRaw, mode: "insensitive" } },
                { barcode: { contains: qRaw, mode: "insensitive" } },
                { description: { contains: qRaw, mode: "insensitive" } },
            ];
        }
        if (categoryIdRaw) {
            const cid = Number(categoryIdRaw);
            if (!Number.isNaN(cid))
                where.categoryId = cid;
        }
        // Add lowStock filter
        const lowStock = req.query.lowStock === 'true';
        if (lowStock) {
            where.stockQuantity = {
                lte: prisma.product.fields.minStockLevel
            };
        }
        const skip = Math.max((page - 1) * pageSize, 0);
        const take = Math.min(Math.max(pageSize, 1), 100);
        const [rawItems, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: { select: { id: true, name: true } },
                    branch: { select: { id: true, name: true } },
                },
                orderBy: { sku: "asc" },
                skip,
                take,
            }),
            prisma.product.count({ where }),
        ]);
        const isOwner = req.user?.role === "OWNER";
        const items = isOwner
            ? rawItems
            : rawItems.map((it) => ({ ...it, costPrice: undefined }));
        return res.json({ items, total, page, pageSize: take });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "failed to fetch products" });
    }
});
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create new product
 *     description: Create a new product with auto-generated SKU
 *     tags: [Products]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// POST /products
router.post("/", session_1.sessionRequired, async (req, res) => {
    try {
        const { sku: skuInput, barcode, name, description, categoryId, costPrice, sellPrice, minStockLevel, branchId, stockQuantity, } = req.body;
        if ((!skuInput && true) ||
            !name ||
            typeof costPrice !== "number" ||
            typeof sellPrice !== "number" ||
            !branchId) {
            return res.status(400).json({ message: "missing required fields" });
        }
        // SKU rules:
        // - If skuInput matches prefix (<=6 letters/numbers) with no 4-digit suffix, auto-generate next
        // - If skuInput matches PREFIX + 4 digits, accept
        // - Else, error
        let skuFinal = null;
        if (skuInput && /^[A-Za-z0-9]{1,6}$/.test(skuInput)) {
            skuFinal = await computeNextSku(skuInput);
        }
        else if (skuInput && /^[A-Za-z0-9]{1,6}\d{4}$/.test(skuInput)) {
            skuFinal = skuInput.toUpperCase();
        }
        else if (!skuInput) {
            return res.status(400).json({ message: "sku (prefix up to 6 chars) is required" });
        }
        else {
            return res.status(400).json({ message: "invalid sku format" });
        }
        // Check if barcode already exists
        if (barcode) {
            const existingBarcode = await prisma.product.findUnique({
                where: { barcode: barcode.trim() }
            });
            if (existingBarcode) {
                return res.status(409).json({ message: "barcode already exists" });
            }
        }
        const created = await prisma.product.create({
            data: {
                sku: skuFinal,
                barcode: barcode?.trim() || null,
                name,
                description: description ?? null,
                categoryId: categoryId ?? null,
                costPrice,
                sellPrice,
                minStockLevel: minStockLevel ?? 1,
                branchId,
                stockQuantity: stockQuantity ?? 0,
            },
            include: {
                category: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
            },
        });
        // Log product creation
        await audit_1.AuditService.logCreate({
            userId: req.user?.id || 0,
            action: "CREATE_PRODUCT",
            entityType: "Product",
            entityId: created.id,
            newValues: created,
            details: `Created product: ${created.name} (SKU: ${created.sku})`,
            ipAddress: req.ip || 'Unknown',
            userAgent: req.get('User-Agent') || 'Unknown',
            branchId: req.user?.branchId || 1,
        });
        const isOwner = req.user?.role === "OWNER";
        const item = isOwner ? created : { ...created, costPrice: undefined };
        return res.status(201).json({ item });
    }
    catch (err) {
        if (err?.code === "P2002") {
            return res.status(409).json({ message: "sku already exists" });
        }
        console.error(err);
        return res.status(500).json({ message: "failed to create product" });
    }
});
/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update product
 *     description: Update an existing product
 *     tags: [Products]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductRequest'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
// PUT /products/:id
router.put("/:id", session_1.sessionRequired, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id))
            return res.status(400).json({ message: "invalid id" });
        const { sku, barcode, name, description, categoryId, costPrice, sellPrice, minStockLevel, branchId, stockQuantity, } = req.body;
        const data = {};
        if (typeof sku !== "undefined")
            data.sku = sku;
        if (typeof barcode !== "undefined")
            data.barcode = barcode?.trim() || null;
        if (typeof name !== "undefined")
            data.name = name;
        if (typeof description !== "undefined")
            data.description = description;
        if (typeof categoryId !== "undefined")
            data.categoryId = categoryId;
        if (typeof costPrice !== "undefined")
            data.costPrice = costPrice;
        if (typeof sellPrice !== "undefined")
            data.sellPrice = sellPrice;
        if (typeof minStockLevel !== "undefined")
            data.minStockLevel = minStockLevel;
        if (typeof branchId !== "undefined")
            data.branchId = branchId;
        if (typeof stockQuantity !== "undefined")
            data.stockQuantity = stockQuantity;
        // Check if barcode already exists (if updating barcode)
        if (barcode && barcode.trim()) {
            const existingBarcode = await prisma.product.findFirst({
                where: {
                    barcode: barcode.trim(),
                    id: { not: id }
                }
            });
            if (existingBarcode) {
                return res.status(409).json({ message: "barcode already exists" });
            }
        }
        const updated = await prisma.product.update({
            where: { id },
            data,
            include: {
                category: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
            },
        });
        const isOwner = req.user?.role === "OWNER";
        const item = isOwner ? updated : { ...updated, costPrice: undefined };
        return res.json({ item });
    }
    catch (err) {
        if (err?.code === "P2025")
            return res.status(404).json({ message: "product not found" });
        if (err?.code === "P2002")
            return res.status(409).json({ message: "sku already exists" });
        console.error(err);
        return res.status(500).json({ message: "failed to update product" });
    }
});
// GET /products/search?barcode=1234567890123
router.get("/search", session_1.sessionRequired, async (req, res) => {
    try {
        const barcode = req.query.barcode;
        if (!barcode) {
            return res.status(400).json({ message: "barcode parameter is required" });
        }
        const product = await prisma.product.findUnique({
            where: { barcode: barcode.trim() },
            include: {
                category: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
            },
        });
        if (!product) {
            return res.json({ product: null });
        }
        const isOwner = req.user?.role === "OWNER";
        const item = isOwner ? product : { ...product, costPrice: undefined };
        return res.json({ product: item });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "failed to search product" });
    }
});
// GET /products/next-sku?prefix=ABC
router.get("/next-sku", session_1.sessionRequired, async (req, res) => {
    try {
        const prefixRaw = req.query.prefix ?? "";
        if (!/^[A-Za-z0-9]{1,6}$/.test(prefixRaw)) {
            return res.status(400).json({ message: "invalid prefix (1-6 alphanumeric)" });
        }
        const nextSku = await computeNextSku(prefixRaw);
        return res.json({ nextSku });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "failed to compute next sku" });
    }
});
// POST /products/:id/stock-in
router.post("/:id/stock-in", session_1.sessionRequired, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id))
            return res.status(400).json({ message: "invalid id" });
        const { quantity, costPrice, notes } = req.body;
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: "quantity must be positive" });
        }
        // Get current product
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
            },
        });
        if (!product) {
            return res.status(404).json({ message: "product not found" });
        }
        // Update stock quantity
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                stockQuantity: { increment: quantity },
                costPrice: costPrice || product.costPrice,
            },
            include: {
                category: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
            },
        });
        // Create stock transaction record
        await prisma.stockTransaction.create({
            data: {
                productId: id,
                branchId: product.branchId,
                qtyChange: quantity,
                type: "PURCHASE",
                reference: `STOCK-IN-${Date.now()}`,
                note: notes || `Stock in: +${quantity}`,
                createdBy: req.user?.id || null,
                balanceAfter: updatedProduct.stockQuantity,
            },
        });
        const isOwner = req.user?.role === "OWNER";
        const item = isOwner ? updatedProduct : { ...updatedProduct, costPrice: undefined };
        return res.json({
            message: "Stock updated successfully",
            item,
            transaction: {
                quantity,
                type: "PURCHASE",
                notes: notes || `Stock in: +${quantity}`,
            }
        });
    }
    catch (err) {
        console.error("Stock in error:", err);
        return res.status(500).json({
            message: "Failed to update stock",
            error: err?.message || "Unknown error",
            details: err
        });
    }
});
// DELETE /products/:id
router.delete("/:id", session_1.sessionRequired, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id))
            return res.status(400).json({ message: "invalid id" });
        // Soft delete - mark as deleted instead of removing from database
        await prisma.product.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });
        return res.status(204).send();
    }
    catch (err) {
        if (err?.code === "P2025")
            return res.status(404).json({ message: "product not found" });
        console.error(err);
        return res.status(500).json({ message: "failed to delete product" });
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map