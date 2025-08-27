"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.sessionRequired = void 0;
const session_1 = require("../lib/session");
const sessionRequired = async (req, res, next) => {
    const sessionId = req.cookies?.sid;
    if (!sessionId) {
        return res.status(401).json({ message: 'Session required' });
    }
    try {
        const session = await session_1.SessionManager.validateSession(sessionId);
        if (!session) {
            // Clear invalid cookie
            res.clearCookie('sid');
            return res.status(401).json({ message: 'Invalid or expired session' });
        }
        // Attach user info to request
        req.user = {
            id: session.user.id,
            username: session.user.username,
            fullName: session.user.fullName,
            role: session.user.role,
            branchId: session.user.branchId,
        };
        req.sessionId = sessionId;
        next();
    }
    catch (error) {
        console.error('Session validation error:', error);
        res.clearCookie('sid');
        return res.status(500).json({ message: 'Session validation failed' });
    }
};
exports.sessionRequired = sessionRequired;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        next();
    };
};
exports.requireRole = requireRole;
// Note: Session cleanup is handled automatically in validateSession method
// when checking for expired sessions
//# sourceMappingURL=session.js.map