declare const textKind: unique symbol;

export type Markdown = string & { readonly [textKind]: "Markdown" };
export type PlainText = string & { readonly [textKind]: "PlainText" };

export function markdown(source: string): Markdown {
  return source as Markdown;
}

export function plainText(source: string): PlainText {
  return source as PlainText;
}
