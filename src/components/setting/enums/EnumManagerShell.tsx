// src/components/enums/EnumManagerShell.tsx
"use client";

import { JSX, useState } from "react";
import { motion } from "framer-motion";
import GroupsList from "./GroupsList";
import GroupDetail from "./GroupDetail";
import useEnumSettingsStore from "@/store/site-settings/enumSettings.store";

export default function EnumManagerShell(): JSX.Element {
  const { fetchGroup } = useEnumSettingsStore();

  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = async (_id: string) => {
    // alert(_id)
    setSelected(_id);
    await fetchGroup(_id);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-lg border shadow-lg overflow-hidden"
    >
      <div className="md:flex">
        <motion.div
          className="md:flex-none"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GroupsList selected={selected} onSelect={(_id: string) => handleSelect(_id)} />
        </motion.div>
        <motion.div
          className="flex-1 md:pl-4"
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