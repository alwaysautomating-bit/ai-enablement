// Deterministic quote verification. A cited span must appear in the stored evidence
// text; anything else is rejected before a person ever sees it.

const EQUIVALENTS: Array<[RegExp, string]> = [
  [/[‘’‚‛′]/g, "'"],
  [/[“”„‟″]/g, '"'],
  [/[‐‑‒–—―]/g, "-"],
  [/…/g, "..."],
];

function canonicalChar(char: string) {
  let value = char.normalize("NFKC");
  for (const [pattern, replacement] of EQUIVALENTS) value = value.replace(pattern, replacement);
  return value.toLowerCase();
}

/** Canonical text plus a map from each canonical character back to the source index. */
function canonicalize(text: string) {
  let output = "";
  const map: number[] = [];
  let previousSpace = true;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (/\s/.test(char)) {
      if (!previousSpace) {
        output += " ";
        map.push(index);
      }
      previousSpace = true;
      continue;
    }
    for (const piece of canonicalChar(char)) {
      output += piece;
      map.push(index);
    }
    previousSpace = false;
  }
  return { output: output.trimEnd(), map };
}

export function locateQuote(text: string, quote: string): { start: number; end: number } | null {
  const trimmed = quote.trim().replace(/^["']|["']$/g, "").trim();
  if (trimmed.length < 3) return null;
  const haystack = canonicalize(text);
  const needle = canonicalize(trimmed).output;
  if (!needle) return null;
  const at = haystack.output.indexOf(needle);
  if (at < 0) return null;
  const start = haystack.map[at];
  const end = haystack.map[at + needle.length - 1] + 1;
  return { start, end };
}
