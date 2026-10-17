const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export const api = {
  list: () => request("/api/todos"),
  create: (title) =>
    request("/api/todos", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  update: (id, patch) =>
    request(`/api/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  remove: (id) => request(`/api/todos/${id}`, { method: "DELETE" }),
};
