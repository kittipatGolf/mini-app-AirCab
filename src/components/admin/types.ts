export type AdminContactMethod = "whatsapp" | "wechat" | "line" | "email";

export type AdminBookingContact = {
  method: AdminContactMethod;
  value: string;
};

export type AdminBookingStatus = "pending" | "assigned" | "arrived";
export type AdminPaymentStatus = "unpaid" | "paid";

export type AdminBookingItem = {
  id: string;
  customerName: string;
  airport: string;
  airline: string;
  flightNumber: string;
  landingDateTime: string;
  passengers: number;
  destination: string;
  contacts: AdminBookingContact[];
  note?: string;
  bookingStatus: AdminBookingStatus;
  paymentStatus: AdminPaymentStatus;
  createdAt: string;
};

export type AdminBookingResponse = {
  items: AdminBookingItem[];
};
