# 假名小达人 (かな小達人) - 日语假名学习 Web 应用设计文档

> 版本：1.0
> 创建日期：2026-03-20
> 项目名称：假名小达人 (かな小達人)

---

## 1. 项目概述

### 1.1 项目背景

与「汉字小达人」同构，为学习者开发一款游戏化日语假名练习 Web 应用。通过**听音选字**的方式（听假名读音，从 4 个选项中选出对应字符），系统掌握全部平假名与片假名，包括：五十音、浊音、半浊音、拗音及特殊音。

### 1.2 目标用户

- 主要用户：学习日语的儿童（Sophia）及初学者
- 管理用户：家长或教师

### 1.3 核心价值

- **游戏化学习**：发音识别、即时反馈、成就系统激发兴趣
- **系统覆盖**：全部 211 个假名字符，分类分阶段掌握
- **高质量发音**：Azure TTS 日语 Neural 声音，发音准确自然
- **复用基础设施**：与汉字小达人共用同一 Supabase 项目（共享用户表），节省资源

### 1.4 与汉字小达人的关系

| 维度 | 汉字小达人 | 假名小达人 |
|------|-----------|-----------|
| 代码位置 | 根目录 | `/Japanese` 子目录（独立 Next.js 项目） |
| Supabase 项目 | jsdsnorvxonzostrhgdo | **同一个项目** |
| 用户表 | `users` | **直接复用** `users` |
| 进度/错字表 | `unit_progress` 等 | `jp_unit_progress` 等（新建） |
| 音频 bucket | `audio` | `jp-audio`（新建） |
| 部署域名 | chinese.sophia.beer | japanese.sophia.beer（待配置） |

---

## 2. 学习内容设计

### 2.1 假名全集

**平假名（Hiragana）— 共 105 字**

| 分类 | 字数 | 字符 |
|------|------|------|
| 五十音（清音） | 46 | あいうえお かきくけこ さしすせそ たちつてと なにぬねの はひふへほ まみむめも やゆよ らりるれろ わをん |
| 濁音 | 20 | がぎぐげご ざじずぜぞ だぢづでど ばびぶべぼ |
| 半濁音 | 5 | ぱぴぷぺぽ |
| 拗音（清音） | 21 | きゃきゅきょ しゃしゅしょ ちゃちゅちょ にゃにゅにょ ひゃひゅひょ みゃみゅみょ りゃりゅりょ |
| 拗音（濁音） | 9 | ぎゃぎゅぎょ じゃじゅじょ びゃびゅびょ |
| 拗音（半濁音） | 3 | ぴゃぴゅぴょ |
| 特殊音 | 1 | っ（促音） |

**片假名（Katakana）— 共 106 字**

| 分类 | 字数 | 字符 |
|------|------|------|
| 五十音（清音） | 46 | アイウエオ カキクケコ サシスセソ タチツテト ナニヌネノ ハヒフヘホ マミムメモ ヤユヨ ラリルレロ ワヲン |
| 濁音 | 20 | ガギグゲゴ ザジズゼゾ ダヂヅデド バビブベボ |
| 半濁音 | 5 | パピプペポ |
| 拗音（清音） | 21 | キャキュキョ シャシュショ チャチュチョ ニャニュニョ ヒャヒュヒョ ミャミュミョ リャリュリョ |
| 拗音（濁音） | 9 | ギャギュギョ ジャジュジョ ビャビュビョ |
| 拗音（半濁音） | 3 | ピャピュピョ |
| 特殊音 | 2 | ッ（促音）、ー（長音符） |

> **备注**
> - ぢ/ヂ 与じ/ジ 读音相同（ji）；づ/ヅ 与ず/ズ 读音相同（zu）——共用同一音频文件
> - 拗音是两个 Unicode 字符的组合（如 きゃ），在代码中以字符串整体处理

### 2.2 学习阶段与单元划分

| 阶段 | 内容 | 单元数 | 字符数 |
|------|------|--------|--------|
| Stage 1 | 平假名（全部分类） | 8 单元 | 105 字 |
| Stage 2 | 片假名（全部分类） | 8 单元 | 106 字 |
| Stage 3 | 混合复习（平假名 + 片假名） | 4 单元 | 随机混合 |

