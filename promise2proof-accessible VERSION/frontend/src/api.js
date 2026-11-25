const BASE = import.meta.env.VITE_API_URL || "";

async function req(path, opts) {
  const r = await fetch(`${BASE}/api${path}`, opts);
  if (!r.ok) {
    let msg = r.statusText;
    try { const j = await r.json(); msg = typeof j.detail === "string" ? j.detail : msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return r.status === 204 ? null : r.json();
}

export const imageUrl = (name) => `${BASE}/uploads/${name}`;
export const exportUrl = (id) => `${BASE}/api/verifications/${id}/export`;
export const api = {
  health: () => req("/health"),
  list: () => req("/verifications"),
  get: (id) => req(`/verifications/${id}`),
  create: (formData) => req("/verifications", { method: "POST", body: formData }),
  analyze: (id) => req(`/verifications/${id}/analyze`, { method: "POST" }),
  saveReport: (id, body) =>
    req(`/verifications/${id}/report`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  remove: (id) => req(`/verifications/${id}`, { method: "DELETE" }),
};
