import { MAX_NOTE_LENGTH } from "~/lib/notes";

export type NoteDraft = {
  length: number;
  limit: number;
  empty: boolean;
  tooLong: boolean;
  canSave: boolean;
};

// Mirrors the save-note schema in the lesson route (trimmed, 1..limit), so the
// Save button is off exactly when the server would refuse the note.
export function describeDraft(body: string): NoteDraft {
  const trimmed = body.trim();
  const empty = trimmed.length === 0;
  const tooLong = trimmed.length > MAX_NOTE_LENGTH;
  return {
    length: body.length,
    limit: MAX_NOTE_LENGTH,
    empty,
    tooLong,
    canSave: !empty && !tooLong,
  };
}
