/** Escape a single CSV field per RFC 4180. */
function escapeField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Render rows to a CSV string. `columns` fixes the header order; each row is
 * an object keyed by column name.
 */
export function toCsv(
  columns: string[],
  rows: Array<Record<string, unknown>>,
): string {
  const header = columns.map(escapeField).join(",");
  const body = rows.map((row) =>
    columns.map((col) => escapeField(row[col])).join(","),
  );
  return [header, ...body].join("\n");
}
