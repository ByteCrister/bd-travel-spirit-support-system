"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Type,
  Hash,
  MessageSquare,
  Loader2,
  Save,
  Check
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import type { GuideBannerPatchOperation, ID, GuideBannerEntity } from "@/types/guide-banner-settings.types";
import { useGuideBannersStore } from "@/store/guide-banner-setting.store";

interface GuideBannerQuickEditProps {
  id: ID;
  entity: GuideBannerEntity;
}

export default function GuideBannerQuickEdit({ id, entity }: GuideBannerQuickEditProps) {

  const { patchBanner, operations } = useGuideBannersStore();

  const [caption, setCaption] = useState<string>(entity.caption ?? "");
  const [alt, setAlt] = useState<string>(entity.alt ?? "");
  const [order, setOrder] = useState<number>(entity.order);

  const [captionSaved, setCaptionSaved] = useState(false);
  const [altSaved, setAltSaved] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);

  const pending = useMemo<boolean>(() => {
    const op = operations["patch"]?.byId?.[String(id)];
    return op?.status === "pending";
  }, [operations, id]);

  const submitCaption = async () => {
    if (caption === (entity.caption ?? "")) return;
    const ops: GuideBannerPatchOperation[] = [{ op: "replace", path: "/caption", value: caption || null }];
    await patchBanner(id, ops);
    setCaptionSaved(true);
    setTimeout(() => setCaptionSaved(false), 2000);
  };

  const submitAlt = async () => {
    if (alt === (entity.alt ?? "")) return;
    const ops: GuideBannerPatchOperation[] = [{ op: "replace", path: "/alt", value: alt || null }];
    await patchBanner(id, ops);
    setAltSaved(true);
    setTimeout(() => setAltSaved(false), 2000);
  };

  const submitOrder = async () => {
    if (order === entity.order) return;
    const ops: GuideBannerPatchOperation[] = [{ op: "set", path: "/order", value: Number(order) }];
    await patchBanner(id, ops);
    setOrderSaved(true);
    setTimeout(() => setOrderSaved(false), 2000);
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-white to-gray-50/50 border-2 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Label htmlFor={`caption-${id}`} className="flex items-center gap-2 text-sm font-semibold">
            <MessageSquare className="h-4 w-4 text-primary" />
            Caption
          </Label>
          <div className="relative group">
            <Input
              id={`caption-${id}`}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onBlur={() => void submitCaption()}
              disabled={pending}
              placeholder="Enter banner caption..."
              className="pr-10 transition-all focus:ring-2 focus:ring-primary/20"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : captionSaved ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Check className="h-4 w-4 text-emerald-500" />
                </motion.div>
              ) : caption !== (entity.caption ?? "") ? (
                <Save className="h-4 w-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              ) : null}
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Label htmlFor={`alt-${id}`} className="flex items-center gap-2 text-sm font-semibold">
            <Type className="h-4 w-4 text-primary" />
            Alt Text
          </Label>
          <div className="relative group">
            <Input
              id={`alt-${id}`}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              onBlur={() => void submitAlt()}
              disabled={pending}
              placeholder="Enter alt text..."
              className="pr-10 transition-all focus:ring-2 focus:ring-primary/20"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : altSaved ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Check className="h-4 w-4 text-emerald-500" />
                </motion.div>
              ) : alt !== (entity.alt ?? "") ? (
                <Save className="h-4 w-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              ) : null}
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Label htmlFor={`order-${id}`} className="flex items-center gap-2 text-sm font-semibold">
            <Hash className="h-4 w-4 text-primary" />
            Order
          </Label>
          <div className="relative group">
            <Input
              id={`order-${id}`}
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              onBlur={() => void submitOrder()}
              disabled={pending}
              placeholder="0"
              className="pr-10 transition-all focus:ring-2 focus:ring-primary/20"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : orderSaved ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Check className="h-4 w-4 text-emerald-500" />
                </motion.div>
              ) : order !== entity.order ? (
                <Save className="h-4 w-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </Card>
  );
}