
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageWithLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
   fallbackSrc?: string;
   containerClassName?: string;
   spinnerClassName?: string;
}

export const ImageWithLoader = ({
   src,
   alt,
   className,
   fallbackSrc = "/not-image.jpg",
   containerClassName,
   spinnerClassName,
   ...props
}: ImageWithLoaderProps) => {
   const [isLoading, setIsLoading] = useState(true);
   const [hasError, setHasError] = useState(false);

   const handleLoad = () => {
      setIsLoading(false);
   };

   const handleError = () => {
      setIsLoading(false);
      setHasError(true);
   };

   return (
      <div className={cn("relative overflow-hidden", containerClassName || className)}>
         {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20 z-10">
               <Loader2 className={cn("h-6 w-6 animate-spin text-muted-foreground", spinnerClassName)} />
            </div>
         )}

         {hasError ? (
            <div className="flex h-full w-full items-center justify-center bg-muted">
               <img
                  src={fallbackSrc}
                  alt={alt || "Fallback image"}
                  className={cn("h-full w-full object-cover", className)}
               />
            </div>
         ) : (
            <img
               src={src}
               alt={alt}
               onLoad={handleLoad}
               onError={handleError}
               className={cn(
                  "transition-opacity duration-300",
                  isLoading ? "opacity-0" : "opacity-100",
                  className
               )}
               {...props}
            />
         )}
      </div>
   );
};
