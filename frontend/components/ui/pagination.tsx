"use client";

import { Button } from "./button";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize?: number;
  onPageChange: (newPage: number) => void;
  disabled?: boolean;
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize = 20,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (total === 0) return null;

  const start = Math.min((page - 1) * pageSize + 1, total);
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-sm p-sm border-t border-outline-variant bg-surfaceContainer-lowest text-data-mono-sm text-secondary">
      <div>
        Exibindo <span className="font-mono font-bold text-tertiary">{start}</span> a{" "}
        <span className="font-mono font-bold text-tertiary">{end}</span> de{" "}
        <span className="font-mono font-bold text-tertiary">{total}</span> registros
      </div>

      <div className="flex items-center gap-xs">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || disabled}
          className="h-8 px-2 flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">chevron_left</span>
          <span>Anterior</span>
        </Button>

        <div className="px-sm py-1 font-mono text-tertiary font-bold text-xs bg-surfaceContainer-low rounded border border-outline-variant">
          Pág. {page} de {Math.max(totalPages, 1)}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || disabled}
          className="h-8 px-2 flex items-center gap-1"
        >
          <span>Próxima</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </Button>
      </div>
    </div>
  );
}