**Stage 1 — 平假名单元详情**

| 单元 | 内容 | 字符（共 n 字） |
|------|------|----------------|
| Unit 1 | 清音 あ行・か行・さ行 | あいうえお かきくけこ さしすせそ（15） |
| Unit 2 | 清音 た行・な行・は行 | たちつてと なにぬねの はひふへほ（15） |
| Unit 3 | 清音 ま行〜わ行 + っ | まみむめも やゆよ らりるれろ わをん っ（17） |
| Unit 4 | 濁音 が行・ざ行 | がぎぐげご ざじずぜぞ（10） |
| Unit 5 | 濁音 だ行・ば行 + 半濁音 ぱ行 | だぢづでど ばびぶべぼ ぱぴぷぺぽ（15） |
| Unit 6 | 清音拗音 前半 | きゃきゅきょ しゃしゅしょ ちゃちゅちょ にゃにゅにょ（12） |
| Unit 7 | 清音拗音 後半 | ひゃひゅひょ みゃみゅみょ りゃりゅりょ（9） |
| Unit 8 | 濁音・半濁音拗音 | ぎゃぎゅぎょ じゃじゅじょ びゃびゅびょ ぴゃぴゅぴょ（12） |

> Stage 1 合计：15+15+17+10+15+12+9+12 = **105 字** ✓

**Stage 2 — 片假名单元详情**（结构与 Stage 1 完全对应）

| 单元 | 内容 | 字符（共 n 字） |
|------|------|----------------|
| Unit 1 | 清音 ア行・カ行・サ行 | アイウエオ カキクケコ サシスセソ（15） |
| Unit 2 | 清音 タ行・ナ行・ハ行 | タチツテト ナニヌネノ ハヒフヘホ（15） |
| Unit 3 | 清音 マ行〜ワ行 + ッ + ー | マミムメモ ヤユヨ ラリルレロ ワヲン ッ ー（18） |
| Unit 4 | 濁音 ガ行・ザ行 | ガギグゲゴ ザジズゼゾ（10） |
| Unit 5 | 濁音 ダ行・バ行 + 半濁音 パ行 | ダヂヅデド バビブベボ パピプペポ（15） |
| Unit 6 | 清音拗音 前半 | キャキュキョ シャシュショ チャチュチョ ニャニュニョ（12） |
| Unit 7 | 清音拗音 後半 | ヒャヒュヒョ ミャミュミョ リャリュリョ（9） |
| Unit 8 | 濁音・半濁音拗音 | ギャギュギョ ジャジュジョ ビャビュビョ ピャピュピョ（12） |

> Stage 2 合计：15+15+18+10+15+12+9+12 = **106 字** ✓

**Stage 3 — 混合复习单元详情**

| 单元 | 内容 | 抽取方式 |
|------|------|---------|
| Unit 1 | 清音综合（平+片） | 从 Stage1 Unit1-3 + Stage2 Unit1-3 随机抽 15 |
| Unit 2 | 浊音・半浊音综合（平+片） | 从 Stage1/2 Unit4-5 随机抽 15 |
| Unit 3 | 拗音综合（平+片） | 从 Stage1/2 Unit6-8 随机抽 15 |
| Unit 4 | 全量综合 | 从全部 211 字随机抽 15 |

---

## 3. 数据设计

### 3.1 假名数据文件结构

```json
// data/stage1.json（平假名）
{
  "stage": 1,
  "name": "平假名",
  "totalKana": 105,
  "totalUnits": 8,
  "units": [
    {
      "unit": 1,
      "name": "清音 あ行・か行・さ行",
      "kana": [
        { "char": "あ", "romaji": "a", "audio": "a.mp3" },
        { "char": "い", "romaji": "i", "audio": "i.mp3" },
        ...
      ]
    },
    ...
  ]
}
```

