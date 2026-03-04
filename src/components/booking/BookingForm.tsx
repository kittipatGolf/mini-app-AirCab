"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormSection } from "./FormSection";
import { StepGuide } from "./StepGuide";
import {
  BookingHistoryItem,
  BookingFormData,
  ContactMethod,
  contactMethodLabels,
} from "./types";
import { fetchAirlines, fetchAirports } from "../../services/flight-options.service";
import {
  CountryOption,
  getBookingHistoryStorageKey,
  getClientAuth,
  getCountryOptions,
  registerUser,
  setAuthSession,
} from "../../lib/mock-user-auth";

const contactMethods: ContactMethod[] = ["whatsapp", "wechat", "line", "email"];

const initialData: BookingFormData = {
  airport: "",
  flightNumber: "",
  airline: "",
  landingDate: "",
  landingTime: "",
  passengers: 1,
  destination: "",
  contacts: {
    whatsapp: { enabled: true, value: "" },
    wechat: { enabled: false, value: "" },
    line: { enabled: false, value: "" },
    email: { enabled: false, value: "" },
  },
};

function findSuggestions(source: string[], keyword: string) {
  const query = keyword.trim().toLowerCase();
  if (!query) return [];

  return source
    .filter((item) => item.toLowerCase().includes(query))
    .slice(0, 8);
}

function formatDateTime(date: string, time: string) {
  return [date, time].filter(Boolean).join(" ").trim();
}

function generateBookingId(now: Date) {
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const suffix = String(now.getTime()).slice(-4);
  return `BK-${yy}${mm}${dd}${suffix}`;
}

type RegisterData = {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  country: CountryOption;
  phoneCountryCode: string;
  phoneNumber: string;
};

const countryOptions = getCountryOptions();
const dialCodeOptions = ["+66", "+1", "+44", "+49", "+33", "+81", "+82", "+65", "+61", "+91"];

const initialRegisterData: RegisterData = {
  username: "",
  password: "",
  confirmPassword: "",
  email: "",
  country: countryOptions[0],
  phoneCountryCode: "+66",
  phoneNumber: "",
};

