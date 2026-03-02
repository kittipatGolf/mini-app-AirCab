export type ContactMethod = "whatsapp" | "wechat" | "line" | "email";
export type ContactChannel = {
  enabled: boolean;
  value: string;
};

export type BookingFormData = {
  airport: string;
  flightNumber: string;
  airline: string;
  landingDate: string;
  landingTime: string;
  passengers: number;
  destination: string;
  contacts: Record<ContactMethod, ContactChannel>;
};

export type FlightLookupResponse = {
  airports: string[];
  airlines: string[];
};

export type BookingHistoryStatus = "Pending" | "Confirmed" | "Completed";

export type BookingHistoryContact = {
  method: string;
  value: string;
};

export type BookingHistoryItem = {
  id: string;
  airport: string;
  destination: string;
  date: string;
  status: BookingHistoryStatus;
  flightNumber?: string;
  airline?: string;
  passengers?: number;
  landingDate?: string;
  landingTime?: string;
  contacts?: BookingHistoryContact[];
};

export const BOOKING_HISTORY_STORAGE_KEY = "aircab_booking_history";

export const contactMethodLabels: Record<ContactMethod, string> = {
  whatsapp: "WhatsApp",
  wechat: "WeChat",
  line: "LINE",
  email: "Email",
};
