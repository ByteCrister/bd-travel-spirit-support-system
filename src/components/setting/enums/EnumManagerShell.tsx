// src/components/enums/EnumManagerShell.tsx
"use client";

import { JSX, useState } from "react";
import { motion } from "framer-motion";
import GroupsList from "./GroupsList";
import GroupDetail from "./GroupDetail";
import useEnumSettingsStore from "@/store/site-settings/enumSettings.store";

// ── Neu style tokens ──────────────────────────────────────────
const S = {
  shell:
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] " +
    "border border-white/60 overflow-hidden",
  inner: "md:flex min-h-[600px]",
  sidebar: "md:w-72 lg:w-80 flex-none border-b md:border-b-0 md:border-r border-[#1E2938]/10",
  detail: "flex-1 min-w-0",
};

export default function EnumManagerShell(): JSX.Element {
  const { fetchGroup } = useEnumSettingsStore();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = async (_id: string) => {
    setSelected(_id);
    await fetchGroup(_id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={S.shell}
    >
      <div className={S.inner}>
        <motion.div
          className={S.sidebar}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GroupsList
            selected={selected}
            onSelect={(_id: string) => void handleSelect(_id)}
          />
        </motion.div>

        <motion.div
          className={S.detail}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <GroupDetail selected={selected} />
        </motion.div>
      </div>
    </motion.div>
  );
}