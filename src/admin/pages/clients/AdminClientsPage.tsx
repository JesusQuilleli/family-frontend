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
import { Search } from "lucide-react";

export const AdminClientsPage = () => {
   const {
      users,
      totalPages,
      currentPage,
      isLoading,
      page,
      setPage,
      search,
      setSearch
   } = useAdminUsers();

   if (isLoading) return <div className="p-8 text-center">Cargando clientes...</div>;

   return (
      <div className="container mx-auto p-6 space-y-6">
         <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
         </div>

         <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
               placeholder="Buscar por nombre o email..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="max-w-sm"
            />
         </div>

         <div className="border rounded-md">
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead>Nombre</TableHead>
                     <TableHead>Email</TableHead>
                     <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {users.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                           No se encontraron clientes
                        </TableCell>
                     </TableRow>
                  ) : (
                     users.map((user) => (
                        <TableRow key={user.uid}>
                           <TableCell className="font-medium">{user.name}</TableCell>
                           <TableCell>{user.email}</TableCell>
                           <TableCell className="text-right">
                              <Button variant="outline" size="sm" asChild>
                                 <Link to={`/admin/clientes/${user.uid}`}>
                                    Ver Detalles
                                 </Link>
                              </Button>
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
