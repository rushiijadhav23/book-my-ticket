import { apiRequest } from "./api.js";

export async function getSeats(movieId) {
  return apiRequest(`/seats/${movieId}`);
}

export async function bookSeat(movieId, seatId) {
  return apiRequest(`/movies/${movieId}/seats/${seatId}/book`, {
    method: "PUT",
  });
}

export async function getMyBookings() {
  return apiRequest("/my-bookings");
}