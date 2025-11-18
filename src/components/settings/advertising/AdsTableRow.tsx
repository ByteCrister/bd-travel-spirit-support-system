import React from "react";
import { Switch } from "@/components/ui/switch";
import { HiPencil, HiTrash } from "react-icons/hi";
import { AdvertisingPriceRow } from "@/types/advertising-settings.types";

interface Props {
  row: AdvertisingPriceRow;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (row: AdvertisingPriceRow) => void;
  onDelete: (id: string) => void;
  onToggleActive: (active: boolean) => void;
}

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);

const AdsTableRow: React.FC<Props> = ({ row, selected, onToggleSelect, onEdit, onDelete, onToggleActive }) => {
  return (
    <tr className="hover:bg-emerald-50">
      <td className="p-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(row.id)}
          aria-label={`Select ${row.placementLabel}`}
        />
      </td>

      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">{row.placementLabel}</div>
          <div className="px-2 py-0.5 text-xs rounded bg-emerald-100 text-emerald-800">{row.placement}</div>
        </div>
      </td>

      <td className="p-3">{formatCurrency(row.price, row.currency)}</td>

      <td className="p-3">{row.defaultDurationDays ?? "—"}</td>

      <td className="p-3">{row.allowedDurationsDays.length ? row.allowedDurationsDays.join(", ") : "Any"}</td>

      <td className="p-3">
        <label className="inline-flex items-center" aria-label={`Active ${row.placementLabel}`}>
          <Switch
            checked={row.active}
            onCheckedChange={(v) => onToggleActive(v as boolean)}
          />
        </label>
      </td>

      <td className="p-3 text-sm">{new Date(row.createdAt).toLocaleDateString()}</td>

      <td className="p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(row)}
            aria-label={`Edit ${row.placementLabel}`}
            className="p-1 rounded hover:bg-slate-100"
          >
            <HiPencil />
          </button>
          <button
            onClick={() => onDelete(row.id)}
            aria-label={`Delete ${row.placementLabel}`}
            className="p-1 rounded hover:bg-slate-100"
          >
            <HiTrash />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdsTableRow;
