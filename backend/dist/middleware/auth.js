"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRequired = authRequired;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function getTokenFromHeader(req) {
    const header = req.headers["authorization"] || req.headers["Authorization"];
    if (!header || Array.isArray(header))
        return null;
    const parts = header.split(" ");
    if (parts.length !== 2)
        return null;
    const scheme = parts[0] ?? "";
    const bearerToken = parts[1] ?? "";
    if (!/^Bearer$/i.test(scheme) || !bearerToken)
        return null;
    return bearerToken;
}
function authRequired(req, res, next) {
    try {
        const token = getTokenFromHeader(req);
        if (!token) {
            res.status(401).json({ message: "missing bearer token" });
            return;
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({ message: "server misconfigured: JWT_SECRET not set" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (typeof decoded !== "object" || decoded === null) {
            res.status(401).json({ message: "invalid token" });
            return;
        }
        const payload = decoded;
        const subValue = typeof payload.sub === "string"
            ? Number(payload.sub)
            : typeof payload.sub === "number"
                ? payload.sub
                : NaN;
        const roleValue = typeof payload.role === "string" ? payload.role : null;
        const usernameValue = typeof payload.username === "string" ? payload.username : null;
        if (!Number.isFinite(subValue) || !roleValue || !usernameValue) {
            res.status(401).json({ message: "invalid token" });
            return;
        }
        req.user = {
            id: subValue,
            role: roleValue,
            username: usernameValue,
            fullName: null,
            branchId: 1
        };
        next();
    }
    catch (err) {
        res.status(401).json({ message: "invalid or expired token" });
    }
}
function requireRole(roles) {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !roles.includes(userRole)) {
            res.status(403).json({ message: "forbidden" });
            return;
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map