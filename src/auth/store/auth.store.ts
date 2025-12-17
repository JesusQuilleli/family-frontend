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
        } catch (error: any) {
          let errorMessage = "Error en el registro";

          if (error.response?.data?.errors) {
            // Express Validator errors
            const errors = error.response.data.errors;
            // Get the first error message available
            const firstErrorKey = Object.keys(errors)[0];
            if (firstErrorKey) {
              errorMessage = errors[firstErrorKey].msg;
            }
          } else if (error.response?.data?.msg) {
            // Custom backend error
            errorMessage = error.response.data.msg;
          } else if (error.message) {
            errorMessage = error.message;
          }

          return { ok: false, msg: errorMessage, role: null };
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
        } catch (error: any) {
          let errorMessage = "Error al iniciar sesión";

          if (error.response?.data?.msg) {
            errorMessage = error.response.data.msg;
          } else if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            const firstErrorKey = Object.keys(errors)[0];
            if (firstErrorKey) errorMessage = errors[firstErrorKey].msg;
          } else if (error.message) {
            errorMessage = error.message;
          }

          set(
            { user: null, token: null, authStatus: "not-authenticated", role: null },
            false,
            "login_error"
          );
          localStorage.removeItem("token");
          return { ok: false, msg: errorMessage } as LoginResponse;
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
