/**
 * The text to paste into Meshy for a 3D model entry: the subject with the rules Meshy needs. Meshy's text
 * prompt is short (about 600 characters), so a long subject is cut at a sentence. The closing style line
 * follows the case: most cases are realistic; CHR001 (the North Pole) is bright, whimsical cartoon fantasy.
 */
const STYLE: Record<string, string> = {
  CHR001: " Standing upright in its normal position, nothing tipped over. Bright, colorful, whimsical storybook cartoon fantasy style with soft rounded shapes.",
};
const DEFAULT = " Standing upright in its normal position, nothing tipped over. Realistic materials and true colors.";

export function meshyText(subject: string, group?: string) {
  const tail = (group && STYLE[group.toUpperCase()]) || DEFAULT;
  let s = subject.trim();
  if (s.length + tail.length > 600) {
    const cut = s.slice(0, 600 - tail.length);
    s = cut.slice(0, Math.max(cut.lastIndexOf(". ") + 1, 200)).trim();
  }
  return s + tail;
}
