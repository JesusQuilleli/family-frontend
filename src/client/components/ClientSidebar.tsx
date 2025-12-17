import { LayoutDashboard, ShoppingBag, Package, LogOut, Settings2, User, ChevronDown, Key, Bell } from "lucide-react";
import { NavLink } from "../../components/NavLink";
import { useLocation, useNavigate } from "react-router";
import { useState } from "react";
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
   SidebarMenuSub,
   SidebarMenuSubItem,
   SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/auth/store/auth.store";
import { NotificationDropdown } from "./notifications/NotificationDropdown";

const items = [
   { title: "Inicio", url: '/client', icon: LayoutDashboard },
   { title: "Pedidos", url: `/client/pedidos`, icon: Package },
   { title: "Productos", url: `/client/productos`, icon: ShoppingBag },
   { title: "Bandeja de Entrada", url: `/client/notificaciones`, icon: Bell },
   {
      title: "Configuraciones",
      icon: Settings2,
      children: [
         { title: "Perfil", url: `/client/perfil?view=info`, icon: User },
         { title: "Cambiar Contraseña", url: `/client/perfil?view=password`, icon: Key },
      ]
   }
];

export const ClientSidebar = () => {
   const { open, isMobile, setOpenMobile } = useSidebar();
   const location = useLocation();
   const navigate = useNavigate();

   const { logout, user } = useAuthStore();


   const handleLogout = () => {
      logout();
      navigate("/auth/login");
   };

   return (
      <Sidebar collapsible="icon" className="border-r">
         <SidebarHeader className="border-b border-border">
            <div className="flex items-center justify-between px-2 sm:px-3 py-3 sm:py-4">
               <div className={`flex items-center gap-3 transition-opacity ${!open ? "opacity-0 w-0" : "opacity-100"}`}>
                  <h2 className="font-semibold text-base sm:text-lg text-foreground">Family Shop</h2>
               </div>
               {open && <NotificationDropdown />}
            </div>
         </SidebarHeader>

         <SidebarContent>
            <SidebarGroup>
               <SidebarGroupLabel>Navegación</SidebarGroupLabel>
               <SidebarGroupContent>
                  <SidebarMenu>
                     {items.map((item, index) => {
                        if (item.children) {
                           return <CollapsibleMenuItem key={index} item={item} />;
                        }

                        const isActive = location.pathname === item.url;
                        return (
                           <SidebarMenuItem key={item.url}>
                              <SidebarMenuButton asChild isActive={isActive}>
                                 <NavLink to={item.url!} className="flex items-center gap-3" onClick={() => isMobile && setOpenMobile(false)}>
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

const CollapsibleMenuItem = ({ item }: { item: any }) => {
   const { open, setOpenMobile, isMobile } = useSidebar();
   const [isOpen, setIsOpen] = useState(false);
   const location = useLocation();

   // Check if any child is active to auto-expand or highlight
   const isChildActive = item.children.some((child: any) => location.pathname === child.url);

   return (
      <SidebarMenuItem>
         <SidebarMenuButton
            onClick={() => setIsOpen(!isOpen)}
            isActive={isChildActive}
            className="w-full justify-between"
         >
            <div className="flex items-center gap-3">
               <item.icon className="h-4 w-4" />
               {open && <span>{item.title}</span>}
            </div>
            {open && (
               <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
               />
            )}
         </SidebarMenuButton>
         {isOpen && open && (
            <SidebarMenuSub>
               {item.children.map((child: any) => {
                  const isActive = location.pathname === child.url;
                  return (
                     <SidebarMenuSubItem key={child.url}>
                        <SidebarMenuSubButton asChild isActive={isActive}>
                           <NavLink
                              to={child.url}
                              onClick={() => isMobile && setOpenMobile(false)}
                           >
                              <span>{child.title}</span>
                           </NavLink>
                        </SidebarMenuSubButton>
                     </SidebarMenuSubItem>
                  );
               })}
            </SidebarMenuSub>
         )}
      </SidebarMenuItem>
   );
};
