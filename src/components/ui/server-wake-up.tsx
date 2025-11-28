import { Cloud } from "lucide-react";

export const ServerWakeUp = () => {
   return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
         <div className="flex flex-col items-center space-y-4 p-8 text-center max-w-md mx-4 bg-card border rounded-lg shadow-lg">
            <div className="relative">
               <Cloud className="h-16 w-16 text-primary animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight">Iniciando Servidor</h2>

            <div className="space-y-2 text-muted-foreground">
               <p>
                  El servidor se encuentra en modo de reposo.
               </p>
               <p>
                  Por favor espera unos segundos mientras se reactiva. Esto puede tomar hasta un minuto.
               </p>
            </div>

            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-4">
               <div className="h-full bg-primary animate-progress-indeterminate origin-left" />
            </div>
         </div>
      </div>
   );
};
