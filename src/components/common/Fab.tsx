import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface FabProps {
  onClick: () => void
  icon: ReactNode
  className?: string
  'aria-label': string
}

export function Fab({ onClick, icon, className = '', ...rest }: FabProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-lg shadow-black/40 ${className}`}
      {...rest}
    >
      {icon}
    </motion.button>
  )
}
