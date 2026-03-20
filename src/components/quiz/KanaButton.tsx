'use client'

import { motion } from 'framer-motion'

interface KanaButtonProps {
  kana: string       // 假名字符（1-2个字符）
  isSelected: boolean
  isCorrect: boolean | null   // true=正确, false=错误, null=未判断
  showResult: boolean
  onClick: () => void
  disabled: boolean
}

export default function KanaButton({
  kana,
  isSelected,
  isCorrect,
  showResult,
  onClick,
  disabled,
}: KanaButtonProps) {
  const isYoon = kana.length > 1  // 拗音（两字组合）

  const getBgClass = () => {
    if (!showResult) return 'bg-white hover:bg-pink-50 border-2 border-gray-200 hover:border-primary-pink text-gray-800'
    if (isCorrect === true) return 'bg-green-100 border-2 border-functional-success text-functional-success'
    if (isSelected && isCorrect === false) return 'bg-red-100 border-2 border-functional-warning text-functional-warning'
    return 'bg-white border-2 border-gray-200 text-gray-400 opacity-60'
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.06, y: -3 } : {}}
      whileTap={!disabled ? { scale: 0.94 } : {}}
      className={`
        w-[72px] h-[72px] md:w-20 md:h-20
        rounded-2xl shadow-md flex items-center justify-center
        font-bold transition-colors duration-200
        ${getBgClass()}
        ${isSelected && showResult ? 'shadow-lg' : ''}
      `}
    >
      <span className={isYoon ? 'text-xl leading-tight' : 'text-3xl'}>
        {kana}
      </span>
    </motion.button>
  )
}
