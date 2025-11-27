import { SidebarProvider } from "@/components/ui/sidebar"
import { Outlet } from "react-router"
import { ClientSidebar } from "../components/ClientSidebar"
import { MobileHeader } from "@/components/MobileHeader"

export const ClientLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <ClientSidebar />
        <main className="flex-1 overflow-auto flex flex-col">
          <MobileHeader />
          <div className="flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
