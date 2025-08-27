export interface Session {
    id: string;
    userId: number;
    expiresAt: Date;
    user: {
        id: number;
        username: string;
        fullName: string | null;
        role: string;
        branchId: number;
    };
}
export declare class SessionManager {
    static createSession(userId: number, rememberMe?: boolean): Promise<Session>;
    static validateSession(sessionId: string): Promise<Session | null>;
    static deleteSession(sessionId: string): Promise<void>;
    static deleteUserSessions(userId: number): Promise<void>;
    private static generateSessionId;
}
//# sourceMappingURL=session.d.ts.map