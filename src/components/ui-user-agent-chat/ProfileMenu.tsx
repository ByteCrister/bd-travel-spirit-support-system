// components/chat/ProfileMenu.tsx
'use client'

import { getInitials } from '@/utils/helper/getInitials'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover'
import { motion, Variants } from 'framer-motion'
import { FiLogOut } from 'react-icons/fi'
import { User } from '@/types/user.type'

interface ProfileMenuProps {
  currentUser: User | null
  onLogout: () => void
}

const menuVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit:    { opacity: 0, scale: 0.95, y: -10 },
}

export default function ProfileMenu({
  currentUser,
  onLogout,
}: ProfileMenuProps) {
  if (!currentUser) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
          aria-label="Open profile menu"
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
                     focus-visible:ring-indigo-500 rounded-full"
        >
          <Avatar className="w-10 h-10 ring-2 ring-white ring-offset-2 ring-offset-indigo-600">
            {currentUser.avatar ? (
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            ) : (
              <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
            )}
          </Avatar>
        </motion.button>
      </PopoverTrigger>

      <PopoverContent asChild align="end">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={menuVariants}
          transition={{ type: 'spring', stiffness: 250, damping: 20 }}
          className="w-64 bg-white dark:bg-gray-800/75 backdrop-blur-md rounded-2xl 
                     shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden"
        >
          {/* Profile Header */}
          <div className="flex flex-col items-center px-6 pt-6 pb-4">
            <Avatar className="w-20 h-20 ring-4 ring-indigo-500">
              {currentUser.avatar ? (
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              ) : (
                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
              )}
            </Avatar>
            <h4 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {currentUser.name}
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
              {currentUser.email}
            </p>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700" />

          {/* Actions */}
          <div className="flex flex-col px-2 py-2">
            <button
              onClick={onLogout}
              className="flex items-center w-full px-4 py-2 text-red-600 
                         hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors 
                         rounded-lg focus:outline-none focus-visible:ring-2 
                         focus-visible:ring-offset-2 focus-visible:ring-red-500"
            >
              <FiLogOut className="mr-3 text-xl" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  )
}
