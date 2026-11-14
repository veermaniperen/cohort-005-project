import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createTestDb,
  seedBaseData,
  seedLessons,
  seedStudent,
} from "~/test/setup";
import {
  getNote,
  isBookmarked,
  listBookmarks,
  listNotes,
  saveNote,
  toggleBookmark,
} from "./saved.server";

let db: ReturnType<typeof createTestDb>;

vi.mock("~/db", async () =>
  (await import("~/test/setup")).sharedDbFor(() => db)
);

const NOW = new Date(2026, 9, 6, 12, 0, 0);
const LATER = new Date(2026, 9, 7, 9, 30, 0);

let base: ReturnType<typeof seedBaseData>;
let lessonId: number;
let otherLessonId: number;
let student: { userId: number; lessonId: number };

beforeEach(() => {
  db = createTestDb();
  base = seedBaseData(db);
  [lessonId, otherLessonId] = seedLessons(db, base.course.id, 2);
  student = { userId: base.user.id, lessonId };
});

describe("toggling a Bookmark", () => {
  it("bookmarks a Lesson that has no Bookmark", () => {
    expect(toggleBookmark(student, NOW)).toBe(true);
    expect(isBookmarked(student)).toBe(true);
  });

  it("removes the Bookmark when toggled again", () => {
    toggleBookmark(student, NOW);

    expect(toggleBookmark(student, LATER)).toBe(false);
    expect(isBookmarked(student)).toBe(false);
  });
});

describe("saving a Note", () => {
  it("creates a Note with the body trimmed", () => {
    const result = saveNote(student, "  Rewatch the intro  ", NOW);

    expect(result).toMatchObject({ ok: true });
    expect(getNote(student)).toMatchObject({
      body: "Rewatch the intro",
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    });
  });

  it("replaces the body and moves the last-edited time on when saved again", () => {
    saveNote(student, "First thought", NOW);
    saveNote(student, "Second thought", LATER);

    expect(getNote(student)).toMatchObject({
      body: "Second thought",
      createdAt: NOW.toISOString(),
      updatedAt: LATER.toISOString(),
    });
    expect(listNotes(base.user.id)).toHaveLength(1);
  });

  it("keeps the body exactly as typed, Markdown characters included", () => {
    saveNote(student, "# not a heading\n* not a list", NOW);

    expect(getNote(student)?.body).toBe("# not a heading\n* not a list");
  });

  it("accepts a Note of exactly 2,000 characters", () => {
    expect(saveNote(student, "a".repeat(2000), NOW).ok).toBe(true);
  });

  it("refuses a Note over 2,000 characters with a message", () => {
    expect(saveNote(student, "a".repeat(2001), NOW)).toEqual({
      ok: false,
      error: "A note can be at most 2,000 characters.",
    });
    expect(getNote(student)).toBeUndefined();
  });

  it("refuses an empty Note", () => {
    expect(saveNote(student, "   ", NOW).ok).toBe(false);
    expect(getNote(student)).toBeUndefined();
  });
});

describe("the Saved lists", () => {
  it("contain only the Student's own rows, newest first, with Lesson and Course", () => {
    const other = seedStudent(db, "Priya");
    toggleBookmark(student, NOW);
    toggleBookmark({ userId: base.user.id, lessonId: otherLessonId }, LATER);
    toggleBookmark({ userId: other.id, lessonId }, LATER);

    saveNote({ userId: base.user.id, lessonId: otherLessonId }, "Older", NOW);
    saveNote(student, "Newer", LATER);
    saveNote({ userId: other.id, lessonId }, "Not mine", LATER);

    expect(listBookmarks(base.user.id)).toMatchObject([
      {
        lessonId: otherLessonId,
        lessonTitle: "Lesson 2",
        courseTitle: "Test Course",
        courseSlug: "test-course",
      },
      {
        lessonId,
        lessonTitle: "Lesson 1",
        courseTitle: "Test Course",
        courseSlug: "test-course",
      },
    ]);
    expect(listNotes(base.user.id)).toMatchObject([
      { body: "Newer", lessonId, courseTitle: "Test Course" },
      { body: "Older", lessonId: otherLessonId, courseTitle: "Test Course" },
    ]);
  });

  it("orders Notes by last edited, not by when they were created", () => {
    saveNote(student, "Written first", NOW);
    saveNote(
      { userId: base.user.id, lessonId: otherLessonId },
      "Written second",
      LATER
    );
    saveNote(student, "Edited last", new Date(2026, 9, 8));

    expect(listNotes(base.user.id).map((note) => note.body)).toEqual([
      "Edited last",
      "Written second",
    ]);
  });
});
