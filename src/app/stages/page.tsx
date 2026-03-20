'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, BookOpen, Flame, Calendar, Trophy, Award } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { getJpUserProgress } from '@/lib/supabase/progress'
import { getJpStudyStats } from '@/lib/supabase/study-records'

const STAGE_CONFIGS = [
  {
    stage: 1,
    name: '平假名',
    nameJa: 'ひらがな',
    emoji: '🌸',
    totalUnits: 8,
    description: '五十音・濁音・拗音，共105字',
    gradient: 'from-pink-400 to-rose-500',
  },
  {
    stage: 2,
    name: '片假名',
    nameJa: 'カタカナ',
    emoji: '⚡',
    totalUnits: 8,
    description: '五十音・濁音・拗音，共106字',
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    stage: 3,
    name: '混合复习',
    nameJa: 'まとめ',
    emoji: '🏆',
    totalUnits: 4,
    description: '平假名＋片假名综合练习',
    gradient: 'from-purple-400 to-violet-500',
  },
]

export default function StagesPage() {
  const router = useRouter()
  const { user, logout } = useStore()
  const [stageProgress, setStageProgress] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0 })
  const [studyStats, setStudyStats] = useState({ streakDays: 0, totalDays: 0, totalUnitsCompleted: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => { setIsHydrated(true) }, [])

  const loadData = useCallback(async () => {
    if (!user?.id) { setIsLoading(false); return }
    try {
      const [progress, stats] = await Promise.all([
        getJpUserProgress(user.id),
        getJpStudyStats(user.id),
      ])
      const p: Record<number, number> = { 1: 0, 2: 0, 3: 0 }
      progress.forEach((u) => { if (u.completed) p[u.stage] = (p[u.stage] || 0) + 1 })
      setStageProgress(p)
      setStudyStats(stats)
    } catch (e) {
      console.error('加载数据失败:', e)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!isHydrated) return
    const t = setTimeout(() => {
      if (!user) { router.push('/'); return }
      loadData()
    }, 100)
    return () => clearTimeout(t)
  }, [isHydrated, user, router, loadData])

  if (!isHydrated || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-2xl animate-pulse">加载中...</div></div>
  }

  return (
    <main className="min-h-screen p-6 pb-28">
      {/* 头部 */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">你好，{user.username}！</h1>
          <p className="text-gray-500 text-sm">今天想练哪种假名？</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { logout(); router.push('/') }}
          className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <LogOut className="w-5 h-5 text-gray-600" />
        </motion.button>
      </motion.header>

      {/* 学习统计 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-primary-pink to-primary-teal rounded-2xl p-4 mb-6 text-white"
      >
        <div className="flex justify-around text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <Flame className="w-5 h-5" />
              <span className="text-2xl font-bold">{studyStats.streakDays}</span>
            </div>
            <span className="text-xs opacity-90">连续学习</span>
          </div>
          <div className="w-px bg-white/30" />
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="w-5 h-5" />
              <span className="text-2xl font-bold">{studyStats.totalDays}</span>
            </div>
            <span className="text-xs opacity-90">学习天数</span>
          </div>
          <div className="w-px bg-white/30" />
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <Trophy className="w-5 h-5" />
              <span className="text-2xl font-bold">{studyStats.totalUnitsCompleted}</span>
            </div>
            <span className="text-xs opacity-90">完成单元</span>
          </div>
        </div>
      </motion.div>

      {/* 阶段卡片 */}
      <div className="flex flex-col gap-4 mb-8">
        {STAGE_CONFIGS.map((cfg, i) => {
          const done = stageProgress[cfg.stage] || 0
          const pct = Math.round((done / cfg.totalUnits) * 100)
          return (
            <motion.button
              key={cfg.stage}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/stages/${cfg.stage}`)}
              className="w-full text-left"
            >
              <div className="bg-white rounded-2xl p-5 shadow-md">
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-3xl shadow-sm`}>
                    {cfg.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-xl font-bold text-gray-800">{cfg.name}</h2>
                      <span className="text-sm text-gray-400">{cfg.nameJa}</span>
                    </div>
                    <p className="text-sm text-gray-500">{cfg.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-700">{done}/{cfg.totalUnits}</p>
                    <p className="text-xs text-gray-400">单元</p>
                  </div>
                </div>
                {/* 进度条 */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">{pct}%</p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* 底部按钮 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/wrong-book')}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-400 to-red-500 text-white font-bold rounded-2xl shadow-lg"
        >
          <BookOpen className="w-5 h-5" />
          错字本
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/achievements')}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-2xl shadow-lg"
        >
          <Award className="w-5 h-5" />
          成就
        </motion.button>
      </motion.div>
    </main>
  )
}
