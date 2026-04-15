import { apiRequest } from "./api.js";

export async function getSeats(movieId) {
  return apiRequest(`/seats/${movieId}`);
}

export async function bookSeat(seatId) {
  return apiRequest(`/book/${seatId}`, {
    method: "PUT",
  });
}