import React from "react";
import { motion } from "framer-motion";
import { HiPencil, HiTrash, HiCheckCircle, HiXCircle, HiCurrencyDollar, HiCalendar } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import type { AdvertisingPriceRow, ObjectId } from "@/types/advertising-settings.types";

interface Props {
  rows: AdvertisingPriceRow[];
  loading: boolean;
  selectedIds: Set<ObjectId>;
  onToggleSelect: (id: ObjectId) => void;
  onEdit: (row: AdvertisingPriceRow) => void;
  onDelete: (id: ObjectId) => void;
  onToggleActive: (id: ObjectId, active: boolean) => void;
}

const AdsTable: React.FC<Props> = ({
  rows,
  loading,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const formatCurrency = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-50">
              <TableHead className="w-12">
                <Checkbox
                  checked={rows.length > 0 && selectedIds.size === rows.length}
                  onCheckedChange={(checked) => {
                    rows.forEach(row => {
                      if (checked && !selectedIds.has(row.id)) {
                        onToggleSelect(row.id);
                      } else if (!checked && selectedIds.has(row.id)) {
                        onToggleSelect(row.id);
                      }
                    });
                  }}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="font-semibold">Placement</TableHead>
              <TableHead className="font-semibold">Price</TableHead>
              <TableHead className="font-semibold">Duration</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Updated</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group hover:bg-emerald-50/50 transition-colors border-b last:border-0"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(row.id)}
                    onCheckedChange={() => onToggleSelect(row.id)}
                    aria-label={`Select ${row.placementLabel}`}
                  />
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {row.placementLabel.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{row.placementLabel}</div>
                      <div className="text-xs text-slate-500">{row.placement}</div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-1">
                    <HiCurrencyDollar className="h-4 w-4 text-emerald-600" />
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(row.price, row.currency)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">{row.currency}</div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    {row.defaultDurationDays && (
                      <div className="flex items-center gap-1 text-sm">
                        <HiCalendar className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-700">{row.defaultDurationDays} days</span>
                      </div>
                    )}
                    {row.allowedDurationsDays.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {row.allowedDurationsDays.slice(0, 3).map((days) => (
                          <Badge
                            key={days}
                            variant="outline"
                            className="text-xs bg-slate-50 border-slate-200"
                          >
                            {days}d
                          </Badge>
                        ))}
                        {row.allowedDurationsDays.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-slate-50">
                            +{row.allowedDurationsDays.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={row.active}
                      onCheckedChange={(checked) => onToggleActive(row.id, checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                    <Badge
                      variant={row.active ? "default" : "secondary"}
                      className={row.active 
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                        : "bg-slate-100 text-slate-600"
                      }
                    >
                      {row.active ? (
                        <>
                          <HiCheckCircle className="mr-1 h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <HiXCircle className="mr-1 h-3 w-3" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm text-slate-600">
                    {formatDate(row.updatedAt)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(row.updatedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(row)}
                      className="hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <HiPencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(row.id)}
                      className="hover:bg-red-50 hover:text-red-700"
                    >
                      <HiTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {loading && (
        <div className="p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full"
          />
        </div>
      )}
    </div>
  );
};

export default AdsTable;