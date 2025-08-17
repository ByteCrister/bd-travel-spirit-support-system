// components/Navbar.tsx
'use client'

import { motion } from 'framer-motion'
import { User } from '@/types/user.type'
import Logo from './Logo'
import ProfileMenu from '@/components/ui-user-agent-chat/ProfileMenu'
import { Separator } from './separator'

interface NavbarProps {
  currentUser: User | null
  onLogout: () => void
}

export default function Navbar({ currentUser, onLogout }: NavbarProps) {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative  top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-md px-6 py-3 flex items-center justify-between"
    >
     {/* shadcn Separator with refined logo colors */}
      <Separator className="absolute bottom-0 left-0 w-full h-1
         bg-gradient-to-r 
         from-[#1f518a] 
         via-[#9eb0d6] 
         to-[#08165e]" />

         <Logo />
      <ProfileMenu currentUser={currentUser} onLogout={onLogout} />
    </motion.nav>
  )
}
