import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FamilyApi } from "@/api/family.api";
import { Loader2, Plus } from "lucide-react";

interface Vendor {
   uid: string;
   name: string;
   email: string;
   phone: string;
   role: string;
   createdAt?: string;
}

export const SuperAdminVendorsPage = () => {
   const [vendors, setVendors] = useState<Vendor[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [isCreateOpen, setIsCreateOpen] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const loadVendors = async () => {
      try {
         setIsLoading(true);
         // Reutilizamos el endpoint existente filtrando por rol admin
         const { data } = await FamilyApi.get('/auth/users?role=admin');
         if (data.ok) {
            setVendors(data.users);
         }
      } catch (error) {
         console.error("Error loading vendors:", error);
         toast.error("Error al cargar vendedores");
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      loadVendors();
   }, []);

   const handleCreateVendor = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);

      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const phone = formData.get("phone") as string;
      const password = formData.get("password") as string;

      try {
         // Nuevo endpoint exclusivo para superadmin
         // Nota: Se debe agregar la ruta en el backend si no existe, o usar create-vendor
         const { data } = await FamilyApi.post('/auth/create-vendor', {
            name,
            email,
            phone,
            password
         });

         if (data.ok) {
            toast.success("Vendedor creado exitosamente");
            setIsCreateOpen(false);
            loadVendors();
         } else {
            toast.error(data.msg || "Error al crear vendedor");
         }
      } catch (error: any) {
         console.error(error);
         toast.error(error.response?.data?.msg || "Error de conexión");
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-2xl font-bold tracking-tight">Gestión de Tiendas (Vendedores)</h1>
               <p className="text-muted-foreground">Administra los usuarios con rol de Vendedor en la plataforma.</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
               <DialogTrigger asChild>
                  <Button>
                     <Plus className="mr-2 h-4 w-4" />
                     Nuevo Vendedor
                  </Button>
               </DialogTrigger>
               <DialogContent>
                  <DialogHeader>
                     <DialogTitle>Registrar Nuevo Vendedor</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateVendor} className="space-y-4 pt-4">
                     <div className="space-y-2">
                        <Label htmlFor="name">Nombre de la Tienda / Vendedor</Label>
                        <Input id="name" name="name" required placeholder="Ej. Tienda Express" />
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input id="email" name="email" type="email" required placeholder="admin@tienda.com" />
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" name="phone" required placeholder="+58 412 1234567" />
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="password">Contraseña Inicial</Label>
                        <Input id="password" name="password" type="password" required minLength={6} placeholder="******" />
                     </div>
                     <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                           {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                           Crear Vendedor
                        </Button>
                     </div>
                  </form>
               </DialogContent>
            </Dialog>
         </div>

         <div className="rounded-md border bg-card">
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead>Nombre</TableHead>
                     <TableHead>Email</TableHead>
                     <TableHead>Teléfono</TableHead>
                     <TableHead>Fecha Registro</TableHead>
                     {/* <TableHead className="text-right">Acciones</TableHead> */}
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {isLoading ? (
                     <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                           <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        </TableCell>
                     </TableRow>
                  ) : vendors.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                           No hay vendedores registrados.
                        </TableCell>
                     </TableRow>
                  ) : (
                     vendors.map((vendor) => (
                        <TableRow key={vendor.uid}>
                           <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                 <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                    {vendor.name.substring(0, 2).toUpperCase()}
                                 </div>
                                 {vendor.name}
                              </div>
                           </TableCell>
                           <TableCell>{vendor.email}</TableCell>
                           <TableCell>{vendor.phone || 'N/A'}</TableCell>
                           <TableCell>{vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '-'}</TableCell>
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         </div>
      </div>
   );
};
