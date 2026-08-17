/** Legacy handsets in this prototype's story predate emoji glyph support in USSD popups. */
const EMOJI_PATTERN = /\p{Extended_Pictographic}\uFE0F?\s*/gu;

export function stripEmoji(label: string): string {
  return label.replace(EMOJI_PATTERN, "").trim();
}
