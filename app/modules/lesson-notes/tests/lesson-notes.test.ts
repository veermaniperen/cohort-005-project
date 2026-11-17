import { describe, it, expect } from "vitest";
import { noteDraft, noteBodySchema } from "../index";
import { MAX_NOTE_LENGTH } from "~/lib/notes";

describe("noteDraft", () => {
  it("cannot save an empty note", () => {
    expect(noteDraft("")).toEqual({
      length: 0,
      limit: MAX_NOTE_LENGTH,
      tooLong: false,
      canSave: false,
    });
  });

  it("treats a whitespace-only note as empty, as the server does", () => {
    const draft = noteDraft("   \n ");
    expect(draft.canSave).toBe(false);
    expect(draft.length).toBe(0);
  });

  it("can save a note with text in it", () => {
    expect(noteDraft("Generics take a type parameter.")).toEqual({
      length: 31,
      limit: MAX_NOTE_LENGTH,
      tooLong: false,
      canSave: true,
    });
  });

  it("can save a note exactly at the limit", () => {
    const draft = noteDraft("a".repeat(MAX_NOTE_LENGTH));
    expect(draft.tooLong).toBe(false);
    expect(draft.canSave).toBe(true);
  });

  it("cannot save a note one character over the limit", () => {
    const draft = noteDraft("a".repeat(MAX_NOTE_LENGTH + 1));
    expect(draft.tooLong).toBe(true);
    expect(draft.canSave).toBe(false);
    expect(draft.length).toBe(MAX_NOTE_LENGTH + 1);
  });

  it("ignores surrounding whitespace when checking the limit", () => {
    const draft = noteDraft(`  ${"a".repeat(MAX_NOTE_LENGTH)}  `);
    expect(draft.tooLong).toBe(false);
    expect(draft.canSave).toBe(true);
    expect(draft.length).toBe(MAX_NOTE_LENGTH);
  });
});

describe("noteBodySchema", () => {
  it("trims the note it accepts", () => {
    expect(noteBodySchema.parse("  Generics  ")).toBe("Generics");
  });

  it("refuses an empty note with a message for the Student", () => {
    const result = noteBodySchema.safeParse("  ");
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Write something before saving your note."
    );
  });

  it("refuses a note over the limit with a message for the Student", () => {
    const result = noteBodySchema.safeParse("a".repeat(MAX_NOTE_LENGTH + 1));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("so it was not saved");
  });
});
