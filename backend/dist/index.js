"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_json_1 = __importDefault(require("../swagger.json"));
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const categories_1 = __importDefault(require("./routes/categories"));
const jobOrders_1 = __importDefault(require("./routes/jobOrders"));
const stockTransactions_1 = __importDefault(require("./routes/stockTransactions"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const users_1 = __importDefault(require("./routes/users"));
const branches_1 = __importDefault(require("./routes/branches"));
const auditLogs_1 = __importDefault(require("./routes/auditLogs"));
const reports_1 = __importDefault(require("./routes/reports"));
// Session cleanup is handled automatically in validateSession method
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://au-nongtota.com']
        : ['http://localhost:3000'],
    credentials: true, // Important for cookies
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// Serve static files
app.use(express_1.default.static('src'));
// Serve swagger.json
app.get('/docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_json_1.default);
});
// Serve Swagger UI HTML
app.get('/docs', (req, res) => {
    res.sendFile('swagger.html', { root: 'src' });
});
// Serve Redoc UI HTML (alternative)
app.get('/redoc', (req, res) => {
    res.sendFile('redoc.html', { root: 'src' });
});
// Routes
app.use("/auth", auth_1.default);
app.use("/products", products_1.default);
app.use("/categories", categories_1.default);
app.use("/job-orders", jobOrders_1.default);
app.use("/stock-transactions", stockTransactions_1.default);
app.use("/dashboard", dashboard_1.default);
app.use("/users", users_1.default);
app.use("/branches", branches_1.default);
app.use("/audit-logs", auditLogs_1.default);
app.use("/reports", reports_1.default);
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});
// Session cleanup is handled automatically in validateSession method
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
});
//# sourceMappingURL=index.js.map