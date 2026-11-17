import { useState } from "react";
import { useFetcher } from "react-router";
import { NotebookPen } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { cn, formatRelativeTime } from "~/lib/utils";
import { noteDraft, type NoteDraft } from "~/modules/lesson-notes";

export function LessonNote({
  note,
}: {
  note: { body: string; updatedAt: string } | null;
}) {
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const [body, setBody] = useState(note?.body ?? "");
  const draft = noteDraft(body);
  const isSaving = fetcher.state !== "idle";
  const error = fetcher.data?.error;

  return (
    <Card className="mb-8">
      <CardContent className="px-6">
        <div className="mb-4 flex items-center gap-2">
          <NotebookPen className="size-5 text-primary" />
          <h2 className="text-xl font-semibold">Your Notes</h2>
          <span className="ml-auto text-xs text-muted-foreground">
            Only you can see these
          </span>
        </div>

        <fetcher.Form method="post" className="space-y-2">
          <input type="hidden" name="intent" value="save-note" />
          <Textarea
            name="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={5}
            placeholder="Jot down what you want to remember from this lesson..."
            aria-label="Your notes"
            className="min-h-32 resize-y"
          />

          <NoteFooter
            isSaving={isSaving}
            error={error}
            updatedAt={note?.updatedAt}
            draft={draft}
          />
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}

function NoteFooter({
  isSaving,
  error,
  updatedAt,
  draft,
}: {
  isSaving: boolean;
  error: string | undefined;
  updatedAt: string | undefined;
  draft: NoteDraft;
}) {
  return (
    <div className="flex items-center gap-3">
      <Button type="submit" size="sm" disabled={isSaving || !draft.canSave}>
        {isSaving ? "Saving..." : "Save notes"}
      </Button>
      {error ? (
        <span className="text-sm text-destructive">{error}</span>
      ) : (
        updatedAt && (
          <span
            suppressHydrationWarning
            className="text-xs text-muted-foreground"
          >
            Last edited {formatRelativeTime(updatedAt)}
          </span>
        )
      )}
      <span
        className={cn(
          "ml-auto text-xs",
          draft.tooLong ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {draft.length} / {draft.limit}
      </span>
    </div>
  );
}
