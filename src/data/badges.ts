import { Badge } from '@/types'

export const BADGES: Badge[] = [
  {
    id: 'first_unit',
    name: '初出茅庐',
    emoji: '🌱',
    description: '完成第 1 个单元',
  },
  {
    id: 'streak_3',
    name: '学习小达人',
    emoji: '🔥',
    description: '连续学习 3 天',
  },
  {
    id: 'streak_7',
    name: '一周不间断',
    emoji: '💪',
    description: '连续学习 7 天',
  },
  {
    id: 'units_5',
    name: '假名入门',
    emoji: '⭐',
    description: '完成 5 个单元',
  },
  {
    id: 'units_10',
    name: '假名学者',
    emoji: '🚀',
    description: '完成 10 个单元',
  },
  {
    id: 'units_16',
    name: '半壁假名',
    emoji: '🌈',
    description: '完成 16 个单元',
  },
  {
    id: 'stage_1',
    name: '平假名达人',
    emoji: '🎓',
    description: '平假名全部 8 单元完成',
  },
  {
    id: 'stage_2',
    name: '片假名达人',
    emoji: '📚',
    description: '片假名全部 8 单元完成',
  },
  {
    id: 'stage_3',
    name: '假名小达人',
    emoji: '👑',
    description: '混合复习全部 4 单元完成',
  },
  {
    id: 'perfect_score',
    name: '完美发挥',
    emoji: '💯',
    description: '单元满分（15/15）',
  },
  {
    id: 'perfect_3',
    name: '三连满分',
    emoji: '🎯',
    description: '连续 3 个单元满分',
  },
  {
    id: 'zero_wrong',
    name: '知错能改',
    emoji: '🧹',
    description: '错字本清零',
  },
]

export const getBadgeById = (id: string): Badge | undefined =>
  BADGES.find(b => b.id === id)
