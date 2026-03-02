type QueryValue = string | number | boolean | null | undefined;

type ApiGetOptions = {
  query?: Record<string, QueryValue>;
  init?: RequestInit;
};

function withQuery(endpoint: string, query?: Record<string, QueryValue>) {
  if (!query) return endpoint;

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    params.set(key, String(value));
  });

  const queryString = params.toString();
  if (!queryString) return endpoint;
  return `${endpoint}?${queryString}`;
}

export async function apiGet<T>(endpoint: string, options: ApiGetOptions = {}) {
  const url = withQuery(endpoint, options.query);
  const response = await fetch(url, {
    method: "GET",
    ...options.init,
  });

  if (!response.ok) {
    throw new Error(`GET ${url} failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
