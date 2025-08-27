export interface AuditLogData {
    userId: number;
    action: string;
    entityType: string;
    entityId?: number | null;
    oldValues?: any;
    newValues?: any;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    branchId: number;
}
export declare class AuditService {
    static logCreate(data: AuditLogData): Promise<void>;
    static logUpdate(data: AuditLogData): Promise<void>;
    static logDelete(data: AuditLogData): Promise<void>;
    static logAction(data: AuditLogData): Promise<void>;
    static logAuth(data: AuditLogData): Promise<void>;
}
//# sourceMappingURL=audit.d.ts.map