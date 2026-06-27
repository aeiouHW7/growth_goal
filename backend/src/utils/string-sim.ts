/**
 * bigram Jaccard 相似度 — 用于中文/短文本近似匹配
 */
export function bigramJaccard(a: string, b: string): number {
  const na = a.replace(/[^一-龥a-zA-Z0-9]/g, "");
  const nb = b.replace(/[^一-龥a-zA-Z0-9]/g, "");
  if (na.includes(nb) || nb.includes(na)) return 1;
  const toBigram = (s: string) => new Set([...Array(s.length - 1)].map((_, i) => s.slice(i, i + 2)));
  const ba = toBigram(na), bb = toBigram(nb);
  const inter = new Set([...ba].filter(x => bb.has(x)));
  const union = new Set([...ba, ...bb]);
  return union.size > 0 ? inter.size / union.size : 0;
}
