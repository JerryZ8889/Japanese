/**
 * 生成日语假名 Azure TTS 音频文件（共 104 个）
 * 运行：node scripts/generate-audio.mjs
 *
 * 前置条件：
 *   - 在 .env.local 中配置 AZURE_TTS_KEY 和 AZURE_TTS_REGION
 *   - 或直接设置环境变量：AZURE_TTS_KEY=xxx node scripts/generate-audio.mjs
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// 读取 .env.local（如果存在）
try {
  const envContent = readFileSync(join(ROOT, '.env.local'), 'utf-8')
  for (const line of envContent.split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length > 0 && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join('=').trim()
    }
  }
} catch { /* .env.local 不存在则忽略 */ }

const AZURE_KEY    = process.env.AZURE_TTS_KEY
const AZURE_REGION = process.env.AZURE_TTS_REGION || 'eastasia'
const VOICE        = 'ja-JP-NanamiNeural'   // 女声，自然亲切
const OUTPUT_DIR   = join(ROOT, 'audio_output')

if (!AZURE_KEY) {
  console.error('❌ 缺少 AZURE_TTS_KEY，请在 .env.local 中配置')
  process.exit(1)
}

// 104 个唯一假名音频（平假名/片假名共用同一音频文件）
const AUDIO_LIST = [
  // 清音（46）
  { romaji: 'a',     text: 'あ' },
  { romaji: 'i',     text: 'い' },
  { romaji: 'u',     text: 'う' },
  { romaji: 'e',     text: 'え' },
  { romaji: 'o',     text: 'お' },
  { romaji: 'ka',    text: 'か' },
  { romaji: 'ki',    text: 'き' },
  { romaji: 'ku',    text: 'く' },
  { romaji: 'ke',    text: 'け' },
  { romaji: 'ko',    text: 'こ' },
  { romaji: 'sa',    text: 'さ' },
  { romaji: 'shi',   text: 'し' },
  { romaji: 'su',    text: 'す' },
  { romaji: 'se',    text: 'せ' },
  { romaji: 'so',    text: 'そ' },
  { romaji: 'ta',    text: 'た' },
  { romaji: 'chi',   text: 'ち' },
  { romaji: 'tsu',   text: 'つ' },
  { romaji: 'te',    text: 'て' },
  { romaji: 'to',    text: 'と' },
  { romaji: 'na',    text: 'な' },
  { romaji: 'ni',    text: 'に' },
  { romaji: 'nu',    text: 'ぬ' },
  { romaji: 'ne',    text: 'ね' },
  { romaji: 'no',    text: 'の' },
  { romaji: 'ha',    text: 'は' },
  { romaji: 'hi',    text: 'ひ' },
  { romaji: 'fu',    text: 'ふ' },
  { romaji: 'he',    text: 'へ' },
  { romaji: 'ho',    text: 'ほ' },
  { romaji: 'ma',    text: 'ま' },
  { romaji: 'mi',    text: 'み' },
  { romaji: 'mu',    text: 'む' },
  { romaji: 'me',    text: 'め' },
  { romaji: 'mo',    text: 'も' },
  { romaji: 'ya',    text: 'や' },
  { romaji: 'yu',    text: 'ゆ' },
  { romaji: 'yo',    text: 'よ' },
  { romaji: 'ra',    text: 'ら' },
  { romaji: 'ri',    text: 'り' },
  { romaji: 'ru',    text: 'る' },
  { romaji: 're',    text: 'れ' },
  { romaji: 'ro',    text: 'ろ' },
  { romaji: 'wa',    text: 'わ' },
  { romaji: 'wo',    text: 'を' },
  { romaji: 'n',     text: 'ん' },
  // 濁音（18个唯一音，ぢ→ji，づ→zu已含）
  { romaji: 'ga',    text: 'が' },
  { romaji: 'gi',    text: 'ぎ' },
  { romaji: 'gu',    text: 'ぐ' },
  { romaji: 'ge',    text: 'げ' },
  { romaji: 'go',    text: 'ご' },
  { romaji: 'za',    text: 'ざ' },
  { romaji: 'ji',    text: 'じ' },
  { romaji: 'zu',    text: 'ず' },
  { romaji: 'ze',    text: 'ぜ' },
  { romaji: 'zo',    text: 'ぞ' },
  { romaji: 'da',    text: 'だ' },
  { romaji: 'de',    text: 'で' },
  { romaji: 'do',    text: 'ど' },
  { romaji: 'ba',    text: 'ば' },
  { romaji: 'bi',    text: 'び' },
  { romaji: 'bu',    text: 'ぶ' },
  { romaji: 'be',    text: 'べ' },
  { romaji: 'bo',    text: 'ぼ' },
  // 半濁音（5）
  { romaji: 'pa',    text: 'ぱ' },
  { romaji: 'pi',    text: 'ぴ' },
  { romaji: 'pu',    text: 'ぷ' },
  { romaji: 'pe',    text: 'ぺ' },
  { romaji: 'po',    text: 'ぽ' },
  // 清音拗音（21）
  { romaji: 'kya',   text: 'きゃ' },
  { romaji: 'kyu',   text: 'きゅ' },
  { romaji: 'kyo',   text: 'きょ' },
  { romaji: 'sha',   text: 'しゃ' },
  { romaji: 'shu',   text: 'しゅ' },
  { romaji: 'sho',   text: 'しょ' },
  { romaji: 'cha',   text: 'ちゃ' },
  { romaji: 'chu',   text: 'ちゅ' },
  { romaji: 'cho',   text: 'ちょ' },
  { romaji: 'nya',   text: 'にゃ' },
  { romaji: 'nyu',   text: 'にゅ' },
  { romaji: 'nyo',   text: 'にょ' },
  { romaji: 'hya',   text: 'ひゃ' },
  { romaji: 'hyu',   text: 'ひゅ' },
  { romaji: 'hyo',   text: 'ひょ' },
  { romaji: 'mya',   text: 'みゃ' },
  { romaji: 'myu',   text: 'みゅ' },
  { romaji: 'myo',   text: 'みょ' },
  { romaji: 'rya',   text: 'りゃ' },
  { romaji: 'ryu',   text: 'りゅ' },
  { romaji: 'ryo',   text: 'りょ' },
  // 濁音拗音（9）
  { romaji: 'gya',   text: 'ぎゃ' },
  { romaji: 'gyu',   text: 'ぎゅ' },
  { romaji: 'gyo',   text: 'ぎょ' },
  { romaji: 'ja',    text: 'じゃ' },
  { romaji: 'ju',    text: 'じゅ' },
  { romaji: 'jo',    text: 'じょ' },
  { romaji: 'bya',   text: 'びゃ' },
  { romaji: 'byu',   text: 'びゅ' },
  { romaji: 'byo',   text: 'びょ' },
  // 半濁音拗音（3）
  { romaji: 'pya',   text: 'ぴゃ' },
  { romaji: 'pyu',   text: 'ぴゅ' },
  { romaji: 'pyo',   text: 'ぴょ' },
  // 特殊音（2）
  { romaji: 'xtsu',  text: 'っ' },
  { romaji: 'choon', text: 'ー' },
]

