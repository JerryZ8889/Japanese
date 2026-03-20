/**
 * 上传 audio_output/ 中的假名音频文件到 Supabase Storage（jp-audio bucket）
 * 运行：node scripts/upload-audio.mjs
 *
 * 前置条件：
 *   - 已在 Supabase Storage 创建名为「jp-audio」的 Public Bucket
 *   - .env.local 中配置了 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, readFileSync as rf } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// 读取 .env.local
try {
  const envContent = rf(join(ROOT, '.env.local'), 'utf-8')
  for (const line of envContent.split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length > 0 && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join('=').trim()
    }
  }
} catch { /* 忽略 */ }

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const AUDIO_DIR        = join(ROOT, 'audio_output')
const BUCKET           = 'jp-audio'   // 注意：与汉字项目的 'audio' bucket 不同

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ 缺少 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const files = readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3'))
console.log(`共 ${files.length} 个音频文件，上传到 Supabase Storage bucket: ${BUCKET}\n`)

let success = 0, skipped = 0, failed = 0

for (let i = 0; i < files.length; i++) {
  const filename = files[i]
  const fileData = readFileSync(join(AUDIO_DIR, filename))

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, fileData, {
      contentType: 'audio/mpeg',
      upsert: false,
    })

  if (error) {
    if (
      error.message?.includes('already exists') ||
      error.message?.includes('The resource already exists')
    ) {
      skipped++
    } else {
      failed++
      console.error(`[${i + 1}/${files.length}] ✗ ${filename}：${error.message}`)
    }
  } else {
    success++
    if (success % 20 === 0 || i === files.length - 1) {
      console.log(`[${i + 1}/${files.length}] 已上传 ${success} 个...`)
    }
  }
}

console.log(`\n✅ 完成！成功: ${success}，跳过: ${skipped}，失败: ${failed}`)
console.log(`\n音频公开访问地址示例：`)
console.log(`  ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/ka.mp3`)
