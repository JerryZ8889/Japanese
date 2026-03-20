'use client'

import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'

interface SpeakerButtonProps {
  onClick: () => void
  isPlaying: boolean
  showHint?: boolean
}

export default function SpeakerButton({ onClick, isPlaying, showHint = false }: SpeakerButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isPlaying}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.93 }}
      animate={showHint && !isPlaying ? { scale: [1, 1.15, 1] } : {}}
      transition={showHint && !isPlaying ? { duration: 1.2, repeat: Infinity } : {}}
      className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary-pink to-primary-teal text-white shadow-xl flex items-center justify-center disabled:opacity-80"
    >
      {isPlaying && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-primary-pink/40"
            animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-primary-pink/30"
            animate={{ scale: [1, 1.9], opacity: [0.4, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
          />
        </>
      )}
      <Volume2 className="w-12 h-12 relative z-10" />
    </motion.button>
  )
}
