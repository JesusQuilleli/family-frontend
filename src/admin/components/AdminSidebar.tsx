import { LayoutDashboard, ShoppingBag, Package, CreditCard, LogOut } from "lucide-react";
import { NavLink } from "../../components/NavLink";
import { useLocation, useNavigate } from "react-router";
import {
   Sidebar,
   SidebarContent,
   SidebarGroup,
   SidebarGroupContent,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarTrigger,
   SidebarHeader,
   SidebarFooter,
   useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/auth/store/auth.store";

export const AdminSidebar = () => {
   const { open } = useSidebar();
   const location = useLocation();
   const navigate = useNavigate();

   const { logout, user } = useAuthStore();

   const items = [
      { title: "Inicio", url: '/admin', icon: LayoutDashboard },
      { title: "Productos", url: `/admin/productos`, icon: ShoppingBag },
      { title: "Pedidos", url: `/admin/pedidos`, icon: Package },
      { title: "Pagos", url: `/admin/pagos`, icon: CreditCard },
   ];

   const handleLogout = () => {
      logout();
      navigate("/auth/login");
   };

   return (
      <Sidebar collapsible="icon" className="border-r">
         <SidebarHeader className="border-b border-border">
            <div className="flex items-center gap-3 px-2 sm:px-3 py-3 sm:py-4">
               <div className={`transition-opacity ${!open ? "opacity-0 w-0" : "opacity-100"}`}>
                  <h2 className="font-semibold text-base sm:text-lg text-foreground">Inicio</h2>
                  <p className="text-xs text-muted-foreground capitalize"></p>
               </div>
            </div>
         </SidebarHeader>

         <SidebarContent>
            <SidebarGroup>
               <SidebarGroupLabel className={!open ? "sr-only" : ""}>Navegación</SidebarGroupLabel>
               <SidebarGroupContent>
                  <SidebarMenu>
                     {items.map((item) => {
                        const isActive = location.pathname === item.url;
                        return (
                           <SidebarMenuItem key={item.url}>
                              <SidebarMenuButton asChild isActive={isActive}>
                                 <NavLink to={item.url} className="flex items-center gap-3">
                                    <item.icon className="h-4 w-4" />
                                    {open && <span>{item.title}</span>}
                                 </NavLink>
                              </SidebarMenuButton>
                           </SidebarMenuItem>
                        );
                     })}
                  </SidebarMenu>
               </SidebarGroupContent>
            </SidebarGroup>
         </SidebarContent>

         <SidebarFooter className="border-t border-border">
            <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
               <div className={`flex items-center gap-2 sm:gap-3 ${!open ? "justify-center" : ""}`}>
                  <Avatar className="h-8 w-8 shrink-0">
                     <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user?.name.substring(0, 2).toUpperCase()}
                     </AvatarFallback>
                  </Avatar>
                  {open && (
                     <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-foreground truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                     </div>
                  )}
               </div>

               {open && <Separator />}

               <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 sm:gap-3 text-muted-foreground hover:text-foreground text-xs sm:text-sm"
                  onClick={handleLogout}
               >
                  <LogOut className="h-4 w-4 shrink-0" />
                  {open && <span>Cerrar sesión</span>}
               </Button>
            </div>

            <div className="p-2 sm:p-3">
               <SidebarTrigger className="w-full" />
            </div>
         </SidebarFooter>
      </Sidebar>
   );
}
