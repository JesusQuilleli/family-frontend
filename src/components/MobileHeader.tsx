import { SidebarTrigger } from "@/components/ui/sidebar";

interface MobileHeaderProps {
   title?: string;
}

export const MobileHeader = ({ title = "Family Shop", children }: MobileHeaderProps & { children?: React.ReactNode }) => {
   return (
      <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground mr-2">
               <SidebarTrigger />
               <span className="text-sm font-medium">Menú</span>
            </div>
            <div className="font-semibold">{title}</div>
         </div>
         {children}
      </header>
   );
};
