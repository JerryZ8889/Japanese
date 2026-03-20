'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronDown, ChevronRight, Volume2, Play } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { getJpUserWrongChars } from '@/lib/supabase/wrong-chars'
import { playKana } from '@/lib/audio/player'
import { JpWrongChar } from '@/types'

const STAGE_NAMES: Record<number, string> = { 1: '平假名', 2: '片假名', 3: '混合复习' }

interface GroupedWrongChars {
  [key: string]: { chars: JpWrongChar[]; stage: number; unit: number }
}

export default function WrongBookPage() {
  const router = useRouter()
  const { user } = useStore()
  const [wrongChars, setWrongChars] = useState<JpWrongChar[]>([])
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => { setIsHydrated(true) }, [])

  useEffect(() => {
    if (!isHydrated) return
    const timer = setTimeout(() => {
      if (!user) { router.push('/'); return }
      loadWrongChars()
    }, 100)
    return () => clearTimeout(timer)
  }, [isHydrated, user, router])

  const loadWrongChars = async () => {
    if (!user?.id) return
    try {
      const data = await getJpUserWrongChars(user.id)
      setWrongChars(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const groupedChars: GroupedWrongChars = wrongChars.reduce((acc, item) => {
    const key = `${STAGE_NAMES[item.stage]} — 单元 ${item.unit}`
    if (!acc[key]) acc[key] = { chars: [], stage: item.stage, unit: item.unit }
    acc[key].chars.push(item)
    return acc
  }, {} as GroupedWrongChars)

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handlePlay = useCallback(async (romaji: string, char: string) => {
    try { await playKana(romaji, char) } catch (e) { console.error(e) }
  }, [])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-2xl animate-pulse">加载中...</div></div>
  }

  return (
    <main className="min-h-screen p-6 pb-20">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/stages')}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">我的错字本</h1>
          <p className="text-sm text-gray-500">共 {wrongChars.length} 个假名</p>
        </div>
      </motion.header>

      {Object.keys(groupedChars).length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-500 text-lg">太棒了！还没有错字</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedChars).map(([key, data], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleGroup(key)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedGroups.has(key)
                    ? <ChevronDown className="w-5 h-5 text-gray-400" />
                    : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  <span className="font-medium text-gray-800">{key}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{data.chars.length} 个</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); router.push(`/wrong-quiz/${data.stage}/${data.unit}`) }}
                    className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-primary-pink to-primary-teal text-white text-sm font-medium rounded-lg"
                  >
                    <Play className="w-3 h-3" />
                    练习
                  </motion.button>
                </div>
              </button>

              <AnimatePresence>
                {expandedGroups.has(key) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-4 flex flex-wrap gap-3">
                      {data.chars.map((item, i) => (
                        <motion.div
                          key={item.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => handlePlay(item.romaji, item.char)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center px-3 py-2 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-colors relative"
                        >
                          <Volume2 className="absolute top-1 right-1 w-3 h-3 text-gray-300" />
                          <span className="text-2xl font-bold text-gray-800">{item.char}</span>
                          <span className="text-xs text-gray-400">{item.romaji}</span>
                          <span className="text-xs text-red-400 mt-0.5">错 {item.wrong_count} 次</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  )
}
