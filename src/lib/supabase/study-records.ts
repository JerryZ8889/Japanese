import { supabase } from './client'
import { JpStudyStats } from '@/types'

export const recordJpStudy = async (userId: string): Promise<void> => {
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('jp_study_records')
    .upsert(
      { user_id: userId, study_date: today, units_completed: 1 },
      { onConflict: 'user_id,study_date', ignoreDuplicates: true }
    )

  if (error) throw error
}

export const getJpStudyStats = async (userId: string): Promise<JpStudyStats> => {
  const { data: records, error } = await supabase
    .from('jp_study_records')
    .select('study_date')
    .eq('user_id', userId)
    .order('study_date', { ascending: false })

  if (error) throw error

  const totalDays = records?.length || 0

  // 计算连续学习天数
  let streakDays = 0
  if (records && records.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let checkDate = new Date(today)
    for (const record of records) {
      const recordDate = new Date(record.study_date)
      recordDate.setHours(0, 0, 0, 0)

      const diffDays = Math.round(
        (checkDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === 0 || diffDays === 1) {
        streakDays++
        checkDate = recordDate
      } else {
        break
      }
    }
  }

  // 获取完成单元数和平均正确率
  const { data: progressData } = await supabase
    .from('jp_unit_progress')
    .select('score, total')
    .eq('user_id', userId)
    .eq('completed', true)

  const totalUnitsCompleted = progressData?.length || 0
  const totalKanaLearned = progressData?.reduce((sum, p) => sum + p.total, 0) || 0
  const avgAccuracy =
    progressData && progressData.length > 0
      ? Math.round(
          (progressData.reduce((sum, p) => sum + p.score / p.total, 0) /
            progressData.length) *
            100
        )
      : 0

  return { streakDays, totalDays, totalUnitsCompleted, totalKanaLearned, avgAccuracy }
}
