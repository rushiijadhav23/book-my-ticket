import { apiRequest } from "./api.js";

export async function register({ firstName, lastName, email, password }) {
  return apiRequest("/register", {
    method: "POST",
    body: JSON.stringify({ firstName, lastName, email, password }),
  });
}

export async function login(email, password) {
  const data = await apiRequest("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (data.token) {
    localStorage.setItem("token", data.token);
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  }

  return data;
}