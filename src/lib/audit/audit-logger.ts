import { headers } from "next/headers";
import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { Types } from "mongoose";
import AuditModel from "@/models/audit.model";
import { AUDIT_ACTION, AuditAction } from "@/constants/audit-action.const";

export type AuditTarget = {
    targetModel: string;
    target: string | Types.ObjectId;
};

export type AuditActor = {
    actor: string | Types.ObjectId;
    actorModel?: string;
};

export type AuditLogInput = AuditTarget &
    Partial<AuditActor> & {
        action: AuditAction;
        note?: string;
        before?: Record<string, unknown>;
        after?: Record<string, unknown>;
        ip?: string;
        userAgent?: string;
    };

function safeHeadersGet(name: string): string | undefined {
    try {
        const h = headers() as unknown as ReadonlyHeaders | Promise<ReadonlyHeaders>;
        if (typeof (h as Promise<ReadonlyHeaders>).then === "function") {
            return undefined;
        }
        return (h as ReadonlyHeaders).get(name) || undefined;
    } catch {
        return undefined;
    }
}

function getRequestIp(): string | undefined {
    const forwarded = safeHeadersGet("x-forwarded-for") || safeHeadersGet("x-real-ip");
    if (!forwarded) return undefined;
    const first = forwarded.split(",")[0]?.trim();
    if (!first || first.toLowerCase() === "unknown") return undefined;
    return first;
}

function getUserAgent(): string | undefined {
    const ua = safeHeadersGet("user-agent");
    if (!ua || ua.toLowerCase() === "unknown") return undefined;
    return ua;
}

export async function logAuditBestEffort(input: AuditLogInput): Promise<void> {
    try {
        await (AuditModel as typeof AuditModel).createAudit({
            targetModel: input.targetModel,
            target: input.target,
            action: input.action,
            note: input.note,
            actor: input.actor,
            actorModel: input.actorModel || (input.actor ? "User" : undefined),
            before: input.before,
            after: input.after,
            ip: input.ip ?? getRequestIp(),
            userAgent: input.userAgent ?? getUserAgent(),
        });
    } catch (err) {
        // audit must never break primary business flow
        console.error("Audit logging failed:", err);
    }
}

export { AUDIT_ACTION };