```json
// data/stage3.json（混合复习，动态抽取，无固定字符列表）
{
  "stage": 3,
  "name": "混合复习",
  "totalUnits": 4,
  "units": [
    {
      "unit": 1,
      "name": "清音综合",
      "sourceStages": [1, 2],
      "sourceUnits": [1, 2, 3],
      "count": 15
    },
    ...
  ]
}
```

> 每个假名对象包含 `char`（字符）、`romaji`（罗马音）、`audio`（音频文件名）三个字段。

### 3.2 数据库表结构

所有新表使用 `jp_` 前缀，与汉字项目表名隔离。`users` 表直接复用，无需新建。

#### 3.2.1 单元进度表 (jp_unit_progress)

```sql
CREATE TABLE jp_unit_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stage INT NOT NULL CHECK (stage BETWEEN 1 AND 3),
  unit INT NOT NULL CHECK (unit >= 1),
  current_index INT DEFAULT 0,       -- 当前练习到第几个字（断点续练）
  completed BOOLEAN DEFAULT FALSE,
  score INT DEFAULT 0,               -- 正确数量
  total INT DEFAULT 15,              -- 本单元总字数
  wrong_chars TEXT[] DEFAULT '{}',   -- 错字列表（TEXT 支持拗音多字符）
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, stage, unit)
);

CREATE INDEX idx_jp_unit_progress_user ON jp_unit_progress(user_id);
CREATE INDEX idx_jp_unit_progress_user_stage ON jp_unit_progress(user_id, stage);
```

#### 3.2.2 错字记录表 (jp_wrong_chars)

```sql
CREATE TABLE jp_wrong_chars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  char VARCHAR(10) NOT NULL,         -- VARCHAR(10) 而非 CHAR(1)，支持拗音（2个Unicode字符）
  romaji VARCHAR(10) NOT NULL,       -- 对应罗马音，方便显示
  stage INT NOT NULL,
  unit INT NOT NULL,
  wrong_count INT DEFAULT 1,
  last_wrong_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, char)
);

CREATE INDEX idx_jp_wrong_chars_user ON jp_wrong_chars(user_id);
```

#### 3.2.3 学习记录表 (jp_study_records)

```sql
CREATE TABLE jp_study_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  study_date DATE NOT NULL,
  units_completed INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, study_date)
);

CREATE INDEX idx_jp_study_records_user ON jp_study_records(user_id);
```

#### 3.2.4 成就徽章表 (jp_user_badges)

```sql
CREATE TABLE jp_user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```

**成就徽章清单（共 12 个）**：

| badge_id | 名称 | emoji | 解锁条件 |
|----------|------|-------|----------|
| `first_unit` | 初出茅庐 | 🌱 | 完成第 1 个单元 |
| `streak_3` | 学习小达人 | 🔥 | 连续学习 3 天 |
| `streak_7` | 一周不间断 | 💪 | 连续学习 7 天 |
| `units_5` | 假名入门 | ⭐ | 完成 5 个单元 |
| `units_10` | 假名学者 | 🚀 | 完成 10 个单元 |
| `units_16` | 半壁假名 | 🌈 | 完成 16 个单元（平片各一半） |
| `stage_1` | 平假名达人 | 🎓 | Stage 1 全部 8 单元完成 |
| `stage_2` | 片假名达人 | 📚 | Stage 2 全部 8 单元完成 |
| `stage_3` | 假名小达人 | 👑 | Stage 3 全部 4 单元完成 |
| `perfect_score` | 完美发挥 | 💯 | 单元满分（15/15） |
| `perfect_3` | 三连满分 | 🎯 | 连续 3 个单元满分 |
| `zero_wrong` | 知错能改 | 🧹 | 错字本清零 |

---

## 4. 技术架构

### 4.1 技术栈

与汉字小达人完全一致：

| 层级 | 技术选型 | 说明 |
|-----|---------|------|
| 前端框架 | Next.js 14 (App Router) | 独立项目，位于 `/Japanese` 目录 |
| 开发语言 | TypeScript | |
| 样式方案 | Tailwind CSS | |
| 动画库 | Framer Motion | |
| 数据库 | Supabase（复用现有项目） | 新建 jp_ 前缀表 |
| 状态管理 | Zustand | |
| 音频播放 | HTML Audio API + 预生成 MP3 | Azure TTS 预生成，无需 Web Speech API |
| 部署平台 | Vercel | 独立部署，域名 japanese.sophia.beer |

