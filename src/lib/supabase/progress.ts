import { supabase } from './client'
import { JpUnitProgress } from '@/types'

export const getJpUserProgress = async (userId: string): Promise<JpUnitProgress[]> => {
  const { data, error } = await supabase
    .from('jp_unit_progress')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data || []
}

export const getJpUnitProgress = async (
  userId: string,
  stage: number,
  unit: number
): Promise<JpUnitProgress | null> => {
  const { data, error } = await supabase
    .from('jp_unit_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('stage', stage)
    .eq('unit', unit)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const saveJpUnitProgress = async (
  progress: Omit<JpUnitProgress, 'id'>
): Promise<JpUnitProgress> => {
  const { data, error } = await supabase
    .from('jp_unit_progress')
    .upsert(progress, { onConflict: 'user_id,stage,unit' })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateJpUnitProgress = async (
  userId: string,
  stage: number,
  unit: number,
  updates: Partial<JpUnitProgress>
): Promise<void> => {
  const { error } = await supabase
    .from('jp_unit_progress')
    .update(updates)
    .eq('user_id', userId)
    .eq('stage', stage)
    .eq('unit', unit)

  if (error) throw error
}
