import { AdminBookingResponse } from "../components/admin/types";
import { apiGet } from "../lib/apiClient";

const ENDPOINT = "/mock-admin-bookings.json";

export async function fetchAdminBookings() {
  return apiGet<AdminBookingResponse>(ENDPOINT);
}

export async function fetchAdminBookingById(id: string) {
  const data = await fetchAdminBookings();
  return data.items.find((item) => item.id === id) ?? null;
}