### 4.2 目录结构

```
Japanese/                              ← 独立 Next.js 项目根目录
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # 登录页
│   │   ├── stages/
│   │   │   ├── page.tsx               # 阶段选择页
│   │   │   └── [stage]/
│   │   │       └── page.tsx           # 单元选择页
│   │   ├── quiz/
│   │   │   └── [stage]/[unit]/
│   │   │       └── page.tsx           # 练习页面
│   │   ├── wrong-quiz/
│   │   │   └── [stage]/[unit]/
│   │   │       └── page.tsx           # 错题练习
│   │   ├── report/
│   │   │   └── [stage]/[unit]/
│   │   │       └── page.tsx           # 单元报告（含徽章检测）
│   │   ├── achievements/
│   │   │   └── page.tsx               # 学习成就页
│   │   ├── wrong-book/
│   │   │   └── page.tsx               # 错字本
│   │   └── admin/
│   │       ├── page.tsx               # 管理后台登录
│   │       └── dashboard/
│   │           └── page.tsx           # 用户管理
│   ├── components/
│   │   ├── quiz/
│   │   │   ├── QuizCard.tsx           # 练习卡片（音效、撒花）
│   │   │   ├── KanaButton.tsx         # 假名选项按钮
│   │   │   ├── SpeakerButton.tsx      # 发音按钮
│   │   │   └── FeedbackOverlay.tsx    # 撒花动画
│   │   ├── stages/
│   │   └── layout/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── users.ts               # 复用中文项目同名逻辑（表名一致）
│   │   │   ├── progress.ts            # 操作 jp_unit_progress
│   │   │   ├── wrong-chars.ts         # 操作 jp_wrong_chars
│   │   │   ├── study-records.ts       # 操作 jp_study_records
│   │   │   └── badges.ts              # 操作 jp_user_badges
│   │   ├── audio/
│   │   │   └── player.ts              # 音频播放封装（含降级处理）
│   │   └── utils/
│   │       ├── shuffle.ts
│   │       ├── sounds.ts              # 答题音效
│   │       └── badge-checker.ts
│   ├── data/
│   │   ├── badges.ts                  # 12个徽章定义
│   │   ├── kana-map.ts                # 假名→罗马音映射表（含音频文件名）
│   │   ├── stage1.json                # 平假名数据
│   │   ├── stage2.json                # 片假名数据
│   │   └── stage3.json                # 混合复习配置
│   ├── store/
│   │   └── useStore.ts
│   └── types/
│       └── index.ts
├── scripts/
│   ├── generate-audio.mjs             # 调用 Azure TTS 生成日语 MP3
│   └── upload-audio.mjs               # 上传到 Supabase Storage jp-audio bucket
├── supabase/
│   └── migrations/
│       └── 001_jp_schema.sql          # 日语项目数据库初始化脚本
├── public/
│   └── sounds/                        # 答题音效（correct.mp3, wrong.mp3）
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── DESIGN.md
```

---

## 5. 音频合成方案

### 5.1 Azure TTS 日语效果

Azure TTS 日语 Neural 声音（如 `ja-JP-NanamiNeural`）发音极为自然，是广播级质量。日语假名发音完全规律，每个假名只有唯一读音，**无同音字问题**，音频生成简单可靠。

推荐声音：`ja-JP-NanamiNeural`（女声，自然亲切，适合儿童学习）

### 5.2 音频文件策略

**关键优化：平假名与片假名发音完全相同，共用音频文件。**

- あ 和 ア 都播放 `a.mp3`
- きゃ 和 キャ 都播放 `kya.mp3`
- 约 **104 个音频文件**（对比汉字项目的 2000 个，极少）

### 5.3 完整罗马音映射表（音频文件名规则）

**清音（46个文件）**

