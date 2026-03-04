export type AppRole = "admin";

export const AUTH_COOKIE_NAME = "aircab_role";
export const AUTH_PROFILE_NAME_COOKIE = "aircab_profile_name";

export const MOCK_CREDENTIALS: Array<{
  role: AppRole;
  username: string;
  password: string;
  label: string;
}> = [
  {
    role: "admin",
    username: "admin01",
    password: "admin1234",
    label: "Admin",
  },
];
