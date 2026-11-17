import { describeDraft, type NoteDraft } from "./lib/draft";

export type { NoteDraft };

/**
 * What the notes editor shows for the text a Student has typed: the count
 * against the limit, and whether Save is allowed.
 */
export function noteDraft(body: string): NoteDraft {
  return describeDraft(body);
}
