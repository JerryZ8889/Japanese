import { supabase } from './client'
import { JpUserBadge, JpStudyStats, JpUnitProgress } from '@/types'

export const getJpUserBadges = async (userId: string): Promise<JpUserBadge[]> => {
  const { data, error } = await supabase
    .from('jp_user_badges')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data || []
}

export const awardJpBadges = async (userId: string, badgeIds: string[]): Promise<void> => {
  if (badgeIds.length === 0) return

  const rows = badgeIds.map(badge_id => ({ user_id: userId, badge_id }))
  const { error } = await supabase
    .from('jp_user_badges')
    .upsert(rows, { onConflict: 'user_id,badge_id', ignoreDuplicates: true })

  if (error) throw error
}

/**
 * 计算本次新解锁的徽章
 * 在单元完成后（report页）调用
 */
export const computeNewJpBadges = (
  stats: JpStudyStats,
  allProgress: JpUnitProgress[],
  wrongCharsCount: number,
  existingBadgeIds: string[]
): string[] => {
  const earned = new Set(existingBadgeIds)
  const newBadges: string[] = []

  const check = (id: string, condition: boolean) => {
    if (condition && !earned.has(id)) newBadges.push(id)
  }

  const completed = allProgress.filter(p => p.completed)
  const totalCompleted = completed.length

  // 连续天数
  check('streak_3', stats.streakDays >= 3)
  check('streak_7', stats.streakDays >= 7)

  // 完成单元数
  check('first_unit', totalCompleted >= 1)
  check('units_5', totalCompleted >= 5)
  check('units_10', totalCompleted >= 10)
  check('units_16', totalCompleted >= 16)

  // 阶段通关
  const stage1Done = allProgress.filter(p => p.stage === 1 && p.completed).length
  const stage2Done = allProgress.filter(p => p.stage === 2 && p.completed).length
  const stage3Done = allProgress.filter(p => p.stage === 3 && p.completed).length
  check('stage_1', stage1Done >= 8)
  check('stage_2', stage2Done >= 8)
  check('stage_3', stage3Done >= 4)

  // 满分
  const lastUnit = completed[completed.length - 1]
  if (lastUnit) {
    check('perfect_score', lastUnit.score === lastUnit.total)

    // 三连满分
    if (completed.length >= 3) {
      const last3 = completed.slice(-3)
      check('perfect_3', last3.every(p => p.score === p.total))
    }
  }

  // 错字本清零
  check('zero_wrong', wrongCharsCount === 0)

  return newBadges
}
