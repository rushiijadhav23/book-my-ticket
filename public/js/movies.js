import { apiRequest } from "./api.js";

export async function getMovies() {
  return apiRequest("/movies");
}