'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import QuizCard from '@/components/quiz/QuizCard'
import { useStore } from '@/store/useStore'
import { KanaItem, MixedUnitConfig } from '@/types'
import { getJpUnitProgress, saveJpUnitProgress, updateJpUnitProgress } from '@/lib/supabase/progress'
import { recordJpWrongChar } from '@/lib/supabase/wrong-chars'
import { recordJpStudy } from '@/lib/supabase/study-records'
import { shuffleArray } from '@/lib/utils/shuffle'
import stage1Data from '@/data/stage1.json'
import stage2Data from '@/data/stage2.json'
import stage3Data from '@/data/stage3.json'

type RawStageData = typeof stage1Data

const stageDataMap: Record<number, RawStageData> = {
  1: stage1Data as RawStageData,
  2: stage2Data as RawStageData,
}

const STAGE_NAMES: Record<number, string> = {
  1: '平假名',
  2: '片假名',
  3: '混合复习',
}

export default function QuizPage() {
  const router = useRouter()
  const params = useParams()
  const stage = parseInt(params.stage as string)
  const unit = parseInt(params.unit as string)
  const { user } = useStore()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [wrongChars, setWrongChars] = useState<string[]>([])
  const [unitKana, setUnitKana] = useState<KanaItem[]>([])
  const [pool, setPool] = useState<KanaItem[]>([])  // 干扰项候选池
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const [showResumeDialog, setShowResumeDialog] = useState(false)
  const [savedProgress, setSavedProgress] = useState<{ idx: number; score: number; wrongChars: string[] } | null>(null)

  useEffect(() => { setIsHydrated(true) }, [])

  useEffect(() => {
    if (!isHydrated) return
    const t = setTimeout(() => {
      if (!user) { router.push('/'); return }
      loadUnitKana()
    }, 100)
    return () => clearTimeout(t)
  }, [isHydrated, user, stage, unit])

  const loadUnitKana = async () => {
    let kana: KanaItem[] = []
    let distractorPool: KanaItem[] = []

    if (stage === 1 || stage === 2) {
      const data = stageDataMap[stage]
      const unitData = data.units.find((u) => u.unit === unit)
      kana = shuffleArray((unitData?.kana as KanaItem[]) || [])
      // 整个阶段的kana作为干扰池
      distractorPool = data.units.flatMap((u) => u.kana as KanaItem[])
    } else if (stage === 3) {
      // 混合复习：从sourceStages/sourceUnits动态抽取
      const cfg = (stage3Data.units as MixedUnitConfig[]).find((u) => u.unit === unit)
      if (cfg) {
        const allKana: KanaItem[] = []
        for (const srcStage of cfg.sourceStages) {
          const srcData = stageDataMap[srcStage]
          for (const srcUnit of cfg.sourceUnits) {
            const ud = srcData?.units.find((u) => u.unit === srcUnit)
            if (ud) allKana.push(...(ud.kana as KanaItem[]))
          }
        }
        // 两个脚本分别构建干扰池
        distractorPool = allKana
        kana = shuffleArray(allKana).slice(0, cfg.count)
      }
    }

    setUnitKana(kana)
    setPool(distractorPool)

    // 检查是否有未完成进度（断点续练）
    if (user?.id && kana.length > 0) {
      const prog = await getJpUnitProgress(user.id, stage, unit)
      if (prog && !prog.completed && prog.current_index > 0) {
        setSavedProgress({ idx: prog.current_index, score: prog.score, wrongChars: prog.wrong_chars })
        setShowResumeDialog(true)
      }
    }
    setIsLoading(false)
  }

  // 每次答题后保存进度
  const saveProgress = useCallback(async () => {
    if (!user?.id || unitKana.length === 0) return
    try {
      await saveJpUnitProgress({
        user_id: user.id, stage, unit,
        current_index: currentIndex, score,
        total: unitKana.length, wrong_chars: wrongChars,
        completed: false, completed_at: null,
      })
    } catch (e) { console.error(e) }
  }, [user?.id, stage, unit, currentIndex, score, wrongChars, unitKana.length])

  useEffect(() => {
    if (!isLoading && user?.id && (currentIndex > 0 || score > 0 || wrongChars.length > 0)) {
      const t = setTimeout(saveProgress, 500)
      return () => clearTimeout(t)
    }
  }, [currentIndex, score, wrongChars, isLoading, user?.id, saveProgress])

  const handleResume = () => {
    if (savedProgress) {
      setCurrentIndex(savedProgress.idx)
      setScore(savedProgress.score)
      setWrongChars(savedProgress.wrongChars)
    }
    setShowResumeDialog(false)
  }

  const handleStartOver = async () => {
    if (user?.id) {
      await updateJpUnitProgress(user.id, stage, unit, { current_index: 0, score: 0, wrong_chars: [], completed: false })
    }
    setCurrentIndex(0); setScore(0); setWrongChars([])
    setShowResumeDialog(false)
  }

  const handleCorrect = useCallback(() => { setScore((s) => s + 1) }, [])

  const handleWrong = useCallback(async () => {
    const kana = unitKana[currentIndex]
    setWrongChars((prev) => [...prev, kana.char])
    if (user?.id) {
      try { await recordJpWrongChar(user.id, kana.char, kana.romaji, stage, unit) } catch (e) { console.error(e) }
    }
  }, [currentIndex, unitKana, user?.id, stage, unit])

  const handleComplete = useCallback(async () => {
    if (user?.id) {
      try {
        await saveJpUnitProgress({
          user_id: user.id, stage, unit,
          current_index: unitKana.length, completed: true,
          score, total: unitKana.length,
          wrong_chars: wrongChars, completed_at: new Date().toISOString(),
        })
        await recordJpStudy(user.id)
      } catch (e) { console.error(e) }
    }
    router.push(`/report/${stage}/${unit}`)
  }, [user?.id, stage, unit, unitKana.length, score, wrongChars, router])

  const handleNext = useCallback(() => {
    if (currentIndex < unitKana.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      handleComplete()
    }
  }, [currentIndex, unitKana.length, handleComplete])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-2xl animate-pulse">加载中...</div></div>
  }

  if (showResumeDialog) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center"
        >
          <div className="text-5xl mb-4">📖</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">发现未完成的练习</h2>
          <p className="text-gray-500 mb-6">
            上次练习到第 {savedProgress?.idx} 题，得分 {savedProgress?.score} 分
          </p>
          <div className="flex gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleStartOver}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl"
            >重新开始</motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleResume}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-pink to-primary-teal text-white font-bold rounded-2xl"
            >继续练习</motion.button>
          </div>
        </motion.div>
      </div>
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
          onClick={() => router.push(`/stages/${stage}`)}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </motion.button>
        <h1 className="text-xl font-bold text-gray-800">
          {STAGE_NAMES[stage]} — 单元 {unit}
        </h1>
      </motion.header>

      <div className="flex-1 flex items-center justify-center">
        {unitKana.length > 0 && (
          <QuizCard
            targetKana={unitKana[currentIndex]}
            pool={pool}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            onNext={handleNext}
            currentIndex={currentIndex}
            total={unitKana.length}
          />
        )}
      </div>
    </main>
  )
}
