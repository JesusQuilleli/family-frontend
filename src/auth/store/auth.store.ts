import type { User } from "@/interfaces/user.interface";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { registerAction } from "../actions/register.action";
import type { RegisterResponse } from "../interfaces/register.response";

import type { LoginResponse } from "../interfaces/login.response";
import { loginAction } from "../actions/login.action";
import { checkAuthAction } from "../actions/check-auth.action";

type AuthStatus = "authenticated" | "not-authenticated" | "checking";

type AuthState = {
  user: User | null;
  token: string | null;
  authStatus: AuthStatus;
  role: string | null;

  isAdmin: () => boolean;

  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (
    fullName: string,
    email: string,
    password: string,
    phone: string,
    referralCode?: string
  ) => Promise<RegisterResponse>;

  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      token: null,
      authStatus: "checking",
      role: null,

      isAdmin: () => {
        const roles = get().user?.role || "";
        return roles.includes("admin");
      },

      register: async (fullName, email, password, phone, referralCode) => {
        try {
          const data = await registerAction(fullName, email, password, phone, referralCode);
          localStorage.setItem("token", data.token ?? "");

          set(
            {
              user: data.user ?? null,
              token: data.token ?? null,
              authStatus: "authenticated",
              role: data.user?.role ?? null,
            },
            false,
            "register"
          );

          return {
            ok: true,
            msg: data.msg ?? "Registro exitoso",
            role: data.user?.role ?? null,
            token: data.token ?? null,
            user: data.user ?? null,
          } as RegisterResponse;
        } catch (error: unknown) {
          return { ok: false, msg: (error as Error)?.message ?? "Error", role: null };
        }
      },

      login: async (email, password) => {
        try {
          const data = await loginAction(email, password);
          localStorage.setItem("token", data.token);

          set(
            {
              user: data.user,
              token: data.token,
              authStatus: "authenticated",
              role: data.user.role ?? null,
            },
            false,
            "login"
          );

          return {
            ok: true,
            msg: data.msg ?? "Login Exitoso",
            role: data.user?.role ?? null,
            token: data.token ?? null,
            user: data.user ?? null,
          } as LoginResponse;
        } catch (error: unknown) {
          set(
            { user: null, token: null, authStatus: "not-authenticated", role: null },
            false,
            "login_error"
          );
          localStorage.removeItem("token");
          return { ok: false, msg: (error as Error)?.message ?? "Error" } as LoginResponse;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set(
          { user: null, token: null, authStatus: "not-authenticated", role: null },
          false,
          "logout"
        );
      },

      checkAuthStatus: async () => {
        const token = localStorage.getItem("token");

        if (!token) {
          set(
            { user: null, token: null, authStatus: "not-authenticated", role: null },
            false,
            "checkAuthStatus_no_token"
          );
          return false;
        }

        set({ authStatus: "checking" }, false, "checkAuthStatus_start"); // 👈 Añade esto

        try {
          const { user, token: newToken } = await checkAuthAction();

          localStorage.setItem("token", newToken ?? token);

          set(
            {
              user,
              token: newToken ?? token,
              authStatus: "authenticated",
              role: user?.role ?? null,
            },
            false,
            "checkAuthStatus_success"
          );

          return true;
        } catch (error: unknown) {
          console.log(`Error on checkAuthStatus ${error}`);
          localStorage.removeItem("token");
          set(
            { user: null, token: null, authStatus: "not-authenticated", role: null },
            false,
            "checkAuthStatus_error"
          );
          return false;
        }
      },
    }),
    { name: "AuthStore" }
  )
);
