/**
 * 假名 → 罗马音映射表
 *
 * 用途：
 * 1. 音频播放：通过假名字符查找对应音频文件名（romaji.mp3）
 * 2. 音频生成脚本：提供需要生成的唯一声音列表
 *
 * 关键规则：
 * - 平假名和片假名发音相同，共用同一音频文件
 *   例：あ 和 ア 都对应 a.mp3
 * - ぢ/ヂ 与 じ/ジ 读音相同，共用 ji.mp3
 * - づ/ヅ 与 ず/ズ 读音相同，共用 zu.mp3
 */

/** 假名字符 → 罗马音（音频文件名，不含 .mp3）*/
export const KANA_AUDIO_MAP: Record<string, string> = {
  // ===== 平假名 清音 =====
  'あ': 'a',  'い': 'i',  'う': 'u',  'え': 'e',  'お': 'o',
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'さ': 'sa', 'し': 'shi','す': 'su', 'せ': 'se', 'そ': 'so',
  'た': 'ta', 'ち': 'chi','つ': 'tsu','て': 'te', 'と': 'to',
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  'や': 'ya',             'ゆ': 'yu',             'よ': 'yo',
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  'わ': 'wa',                         'を': 'wo', 'ん': 'n',
  'っ': 'xtsu',

  // ===== 平假名 濁音 =====
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',

  // ===== 平假名 半濁音 =====
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',

  // ===== 平假名 清音拗音 =====
  'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
  'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
  'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
  'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
  'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
  'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
  'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',

  // ===== 平假名 濁音・半濁音拗音 =====
  'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
  'じゃ': 'ja',  'じゅ': 'ju',  'じょ': 'jo',
  'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
  'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',

  // ===== 片假名 清音（与平假名共用音频）=====
  'ア': 'a',  'イ': 'i',  'ウ': 'u',  'エ': 'e',  'オ': 'o',
  'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
  'サ': 'sa', 'シ': 'shi','ス': 'su', 'セ': 'se', 'ソ': 'so',
  'タ': 'ta', 'チ': 'chi','ツ': 'tsu','テ': 'te', 'ト': 'to',
  'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
  'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
  'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
  'ヤ': 'ya',             'ユ': 'yu',             'ヨ': 'yo',
  'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
  'ワ': 'wa',                         'ヲ': 'wo', 'ン': 'n',
  'ッ': 'xtsu', 'ー': 'choon',

  // ===== 片假名 濁音 =====
  'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
  'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
  'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
  'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',

  // ===== 片假名 半濁音 =====
  'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',

  // ===== 片假名 清音拗音 =====
  'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
  'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
  'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
  'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
  'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
  'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
  'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',

  // ===== 片假名 濁音・半濁音拗音 =====
  'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
  'ジャ': 'ja',  'ジュ': 'ju',  'ジョ': 'jo',
  'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
  'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo',
}

/** 获取假名对应的音频文件名（含.mp3扩展名） */
export function getAudioFilename(kana: string): string {
  const romaji = KANA_AUDIO_MAP[kana]
  if (!romaji) return ''
  return `${romaji}.mp3`
}

/**
 * 需要生成的唯一音频列表（104个）
 * 供 generate-audio.mjs 脚本使用
 */
