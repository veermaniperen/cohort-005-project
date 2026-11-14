import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import { fileURLToPath } from "url";
import * as schema from "~/db/schema";
import { markdown } from "~/lib/text";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsFolder = path.resolve(__dirname, "../../drizzle");

/**
 * Creates a fresh in-memory SQLite database with all tables for testing.
 * Each call returns a new isolated database instance.
 *
 * Uses the same Drizzle migrations as the live database, ensuring
 * test and production schemas are always in sync.
 */
export function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const testDb = drizzle(sqlite, { schema });

  migrate(testDb, { migrationsFolder });

  return testDb;
}

/**
 * Seeds a minimal set of base data (user, category, course) that most tests need.
 * Returns the created IDs for use in test assertions.
 */
export function seedBaseData(testDb: ReturnType<typeof createTestDb>) {
  const user = testDb
    .insert(schema.users)
    .values({
      name: "Test User",
      email: "test@example.com",
      role: schema.UserRole.Student,
    })
    .returning()
    .get();

  const instructor = testDb
    .insert(schema.users)
    .values({
      name: "Test Instructor",
      email: "instructor@example.com",
      role: schema.UserRole.Instructor,
    })
    .returning()
    .get();

  const category = testDb
    .insert(schema.categories)
    .values({ name: "Programming", slug: "programming" })
    .returning()
    .get();

  const course = testDb
    .insert(schema.courses)
    .values({
      title: "Test Course",
      slug: "test-course",
      description: "A test course",
      salesCopy: markdown("## Test Course\n\nSales copy for the test course."),
      instructorId: instructor.id,
      categoryId: category.id,
      status: schema.CourseStatus.Published,
    })
    .returning()
    .get();

  return { user, instructor, category, course };
}

type TestDb = ReturnType<typeof createTestDb>;

/**
 * For services that import the shared `~/db`: keeps their queries on the
 * test's in-memory database, so a test run never writes to data.db.
 *
 *   vi.mock("~/db", async () =>
 *     (await import("~/test/setup")).sharedDbFor(() => db));
 */
export function sharedDbFor(current: () => TestDb) {
  return {
    db: new Proxy(
      {},
      {
        get(_target, prop) {
          const testDb = current();
          const value = Reflect.get(testDb, prop);
          return typeof value === "function" ? value.bind(testDb) : value;
        },
      }
    ),
  };
}

export function seedLessons(testDb: TestDb, courseId: number, count: number) {
  const module = testDb
    .insert(schema.modules)
    .values({ courseId, title: "Basics", position: 1 })
    .returning()
    .get();

  return Array.from(
    { length: count },
    (_, i) =>
      testDb
        .insert(schema.lessons)
        .values({
          moduleId: module.id,
          title: `Lesson ${i + 1}`,
          position: i + 1,
        })
        .returning()
        .get().id
  );
}

export function seedStudent(testDb: TestDb, name: string) {
  return testDb
    .insert(schema.users)
    .values({
      name,
      email: `${name.toLowerCase()}@example.com`,
      role: schema.UserRole.Student,
    })
    .returning()
    .get();
}
