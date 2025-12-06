import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { getCroppedImg } from '@/helpers/canvasUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

interface ImageUploadProps {
   /** URL de la imagen existente (si hay) */
   value?: string;
   /** Callback cuando se selecciona un archivo */
   onFileSelect: (file: File | undefined) => void;
   label?: string;
   className?: string;
}

import { getImageUrl } from '@/helpers/get-image-url';
import { Slider } from '@/components/ui/slider';

export const ImageUpload = ({
   value,
   onFileSelect,
   label = "Imagen del producto",
   className
}: ImageUploadProps) => {
   const [preview, setPreview] = useState<string | undefined>(value);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const { toast } = useToast();

   // Estado para el recortador
   const [imageSrc, setImageSrc] = useState<string | null>(null);
   const [crop, setCrop] = useState({ x: 0, y: 0 });
   const [zoom, setZoom] = useState(1);
   const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
   const [isCropping, setIsCropping] = useState(false);

   // Sincronizar preview si el valor externo cambia (ej: al editar otro producto)
   useEffect(() => {
      setPreview(value);
   }, [value]);

   const onCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
   };

   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
         const file = e.target.files[0];

         // Validaciones
         if (!file.type.startsWith('image/')) {
            toast({
               title: "Error",
               description: "Por favor selecciona un archivo de imagen válido",
               variant: "destructive"
            });
            return;
         }

         if (file.size > 5 * 1024 * 1024) {
            toast({
               title: "Error",
               description: "La imagen no debe superar los 5MB",
               variant: "destructive"
            });
            return;
         }

         const reader = new FileReader();
         reader.addEventListener('load', () => {
            setImageSrc(reader.result?.toString() || null);
            setIsCropping(true);
            // Reset zoom/crop
            setZoom(1);
            setCrop({ x: 0, y: 0 });
         });
         reader.readAsDataURL(file);

         // Limpiar input para permitir seleccionar el mismo archivo
         e.target.value = '';
      }
   };

   const showCroppedImage = async () => {
      try {
         if (!imageSrc || !croppedAreaPixels) return;

         const croppedImage = await getCroppedImg(
            imageSrc,
            croppedAreaPixels
         );

         if (!croppedImage) return;

         // Crear preview
         const objectUrl = URL.createObjectURL(croppedImage);
         setPreview(objectUrl);

         // Pasar archivo al padre
         onFileSelect(croppedImage);

         // Cerrar modal y limpiar
         setIsCropping(false);
         setImageSrc(null);

      } catch (e) {
         console.error(e);
         toast({
            title: "Error",
            description: "No se pudo recortar la imagen",
            variant: "destructive"
         });
      }
   };

   const handleCancelCrop = () => {
      setIsCropping(false);
      setImageSrc(null);
   };

   const handleRemove = () => {
      setPreview(undefined);
      onFileSelect(undefined);
      if (fileInputRef.current) {
         fileInputRef.current.value = '';
      }
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

         {/* Modal de Recorte */}
         <Dialog open={isCropping} onOpenChange={(open) => !open && handleCancelCrop()}>
            <DialogContent className="sm:max-w-xl">
               <DialogHeader>
                  <DialogTitle>Editar Imagen</DialogTitle>
                  <DialogDescription>
                     Ajusta el zoom y la posición de tu imagen.
                  </DialogDescription>
               </DialogHeader>

               <div className="relative w-full h-80 bg-black rounded-md overflow-hidden">
                  {imageSrc && (
                     <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1} // Cuadrado por defecto para productos
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                     />
                  )}
               </div>

               <div className="py-4">
                  <Label>Zoom</Label>
                  <Slider
                     value={[zoom]}
                     min={1}
                     max={3}
                     step={0.1}
                     onValueChange={(value) => setZoom(value[0])}
                     className="mt-2"
                  />
               </div>

               <DialogFooter>
                  <Button variant="outline" onClick={handleCancelCrop}>
                     Cancelar
                  </Button>
                  <Button onClick={showCroppedImage}>
                     <Check className="w-4 h-4 mr-2" />
                     Recortar y Guardar
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
};
