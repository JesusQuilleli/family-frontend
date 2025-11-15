import { useAuthStore } from "@/auth/store/auth.store"
import type { JSX } from "react"
import { Navigate } from "react-router";

interface ProtectedRouteProps {
   children: JSX.Element;
}

export function ProtectedRouteClient({ children }: ProtectedRouteProps) {
   const { authStatus, role } = useAuthStore();

   // ✅ Esperar mientras verifica el token
   if (authStatus === "checking") {
      return (
         <div className="flex h-screen items-center justify-center">
            <div className="text-center">
               <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
               <span className="text-lg font-medium">Verificando sesión...</span>
            </div>
         </div>
      );
   }

   // ✅ Si no está autenticado, redirigir
   if (authStatus === "not-authenticated") {
      return <Navigate to="/auth/login" replace />;
   }

   // ✅ Si está autenticado pero no es cliente
   if (role !== "cliente") {
      return (
         <div className="flex h-screen items-center justify-center">
            <div className="text-center space-y-4">
               <h2 className="text-xl font-semibold">Acceso Denegado</h2>
               <p className="text-muted-foreground">No tienes permisos de cliente</p>
               <Navigate to="/admin" replace />
            </div>
         </div>
      );
   }

   return children;
}

export function ProtectedRouteAdmin({ children }: ProtectedRouteProps) {
   const { authStatus, role } = useAuthStore();

   // ✅ Esperar mientras verifica el token
   if (authStatus === "checking") {
      return (
         <div className="flex h-screen items-center justify-center">
            <div className="text-center">
               <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
               <span className="text-lg font-medium">Verificando sesión...</span>
            </div>
         </div>
      );
   }

   // ✅ Si no está autenticado, redirigir
   if (authStatus === "not-authenticated") {
      return <Navigate to="/auth/login" replace />;
   }

   // ✅ Si está autenticado pero no es admin
   if (role !== "admin") {
      return (
         <div className="flex h-screen items-center justify-center">
            <div className="text-center space-y-4">
               <h2 className="text-xl font-semibold">Acceso Denegado</h2>
               <p className="text-muted-foreground">No tienes permisos de administrador</p>
               <Navigate to="/client" replace />
            </div>
         </div>
      );
   }

   return children;
}