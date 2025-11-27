import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
   /** URL de la imagen existente (si hay) */
   value?: string;
   /** Callback cuando se selecciona un archivo */
   onFileSelect: (file: File | undefined) => void;
   label?: string;
   className?: string;
}

export const ImageUpload = ({
   value,
   onFileSelect,
   label = "Imagen del producto",
   className
}: ImageUploadProps) => {
   const [preview, setPreview] = useState<string | undefined>(value);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const { toast } = useToast();

   // Sincronizar preview si el valor externo cambia (ej: al editar otro producto)
   useEffect(() => {
      setPreview(value);
   }, [value]);

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
         toast({
            title: "Error",
            description: "Por favor selecciona un archivo de imagen válido",
            variant: "destructive"
         });
         return;
      }

      // Crear preview local
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Pasar archivo al padre
      onFileSelect(file);
   };

   const handleRemove = () => {
      setPreview(undefined);
      onFileSelect(undefined);
      if (fileInputRef.current) {
         fileInputRef.current.value = '';
      }
   };

   // Helper para construir la URL completa si es relativa
   const getImageUrl = (url: string) => {
      if (url.startsWith('http')) return url;
      // Si es un blob local (preview), retornarlo tal cual
      if (url.startsWith('blob:')) return url;
      // Si es relativa del backend, agregar la URL base
      return `${import.meta.env.VITE_API_URL}${url}`;
   };

   return (
      <div className={`space-y-4 ${className}`}>
         <Label>{label}</Label>

         <div className="flex flex-col sm:flex-row items-center gap-4">
            {preview ? (
               <div className="relative w-full sm:w-40 h-40 border rounded-lg overflow-hidden group bg-muted shrink-0">
                  <img
                     src={getImageUrl(preview)}
                     alt="Preview"
                     className="w-full h-full object-cover"
                     onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.png';
                     }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={handleRemove}
                     >
                        <X className="h-4 w-4" />
                     </Button>
                  </div>
               </div>
            ) : (
               <div
                  className="w-full sm:w-40 h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors shrink-0"
                  onClick={() => fileInputRef.current?.click()}
               >
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-xs">Subir imagen</span>
               </div>
            )}

            <div className="flex-1 space-y-2">
               <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
               />
               <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
               >
                  <Upload className="ml-2 h-4 w-4" />
                  Seleccionar Imagen
               </Button>
               <p className="text-xs text-muted-foreground">
                  Formatos: JPG, PNG, WEBP. Máx 5MB.
               </p>
            </div>
         </div>
      </div>
   );
};
