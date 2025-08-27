"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class SessionManager {
    static async createSession(userId, rememberMe = false) {
        // Generate session ID
        const sessionId = this.generateSessionId();
        // Set expiration (24 hours default, 30 days if remember me)
        const expiresAt = new Date();
        if (rememberMe) {
            expiresAt.setDate(expiresAt.getDate() + 30);
        }
        else {
            expiresAt.setHours(expiresAt.getHours() + 24);
        }
        // Create session in database
        const session = await prisma.session.create({
            data: {
                id: sessionId,
                userId,
                expiresAt,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        role: true,
                        branchId: true,
                    },
                },
            },
        });
        return session;
    }
    static async validateSession(sessionId) {
        try {
            // Find session and check if expired
            const session = await prisma.session.findUnique({
                where: { id: sessionId },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            role: true,
                            branchId: true,
                        },
                    },
                },
            });
            if (!session) {
                return null;
            }
            // Check if session is expired
            if (new Date() > session.expiresAt) {
                // Delete expired session
                await this.deleteSession(sessionId);
                return null;
            }
            return session;
        }
        catch (error) {
            console.error('Session validation error:', error);
            return null;
        }
    }
    static async deleteSession(sessionId) {
        try {
            await prisma.session.delete({
                where: { id: sessionId },
            });
        }
        catch (error) {
            console.error('Session deletion error:', error);
        }
    }
    static async deleteUserSessions(userId) {
        try {
            await prisma.session.deleteMany({
                where: { userId },
            });
        }
        catch (error) {
            console.error('User sessions deletion error:', error);
        }
    }
    static generateSessionId() {
        return 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}
exports.SessionManager = SessionManager;
//# sourceMappingURL=session.js.map