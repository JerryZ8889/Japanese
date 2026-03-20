'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SpeakerButton from './SpeakerButton'
import KanaButton from './KanaButton'
import FeedbackOverlay from './FeedbackOverlay'
import { playKana } from '@/lib/audio/player'
import { shuffleArray } from '@/lib/utils/shuffle'
import { playCorrectSound, playWrongSound, preloadSounds } from '@/lib/utils/sounds'
import { KanaItem } from '@/types'

/** 判断字符串首字是否为平假名 */
const isHiragana = (char: string) => /[\u3041-\u3096]/.test(char[0])

interface QuizCardProps {
  targetKana: KanaItem
  pool: KanaItem[]     // 整个阶段/混合池，用于选干扰项
  onCorrect: () => void
  onWrong: () => void
  onNext: () => void
  currentIndex: number
  total: number
}

export default function QuizCard({
  targetKana,
  pool,
  onCorrect,
  onWrong,
  onNext,
  currentIndex,
  total,
}: QuizCardProps) {
  const [options, setOptions] = useState<KanaItem[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)
  const [selectedChar, setSelectedChar] = useState<string | null>(null)
  const [isCorrectState, setIsCorrectState] = useState<boolean | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    preloadSounds()

    // 生成干扰项：从同一脚本（平假名/片假名）的池中随机选3个
    const targetIsHiragana = isHiragana(targetKana.char)
    const sameScriptPool = pool.filter(
      (k) => k.char !== targetKana.char && isHiragana(k.char[0]) === targetIsHiragana
    )
    const distractors = shuffleArray(sameScriptPool).slice(0, 3)
    setOptions(shuffleArray([targetKana, ...distractors]))

    // 重置状态
    setIsAnswered(false)
    setSelectedChar(null)
    setIsCorrectState(null)
    setShowFeedback(false)

    // 自动播放发音，延迟 400ms 等动画完成
    setIsPlaying(true)
    const timer = setTimeout(async () => {
      try {
        await playKana(targetKana.romaji, targetKana.char)
      } catch {
        // ignore
      } finally {
        setIsPlaying(false)
      }
    }, 400)

    // cleanup：清定时器并重置 isPlaying，防止 StrictMode 第一次 cleanup 后卡住
    return () => {
      clearTimeout(timer)
      setIsPlaying(false)
    }
  }, [targetKana, pool])

  const handleSpeak = async () => {
    if (isPlaying) return
    setIsPlaying(true)
    try {
      await playKana(targetKana.romaji, targetKana.char)
    } catch {
      // ignore
    } finally {
      setIsPlaying(false)
    }
  }

  const handleKanaClick = (kana: KanaItem) => {
    if (isAnswered) return

    setIsAnswered(true)
    setSelectedChar(kana.char)
    const correct = kana.char === targetKana.char
    setIsCorrectState(correct)
    setShowFeedback(true)

    if (correct) {
      onCorrect()
      playCorrectSound()
    } else {
      onWrong()
      playWrongSound()
    }

    setTimeout(() => setShowFeedback(false), 1200)
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md -mt-20">
      {/* 进度条 */}
      <div className="w-full mb-10">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>第 {currentIndex + 1} 题</span>
          <span>共 {total} 题</span>
        </div>
        <div className="progress-bar h-2">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* 发音按钮 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center mb-10"
      >
        <p className="text-gray-400 text-sm mb-4">点击按钮听发音，选出对应的假名</p>
        <SpeakerButton onClick={handleSpeak} isPlaying={isPlaying} />
      </motion.div>

      {/* 假名选项 - 一排四个 */}
      <div className="flex justify-center gap-4 w-full mb-10">
        {options.map((kana, index) => (
          <motion.div
            key={`${kana.char}-${index}`}
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <KanaButton
              kana={kana.char}
              isSelected={selectedChar === kana.char}
              isCorrect={kana.char === targetKana.char ? true : selectedChar === kana.char ? false : null}
              showResult={isAnswered}
              onClick={() => handleKanaClick(kana)}
              disabled={isAnswered}
            />
          </motion.div>
        ))}
      </div>

      {/* 答对后显示罗马音 */}
      <div className="h-8 flex items-center">
        {isAnswered && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 text-sm"
          >
            {targetKana.char} = <span className="font-bold text-primary-pink">{targetKana.romaji}</span>
          </motion.p>
        )}
      </div>

      {/* Next 按钮 */}
      <div className="h-14 flex items-center justify-center mt-2">
        {isAnswered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-8 py-3 bg-gradient-to-r from-primary-pink to-primary-teal text-white font-bold rounded-2xl shadow-lg"
          >
            下一题 →
          </motion.button>
        )}
      </div>

      <FeedbackOverlay show={showFeedback} isCorrect={isCorrectState ?? false} />
    </div>
  )
}
