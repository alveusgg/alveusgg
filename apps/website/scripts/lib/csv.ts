// Quoted commas, escaped quotes, CRLF and embedded newlines are common in exports.
// Reject incomplete quoting before any importer starts writing rows.
export function parseCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let closed = false;
  const text = input.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (quoted) {
        quoted = false;
        closed = true;
      } else {
        if (field.length || closed) throw new Error("Malformed CSV quote");
        quoted = true;
      }
    } else if (!quoted && (char === "," || char === "\n" || char === "\r")) {
      row.push(field);
      field = "";
      closed = false;
      if (char !== ",") {
        rows.push(row);
        row = [];
        if (char === "\r" && text[i + 1] === "\n") i++;
      }
    } else if (closed) {
      if (char.trim()) throw new Error("Unexpected content after CSV quote");
    } else field += char;
  }
  if (quoted) throw new Error("Unterminated CSV quote");
  if (field || row.length || closed) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((fields) => fields.some((value) => value.trim() !== ""));
}

export function parseUsdAmount(input: string) {
  const value = input.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return undefined;
  const amount = Number(value);
  return Number.isFinite(amount) &&
    amount > 0 &&
    Math.round(amount * 100) <= 2_147_483_647
    ? amount
    : undefined;
}
