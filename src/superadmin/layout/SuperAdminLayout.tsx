import { Outlet, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/auth/store/auth.store";
import { LogOut, Store, Users } from "lucide-react";

export const SuperAdminLayout = () => {
   const { logout, user } = useAuthStore();
   const navigate = useNavigate();

   const handleLogout = () => {
      logout();
      navigate("/auth/login");
   };

   return (
      <div className="min-h-screen bg-muted/20">
         {/* Header / Navbar */}
         <header className="bg-background border-b h-16 flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center gap-2">
               <Store className="h-6 w-6 text-primary" />
               <span className="font-bold text-xl">App Family - Panel Master</span>
            </div>

            <div className="flex items-center gap-4">
               <span className="text-sm text-muted-foreground">
                  {user?.name || 'Super Admin'}
               </span>
               <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar Sesión">
                  <LogOut className="h-5 w-5" />
               </Button>
            </div>
         </header>

         <main className="container mx-auto py-8 px-4">
            <div className="flex gap-4">
               {/* Sidebar simplificado (Opcional) */}
               <aside className="w-64 hidden md:block">
                  <nav className="space-y-2">
                     <Button variant="secondary" className="w-full justify-start" disabled>
                        <Users className="mr-2 h-4 w-4" />
                        Vendedores (Tiendas)
                     </Button>
                  </nav>
               </aside>

               {/* Contenido Principal */}
               <div className="flex-1">
                  <Outlet />
               </div>
            </div>
         </main>
      </div>
   );
};
