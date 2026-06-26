// Shared client-side fetch helpers that understand the API envelope
// ({ data } / { error }). Throwing on error lets callers use try/catch + toast.

export async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "请求失败");
  return json.data as T;
}

type Method = "POST" | "PUT" | "DELETE";

export async function sendJSON<T>(
  url: string,
  method: Method,
  body?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "请求失败");
  return json.data as T;
}

// SWR-compatible fetcher.
export const swrFetcher = (url: string) => getJSON(url);
