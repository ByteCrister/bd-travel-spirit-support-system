export enum AUDIT_ACTION {
    CREATE = "create",
    READ = "read",
    UPDATE = "update",
    DELETE = "delete",
}

export type AuditAction = `${AUDIT_ACTION}`;