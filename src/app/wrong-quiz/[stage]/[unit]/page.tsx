'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Star } from 'lucide-react'
import QuizCard from '@/components/quiz/QuizCard'
import { useStore } from '@/store/useStore'
import { getJpWrongCharsByStageUnit, deleteJpWrongChar, getJpUserWrongChars } from '@/lib/supabase/wrong-chars'
import { getJpUserProgress } from '@/lib/supabase/progress'
import { getJpStudyStats } from '@/lib/supabase/study-records'
import { getJpUserBadges, awardJpBadges, computeNewJpBadges } from '@/lib/supabase/badges'
import { getBadgeById } from '@/data/badges'
import { shuffleArray } from '@/lib/utils/shuffle'
import { KANA_AUDIO_MAP } from '@/data/kana-map'
import { JpWrongChar, KanaItem } from '@/types'
import stage1Data from '@/data/stage1.json'
import stage2Data from '@/data/stage2.json'

type StageJson = { units: Array<{ unit: number; kana: Array<{ char: string; romaji: string }> }> }
const stageDataMap: Record<number, StageJson> = {
  1: stage1Data as StageJson,
  2: stage2Data as StageJson,
}

const STAGE_NAMES: Record<number, string> = { 1: '平假名', 2: '片假名', 3: '混合复习' }