console.log(`共 ${AUDIO_LIST.length} 个唯一假名音频，开始生成...\n`)
console.log(`语音：${VOICE}  区域：${AZURE_REGION}\n`)

// 创建输出目录
if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

// 调用 Azure TTS REST API
async function synthesize(text) {
  const ssml = `<speak version='1.0' xml:lang='ja-JP'>
    <voice name='${VOICE}'>${text}</voice>
  </speak>`

  const res = await fetch(
    `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
      },
      body: ssml,
    }
  )

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return Buffer.from(await res.arrayBuffer())
}

// 主循环
let success = 0, skipped = 0, failed = 0

for (let i = 0; i < AUDIO_LIST.length; i++) {
  const { romaji, text } = AUDIO_LIST[i]
  const filename = `${romaji}.mp3`
  const filepath = join(OUTPUT_DIR, filename)

  if (existsSync(filepath)) {
    skipped++
    continue
  }

  try {
    const audio = await synthesize(text)
    writeFileSync(filepath, audio)
    success++
    console.log(`[${i + 1}/${AUDIO_LIST.length}] ✓  ${text}  →  ${filename}`)
  } catch (err) {
    failed++
    console.error(`[${i + 1}/${AUDIO_LIST.length}] ✗  ${text}  →  ${err.message}`)
  }

  // 每 150ms 一个请求，避免触发频率限制
  await new Promise(r => setTimeout(r, 150))
}

console.log(`\n✅ 完成！成功: ${success}，跳过: ${skipped}，失败: ${failed}`)
console.log(`📁 文件保存在：${OUTPUT_DIR}`)
console.log(`\n下一步：node scripts/upload-audio.mjs`)
