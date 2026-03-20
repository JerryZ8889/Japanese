-- ============================================================
-- 假名小达人 - 数据库初始化脚本
-- 在现有 Supabase 项目中执行（与汉字小达人共用同一项目）
-- 注意：users 表已存在，无需重建
-- ============================================================

-- ============================================================
-- 1. jp_unit_progress（单元进度表）
-- ============================================================
CREATE TABLE IF NOT EXISTS jp_unit_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stage INT NOT NULL CHECK (stage BETWEEN 1 AND 3),
  unit INT NOT NULL CHECK (unit >= 1),
  current_index INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  score INT DEFAULT 0,
  total INT DEFAULT 15,
  wrong_chars TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, stage, unit)
);

CREATE INDEX IF NOT EXISTS idx_jp_unit_progress_user
  ON jp_unit_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_jp_unit_progress_user_stage
  ON jp_unit_progress(user_id, stage);

-- RLS
ALTER TABLE jp_unit_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_jp_unit_progress" ON jp_unit_progress;
CREATE POLICY "allow_all_jp_unit_progress"
  ON jp_unit_progress FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 2. jp_wrong_chars（错字记录表）
-- char 字段使用 VARCHAR(10) 支持拗音（2个Unicode字符的组合）
-- ============================================================
CREATE TABLE IF NOT EXISTS jp_wrong_chars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  char VARCHAR(10) NOT NULL,
  romaji VARCHAR(10) NOT NULL,
  stage INT NOT NULL,
  unit INT NOT NULL,
  wrong_count INT DEFAULT 1,
  last_wrong_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, char)
);

CREATE INDEX IF NOT EXISTS idx_jp_wrong_chars_user
  ON jp_wrong_chars(user_id);

ALTER TABLE jp_wrong_chars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_jp_wrong_chars" ON jp_wrong_chars;
CREATE POLICY "allow_all_jp_wrong_chars"
  ON jp_wrong_chars FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 3. jp_study_records（学习记录表，用于连续天数统计）
-- ============================================================
CREATE TABLE IF NOT EXISTS jp_study_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  study_date DATE NOT NULL,
  units_completed INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, study_date)
);

CREATE INDEX IF NOT EXISTS idx_jp_study_records_user
  ON jp_study_records(user_id);
CREATE INDEX IF NOT EXISTS idx_jp_study_records_date
  ON jp_study_records(study_date);

ALTER TABLE jp_study_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_jp_study_records" ON jp_study_records;
CREATE POLICY "allow_all_jp_study_records"
  ON jp_study_records FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 4. jp_user_badges（成就徽章表）
-- ============================================================
CREATE TABLE IF NOT EXISTS jp_user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE jp_user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_jp_user_badges" ON jp_user_badges;
CREATE POLICY "allow_all_jp_user_badges"
  ON jp_user_badges FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 完成提示
-- ============================================================
-- 执行完成后，还需在 Supabase Storage 创建名为 「jp-audio」的 Public Bucket
-- ============================================================
