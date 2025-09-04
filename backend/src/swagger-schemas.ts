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
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         skuPrefix:
 *           type: string
 *         productCount:
 *           type: integer
 *     CreateCategoryRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         skuPrefix:
 *           type: string
 *     UpdateCategoryRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         skuPrefix:
 *           type: string
 *     JobOrder:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         jobNumber:
 *           type: string
 *         customerName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         carType:
 *           type: string
 *         licensePlate:
 *           type: string
 *         issueDetail:
 *           type: string
 *         jobDetail:
 *           type: string
 *         status:
 *           type: string
 *           enum: [OPEN, IN_PROGRESS, COMPLETED, CANCELLED]
 *         createdAt:
 *           type: string
 *         branchId:
 *           type: integer
 *         branch:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/JobOrderItem'
 *     JobOrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         productId:
 *           type: integer
 *         quantity:
 *           type: integer
 *         unitPrice:
 *           type: number
 *         product:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             sku:
 *               type: string
 *     CreateJobOrderRequest:
 *       type: object
 *       required:
 *         - customerName
 *         - phoneNumber
 *         - carType
 *         - licensePlate
 *         - issueDetail
 *         - jobDetail
 *       properties:
 *         customerName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         carType:
 *           type: string
 *         licensePlate:
 *           type: string
 *         issueDetail:
 *           type: string
 *         jobDetail:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               unitPrice:
 *                 type: number
 *     UpdateJobOrderRequest:
 *       type: object
 *       properties:
 *         customerName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         carType:
 *           type: string
 *         licensePlate:
 *           type: string
 *         issueDetail:
 *           type: string
 *         jobDetail:
 *           type: string
 *         status:
 *           type: string
 *           enum: [OPEN, IN_PROGRESS, COMPLETED, CANCELLED]
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               unitPrice:
 *                 type: number
 */
