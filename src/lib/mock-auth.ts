export type AppRole = "user" | "admin";

export const AUTH_COOKIE_NAME = "aircab_role";

export const MOCK_CREDENTIALS: Array<{
  role: AppRole;
  username: string;
  password: string;
  label: string;
}> = [
  {
    role: "user",
    username: "user01",
    password: "user1234",
    label: "User",
  },
  {
    role: "admin",
    username: "admin01",
    password: "admin1234",
    label: "Admin",
  },
];
