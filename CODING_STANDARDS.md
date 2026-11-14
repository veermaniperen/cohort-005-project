# Coding standards

## Fail with a thrown response, not a return value

A loader or an action that cannot continue throws. It does not return an
error shape for the component to unpack.

```ts
if (!course) throw data("Course not found", { status: 404 });
```

The route then has one success path. A returned error shape gives every
component a second path to forget about.

## Parse untrusted input with a schema

Form data, search parameters and request bodies get a zod schema before the
values reach any query. Do not read `formData.get("x") as string`. The cast
is a lie the type checker believes.

## Do not write `any`, and do not write `!`

Both switch the type checker off at the exact point you are least sure. If a
value can be missing, narrow it with a check. If you cannot name the type,
the shape is wrong — fix the shape.

## Set up tests through the module's own functions

A test builds its state by calling the module under test (`saveNote`, then
`listNotes`), not by inserting into that module's tables. Rows the module does
not own come from the shared fixtures in `app/test/setup.ts` (`seedBaseData`,
`seedLessons`, `seedStudent`); add a fixture there before reaching for raw
`db.insert` in a test. Then a change to how the module stores its data leaves
the tests alone.

## A comment says why, never what

If a comment explains what the code does, rename or reshape the code until it
says that itself, and delete the comment. Keep comments for what the code
cannot say: a constraint from elsewhere, a race, a reason a simpler version
was rejected. A comment that contradicts its code is deleted, not corrected.

## Give each kind of text its own type

Markdown and plain text are different types (`Markdown`, `PlainText` in
`app/lib/text.ts`), set on the schema column with `.$type<>()`. Text gets its
type once, where it enters (a parsed form, the seed), and the renderers accept
only `Markdown`. A new kind of text (HTML, a slug) gets its own brand rather
than a comment saying what the string holds.
