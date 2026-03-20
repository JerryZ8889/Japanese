import { supabase } from './client'
import { JpWrongChar } from '@/types'

export const recordJpWrongChar = async (
  userId: string,
  char: string,
  romaji: string,
  stage: number,
  unit: number
): Promise<void> => {
  // 先查是否已有记录
  const { data: existing } = await supabase
    .from('jp_wrong_chars')
    .select('wrong_count')
    .eq('user_id', userId)
    .eq('char', char)
    .single()

  if (existing) {
    // 已存在：递增错误次数
    const { error } = await supabase
      .from('jp_wrong_chars')
      .update({
        wrong_count: existing.wrong_count + 1,
        last_wrong_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('char', char)

    if (error) throw error
  } else {
    // 首次出错：新建记录
    const { error } = await supabase
      .from('jp_wrong_chars')
      .insert({
        user_id: userId,
        char,
        romaji,
        stage,
        unit,
        wrong_count: 1,
        last_wrong_at: new Date().toISOString(),
      })

    if (error) throw error
  }
}

export const getJpUserWrongChars = async (userId: string): Promise<JpWrongChar[]> => {
  const { data, error } = await supabase
    .from('jp_wrong_chars')
    .select('*')
    .eq('user_id', userId)
    .order('last_wrong_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const getJpWrongCharsByStageUnit = async (
  userId: string,
  stage: number,
  unit: number
): Promise<JpWrongChar[]> => {
  const { data, error } = await supabase
    .from('jp_wrong_chars')
    .select('*')
    .eq('user_id', userId)
    .eq('stage', stage)
    .eq('unit', unit)

  if (error) throw error
  return data || []
}

export const deleteJpWrongChar = async (userId: string, char: string): Promise<void> => {
  const { error } = await supabase
    .from('jp_wrong_chars')
    .delete()
    .eq('user_id', userId)
    .eq('char', char)

  if (error) throw error
}
