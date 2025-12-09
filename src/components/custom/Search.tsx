// components/Search.jsx
import { useRef } from 'react';
// Asegúrate de importar desde 'react-router-dom' o 'next/navigation'
import { useLocation, useSearchParams } from 'react-router-dom';
import { Input } from '../ui/input';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import { Search as SearchIcon, X } from 'lucide-react';
import type { CategoryResponse } from '@/interfaces/category.interface';

interface SearchProps {
   categories?: CategoryResponse;
   isLoadingCategories?: boolean;
}

export const Search = ({
   categories = [],
   isLoadingCategories = false,
}: SearchProps) => {

   const [searchParams, setSearchParams] = useSearchParams();
   const inputRef = useRef<HTMLInputElement>(null);

   const { pathname } = useLocation();

   const currentQuery = searchParams.get('query') || '';
   const currentCategory = searchParams.get('categoryId') || 'all';

   // 4. Manejador para el cambio de categoría
   const handleCategoryChange = (newCategory: string) => {
      const newParams = new URLSearchParams(searchParams.toString());

      if (newCategory === 'all') {
         newParams.delete('categoryId');
      } else {
         newParams.set('categoryId', newCategory);
      }

      newParams.set('page', '1'); // Resetea la paginación
      setSearchParams(newParams);
   };

   // 5. Manejador para el input de búsqueda (al presionar Enter)
   const handleSearch = () => {
      const query = inputRef.current?.value || '';
      const newParams = new URLSearchParams(searchParams.toString());

      if (query) {
         newParams.set('query', query);
      } else {
         newParams.delete('query');
      }

      newParams.set('page', '1'); // Resetea la paginación
      setSearchParams(newParams);
   };

   // 6. Función para limpiar la búsqueda
   const clearSearch = () => {
      if (inputRef.current) {
         inputRef.current.value = ''; // Limpia el input visualmente
      }
      // Actualiza la URL
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('query');
      newParams.delete('categoryId');
      newParams.set('page', '1');
      setSearchParams(newParams);
   };

   // 7. Gatillo para 'Enter' en el input
   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
         e.preventDefault(); // Evita que el formulario haga submit (si lo hay)
         handleSearch();
      }
   };

   return (
      <div className="border-b border-border bg-card">
         <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row gap-4">

               {/* --- INPUT DE BÚSQUEDA --- */}
               <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                     placeholder={pathname.includes('/admin/productos') || pathname.includes('/client/productos') ? 'Buscar productos...' : 'Buscar categorías...'}
                     ref={inputRef}
                     defaultValue={currentQuery}
                     onKeyDown={handleKeyDown}
                     className="pl-9 pr-9" // Padding para icono izquierdo y derecho
                  />
                  {/* Botón para limpiar */}
                  {currentQuery && (
                     <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                     >
                        <X className="w-4 h-4" />
                     </button>
                  )}
               </div>

               {/* --- SELECT DE CATEGORÍA --- */}
               {categories.length > 0 && (
                  <Select
                     value={currentCategory}          // Controlado por URL
                     onValueChange={handleCategoryChange} // Actualiza la URL
                     disabled={isLoadingCategories}
                  >
                     <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Categoría" />
                     </SelectTrigger>
                     <SelectContent>
                        {/* Opción manual para "Todas" */}
                        <SelectItem value="all">Todas las categorías</SelectItem>

                        {/* Mapeo sobre el array de objetos */}
                        {categories.map((cat) => (
                           <SelectItem key={cat._id} value={cat._id}>
                              {cat.name}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               )}
            </div>
         </div>
      </div>
   );
};