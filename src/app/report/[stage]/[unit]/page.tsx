'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ArrowLeft, RefreshCw, Home } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { getJpUnitProgress, getJpUserProgress } from '@/lib/supabase/progress'
import { getJpStudyStats } from '@/lib/supabase/study-records'
import { getJpUserWrongChars } from '@/lib/supabase/wrong-chars'
import { getJpUserBadges, awardJpBadges, computeNewJpBadges } from '@/lib/supabase/badges'
import { getBadgeById } from '@/data/badges'
import { KANA_AUDIO_MAP } from '@/data/kana-map'

const STAGE_NAMES: Record<number, string> = { 1: '平假名', 2: '片假名', 3: '混合复习' }

export default function ReportPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useStore()
  const stage = parseInt(params.stage as string)
  const unit = parseInt(params.unit as string)

  const [isLoading, setIsLoading] = useState(true)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(15)
  const [wrongChars, setWrongChars] = useState<string[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([])
  const [showBadge, setShowBadge] = useState(false)
  const [badgeIdx, setBadgeIdx] = useState(0)

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0
  const starCount = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0

  useEffect(() => { setIsHydrated(true) }, [])

  useEffect(() => {
    if (!isHydrated) return
    const load = async () => {
      if (!user?.id) { router.push('/'); return }
      try {
        const data = await getJpUnitProgress(user.id, stage, unit)
        const s = data?.score ?? 0
        const t = data?.total ?? 15
        const wc = data?.wrong_chars ?? []
        setScore(s); setTotal(t); setWrongChars(wc)

        // 徽章检测
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
      } catch (e) { console.error(e) } finally { setIsLoading(false) }
    }
    load()
  }, [isHydrated, user, stage, unit, router])

  const currentBadge = newBadgeIds[badgeIdx] ? getBadgeById(newBadgeIds[badgeIdx]) : null

  const nextBadge = () => {
    if (badgeIdx < newBadgeIds.length - 1) setBadgeIdx((i) => i + 1)
    else setShowBadge(false)
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-2xl animate-pulse">加载中...</div></div>
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center relative">
      {/* 新徽章弹窗 */}
      <AnimatePresence>
        {showBadge && currentBadge && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.5 }}
            >
              <motion.div
                className="text-8xl mb-4"
                animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1.2, 1.1, 1.1, 1] }}
                transition={{ duration: 0.8 }}
              >
                {currentBadge.emoji}
              </motion.div>
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
        className="flex flex-col items-center text-center w-full max-w-sm"
      >
        {/* 标题 */}
        <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">🎉 恭喜完成！ 🎉</h1>
          <p className="text-gray-400 text-sm">{STAGE_NAMES[stage]} — 单元 {unit}</p>
        </motion.div>

        {/* 星星评分 */}
        <div className="flex gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2 + i * 0.15 }}
            >
              <Star className={`w-12 h-12 ${i < starCount ? 'text-functional-star fill-functional-star' : 'text-gray-200'}`} />
            </motion.div>
          ))}
        </div>

        {/* 得分卡片 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-6 shadow-lg mb-6 w-full"
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-400 text-sm">得分</p>
              <p className="text-3xl font-bold text-primary-pink">{score} / {total}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">正确率</p>
              <p className="text-3xl font-bold text-functional-success">{accuracy}%</p>
            </div>
          </div>

          {/* 错字列表（显示假名+罗马音） */}
          {wrongChars.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              className="pt-4 border-t border-gray-100"
            >
              <p className="text-gray-400 text-sm mb-3">需要复习的假名：</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {wrongChars.map((char, i) => (
                  <motion.div
                    key={char + i}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.05 }}
                    className="flex flex-col items-center px-3 py-2 bg-red-50 text-red-500 rounded-xl border border-red-200"
                  >
                    <span className="text-xl font-bold">{char}</span>
                    <span className="text-xs opacity-70">{KANA_AUDIO_MAP[char] || ''}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 操作按钮 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}
          className="flex flex-col gap-3 w-full"
        >
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/stages/${stage}`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl"
          >
            <ArrowLeft className="w-5 h-5" /> 返回单元列表
          </motion.button>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/quiz/${stage}/${unit}`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-pink to-primary-teal text-white font-bold rounded-2xl"
          >
            <RefreshCw className="w-5 h-5" /> 再练一次
          </motion.button>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/stages')}
            className="flex items-center justify-center gap-2 text-gray-400 py-2"
          >
            <Home className="w-4 h-4" /> 返回首页
          </motion.button>
        </motion.div>
      </motion.div>
    </main>
  )
}
