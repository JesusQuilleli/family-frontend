import { SidebarProvider } from "@/components/ui/sidebar"
import { Outlet } from "react-router"
import { AdminSidebar } from "../components/AdminSidebar"
import { MobileHeader } from "@/components/MobileHeader"


import { NotificationDropdown } from "@/client/components/notifications/NotificationDropdown";

import { useSocketNotifications } from "@/hooks/useSocketNotifications";

export const AdminLayout = () => {
  useSocketNotifications();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-auto flex flex-col">
          <MobileHeader title="Panel de Administración">
            <NotificationDropdown />
          </MobileHeader>

          {/* Desktop Header */}
          <header className="hidden lg:flex h-14 items-center justify-end gap-4 border-b bg-background px-6">
            <NotificationDropdown />
          </header>

          <div className="flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
