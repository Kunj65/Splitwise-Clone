const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const buildAuthHeaders = () => {
  const token = localStorage.getItem("splitwise_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchJson = async (path, options = {}) => {
  try {
    const { body, headers, ...restOptions } = options;

    const serializedBody =
      body !== undefined
        ? typeof body === "string"
          ? body
          : JSON.stringify(body)
        : undefined;

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...restOptions,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...(serializedBody !== undefined ? { body: serializedBody } : {}),
    });

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(responseBody?.message || "Request failed");
    }

    return responseBody;
  } catch (error) {
    console.error("❌ Fetch error:", error.message);
    throw error;
  }
};

export const fetchJsonWithAuth = async (path, options = {}) =>
  fetchJson(path, {
    ...options,
    headers: {
      ...buildAuthHeaders(),
      ...options.headers,
    },
  });

export const pingBackend = () => {
  fetch(`${API_BASE_URL}/health`).catch(() => {});
};

export const getAuthHeaders = () => buildAuthHeaders();