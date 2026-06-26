// SQLite stores arrays as JSON strings. These helpers centralize the
// (de)serialization so models can expose real string[] to the app layer.
// When migrating to PostgreSQL (native arrays), only this file needs changing.

export function parseStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function stringifyStringArray(value: string[] | undefined | null): string {
  return JSON.stringify(value ?? []);
}
