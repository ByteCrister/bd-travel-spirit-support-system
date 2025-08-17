// components/ui/Logo.tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import React from 'react'

export default function Logo() {
  return (
    <motion.div
      className="flex items-center space-x-4 cursor-pointer"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
    >
      <div className="relative w-[180px] h-[100px]">
        <Image
          src="/images/travel_spirit.png"
          alt="BD Travel Spirit Logo"
          fill
          quality={100}
          className="object-contain"
          sizes="180px"
        />
      </div>
    </motion.div>
  )
}
