import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { useSearchParams } from "react-router";
import { LoadingSpinner } from "../admin-products/LoadingSpinner";

interface Props {
  totalPages: number;
  isLoading?: boolean;
}

export const CustomPagination = ({ totalPages, isLoading }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();


  const queryPage = searchParams.get("page") ?? "1";
  const page = isNaN(+queryPage) ? 1 : +queryPage;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    searchParams.set("page", newPage.toString());
    setSearchParams(searchParams);
  };

  // Calcular el rango de páginas a mostrar
  const range = 5; // Mostrar 5 páginas
  const half = Math.floor(range / 2);

  let startPage = Math.max(1, page - half);
  const endPage = Math.min(totalPages, startPage + range - 1);

  // Ajustar si está cerca del final
  if (endPage - startPage + 1 < range) {
    startPage = Math.max(1, endPage - range + 1);
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  const showFirstPages = startPage > 1;
  const showLastPages = endPage < totalPages;

  return (
    <div className="flex items-center justify-center space-x-2 mt-5 flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer "
        disabled={page === 1 || isLoading}
        onClick={() => handlePageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Atras
      </Button>

      {/* Primera página */}
      {showFirstPages && (
        <>
          <Button
            variant={page === 1 ? "default" : "outline"}
            size="sm"
            className="cursor-pointer"
            onClick={() => handlePageChange(1)}
          >
            1
          </Button>
          {startPage > 2 && <span className="px-2 text-muted-foreground">...</span>}
        </>
      )}

      {/* Páginas del rango */}
      {pages.map((pageNum) => (
        <Button
          key={pageNum}
          variant={page === pageNum ? "default" : "outline"}
          size="sm"
          className="cursor-pointer"
          disabled={isLoading}
          onClick={() => handlePageChange(pageNum)}
        >
          {pageNum}
        </Button>
      ))}

      {/* Última página */}
      {showLastPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2 text-muted-foreground">...</span>}
          <Button
            variant={page === totalPages ? "default" : "outline"}
            size="sm"
            className="cursor-pointer"
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        disabled={page === totalPages || isLoading}
        onClick={() => handlePageChange(page + 1)}
      >
        Siguiente
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Spinner de carga */}
      {isLoading && (
        <LoadingSpinner title="Cargando..." />
      )}

      {/* Info de página */}
      {!isLoading && (
        <span className="text-sm text-muted-foreground ml-4">
          Página {page} de {totalPages}
        </span>
      )}
    </div>
  );
};