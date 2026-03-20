// ===== 共用类型（与汉字项目共享 users 表）=====

export interface User {
  id: string
  username: string
  expire_at: string | null
  created_at: string
  is_active: boolean
}

// ===== 假名数据类型 =====

export interface KanaItem {
  char: string    // 假名字符（1-2个Unicode字符，拗音如「きゃ」是2个）
  romaji: string  // 罗马音，同时也是音频文件名（不含.mp3）
}

export interface UnitData {
  unit: number
  name: string
  kana: KanaItem[]
}

export interface StageData {
  stage: number
  name: string      // 中文名（如「平假名」）
  nameJa: string    // 日文名（如「ひらがな」）
  totalKana: number
  totalUnits: number
  units: UnitData[]
}

// Stage 3 混合复习的单元配置（从其他阶段动态抽取）
export interface MixedUnitConfig {
  unit: number
  name: string
  sourceStages: number[]
  sourceUnits: number[]
  count: number
}

export interface MixedStageData {
  stage: number
  name: string
  nameJa: string
  totalUnits: number
  units: MixedUnitConfig[]
}

// ===== 数据库表类型（jp_ 前缀表）=====

export interface JpUnitProgress {
  id: string
  user_id: string
  stage: number
  unit: number
  current_index: number
  completed: boolean
  score: number
  total: number
  wrong_chars: string[]   // 错误的假名字符列表
  completed_at: string | null
}

export interface JpWrongChar {
  id: string
  user_id: string
  char: string    // 假名字符（VARCHAR(10)，支持拗音）
  romaji: string  // 对应罗马音
  stage: number
  unit: number
  wrong_count: number
  last_wrong_at: string
}

export interface JpStudyRecord {
  id: string
  user_id: string
  study_date: string
  units_completed: number
  created_at: string
}

export interface JpUserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
}

// ===== 统计类型 =====

export interface JpStudyStats {
  streakDays: number
  totalDays: number
  totalUnitsCompleted: number
  totalKanaLearned: number
  avgAccuracy: number
}

// ===== 成就徽章类型 =====

export interface Badge {
  id: string
  name: string
  emoji: string
  description: string
}
