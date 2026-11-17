import { z } from "zod";
import { MAX_NOTE_LENGTH } from "~/lib/notes";

// The one rule for a note body. The save-note action parses with it and the
// editor previews it, so Save is off exactly when the server would refuse.
export const noteBodySchema = z
  .string()
  .trim()
  .min(1, "Write something before saving your note.")
  .max(
    MAX_NOTE_LENGTH,
    `Your note is over ${MAX_NOTE_LENGTH.toLocaleString("en")} characters, so it was not saved.`
  );

export type NoteDraft = {
  length: number;
  limit: number;
  tooLong: boolean;
  canSave: boolean;
};

/**
 * What the notes editor shows for the text a Student has typed: the count
 * against the limit, and whether Save is allowed. The count ignores
 * surrounding whitespace, as the limit does.
 */
export function noteDraft(body: string): NoteDraft {
  const length = body.trim().length;
  return {
    length,
    limit: MAX_NOTE_LENGTH,
    tooLong: length > MAX_NOTE_LENGTH,
    canSave: noteBodySchema.safeParse(body).success,
  };
}
