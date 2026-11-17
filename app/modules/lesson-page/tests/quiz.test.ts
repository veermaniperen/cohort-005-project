import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDb, seedBaseData, type TestDb } from "~/test/setup";
import * as schema from "~/db/schema";

const testDb = vi.hoisted(() => ({ current: undefined as unknown }));
vi.mock("~/db", () => ({
  get db() {
    return testDb.current;
  },
}));

const { getQuizInLesson } = await import("../quiz.server");

let db: TestDb;
let lessonId: number;
let otherLessonId: number;
let quizId: number;

// lesson-page only reads lessons and quizzes; nothing in the app writes them
// through a service yet, so the fixtures insert rows directly.
function addLesson(moduleId: number, position: number) {
  return db
    .insert(schema.lessons)
    .values({ moduleId, title: `Lesson ${position}`, position })
    .returning()
    .get().id;
}

beforeEach(() => {
  db = createTestDb();
  testDb.current = db;
  const { course } = seedBaseData(db);
  const mod = db
    .insert(schema.modules)
    .values({ courseId: course.id, title: "Basics", position: 1 })
    .returning()
    .get();
  lessonId = addLesson(mod.id, 1);
  otherLessonId = addLesson(mod.id, 2);
  quizId = db
    .insert(schema.quizzes)
    .values({ lessonId, title: "Check", passingScore: 0.5 })
    .returning()
    .get().id;
});

describe("getQuizInLesson", () => {
  it("finds a quiz in the lesson it belongs to", () => {
    expect(getQuizInLesson(quizId, lessonId)?.id).toBe(quizId);
  });

  it("does not find a quiz through another lesson", () => {
    expect(getQuizInLesson(quizId, otherLessonId)).toBeUndefined();
  });

  it("does not find a quiz that does not exist", () => {
    expect(getQuizInLesson(quizId + 1, lessonId)).toBeUndefined();
  });
});
