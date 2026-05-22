import { Types } from "mongoose";
import { DataModel, QueryExecutionResult } from "./llm.interface";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";

const BASE_URL = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

function getDetailUrl(model: DataModel, id: string): string {
    switch (model) {
        case "traveler":
            return `${BASE_URL}/users/travelers/${encodeURIComponent(encodeId(id))}`;
        case "employee":
            return `${BASE_URL}/users/employees/${encodeURIComponent(encodeId(id))}`;
        case "guide":
            return `${BASE_URL}/users/guides`;
        case "tour":
            return `${BASE_URL}/support/tours/${encodeURIComponent(encodeId(id))}`;
        case "user":
            return `${BASE_URL}/users/travelers`;
        default:
            return "#";
    }
}

function asString(value: unknown): string {
    if (value === null || value === undefined || value === "") return "—";
    if (value instanceof Types.ObjectId) return value.toString();
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

function populatedUser(row: Record<string, unknown>): { name?: string; email?: string } | null {
    const user = row.user;
    if (!user || typeof user !== "object" || Array.isArray(user)) return null;
    return user as { name?: string; email?: string };
}

function formatFindRows(model: DataModel, rows: Record<string, unknown>[]): string {
    const headers = getTableHeaders(model);
    let markdown = `| ${headers.join(" | ")} |\n`;
    markdown += `| ${headers.map(() => "---").join(" | ")} |\n`;

    for (const row of rows) {
        const cells = getTableCells(model, row);
        markdown += `| ${cells.join(" | ")} |\n`;
    }

    return markdown;
}

function getTableHeaders(model: DataModel): string[] {
    switch (model) {
        case "traveler":
            return ["Name", "Contact", "Status", "Link"];
        case "user":
            return ["Name", "Email", "Role", "Link"];
        case "employee":
            return ["Name", "Contact", "Salary", "Status", "Link"];
        case "guide":
            return ["Company", "Status", "Phone", "City", "Link"];
        case "tour":
            return ["Title", "Code", "Price", "Status", "Link"];
        case "booking":
            return ["Reference", "Traveler", "Tour", "Paid", "Status"];
        case "transaction":
            return ["Amount", "Currency", "Status", "Description", "Date"];
        default:
            return ["Summary", "Details"];
    }
}

function getTableCells(model: DataModel, row: Record<string, unknown>): string[] {
    const id = asString(row._id);

    switch (model) {
        case "traveler": {
            const user = populatedUser(row);
            const contactInfo = user?.email || asString(row.phone);
            return [
                asString(row.name),
                contactInfo,
                asString(row.accountStatus),
                id !== "—" ? `[View →](${getDetailUrl(model, id)})` : "—",
            ];
        }
        case "user":
            return [
                asString(row.name),
                asString(row.email),
                asString(row.role),
                id !== "—" ? `[View →](${getDetailUrl(model, id)})` : "—",
            ];
        case "employee": {
            const user = populatedUser(row);
            const contact = row.contactInfo as { email?: string; phone?: string } | undefined;
            return [
                user?.name || "—",
                contact?.email || contact?.phone || user?.email || "—",
                `${asString(row.salary)} ${asString(row.currency)}`,
                asString(row.status),
                id !== "—" ? `[View →](${getDetailUrl(model, id)})` : "—",
            ];
        }
        case "guide": {
            const owner = row.owner as { phone?: string } | undefined;
            const address = row.address as { city?: string } | undefined;
            return [
                asString(row.companyName),
                asString(row.status),
                asString(owner?.phone),
                asString(address?.city),
                `[Open guides](${getDetailUrl(model, id)})`,
            ];
        }
        case "tour": {
            const basePrice = row.basePrice as { amount?: number; currency?: string } | undefined;
            return [
                asString(row.title),
                asString(row.uniqueTourCode),
                basePrice ? `${basePrice.amount} ${basePrice.currency}` : "—",
                asString(row.status),
                id !== "—" ? `[View →](${getDetailUrl(model, id)})` : "—",
            ];
        }
        case "booking": {
            const traveler = row.traveler as { name?: string } | undefined;
            const tour = row.tour as { title?: string; uniqueTourCode?: string } | undefined;
            return [
                asString(row.bookingReference),
                traveler?.name || "—",
                tour?.title || tour?.uniqueTourCode || "—",
                asString(row.totalPaid),
                asString(row.status),
            ];
        }
        case "transaction":
            return [
                asString(row.amount),
                asString(row.currency),
                asString(row.status),
                asString(row.description),
                asString(row.createdAt),
            ];
        default:
            return [id, JSON.stringify(row)];
    }
}

function formatAggregateRows(rows: Record<string, unknown>[]): string {
    if (rows.length === 1 && rows[0]) {
        const row = rows[0];
        const entries = Object.entries(row).filter(([key]) => key !== "_id");
        if (entries.length) {
            return entries.map(([key, value]) => `- **${key}**: ${asString(value)}`).join("\n");
        }
    }

    const keys = Array.from(
        rows.reduce((set, row) => {
            Object.keys(row).forEach((key) => set.add(key));
            return set;
        }, new Set<string>())
    );

    let markdown = `| ${keys.join(" | ")} |\n`;
    markdown += `| ${keys.map(() => "---").join(" | ")} |\n`;
    for (const row of rows) {
        markdown += `| ${keys.map((key) => asString(row[key])).join(" | ")} |\n`;
    }
    return markdown;
}

export function formatAsMarkdown(
    result: QueryExecutionResult,
    queryDescription: string
): string {
    const label = result.model.charAt(0).toUpperCase() + result.model.slice(1);

    if (!result.rows.length) {
        return `No **${label}** records found for: *${queryDescription}*`;
    }

    const count =
        result.mode === "aggregate"
            ? `${result.rows.length} aggregate row(s)`
            : `**${result.rows.length}** record(s)`;

    let markdown = `## ${label} ${result.mode === "aggregate" ? "Summary" : "Results"}\n\n`;
    markdown += `Found ${count}.\n\n`;
    markdown +=
        result.mode === "aggregate"
            ? formatAggregateRows(result.rows)
            : formatFindRows(result.model, result.rows);

    return markdown;
}
