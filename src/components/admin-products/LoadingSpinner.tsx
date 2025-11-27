import { Loader2 } from 'lucide-react';

interface Props {
  title : string;
}

export function LoadingSpinner({title}: Props) {
   return (
     <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">Por favor espera...</p>
        </div>
      </div>
    </div>
   );
}