/** 使用 Web Audio API 生成答题音效，无需外部文件 */

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.25
) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.type = type
    osc.frequency.value = frequency
    gainNode.gain.setValueAtTime(gain, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {
    // 忽略不支持 AudioContext 的环境
  }
}

export const playCorrectSound = () => {
  playTone(880, 0.12)
  setTimeout(() => playTone(1100, 0.18), 100)
}

export const playWrongSound = () => {
  playTone(280, 0.35, 'sawtooth', 0.2)
}

export const preloadSounds = () => {
  // Web Audio API 无需预加载
}
