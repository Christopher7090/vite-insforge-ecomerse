export default function ProductPagination({
  paginaActual,
  totalPaginas,
  onPaginaChange,
}) {
  if (totalPaginas <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        onClick={() => onPaginaChange(paginaActual - 1)}
        disabled={paginaActual === 1}
        className="btn-secondary"
      >
        Anterior
      </button>

      {Array.from({ length: totalPaginas }, (_, index) => {
        const pagina = index + 1;

        return (
          <button
            key={pagina}
            onClick={() => onPaginaChange(pagina)}
            className={`rounded-lg px-3 py-2 text-sm ${
              paginaActual === pagina
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {pagina}
          </button>
        );
      })}

      <button
        onClick={() => onPaginaChange(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="btn-secondary"
      >
        Siguiente
      </button>
    </div>
  );
}