export const AUDIO_GENERATION_LIST: Array<{ romaji: string; text: string }> = [
  // 清音（46）
  { romaji: 'a',    text: 'あ' },
  { romaji: 'i',    text: 'い' },
  { romaji: 'u',    text: 'う' },
  { romaji: 'e',    text: 'え' },
  { romaji: 'o',    text: 'お' },
  { romaji: 'ka',   text: 'か' },
  { romaji: 'ki',   text: 'き' },
  { romaji: 'ku',   text: 'く' },
  { romaji: 'ke',   text: 'け' },
  { romaji: 'ko',   text: 'こ' },
  { romaji: 'sa',   text: 'さ' },
  { romaji: 'shi',  text: 'し' },
  { romaji: 'su',   text: 'す' },
  { romaji: 'se',   text: 'せ' },
  { romaji: 'so',   text: 'そ' },
  { romaji: 'ta',   text: 'た' },
  { romaji: 'chi',  text: 'ち' },
  { romaji: 'tsu',  text: 'つ' },
  { romaji: 'te',   text: 'て' },
  { romaji: 'to',   text: 'と' },
  { romaji: 'na',   text: 'な' },
  { romaji: 'ni',   text: 'に' },
  { romaji: 'nu',   text: 'ぬ' },
  { romaji: 'ne',   text: 'ね' },
  { romaji: 'no',   text: 'の' },
  { romaji: 'ha',   text: 'は' },
  { romaji: 'hi',   text: 'ひ' },
  { romaji: 'fu',   text: 'ふ' },
  { romaji: 'he',   text: 'へ' },
  { romaji: 'ho',   text: 'ほ' },
  { romaji: 'ma',   text: 'ま' },
  { romaji: 'mi',   text: 'み' },
  { romaji: 'mu',   text: 'む' },
  { romaji: 'me',   text: 'め' },
  { romaji: 'mo',   text: 'も' },
  { romaji: 'ya',   text: 'や' },
  { romaji: 'yu',   text: 'ゆ' },
  { romaji: 'yo',   text: 'よ' },
  { romaji: 'ra',   text: 'ら' },
  { romaji: 'ri',   text: 'り' },
  { romaji: 'ru',   text: 'る' },
  { romaji: 're',   text: 'れ' },
  { romaji: 'ro',   text: 'ろ' },
  { romaji: 'wa',   text: 'わ' },
  { romaji: 'wo',   text: 'を' },
  { romaji: 'n',    text: 'ん' },
  // 濁音（18个唯一音，ぢ→ji，づ→zu已在ざ行中）
  { romaji: 'ga',   text: 'が' },
  { romaji: 'gi',   text: 'ぎ' },
  { romaji: 'gu',   text: 'ぐ' },
  { romaji: 'ge',   text: 'げ' },
  { romaji: 'go',   text: 'ご' },
  { romaji: 'za',   text: 'ざ' },
  { romaji: 'ji',   text: 'じ' },
  { romaji: 'zu',   text: 'ず' },
  { romaji: 'ze',   text: 'ぜ' },
  { romaji: 'zo',   text: 'ぞ' },
  { romaji: 'da',   text: 'だ' },
  { romaji: 'de',   text: 'で' },
  { romaji: 'do',   text: 'ど' },
  { romaji: 'ba',   text: 'ば' },
  { romaji: 'bi',   text: 'び' },
  { romaji: 'bu',   text: 'ぶ' },
  { romaji: 'be',   text: 'べ' },
  { romaji: 'bo',   text: 'ぼ' },
  // 半濁音（5）
  { romaji: 'pa',   text: 'ぱ' },
  { romaji: 'pi',   text: 'ぴ' },
  { romaji: 'pu',   text: 'ぷ' },
  { romaji: 'pe',   text: 'ぺ' },
  { romaji: 'po',   text: 'ぽ' },
  // 清音拗音（21）
  { romaji: 'kya',  text: 'きゃ' },
  { romaji: 'kyu',  text: 'きゅ' },
  { romaji: 'kyo',  text: 'きょ' },
  { romaji: 'sha',  text: 'しゃ' },
  { romaji: 'shu',  text: 'しゅ' },
  { romaji: 'sho',  text: 'しょ' },
  { romaji: 'cha',  text: 'ちゃ' },
  { romaji: 'chu',  text: 'ちゅ' },
  { romaji: 'cho',  text: 'ちょ' },
  { romaji: 'nya',  text: 'にゃ' },
  { romaji: 'nyu',  text: 'にゅ' },
  { romaji: 'nyo',  text: 'にょ' },
  { romaji: 'hya',  text: 'ひゃ' },
  { romaji: 'hyu',  text: 'ひゅ' },
  { romaji: 'hyo',  text: 'ひょ' },
  { romaji: 'mya',  text: 'みゃ' },
  { romaji: 'myu',  text: 'みゅ' },
  { romaji: 'myo',  text: 'みょ' },
  { romaji: 'rya',  text: 'りゃ' },
  { romaji: 'ryu',  text: 'りゅ' },
  { romaji: 'ryo',  text: 'りょ' },
  // 濁音拗音（9）
  { romaji: 'gya',  text: 'ぎゃ' },
  { romaji: 'gyu',  text: 'ぎゅ' },
  { romaji: 'gyo',  text: 'ぎょ' },
  { romaji: 'ja',   text: 'じゃ' },
  { romaji: 'ju',   text: 'じゅ' },
  { romaji: 'jo',   text: 'じょ' },
  { romaji: 'bya',  text: 'びゃ' },
  { romaji: 'byu',  text: 'びゅ' },
  { romaji: 'byo',  text: 'びょ' },
  // 半濁音拗音（3）
  { romaji: 'pya',  text: 'ぴゃ' },
  { romaji: 'pyu',  text: 'ぴゅ' },
  { romaji: 'pyo',  text: 'ぴょ' },
  // 特殊音（2）
  { romaji: 'xtsu', text: 'っ' },
  { romaji: 'choon',text: 'ー' },
]
// 合计：46 + 18 + 5 + 21 + 9 + 3 + 2 = 104 个唯一音频文件
