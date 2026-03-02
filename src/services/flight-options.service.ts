import { FlightLookupResponse } from "../components/booking/types";
import { apiGet } from "../lib/apiClient";

const ENDPOINT = "/mock-flight-options.json";

export async function fetchFlightLookup() {
  return apiGet<FlightLookupResponse>(ENDPOINT);
}

export async function fetchAirports() {
  const data = await fetchFlightLookup();
  return data.airports;
}

export async function fetchAirlines() {
  const data = await fetchFlightLookup();
  return data.airlines;
}
