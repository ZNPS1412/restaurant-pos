const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

export async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(body.error ?? "Request failed");
  }
  return response.status === 204 ? (null as T) : ((await response.json()) as T);
}
