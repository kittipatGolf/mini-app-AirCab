"use client";

import {
  AUTH_COOKIE_NAME,
  AUTH_PROFILE_NAME_COOKIE,
  AppRole,
  MOCK_CREDENTIALS,
} from "./mock-auth";

const USERS_STORAGE_KEY = "aircab_mock_users";
const USERNAME_STORAGE_KEY = "aircab_auth_username";
const COUNTRY_OPTIONS = [
  "Thailand",
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Japan",
  "South Korea",
  "Singapore",
  "Australia",
  "India",
] as const;

export type CountryOption = (typeof COUNTRY_OPTIONS)[number];

export type RegisterInput = {
  username: string;
  password: string;
  email: string;
  country: CountryOption;
  phoneCountryCode: string;
  phoneNumber: string;
};

type StoredUser = RegisterInput & {
  role: "user";
  createdAt: string;
};

type AuthenticatedUser = {
  username: string;
  role: AppRole;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function readCookie(name: string) {
  if (typeof window === "undefined") return "";
  const encodedName = `${name}=`;
  const part = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(encodedName));

  return part ? decodeURIComponent(part.slice(encodedName.length)) : "";
}

function setCookie(name: string, value: string) {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=86400; samesite=lax`;
}

export function setAuthSession(role: AppRole, username: string) {
  setCookie(AUTH_COOKIE_NAME, role);
  setCookie(AUTH_PROFILE_NAME_COOKIE, username);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(USERNAME_STORAGE_KEY, username);
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
  document.cookie = `${AUTH_PROFILE_NAME_COOKIE}=; path=/; max-age=0; samesite=lax`;
  window.localStorage.removeItem(USERNAME_STORAGE_KEY);
}

export function getClientAuth() {
  const role = readCookie(AUTH_COOKIE_NAME) as AppRole | "";
  const profileName = readCookie(AUTH_PROFILE_NAME_COOKIE);

  return {
    role: role || null,
    profileName: profileName || null,
    username:
      profileName ||
      (typeof window !== "undefined"
        ? window.localStorage.getItem(USERNAME_STORAGE_KEY)
        : null),
  };
}

function validateRegisterInput(input: RegisterInput) {
  if (!input.username.trim()) return "Username is required.";
  if (!input.password.trim()) return "Password is required.";
  if (input.password.trim().length < 6) return "Password must be at least 6 characters.";
  if (!input.email.trim()) return "Email is required.";
  if (!input.country.trim()) return "Country is required.";
  if (!input.phoneCountryCode.trim()) return "Country code is required.";
  if (!input.phoneNumber.trim()) return "Phone number is required.";
  return "";
}

export function registerUser(input: RegisterInput) {
  const error = validateRegisterInput(input);
  if (error) {
    return { ok: false as const, error };
  }

  const users = readUsers();
  const usernameKey = normalize(input.username);
  const emailKey = normalize(input.email);
  const duplicated = users.some(
    (item) => normalize(item.username) === usernameKey || normalize(item.email) === emailKey
  );

  const reserved = MOCK_CREDENTIALS.some(
    (item) => normalize(item.username) === usernameKey
  );

  if (duplicated || reserved) {
    return { ok: false as const, error: "Username or email already exists." };
  }

  const user: StoredUser = {
    role: "user",
    username: input.username.trim(),
    password: input.password,
    email: input.email.trim(),
    country: input.country,
    phoneCountryCode: input.phoneCountryCode.trim(),
    phoneNumber: input.phoneNumber.trim(),
    createdAt: new Date().toISOString(),
  };

  writeUsers([user, ...users]);
  return { ok: true as const, user };
}

export function authenticateUser(username: string, password: string): AuthenticatedUser | null {
  const usernameKey = normalize(username);
  const admin = MOCK_CREDENTIALS.find(
    (item) => normalize(item.username) === usernameKey && item.password === password
  );
  if (admin) {
    return { username: admin.username, role: admin.role };
  }

  const users = readUsers();
  const user = users.find(
    (item) => normalize(item.username) === usernameKey && item.password === password
  );
  if (!user) return null;
  return { username: user.username, role: user.role };
}

export function getBookingHistoryStorageKey(username: string) {
  return `aircab_booking_history_${normalize(username)}`;
}

export function getCountryOptions() {
  return [...COUNTRY_OPTIONS];
}

