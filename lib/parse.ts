// Deterministic keyword parser for the WhatsApp-style assistant. This is the
// zero-dependency fallback that runs when no LLM key is configured (see the
// Phase 4 /api/parse-invoice route).
import type { TemplateKey } from "./types";

export function amountFromText(text: string): number | null {
  const match = text.match(/(?:rm|myr)?\s*(\d+(?:\.\d{1,2})?)/i);
  return match ? Number(match[1]) : null;
}

export function templateFromText(text: string): TemplateKey {
  const lower = text.toLowerCase();
  if (/(refund|return|credit|duplicate|wrong price)/.test(lower)) {
    return "credit";
  }
  if (/(grab|driver|ride|delivery|lalamove|rider|platform)/.test(lower)) {
    return "grab";
  }
  if (/(hawker|stall|pasar|food|nasi|mee|kopi|catering)/.test(lower)) {
    return "hawker";
  }
  if (/(airbnb|rental|rent|tenant|room|house|homestay)/.test(lower)) {
    return "rental";
  }
  if (/(goods|stock|carton|supply|retail|shop|delivery|product)/.test(lower)) {
    return "retail";
  }
  return "services";
}
