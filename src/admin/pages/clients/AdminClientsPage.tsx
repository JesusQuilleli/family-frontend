import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Search, AlertTriangle, Check, X, Trash2, Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FamilyApi } from "@/api/family.api";
import Swal from "sweetalert2";
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/admin-products/LoadingSpinner";

export const AdminClientsPage = () => {
   const {
      users,
      totalPages,
      currentPage,
      isLoading,
      page,
      setPage,
      search,
      setSearch,
      showDeleted,
      setShowDeleted
   } = useAdminUsers();

   const queryClient = useQueryClient();

   const approveDeletionMutation = useMutation({
      mutationFn: async (userId: string) => {
         const { data } = await FamilyApi.post(`/auth/admin/approve-deletion/${userId}`);
         return data;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['users'] });
         Swal.fire('Eliminado', 'La cuenta ha sido eliminada correctamente', 'success');
      },
      onError: (error: any) => {
         Swal.fire('Error', error.response?.data?.msg || 'Error al aprobar eliminación', 'error');
      }
   });

   const rejectDeletionMutation = useMutation({
      mutationFn: async (userId: string) => {
         const { data } = await FamilyApi.post(`/auth/admin/reject-deletion/${userId}`);
         return data;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['users'] });
         Swal.fire('Rechazado', 'La solicitud de eliminación ha sido rechazada', 'success');
      },
      onError: (error: any) => {
         Swal.fire('Error', error.response?.data?.msg || 'Error al rechazar eliminación', 'error');
      }
   });

   const togglePremiumMutation = useMutation({
      mutationFn: async (userId: string) => {
         const { data } = await FamilyApi.post('/membership/admin/toggle-premium', { userId });
         return data;
      },
      onSuccess: (data) => {
         queryClient.invalidateQueries({ queryKey: ['users'] });
         Swal.fire('Actualizado', data.msg, 'success');
      },
      onError: (error: any) => {
         Swal.fire('Error', error.response?.data?.msg || 'Error al cambiar membresía', 'error');
      }
   });

   const handleApproveDeletion = (userId: string) => {
      Swal.fire({
         title: '¿Aprobar eliminación?',
         text: "El usuario será marcado como eliminado y no podrá acceder al sistema.",
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: '#d33',
         cancelButtonColor: '#3085d6',
         confirmButtonText: 'Sí, eliminar',
         cancelButtonText: 'Cancelar'
      }).then((result) => {
         if (result.isConfirmed) {
            approveDeletionMutation.mutate(userId);
         }
      });
   };

   const handleRejectDeletion = (userId: string) => {
      Swal.fire({
         title: '¿Rechazar solicitud?',
         text: "El usuario mantendrá su cuenta activa.",
         icon: 'question',
         showCancelButton: true,
         confirmButtonColor: '#3085d6',
         cancelButtonColor: '#d33',
         confirmButtonText: 'Sí, rechazar',
         cancelButtonText: 'Cancelar'
      }).then((result) => {
         if (result.isConfirmed) {
            rejectDeletionMutation.mutate(userId);
         }
      });
   };

   if (isLoading) return <LoadingSpinner title="Cargando clientes..." />;

   return (
      <div className="container mx-auto p-6 space-y-6">
         <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
         </div>

         <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <Tabs defaultValue="active" className="w-[400px]" onValueChange={(val) => setShowDeleted(val === 'deleted')}>
               <TabsList>
                  <TabsTrigger value="active">Clientes Activos</TabsTrigger>
                  <TabsTrigger value="deleted">Cuentas Eliminadas</TabsTrigger>
               </TabsList>
            </Tabs>

            <div className="flex items-center space-x-2 w-full md:w-auto">
               <Search className="w-4 h-4 text-gray-500" />
               <Input
                  placeholder="Buscar por nombre o email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
               />
            </div>
         </div>

         <div className="border rounded-md">
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead>Nombre</TableHead>
                     <TableHead>Email</TableHead>
                     <TableHead>Estado</TableHead>
                     {!showDeleted && <TableHead>Membresía</TableHead>}
                     {showDeleted && <TableHead>Fecha Eliminación</TableHead>}
                     <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {users.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={showDeleted ? 5 : 4} className="text-center h-24">
                           {showDeleted ? "No hay cuentas eliminadas" : "No se encontraron clientes"}
                        </TableCell>
                     </TableRow>
                  ) : (
                     users.map((user: any) => (
                        <TableRow key={user.uid} className={user.deletionRequested ? "bg-red-50" : ""}>
                           <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                 {user.name}
                                 {user.deletionRequested && !showDeleted && (
                                    <TooltipProvider>
                                       <Tooltip>
                                          <TooltipTrigger>
                                             <AlertTriangle className="h-4 w-4 text-red-500" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                             <p>Solicitud de eliminación: {user.deletionReason}</p>
                                          </TooltipContent>
                                       </Tooltip>
                                    </TooltipProvider>
                                 )}
                              </div>
                           </TableCell>
                           <TableCell>{user.email}</TableCell>
                           <TableCell>
                              {user.deleted ? (
                                 <span className="text-gray-500 font-semibold text-xs flex items-center gap-1">
                                    <Trash2 className="w-3 h-3" /> Eliminado
                                 </span>
                              ) : user.deletionRequested ? (
                                 <span className="text-red-600 font-semibold text-xs">Solicita Eliminación</span>
                              ) : (
                                 <span className="text-green-600 text-xs">Activo</span>
                              )}
                           </TableCell>
                           {!showDeleted && (
                              <TableCell>
                                 <Button
                                    variant={user.isPremium ? "default" : "outline"}
                                    size="sm"
                                    className={user.isPremium ? "bg-yellow-500 hover:bg-yellow-600 border-none" : ""}
                                    onClick={() => togglePremiumMutation.mutate(user.uid)}
                                    title={user.isPremium ? "Desactivar Premium" : "Activar Premium"}
                                 >
                                    <Star className={`h-4 w-4 ${user.isPremium ? "fill-white text-white" : "text-gray-400"}`} />
                                 </Button>
                              </TableCell>
                           )}
                           {showDeleted && (
                              <TableCell>
                                 {user.deletedAt ? new Date(user.deletedAt).toLocaleDateString() : 'N/A'}
                              </TableCell>
                           )}
                           <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                 {user.deletionRequested && !showDeleted && (
                                    <>
                                       <Button
                                          variant="destructive"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleApproveDeletion(user.uid)}
                                          title="Aprobar eliminación"
                                       >
                                          <Check className="h-4 w-4" />
                                       </Button>
                                       <Button
                                          variant="secondary"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleRejectDeletion(user.uid)}
                                          title="Rechazar solicitud"
                                       >
                                          <X className="h-4 w-4" />
                                       </Button>
                                    </>
                                 )}
                                 <Button variant="outline" size="sm" asChild>
                                    <Link to={`/admin/clientes/${user.uid}`}>
                                       Ver Detalles
                                    </Link>
                                 </Button>
                              </div>
                           </TableCell>
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         </div>

         <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
               Página {currentPage} de {totalPages}
            </div>
            <div className="space-x-2">
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
               >
                  Anterior
               </Button>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
               >
                  Siguiente
               </Button>
            </div>
         </div>
      </div>
   );
};