| 假名 | 文件名 | 假名 | 文件名 | 假名 | 文件名 | 假名 | 文件名 | 假名 | 文件名 |
|------|--------|------|--------|------|--------|------|--------|------|--------|
| あ/ア | a | い/イ | i | う/ウ | u | え/エ | e | お/オ | o |
| か/カ | ka | き/キ | ki | く/ク | ku | け/ケ | ke | こ/コ | ko |
| さ/サ | sa | し/シ | shi | す/ス | su | せ/セ | se | そ/ソ | so |
| た/タ | ta | ち/チ | chi | つ/ツ | tsu | て/テ | te | と/ト | to |
| な/ナ | na | に/ニ | ni | ぬ/ヌ | nu | ね/ネ | ne | の/ノ | no |
| は/ハ | ha | ひ/ヒ | hi | ふ/フ | fu | へ/ヘ | he | ほ/ホ | ho |
| ま/マ | ma | み/ミ | mi | む/ム | mu | め/メ | me | も/モ | mo |
| や/ヤ | ya | ゆ/ユ | yu | よ/ヨ | yo | | | | |
| ら/ラ | ra | り/リ | ri | る/ル | ru | れ/レ | re | ろ/ロ | ro |
| わ/ワ | wa | を/ヲ | wo | ん/ン | n | | | | |

**濁音（18个唯一文件，ぢ→ji，づ→zu 与ざ行共用）**

| 假名 | 文件名 | 假名 | 文件名 |
|------|--------|------|--------|
| が/ガ | ga | ぎ/ギ | gi | ぐ/グ | gu | げ/ゲ | ge | ご/ゴ | go |
| ざ/ザ | za | じ/ジ/ぢ/ヂ | ji | ず/ズ/づ/ヅ | zu | ぜ/ゼ | ze | ぞ/ゾ | zo |
| だ/ダ | da | （ぢ/ヂ→ji） | — | （づ/ヅ→zu） | — | で/デ | de | ど/ド | do |
| ば/バ | ba | び/ビ | bi | ぶ/ブ | bu | べ/ベ | be | ぼ/ボ | bo |

**半濁音（5个文件）**

| 假名 | 文件名 |
|------|--------|
| ぱ/パ | pa | ぴ/ピ | pi | ぷ/プ | pu | ぺ/ペ | pe | ぽ/ポ | po |

**拗音（33个文件）**

| 假名 | 文件名 | 假名 | 文件名 | 假名 | 文件名 |
|------|--------|------|--------|------|--------|
| きゃ/キャ | kya | きゅ/キュ | kyu | きょ/キョ | kyo |
| しゃ/シャ | sha | しゅ/シュ | shu | しょ/ショ | sho |
| ちゃ/チャ | cha | ちゅ/チュ | chu | ちょ/チョ | cho |
| にゃ/ニャ | nya | にゅ/ニュ | nyu | にょ/ニョ | nyo |
| ひゃ/ヒャ | hya | ひゅ/ヒュ | hyu | ひょ/ヒョ | hyo |
| みゃ/ミャ | mya | みゅ/ミュ | myu | みょ/ミョ | myo |
| りゃ/リャ | rya | りゅ/リュ | ryu | りょ/リョ | ryo |
| ぎゃ/ギャ | gya | ぎゅ/ギュ | gyu | ぎょ/ギョ | gyo |
| じゃ/ジャ | ja | じゅ/ジュ | ju | じょ/ジョ | jo |
| びゃ/ビャ | bya | びゅ/ビュ | byu | びょ/ビョ | byo |
| ぴゃ/ピャ | pya | ぴゅ/ピュ | pyu | ぴょ/ピョ | pyo |

**特殊音（2个文件）**

| 假名 | 文件名 | 说明 |
|------|--------|------|
| っ/ッ | xtsu | 促音，TTS 读作「小さいつ」的发音 |
| ー | choon | 長音符，TTS 以长音「あー」形式朗读 |

> **合计 104 个音频文件**

### 5.4 音频生成脚本要点

