/**
 * 日语假名音频播放器
 * 优先播放 Supabase Storage 中的预生成 MP3（Azure TTS NanamiNeural）
 * 失败时降级到 Web Speech API（ja-JP），使用实际假名字符发音
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const AUDIO_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/jp-audio`

let currentAudio: HTMLAudioElement | null = null

/**
 * @param romaji  音频文件名（不含 .mp3），如 "ka"、"chi"
 * @param char    实际假名字符，用于 TTS 兜底（发音质量更好）
 */
export async function playKana(romaji: string, char?: string): Promise<void> {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }

  return new Promise((resolve) => {
    const audio = new Audio(`${AUDIO_BASE_URL}/${romaji}.mp3`)
    currentAudio = audio

    // 防止 onerror 和 play().catch() 同时触发导致双重 fallback
    let settled = false

    const done = () => {
      if (settled) return
      settled = true
      currentAudio = null
      resolve()
    }

    const fallback = () => {
      if (settled) return
      settled = true
      currentAudio = null
      // 优先用实际假名字符做 TTS，发音更准确
      fallbackSpeak(char ?? romaji).then(resolve)
    }

    audio.onended = done
    audio.onerror = fallback
    audio.play().catch(fallback)
  })
}

/**
 * TTS 兜底：带 5s 超时，防止没有日语语音包时 promise 永久挂死
 */
function fallbackSpeak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve()
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.9

    // 最长等 5s，防止 onend / onerror 不触发时永久挂死
    const timeout = setTimeout(resolve, 5000)
    utterance.onend = () => { clearTimeout(timeout); resolve() }
    utterance.onerror = () => { clearTimeout(timeout); resolve() }

    speechSynthesis.speak(utterance)
  })
}

export function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
}
