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

export const contactMethodLabels: Record<ContactMethod, string> = {
  whatsapp: "WhatsApp",
  wechat: "WeChat",
  line: "LINE",
  email: "Email",
};