```javascript
// scripts/generate-audio.mjs（核心逻辑示意）
const KANA_MAP = [
  { romaji: 'a',    text: 'あ' },
  { romaji: 'ka',   text: 'か' },
  { romaji: 'kya',  text: 'きゃ' },  // 拗音直接传入两字，TTS 自然合成
  { romaji: 'xtsu', text: 'っ' },    // 促音
  { romaji: 'choon',text: 'ー' },
  // ... 全部 104 条
]

// Azure TTS 配置
const voice = 'ja-JP-NanamiNeural'
const lang = 'ja-JP'
// 输出文件：audio_output/{romaji}.mp3
```

---

## 6. 页面设计

### 6.1 设计风格

- **整体风格**：卡通可爱，色彩明快
- **配色方案**（日式清新风）：
  - 主色调：#FF6B9D（樱花粉）、#4ECDC4（青绿）、#FFE66D（明黄）
  - 背景色：#FFF5F8（暖粉白）、#FFFFFF
  - 功能色：#00B894（正确绿）、#E17055（错误橙）
- **假名显示**：大字体（text-6xl），突出字形，方便辨认

### 6.2 页面规划

#### 6.2.1 登录页
- 标题：假名小达人 / かな小達人
- 输入框：请输入你的名字
- **与汉字小达人共用用户体系**（同一 users 表）

#### 6.2.2 阶段选择页
- 3 个阶段卡片：平假名 / 片假名 / 混合复习
- 显示每个阶段完成进度（x/8 单元）
- 底部：错字本入口

#### 6.2.3 单元选择页
- 网格展示单元（已完成绿色星星 / 进行中蓝色 / 未开始灰色）
- 每个单元显示当前阶段内容名称（如「清音 あ行・か行・さ行」）

#### 6.2.4 练习页面（核心）

**出题逻辑**：
- 播放当前假名的读音（自动播放）
- 显示 4 个假名选项按钮（1 个正确 + 3 个干扰）
- 干扰项选取规则：**同一阶段（同脚本）内随机选取**，不跨平假名/片假名
- 无需排除同音字（日语假名每字读音唯一，不存在同音问题）

**反馈**：
- 答对：撒花动画 + 音效
- 答错：高亮正确答案 + 音效

#### 6.2.5 错字本页
- 按阶段/单元分组展示错误的假名
- 显示错误次数 + 假名字符（大字显示）+ 罗马音
- 点击进入错题练习

#### 6.2.6 单元报告页
- 得分和正确率
- 需要复习的假名列表（显示字符 + 罗马音）
- 检测新解锁徽章，弹窗庆祝

#### 6.2.7 学习成就页（/achievements）
- 整体学习报告：总天数、连续天数、完成单元数
- 徽章墙：全部 12 个徽章，已解锁彩色，未解锁灰色

#### 6.2.8 管理后台
- 与汉字项目相同的用户管理逻辑（复用 users 表）
- 密码：admin（硬编码）

---

## 7. 核心流程

### 7.1 练习流程

```
选择单元 → 加载单元假名列表
  → 判断是否有未完成进度（断点续练）
  → 逐字出题：
      自动播放当前假名音频
      显示 4 个选项（同阶段随机干扰）
      用户选择 → 判断正误
        ✓ 正确：撒花+音效，保存进度
        ✗ 错误：高亮正确答案+音效，记录错字
      → 点击 Next → 下一字
  → 最后一字完成 → 记录学习日期 → 跳转报告页
  → 报告页检测新徽章 → 弹窗庆祝（如有）
```

### 7.2 音频播放逻辑

```typescript
// lib/audio/player.ts
const AUDIO_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/jp-audio`

