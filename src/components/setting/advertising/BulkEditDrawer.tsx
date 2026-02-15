"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  HiX,
  HiCheck,
  HiAdjustments,
  HiLightningBolt,
  HiUsers,
} from "react-icons/hi";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AdvertisingPriceRow,
  BulkUpdateAdvertisingPricesPayload,
  UpdateAdvertisingPricePayload,
} from "@/types/advertising/advertising-settings.types";
import { Currency, CURRENCY } from "@/constants/tour.const";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

interface Props {
  open: boolean;
  onClose: () => void;
  selectedRows: AdvertisingPriceRow[];
  onSubmit: (payload: BulkUpdateAdvertisingPricesPayload) => Promise<void>;
}

const currencies = Object.values(CURRENCY);

const BulkEditDrawer: React.FC<Props> = ({ open, onClose, selectedRows, onSubmit }) => {
  const [currency, setCurrency] = useState<Currency>(CURRENCY.USD);
  const [setActive, setSetActive] = useState<boolean | null>(null);
  const [multiplier, setMultiplier] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    setSubmitting(true);
    try {
      const updates: UpdateAdvertisingPricePayload[] = selectedRows.map(
        (r): UpdateAdvertisingPricePayload => {
          const upd: UpdateAdvertisingPricePayload = { id: r.id, title: r.title };

          if (currency) {
            upd.currency = currency;
          }

          if (setActive !== null) {
            upd.active = setActive;
          }

          if (multiplier && multiplier.trim() !== "") {
            const m = Number(multiplier);
            if (!Number.isNaN(m)) {
              const newPrice = Math.round((r.price * m + Number.EPSILON) * 100) / 100;
              upd.price = newPrice;
            }
          }

          return upd;
        }
      );

      const payload: BulkUpdateAdvertisingPricesPayload = {
        updates,
      };

      await onSubmit(payload);

      // Reset form
      setCurrency(CURRENCY.BDT);
      setSetActive(null);
      setMultiplier("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const hasChanges = currency !== CURRENCY.BDT || setActive !== null || multiplier !== "";

  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader className="border-b">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <HiAdjustments className="h-6 w-6 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-2xl font-bold">Bulk Edit</DrawerTitle>
                <DrawerDescription className="flex items-center gap-2 mt-1">
                  <HiUsers className="h-4 w-4" />
                  Editing {selectedRows.length} selected {selectedRows.length === 1 ? "item" : "items"}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-12rem)]">
            {/* Selected Items Preview */}
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-slate-50 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <HiLightningBolt className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-700">Selected Items</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedRows.slice(0, 5).map((row) => (
                  <Badge
                    key={row.id}
                    variant="secondary"
                    className="bg-white border-blue-200 text-slate-700"
                  >
                    {row.placementLabel}
                  </Badge>
                ))}
                {selectedRows.length > 5 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    +{selectedRows.length - 5} more
                  </Badge>
                )}
              </div>
            </Card>

            {/* Currency Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FaBangladeshiTakaSign className="h-5 w-5 text-emerald-600" />
                <Label className="text-sm font-semibold">Update Currency</Label>
              </div>
              <Select value={currency} onValueChange={(c: Currency) => setCurrency(c)}>
                <SelectTrigger className="h-12 border-slate-200 hover:border-emerald-300">
                  <SelectValue placeholder="Keep current currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="text-xs text-slate-500">
                Apply the same currency to all selected items
              </p>
            </div>

            {/* Active Status */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Set Active Status</Label>
              <Select
                value={setActive === null ? undefined : setActive ? "true" : "false"}
                onValueChange={(val) => {
                  if (val === undefined) setSetActive(null);
                  else setSetActive(val === "true");
                }}
              >
                <SelectTrigger className="h-12 border-slate-200 hover:border-emerald-300">
                  <SelectValue placeholder="Keep current status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="false">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-400" />
                      Inactive
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <p className="text-xs text-slate-500">
                Enable or disable all selected items at once
              </p>
            </div>

            {/* Price Multiplier */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Price Multiplier</Label>
              <Input
                type="number"
                step="0.01"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                placeholder="1.10"
                className="h-12 border-slate-200 focus:border-emerald-500"
                aria-label="Price multiplier"
              />
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <strong>Example:</strong> 1.1 increases prices by 10%, 0.9 reduces by 10%
                </p>
              </div>
            </div>

            {/* Preview Changes */}
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-slate-50 border-emerald-200">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">
                    Changes to Apply:
                  </h3>
                  <ul className="space-y-1 text-sm text-slate-600">
                    {currency && (
                      <li className="flex items-center gap-2">
                        <HiCheck className="h-4 w-4 text-emerald-600" />
                        Currency → {currency}
                      </li>
                    )}
                    {setActive !== null && (
                      <li className="flex items-center gap-2">
                        <HiCheck className="h-4 w-4 text-emerald-600" />
                        Status → {setActive ? "Active" : "Inactive"}
                      </li>
                    )}
                    {multiplier && (
                      <li className="flex items-center gap-2">
                        <HiCheck className="h-4 w-4 text-emerald-600" />
                        Price multiplier: {`x`}{multiplier}
                      </li>
                    )}
                  </ul>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t pb-8 bg-white">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 h-12 hover:bg-slate-50"
              >
                <HiX className="mr-2 h-4 w-4" />
                Cancel
              </Button>

              <motion.div
                whileHover={{ scale: submitting || !hasChanges ? 1 : 1.02 }}
                whileTap={{ scale: submitting || !hasChanges ? 1 : 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !hasChanges}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
                >
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Applying...
                    </>
                  ) : (
                    <>
                      <HiCheck className="mr-2 h-4 w-4" />
                      Apply Changes
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default BulkEditDrawer;