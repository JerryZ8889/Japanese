'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Circle, PlayCircle } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { getJpUserProgress } from '@/lib/supabase/progress'
import { JpUnitProgress } from '@/types'
import stage1Data from '@/data/stage1.json'
import stage2Data from '@/data/stage2.json'
import stage3Data from '@/data/stage3.json'

const STAGE_INFO: Record<number, { name: string; nameJa: string; totalUnits: number }> = {
  1: { name: '平假名', nameJa: 'ひらがな', totalUnits: 8 },
  2: { name: '片假名', nameJa: 'カタカナ', totalUnits: 8 },
  3: { name: '混合复习', nameJa: 'まとめ', totalUnits: 4 },
}

export default function UnitSelectPage() {
  const router = useRouter()
  const params = useParams()
  const stage = parseInt(params.stage as string)
  const { user } = useStore()
  const [progress, setProgress] = useState<JpUnitProgress[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => { setIsHydrated(true) }, [])

  useEffect(() => {
    if (!isHydrated) return
    const t = setTimeout(async () => {
      if (!user) { router.push('/'); return }
      try {
        const data = await getJpUserProgress(user.id)
        setProgress(data.filter((p) => p.stage === stage))
      } catch (e) {
        console.error(e)
      }
    }, 100)
    return () => clearTimeout(t)
  }, [isHydrated, user, stage, router])

  const stageInfo = STAGE_INFO[stage]
  if (!stageInfo) { router.push('/stages'); return null }

  // 获取单元名称
  const getUnitName = (unit: number): string => {
    if (stage === 1) return stage1Data.units.find((u) => u.unit === unit)?.name || `单元 ${unit}`
    if (stage === 2) return stage2Data.units.find((u) => u.unit === unit)?.name || `单元 ${unit}`
    if (stage === 3) {
      const u = (stage3Data as { units: Array<{ unit: number; name: string }> }).units.find((u) => u.unit === unit)
      return u?.name || `单元 ${unit}`
    }
    return `单元 ${unit}`
  }

  const getUnitProgress = (unit: number) => progress.find((p) => p.unit === unit)

  return (
    <main className="min-h-screen p-6">
      {/* 头部 */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/stages')}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </motion.button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{stageInfo.name}</h1>
          <p className="text-gray-400 text-sm">{stageInfo.nameJa}</p>
        </div>
      </motion.header>

      {/* 单元网格 */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: stageInfo.totalUnits }, (_, i) => i + 1).map((unit, idx) => {
          const unitProgress = getUnitProgress(unit)
          const isCompleted = unitProgress?.completed
          const isInProgress = unitProgress && !unitProgress.completed && unitProgress.current_index > 0
          const accuracy = isCompleted && unitProgress.total > 0
            ? Math.round((unitProgress.score / unitProgress.total) * 100)
            : null

          return (
            <motion.button
              key={unit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(`/quiz/${stage}/${unit}`)}
              className={`
                p-4 rounded-2xl text-left shadow-sm transition-all
                ${isCompleted
                  ? 'bg-green-50 border-2 border-functional-success'
                  : isInProgress
                  ? 'bg-blue-50 border-2 border-blue-400'
                  : 'bg-white border-2 border-gray-100'}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-500">单元 {unit}</span>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-functional-success" />
                ) : isInProgress ? (
                  <PlayCircle className="w-5 h-5 text-blue-400" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
              </div>
              <p className="text-xs text-gray-500 leading-snug">{getUnitName(unit)}</p>
              {isCompleted && accuracy !== null && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-functional-success rounded-full"
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                  <p className="text-xs text-functional-success mt-1">{accuracy}% 正确率</p>
                </div>
              )}
              {isInProgress && (
                <p className="text-xs text-blue-400 mt-1">进行中 {unitProgress.current_index}/{unitProgress.total}</p>
              )}
            </motion.button>
          )
        })}
      </div>
    </main>
  )
}
