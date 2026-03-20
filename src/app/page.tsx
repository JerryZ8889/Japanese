'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Sparkles, Play } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { getUserByUsername, checkUserExpired } from '@/lib/supabase/users'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { setUser } = useStore()

  const handleLogin = async () => {
    const name = username.trim()
    if (!name) { setError('请输入你的名字'); return }
    if (name.length < 2) { setError('用户名至少需要 2 个字符'); return }

    setIsLoading(true)
    setError('')

    try {
      const user = await getUserByUsername(name)
      if (!user) { setError('用户名不存在，请联系管理员添加'); return }
      if (checkUserExpired(user)) { setError('账号已过期，请联系管理员续期'); return }

      setUser(user)
      router.push('/stages')
    } catch {
      setError('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* 装饰背景 */}
      <div className="absolute inset-0 pointer-events-none">
        {['🌸', '🌸', '⭐', '⭐', '🎋', '🎋'].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            style={{
              left: `${[8, 80, 15, 75, 5, 85][i]}%`,
              top: `${[15, 20, 75, 70, 45, 40][i]}%`,
            }}
            animate={{ y: [0, -15, 0], rotate: [0, i % 2 === 0 ? 10 : -10, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-8 z-10"
      >
        {/* 标题 */}
        <motion.div
          className="flex flex-col items-center gap-3"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <Sparkles className="w-16 h-16 text-primary-pink" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-pink via-primary-teal to-primary-yellow bg-clip-text text-transparent">
            假名小达人
          </h1>
          <p className="text-gray-400 text-lg">かな小達人</p>
          <p className="text-gray-500 text-sm">掌握全部日语假名！</p>
        </motion.div>

        {/* 登录表单 */}
        <motion.div
          className="flex flex-col items-center gap-4 w-full max-w-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="请输入你的名字"
            maxLength={20}
            className="w-full px-6 py-4 text-xl text-center rounded-2xl border-2 border-primary-pink/30 focus:border-primary-pink focus:outline-none focus:ring-4 focus:ring-primary-pink/20 transition-all bg-white shadow-lg"
          />

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            onClick={handleLogin}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-8 py-4 bg-gradient-to-r from-primary-pink to-primary-teal text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <span className="animate-spin">⏳</span> : <><Play className="w-5 h-5" />开始学习</>}
          </motion.button>
        </motion.div>

        <motion.a
          href="/admin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-4"
        >
          管理入口
        </motion.a>
      </motion.div>
    </main>
  )
}
