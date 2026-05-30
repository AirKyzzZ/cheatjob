// Models routinely wrap JSON in ```json fences or add prose around it despite a
// "réponds strictement en JSON" instruction (Sonnet and Haiku both do via OpenRouter),
// and sometimes emit a reasoning fence before the real one. Try every fenced block
// (preferring object-looking ones), then the raw text, then the outermost {…} span.
export function extractJsonObject(raw: string): unknown {
  const text = raw.trim();

  const candidates: string[] = [];
  for (const match of text.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)) {
    candidates.push(match[1].trim());
  }
  candidates.sort((a, b) => Number(b.startsWith("{")) - Number(a.startsWith("{")));
  candidates.push(text);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // try the next candidate
    }
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return JSON.parse(text.slice(start, end + 1));
  }
  throw new SyntaxError("No JSON object found in model output");
}
