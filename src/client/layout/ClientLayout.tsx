import { SidebarProvider } from "@/components/ui/sidebar"
import { Outlet, Link } from "react-router"
import { ClientSidebar } from "../components/ClientSidebar"
import { MobileHeader } from "@/components/MobileHeader"
import { Bell } from "lucide-react"
import { AdComponent } from "@/components/ads/AdComponent"

export const ClientLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <ClientSidebar />
        <main className="flex-1 overflow-auto flex flex-col">
          <div className="flex items-center justify-between p-4 md:hidden">
            <MobileHeader />
            <Link to="/client/notificaciones" className="p-2">
              <Bell className="w-6 h-6 text-gray-600" />
            </Link>
          </div>
          <div className="flex-1">
            <Outlet />
          </div>
          <AdComponent slotId="1234567890" />
        </main>
      </div>
    </SidebarProvider>
  )
}
