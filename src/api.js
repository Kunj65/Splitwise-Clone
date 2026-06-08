const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const buildAuthHeaders = () => {
  const token = localStorage.getItem("splitwise_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchJson = async (path, options = {}) => {

  const { body, headers, ...restOptions } = options;

  // Always stringify body if it's an object
  const serializedBody = body !== undefined
    ? (typeof body === "string" ? body : JSON.stringify(body))
    : undefined;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    // Only include body if it exists (GET requests have no body)
    ...(serializedBody !== undefined ? { body: serializedBody } : {}),
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(responseBody?.message || "Request failed");
  }

  return responseBody;
};

export const fetchJsonWithAuth = async (path, options = {}) =>
  fetchJson(path, {
    ...options,
    headers: {
      ...buildAuthHeaders(),
      ...options.headers,
    },
  });

export const getAuthHeaders = () => buildAuthHeaders();