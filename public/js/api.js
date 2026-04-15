const BASE_URL = "";

export async function apiRequest(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  try {
    const res = await fetch(BASE_URL + url, {
      ...options,
      headers,
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await res.json() : { error: await res.text() };

    if (res.status === 401) {
      // Token is missing/invalid; ensure UI can recover cleanly.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    return data;
  } catch (err) {
    return { error: "Network error. Please try again." };
  }
}