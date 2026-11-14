import { and, desc, eq } from "drizzle-orm";
import { db } from "~/db";
import { bookmarks, courses, lessons, modules, notes } from "~/db/schema";
import { MAX_NOTE_LENGTH } from "~/lib/notes";

// ─── Bookmarks and Notes ───
// A Student's own flag on a Lesson (Bookmark) and their own writing about it
// (Note). See GLOSSARY.md. Both are private to the Student: every read here is
// scoped to one Student, and nothing outside the Student's own Lesson page and
// Saved page may call these. Content access is the caller's job.

export type Note = typeof notes.$inferSelect;

/** One Student and one Lesson: the key both Bookmarks and Notes hang off. */
export type StudentLesson = { userId: number; lessonId: number };

function bookmarkFor({ userId, lessonId }: StudentLesson) {
  return db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.lessonId, lessonId)))
    .get();
}

export function isBookmarked(key: StudentLesson) {
  return !!bookmarkFor(key);
}

/**
 * Adds the Bookmark if there is none, removes it if there is one. Returns
 * whether the Lesson is now bookmarked. The unique index on (user, lesson)
 * makes a racing second insert a no-op rather than a duplicate.
 */
export function toggleBookmark(key: StudentLesson, now: Date): boolean {
  const existing = bookmarkFor(key);

  if (existing) {
    db.delete(bookmarks).where(eq(bookmarks.id, existing.id)).run();
    return false;
  }

  db.insert(bookmarks)
    .values({ ...key, createdAt: now.toISOString() })
    .onConflictDoNothing()
    .run();
  return true;
}

export function getNote({ userId, lessonId }: StudentLesson) {
  return db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.lessonId, lessonId)))
    .get();
}

export type SaveNoteResult =
  { ok: true; note: Note } | { ok: false; error: string };

/**
 * Creates the Student's Note on the Lesson, or replaces its body if they
 * already have one. A re-save moves `updatedAt` on and leaves `createdAt`.
 */
export function saveNote(
  key: StudentLesson,
  body: string,
  now: Date
): SaveNoteResult {
  const trimmed = body.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: "Write something before saving your note." };
  }
  if (trimmed.length > MAX_NOTE_LENGTH) {
    return {
      ok: false,
      error: `A note can be at most ${MAX_NOTE_LENGTH.toLocaleString("en-US")} characters.`,
    };
  }

  const timestamp = now.toISOString();
  const note = db
    .insert(notes)
    .values({
      ...key,
      body: trimmed,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .onConflictDoUpdate({
      target: [notes.userId, notes.lessonId],
      set: { body: trimmed, updatedAt: timestamp },
    })
    .returning()
    .get();

  return { ok: true, note };
}

const lessonLocation = {
  lessonId: lessons.id,
  lessonTitle: lessons.title,
  courseTitle: courses.title,
  courseSlug: courses.slug,
};

/** The Student's Bookmarks, newest first, each with its Lesson and Course. */
export function listBookmarks(userId: number) {
  return db
    .select({
      id: bookmarks.id,
      createdAt: bookmarks.createdAt,
      ...lessonLocation,
    })
    .from(bookmarks)
    .innerJoin(lessons, eq(bookmarks.lessonId, lessons.id))
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt), desc(bookmarks.id))
    .all();
}

/** The Student's Notes, last edited first, each with its Lesson and Course. */
export function listNotes(userId: number) {
  return db
    .select({
      id: notes.id,
      body: notes.body,
      updatedAt: notes.updatedAt,
      ...lessonLocation,
    })
    .from(notes)
    .innerJoin(lessons, eq(notes.lessonId, lessons.id))
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.updatedAt), desc(notes.id))
    .all();
}
