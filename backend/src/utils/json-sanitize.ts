/**
 * 清洗 AI 返回的 JSON 文本：将字符串字面量内的原始控制字符转义。
 *
 * Claude 等模型偶尔会在 JSON 字符串值里输出未转义的换行/制表符，
 * 直接 JSON.parse 会抛 "Bad control character in string literal"。
 * 本函数只处理字符串内部的控制字符，保留 JSON 结构外的空白（换行、缩进），
 * 避免破坏 pretty-print 后的结构。
 */
export function sanitizeJsonControlChars(text: string): string {
  let out = "";
  let inString = false;
  let escaped = false;

  for (const ch of text) {
    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }
    if (inString) {
      if (ch === "\\") {
        out += ch;
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
        out += ch;
        continue;
      }
      const code = ch.charCodeAt(0);
      if (code < 0x20) {
        switch (ch) {
          case "\n": out += "\\n"; break;
          case "\r": out += "\\r"; break;
          case "\t": out += "\\t"; break;
          case "\b": out += "\\b"; break;
          case "\f": out += "\\f"; break;
          default: out += "\\u" + code.toString(16).padStart(4, "0");
        }
        continue;
      }
      out += ch;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }
    out += ch;
  }
  return out;
}