export async function playKana(romaji: string): Promise<void> {
  const audio = new Audio(`${AUDIO_BASE_URL}/${romaji}.mp3`)
  try {
    await audio.play()
  } catch {
    // 降级：使用 Web Speech API（lang: 'ja-JP'）
    fallbackSpeak(romaji)
  }
}
```

---

## 8. API 设计

### 8.1 Supabase 数据操作

#### 进度相关（jp_unit_progress）
- `getJpUserProgress(userId)` - 获取所有单元进度
- `getJpUnitProgress(userId, stage, unit)` - 获取单个单元进度
- `saveJpUnitProgress(progress)` - 保存进度
- `updateJpUnitProgress(userId, stage, unit, updates)` - 更新进度

#### 错字相关（jp_wrong_chars）
- `recordJpWrongChar(userId, char, romaji, stage, unit)` - 记录错字
- `getJpUserWrongChars(userId)` - 获取所有错字
- `deleteJpWrongChar(userId, char)` - 删除错字记录

#### 学习统计（jp_study_records）
- `recordJpStudy(userId)` - 记录今日学习
- `getJpStudyStats(userId)` - 获取统计数据（连续天数等）

#### 徽章（jp_user_badges）
- `getJpUserBadges(userId)` - 获取已解锁徽章
- `awardJpBadges(userId, badgeIds[])` - 批量解锁新徽章

---

## 9. 部署方案

### 9.1 环境变量

```env
# Japanese/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://jsdsnorvxonzostrhgdo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key      # 与中文项目相同
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # 音频上传脚本使用
ADMIN_PASSWORD=admin
AZURE_TTS_KEY=your_azure_tts_key
AZURE_TTS_REGION=eastasia
```

### 9.2 Supabase 准备工作

1. **在现有 Supabase 项目执行** `supabase/migrations/001_jp_schema.sql`（创建 jp_ 前缀表 + RLS 策略）
2. **创建新 Storage Bucket**：名称 `jp-audio`，设为 Public
3. **无需新建 Supabase 项目**，与汉字项目共享

### 9.3 实施步骤

```bash
# 1. 初始化 Next.js 项目
cd Japanese
npx create-next-app@latest . --typescript --tailwind --app

# 2. 安装依赖
npm install @supabase/supabase-js zustand framer-motion

# 3. 执行数据库迁移（在 Supabase SQL Editor 粘贴执行）
# → supabase/migrations/001_jp_schema.sql

# 4. 生成音频文件（约 104 个 MP3，数分钟完成）
node scripts/generate-audio.mjs

# 5. 上传音频到 Supabase Storage jp-audio bucket
node scripts/upload-audio.mjs

# 6. 本地开发
npm run dev   # http://localhost:3001（与中文项目端口区分）
```

### 9.4 Vercel 部署

- 在 Vercel 中将 `Japanese/` 目录作为独立项目导入
- 配置环境变量
- 绑定域名 `japanese.sophia.beer`

---

## 10. 开发任务清单

### Phase 1：基础架构
- [ ] `create-next-app` 初始化项目
- [ ] 配置 Supabase 客户端（复用密钥）
- [ ] 执行数据库迁移，建 jp_ 表 + RLS
- [ ] 创建 jp-audio Storage Bucket
- [ ] 完成 `kana-map.ts` 全量映射表
- [ ] 完成 `stage1.json` / `stage2.json` / `stage3.json` 数据文件

### Phase 2：音频生成
- [ ] 编写 `generate-audio.mjs`（Azure TTS ja-JP）
- [ ] 编写 `upload-audio.mjs`
- [ ] 生成并上传全部 104 个音频文件

### Phase 3：核心页面
- [ ] 登录页
- [ ] 阶段选择页
- [ ] 单元选择页
- [ ] 练习页（含音频自动播放、答题逻辑、撒花动画）
- [ ] 单元报告页

### Phase 4：扩展功能
- [ ] 错字本 + 错题练习
- [ ] 学习成就页 + 成就徽章系统
- [ ] 管理后台
- [ ] 断点续练

### Phase 5：部署
- [ ] Vercel 部署 + 域名配置
- [ ] 端对端测试

---

## 附录

### A. 数据库迁移脚本

详见：`supabase/migrations/001_jp_schema.sql`

### B. 假名数据文件

详见：`src/data/stage1.json`、`src/data/stage2.json`、`src/data/stage3.json`

### C. 参考资源

- [Azure Cognitive Services TTS 日语语音列表](https://learn.microsoft.com/zh-cn/azure/ai-services/speech-service/language-support)
- [日语假名体系 - Wikipedia](https://ja.wikipedia.org/wiki/仮名)
- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