export default function WrongQuizPage() {
  const router = useRouter()
  const params = useParams()
  const stage = parseInt(params.stage as string)
  const unit = parseInt(params.unit as string)
  const { user } = useStore()

  const [wrongChars, setWrongChars] = useState<JpWrongChar[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [currentAnswerCorrect, setCurrentAnswerCorrect] = useState(false)
  const [quizKey, setQuizKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([])
  const [showBadge, setShowBadge] = useState(false)
  const [badgeIdx, setBadgeIdx] = useState(0)

  useEffect(() => { setIsHydrated(true) }, [])

  useEffect(() => {
    if (!isHydrated) return
    const t = setTimeout(() => {
      if (!user) { router.push('/'); return }
      loadWrongChars()
    }, 100)
    return () => clearTimeout(t)
  }, [isHydrated, user, stage, unit, router])

  const loadWrongChars = async () => {
    if (!user?.id) return
    try {
      const data = await getJpWrongCharsByStageUnit(user.id, stage, unit)
      setWrongChars(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  // 构建干扰池：stage1/2 取同阶段；stage3 两者合并（QuizCard 内会按脚本类型过滤）
  const pool: KanaItem[] = useMemo(() => {
    if (stage === 3) {
      return [
        ...stageDataMap[1].units.flatMap((u) => u.kana as KanaItem[]),
        ...stageDataMap[2].units.flatMap((u) => u.kana as KanaItem[]),
      ]
    }
    const stageData = stageDataMap[stage]
    if (!stageData) return []
    return stageData.units.flatMap((u) => u.kana as KanaItem[])
  }, [stage])

  // 用 useMemo 缓存，确保 onCorrect/onWrong 触发重渲染时对象引用不变，
  // 避免 QuizCard 的 useEffect 误触发并重置 isAnswered 状态
  const currentTarget = useMemo<KanaItem | null>(() => {
    const wc = wrongChars[currentIndex]
    if (!wc) return null
    return {
      char: wc.char,
      romaji: KANA_AUDIO_MAP[wc.char] || wc.romaji,
    }
  }, [wrongChars, currentIndex])

  const handleCorrect = useCallback(() => {
    setCurrentAnswerCorrect(true)
    setCorrectCount((n) => n + 1)
  }, [])

  const handleWrong = useCallback(() => {
    setCurrentAnswerCorrect(false)
  }, [])

  const handleNext = useCallback(async () => {
    if (wrongChars.length === 0 || !wrongChars[currentIndex]) {
      setIsComplete(true)
      return
    }
    const current = wrongChars[currentIndex]

    if (currentAnswerCorrect && current) {
      // 答对：从DB删除，从列表移除
      if (user?.id) {
        try { await deleteJpWrongChar(user.id, current.char) } catch (e) { console.error(e) }
      }
      setWrongChars((prev) => {
        const next = [...prev]
        next.splice(currentIndex, 1)
        return next
      })
      if (wrongChars.length === 1) {
        // 最后一题答对，触发完成
        setIsComplete(true)
        return
      }
    } else {
      // 答错：移到末尾
      setWrongChars((prev) => {
        const current = prev[currentIndex]
        const next = [...prev]
        next.splice(currentIndex, 1)
        next.push(current)
        return next
      })
      setQuizKey((k) => k + 1)
    }
    setCurrentAnswerCorrect(false)
  }, [currentAnswerCorrect, currentIndex, wrongChars, user?.id])

  // 完成后检测徽章
  useEffect(() => {
    if (!isComplete || !user?.id) return
    const checkBadges = async () => {
      try {
        const [allProg, stats, allWrong, earnedBadges] = await Promise.all([
          getJpUserProgress(user.id),
          getJpStudyStats(user.id),
          getJpUserWrongChars(user.id),
          getJpUserBadges(user.id),
        ])
        const newIds = computeNewJpBadges(stats, allProg, allWrong.length, earnedBadges.map((b) => b.badge_id))
        if (newIds.length > 0) {
          await awardJpBadges(user.id, newIds)
          setNewBadgeIds(newIds)
          setShowBadge(true)
        }
      } catch (e) { console.error(e) }
    }
    checkBadges()
  }, [isComplete, user?.id])

  const currentBadge = newBadgeIds[badgeIdx] ? getBadgeById(newBadgeIds[badgeIdx]) : null
  const nextBadge = () => {
    if (badgeIdx < newBadgeIds.length - 1) setBadgeIdx((i) => i + 1)
    else setShowBadge(false)
  }

  if (isLoading || !isHydrated) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-2xl animate-pulse">加载中...</div></div>
  }

  if (wrongChars.length === 0 && !isComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🎉</div>
        <p className="text-xl text-gray-600 mb-6">该单元没有错字</p>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/wrong-book')}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl"
        >返回错字本</motion.button>
      </div>
    )
  }

  if (isComplete) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center">
        {/* 徽章弹窗 */}
        <AnimatePresence>
          {showBadge && currentBadge && (
            <motion.div
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl"
                initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}
              >
                <motion.div
                  className="text-8xl mb-4"
                  animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.2, 1.2, 1] }}
                  transition={{ duration: 0.8 }}
                >{currentBadge.emoji}</motion.div>
                <p className="text-sm text-primary-pink font-bold mb-1">🎉 新徽章解锁！</p>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{currentBadge.name}</h3>
                <p className="text-gray-500 mb-6">{currentBadge.description}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={nextBadge}
                  className="px-8 py-3 bg-gradient-to-r from-primary-pink to-primary-teal text-white font-bold rounded-2xl w-full"
                >
                  {badgeIdx < newBadgeIds.length - 1 ? '下一个 →' : '太棒了！'}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">练习完成！</h1>
          <p className="text-gray-500 mb-6">{STAGE_NAMES[stage]} — 单元 {unit}</p>
          <div className="bg-white rounded-3xl p-8 shadow-lg mb-8 w-full max-w-sm flex items-center justify-center gap-3">
            <Star className="w-8 h-8 text-functional-star fill-functional-star" />
            <div>
              <p className="text-3xl font-bold text-functional-success">{correctCount}</p>
              <p className="text-gray-400 text-sm">个假名已掌握</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/wrong-book')}
            className="px-8 py-3 bg-gradient-to-r from-primary-pink to-primary-teal text-white font-bold rounded-2xl shadow-lg"
          >
            返回错字本
          </motion.button>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6 flex flex-col">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/wrong-book')}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">错字练习</h1>
          <p className="text-sm text-gray-500">
            {STAGE_NAMES[stage]} — 单元 {unit} · 剩余 {wrongChars.length} 个
          </p>
        </div>
      </motion.header>

      <div className="flex-1 flex items-center justify-center">
        {currentTarget && (
          <QuizCard
            key={`${currentTarget.char}-${currentIndex}-${quizKey}`}
            targetKana={currentTarget}
            pool={pool}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            onNext={handleNext}
            currentIndex={currentIndex}
            total={wrongChars.length}
          />
        )}
      </div>
    </main>
  )
}
