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

  const res = await fetch(BASE_URL + url, {
    ...options,
    headers,
  });

  return res.json();
}