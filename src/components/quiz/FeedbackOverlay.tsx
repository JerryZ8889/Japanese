'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface FeedbackOverlayProps {
  show: boolean
  isCorrect: boolean
}

const COLORS = ['#FF6B9D', '#FFE66D', '#4ECDC4', '#C3B1E1', '#FF9A3C']

export default function FeedbackOverlay({ show, isCorrect }: FeedbackOverlayProps) {
  if (!isCorrect) return null  // 答错不显示撒花

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {/* 撒花彩带 */}
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-0 w-3 h-3 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: COLORS[i % COLORS.length],
              }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{
                y: window.innerHeight + 20,
                opacity: [1, 1, 0],
                rotate: Math.random() * 720 - 360,
                x: (Math.random() - 0.5) * 200,
              }}
              transition={{
                duration: 1.5 + Math.random() * 0.8,
                delay: Math.random() * 0.3,
                ease: 'easeIn',
              }}
            />
          ))}

          {/* 中心正确提示 */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-7xl">⭐</span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