export function BookingForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<BookingFormData>(initialData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [authRole, setAuthRole] = useState<string | null>(null);
  const [authUsername, setAuthUsername] = useState<string | null>(null);
  const [airports, setAirports] = useState<string[]>([]);
  const [airlines, setAirlines] = useState<string[]>([]);
  const [isLoadingLookup, setIsLoadingLookup] = useState(true);
  const [showAirportSuggestions, setShowAirportSuggestions] = useState(false);
  const [showAirlineSuggestions, setShowAirlineSuggestions] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isRegisterConfirmOpen, setIsRegisterConfirmOpen] = useState(false);
  const [registerData, setRegisterData] = useState<RegisterData>(initialRegisterData);
  const [registerError, setRegisterError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadLookup = async () => {
      try {
        const [airportList, airlineList] = await Promise.all([
          fetchAirports(),
          fetchAirlines(),
        ]);

        if (isMounted) {
          setAirports(airportList);
          setAirlines(airlineList);
        }
      } finally {
        if (isMounted) {
          setIsLoadingLookup(false);
        }
      }
    };

    loadLookup();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const auth = getClientAuth();
    setAuthRole(auth.role);
    setAuthUsername(auth.username);
  }, []);

  const hasContact = useMemo(
    () =>
      contactMethods.some(
        (method) =>
          formData.contacts[method].enabled &&
          Boolean(formData.contacts[method].value.trim())
      ),
    [formData.contacts]
  );

  const canSubmit = useMemo(() => {
    return Boolean(
      formData.airport &&
        formData.flightNumber &&
        formData.landingDate &&
        formData.landingTime &&
        formData.passengers > 0 &&
        formData.destination &&
        hasContact
    );
  }, [formData, hasContact]);

  const canProceedRegister = useMemo(() => {
    return Boolean(
      registerData.username.trim() &&
        registerData.password &&
        registerData.confirmPassword &&
        registerData.email.trim() &&
        registerData.country &&
        registerData.phoneCountryCode &&
        registerData.phoneNumber.trim()
    );
  }, [registerData]);

  const airportSuggestions = useMemo(
    () => findSuggestions(airports, formData.airport),
    [airports, formData.airport]
  );

  const airlineSuggestions = useMemo(
    () => findSuggestions(airlines, formData.airline),
    [airlines, formData.airline]
  );

  const updateField = <K extends keyof BookingFormData>(
    key: K,
    value: BookingFormData[K]
  ) => {
    setIsSubmitted(false);
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleContact = (method: ContactMethod) => {
    setIsSubmitted(false);
    setFormData((prev) => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        [method]: {
          ...prev.contacts[method],
          enabled: !prev.contacts[method].enabled,
        },
      },
    }));
  };

  const updateContactValue = (method: ContactMethod, value: string) => {
    setIsSubmitted(false);
    setFormData((prev) => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        [method]: {
          ...prev.contacts[method],
          value,
        },
      },
    }));
  };

  const updateRegisterField = <K extends keyof RegisterData>(
    key: K,
    value: RegisterData[K]
  ) => {
    setRegisterError("");
    setRegisterData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    const latestRole = getClientAuth().role ?? authRole;
    if (latestRole !== "user") {
      setIsRegisterModalOpen(true);
      return;
    }
    setIsSubmitted(true);
  };

  const handleRegisterContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canProceedRegister) return;
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Password and confirm password do not match.");
      return;
    }
    setIsRegisterConfirmOpen(true);
  };

  const handleConfirmRegister = () => {
    const result = registerUser({
      username: registerData.username,
      password: registerData.password,
      email: registerData.email,
      country: registerData.country,
      phoneCountryCode: registerData.phoneCountryCode,
      phoneNumber: registerData.phoneNumber,
    });

    if (!result.ok) {
      setRegisterError(result.error);
      setIsRegisterConfirmOpen(false);
      return;
    }

    setAuthSession("user", registerData.username.trim());
    setAuthRole("user");
    setAuthUsername(registerData.username.trim());
    setIsRegisterModalOpen(false);
    setIsRegisterConfirmOpen(false);
    setIsSubmitted(true);
  };

  const handleConfirmBooking = () => {
    const username = authUsername?.trim();
    if (!username) {
      setIsSubmitted(false);
      setIsRegisterModalOpen(true);
      return;
    }

    const now = new Date();
    const contacts = contactMethods
      .filter(
        (method) =>
          formData.contacts[method].enabled &&
          Boolean(formData.contacts[method].value.trim())
      )
      .map((method) => ({
        method: contactMethodLabels[method],
        value: formData.contacts[method].value.trim(),
      }));

    const newItem: BookingHistoryItem = {
      id: generateBookingId(now),
      airport: formData.airport,
      destination: formData.destination,
      date: formatDateTime(formData.landingDate, formData.landingTime),
      status: "Pending",
      flightNumber: formData.flightNumber,
      airline: formData.airline,
      passengers: formData.passengers,
      landingDate: formData.landingDate,
      landingTime: formData.landingTime,
      contacts,
    };

    try {
      const storageKey = getBookingHistoryStorageKey(username);
      const raw = window.localStorage.getItem(storageKey);
      const existing = raw ? (JSON.parse(raw) as BookingHistoryItem[]) : [];
      const safeExisting = Array.isArray(existing) ? existing : [];
      window.localStorage.setItem(
        storageKey,
        JSON.stringify([newItem, ...safeExisting])
      );
    } catch {
      // Ignore storage failures and continue navigation.
    }

    router.push("/profile?tab=history");
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-[0_20px_60px_rgba(2,6,23,0.08)]">
      <header className="border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-cyan-50 px-4 py-5 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
          ระบบจองแท็กซี่สนามบิน
        </p>
        <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
          แบบฟอร์มจองรถจากสนามบิน (Airport Taxi Booking Form)
        </h1>
        <p className="mt-2 text-base text-slate-600">
          กรอกข้อมูลที่จำเป็นให้ครบ แล้วกดยืนยันคำขอจองรถ
        </p>
        <div className="mt-4">
          <StepGuide activeStep={6} />
        </div>
      </header>

      <div className="grid gap-4 p-4 sm:p-6">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <FormSection
            title="1) สนามบินและเที่ยวบิน (Airport and Flight)"
            description="กรอกชื่อสนามบินและสายการบินได้เอง ระบบจะแสดงรายการที่ตรงกับข้อมูล"
          >
            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-1">
                <span className="text-base font-medium text-slate-700">สนามบิน (Airport)</span>
                <input
                  required
                  type="text"
                  value={formData.airport}
                  onChange={(event) => updateField("airport", event.target.value)}
                  onFocus={() => setShowAirportSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowAirportSuggestions(false), 120)}
                  placeholder={
                    isLoadingLookup ? "กำลังโหลดรายชื่อสนามบิน..." : "พิมพ์ชื่อสนามบิน"
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 transition focus:border-sky-500 focus:ring-4"
                />
                {showAirportSuggestions &&
                formData.airport &&
                airportSuggestions.length > 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-white p-1">
                    {airportSuggestions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          updateField("airport", item);
                          setShowAirportSuggestions(false);
                        }}
                        className="block w-full rounded-md px-3 py-2 text-left text-base text-slate-700 hover:bg-slate-100"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : null}
              </label>

              <label className="space-y-1">
                <span className="text-base font-medium text-slate-700">
                  สายการบิน (Airline - ไม่บังคับ)
                </span>
                <input
                  type="text"
                  value={formData.airline}
                  onChange={(event) => updateField("airline", event.target.value)}
                  onFocus={() => setShowAirlineSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowAirlineSuggestions(false), 120)}
                  placeholder={
                    isLoadingLookup ? "กำลังโหลดรายชื่อสายการบิน..." : "พิมพ์ชื่อสายการบิน"
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 transition focus:border-sky-500 focus:ring-4"
                />
                {showAirlineSuggestions &&
                formData.airline &&
                airlineSuggestions.length > 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-white p-1">
                    {airlineSuggestions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          updateField("airline", item);
                          setShowAirlineSuggestions(false);
                        }}
                        className="block w-full rounded-md px-3 py-2 text-left text-base text-slate-700 hover:bg-slate-100"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : null}
              </label>

              <label className="space-y-1">
                <span className="text-base font-medium text-slate-700">เลขเที่ยวบิน (Flight Number)</span>
                <input
                  required
                  type="text"
                  value={formData.flightNumber}
                  onChange={(event) => updateField("flightNumber", event.target.value)}
                  placeholder="กรอกเอง เช่น TG102"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 transition focus:border-sky-500 focus:ring-4"
                />
              </label>
            </div>
          </FormSection>

          <FormSection title="2) เวลาเครื่องลง (Landing Time)" description="เลือกวันที่และเวลาที่เครื่องลง">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-base font-medium text-slate-700">วันที่เครื่องลง (Landing Date)</span>
                <input
                  required
                  type="date"
                  value={formData.landingDate}
                  onChange={(event) => updateField("landingDate", event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 transition focus:border-sky-500 focus:ring-4"
                />
              </label>

              <label className="space-y-1">
                <span className="text-base font-medium text-slate-700">เวลาเครื่องลง (Landing Time)</span>
                <input
                  required
                  type="time"
                  value={formData.landingTime}
                  onChange={(event) => updateField("landingTime", event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 transition focus:border-sky-500 focus:ring-4"
                />
              </label>
            </div>
          </FormSection>

          <FormSection title="3) จำนวนผู้โดยสาร (Passengers)">
            <label className="space-y-1">
              <span className="text-base font-medium text-slate-700">ผู้โดยสาร (Passengers)</span>
              <input
                required
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.passengers}
                onChange={(event) => {
                  const digitsOnly = event.target.value.replace(/\D/g, "");
                  updateField("passengers", Number(digitsOnly || 0));
                }}
                placeholder="กรอกจำนวนผู้โดยสาร"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 transition focus:border-sky-500 focus:ring-4 md:max-w-[220px]"
              />
            </label>
          </FormSection>

          <FormSection title="4) ปลายทาง (Destination)">
            <label className="space-y-1">
              <span className="text-base font-medium text-slate-700">ปลายทาง (Destination)</span>
              <textarea
                required
                value={formData.destination}
                onChange={(event) => updateField("destination", event.target.value)}
                placeholder="โรงแรม / อาคาร / ที่อยู่"
                rows={3}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 transition focus:border-sky-500 focus:ring-4"
              />
            </label>
          </FormSection>

          <FormSection
            title="5) ช่องทางติดต่อ (Contact)"
            description="เปิดได้หลายช่องทาง และกรอกข้อมูลติดต่อของแต่ละช่องทาง"
          >
            <div className="space-y-2">
              {contactMethods.map((method) => {
                const enabled = formData.contacts[method].enabled;
                return (
                  <div key={method} className="space-y-2 rounded-lg">
                    <button
                      type="button"
                      onClick={() => toggleContact(method)}
                      className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-base font-medium transition ${
                        enabled
                          ? "border-sky-500 bg-sky-100 text-sky-900"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <span>{contactMethodLabels[method]}</span>
                      <span>{enabled ? "ON" : "OFF"}</span>
                    </button>

                    {enabled ? (
                      <div>
                        <input
                          type={method === "email" ? "email" : "text"}
                          value={formData.contacts[method].value}
                          onChange={(event) =>
                            updateContactValue(method, event.target.value)
                          }
                          placeholder={method === "email" ? "you@example.com" : "ID หรือเบอร์โทร"}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 transition focus:border-sky-500 focus:ring-4"
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </FormSection>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold text-slate-900">6) ยืนยันการจอง (Confirm Booking)</h3>
            <p className="mt-1 text-base text-slate-600">
              กรุณาตรวจสอบข้อมูลอีกครั้งก่อนกดยืนยัน
            </p>
            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-3 text-base font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
            >
              ยืนยันการจอง
            </button>
            {isSubmitted ? (
              <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-base text-green-700">
                Booking request sent successfully.
                
              </p>
            ) : null}
          </div>
        </form>
      </div>

      {isSubmitted ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5">
            <h2 className="text-lg font-semibold text-slate-900">Booking Summary</h2>
            <p className="mt-1 text-base text-slate-600">
              สรุปรายการจอง กรุณาตรวจสอบความถูกต้อง
            </p>

            <dl className="mt-4 space-y-2 text-base">
              <div className="rounded-lg bg-slate-100 p-2">
                <dt className="text-slate-600">สนามบิน / เที่ยวบิน</dt>
                <dd className="font-medium text-slate-900">
                  {(formData.airport || "-") +
                    (formData.flightNumber ? ` / ${formData.flightNumber}` : "")}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-100 p-2">
                <dt className="text-slate-600">สายการบิน</dt>
                <dd className="font-medium text-slate-900">{formData.airline || "-"}</dd>
              </div>
              <div className="rounded-lg bg-slate-100 p-2">
                <dt className="text-slate-600">เวลาเครื่องลง</dt>
                <dd className="font-medium text-slate-900">
                  {formData.landingDate || "-"} {formData.landingTime || ""}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-100 p-2">
                <dt className="text-slate-600">ผู้โดยสาร</dt>
                <dd className="font-medium text-slate-900">{formData.passengers}</dd>
              </div>
              <div className="rounded-lg bg-slate-100 p-2">
                <dt className="text-slate-600">ปลายทาง</dt>
                <dd className="font-medium text-slate-900">{formData.destination || "-"}</dd>
              </div>
              <div className="rounded-lg bg-slate-100 p-2">
                <dt className="text-slate-600">ช่องทางติดต่อ</dt>
                <dd className="space-y-1 font-medium text-slate-900">
                  {hasContact ? (
                    contactMethods
                      .filter(
                        (method) =>
                          formData.contacts[method].enabled &&
                          formData.contacts[method].value.trim()
                      )
                      .map((method) => (
                        <div key={method}>
                          {contactMethodLabels[method]}: {formData.contacts[method].value}
                        </div>
                      ))
                  ) : (
                    <div>-</div>
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleConfirmBooking}
                className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2.5 text-base font-semibold text-white transition hover:brightness-110"
              >
                {"\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E08\u0E2D\u0E07"}
              </button>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {"\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isRegisterModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5">
            <h2 className="text-lg font-semibold text-slate-900">Create Account To Continue</h2>
            <p className="mt-1 text-base text-slate-600">
              We will create your account and auto-login so you can track booking history.
            </p>

            <form onSubmit={handleRegisterContinue} className="mt-4 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-base font-medium text-slate-700">Username *</span>
                  <input
                    required
                    value={registerData.username}
                    onChange={(event) => updateRegisterField("username", event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 focus:border-sky-500 focus:ring-4"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-base font-medium text-slate-700">Email *</span>
                  <input
                    required
                    type="email"
                    value={registerData.email}
                    onChange={(event) => updateRegisterField("email", event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 focus:border-sky-500 focus:ring-4"
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-base font-medium text-slate-700">Password *</span>
                  <input
                    required
                    type="password"
                    value={registerData.password}
                    onChange={(event) => updateRegisterField("password", event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 focus:border-sky-500 focus:ring-4"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-base font-medium text-slate-700">Confirm Password *</span>
                  <input
                    required
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(event) =>
                      updateRegisterField("confirmPassword", event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 focus:border-sky-500 focus:ring-4"
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-base font-medium text-slate-700">Country *</span>
                  <select
                    value={registerData.country}
                    onChange={(event) =>
                      updateRegisterField("country", event.target.value as CountryOption)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 focus:border-sky-500 focus:ring-4"
                  >
                    {countryOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="space-y-1">
                    <span className="text-base font-medium text-slate-700">Code *</span>
                    <select
                      value={registerData.phoneCountryCode}
                      onChange={(event) =>
                        updateRegisterField("phoneCountryCode", event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 focus:border-sky-500 focus:ring-4"
                    >
                      {dialCodeOptions.map((code) => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="col-span-2 space-y-1">
                    <span className="text-base font-medium text-slate-700">Phone *</span>
                    <input
                      required
                      value={registerData.phoneNumber}
                      onChange={(event) => updateRegisterField("phoneNumber", event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 focus:border-sky-500 focus:ring-4"
                    />
                  </label>
                </div>
              </div>

              {registerError ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-base text-rose-700">
                  {registerError}
                </p>
              ) : null}

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="submit"
                  disabled={!canProceedRegister}
                  className="rounded-xl bg-sky-600 px-4 py-2.5 text-base font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterModalOpen(false);
                    setIsRegisterConfirmOpen(false);
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isRegisterConfirmOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/55 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5">
            <h2 className="text-lg font-semibold text-slate-900">Confirm Account Details</h2>
            <p className="mt-1 text-base text-slate-600">
              Please review details before creating account and logging in.
            </p>

            <dl className="mt-4 grid gap-2 text-base">
              <div className="rounded-lg bg-slate-100 p-2">
                <dt className="text-slate-600">Username</dt>
                <dd className="font-medium text-slate-900">{registerData.username}</dd>
              </div>
              <div className="rounded-lg bg-slate-100 p-2">
                <dt className="text-slate-600">Email</dt>
                <dd className="font-medium text-slate-900">{registerData.email}</dd>
              </div>
              <div className="rounded-lg bg-slate-100 p-2">
                <dt className="text-slate-600">Country / Mobile</dt>
                <dd className="font-medium text-slate-900">
                  {registerData.country} ({registerData.phoneCountryCode}
                  {registerData.phoneNumber})
                </dd>
              </div>
            </dl>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleConfirmRegister}
                className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2.5 text-base font-semibold text-white transition hover:brightness-110"
              >
                Create Account & Continue
              </button>
              <button
                type="button"
                onClick={() => setIsRegisterConfirmOpen(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
