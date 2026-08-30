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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-sm p-sm border-t border-white/10 bg-transparent text-data-mono-sm text-[#888888]">
      <div>
        Exibindo <span className="font-mono font-bold text-white">{start}</span> a{" "}
        <span className="font-mono font-bold text-white">{end}</span> de{" "}
        <span className="font-mono font-bold text-white">{total}</span> registros
      </div>

      <div className="flex items-center gap-xs">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || disabled}
          className="h-8 px-2 flex items-center gap-1 border-white/10 text-[#aaa] hover:text-white"
        >
          <span className="material-symbols-outlined text-sm">chevron_left</span>
          <span>Anterior</span>
        </Button>

        <div className="px-sm py-1 font-mono text-white font-bold text-xs bg-white/5 rounded border border-white/10">
          Pág. {page} de {Math.max(totalPages, 1)}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || disabled}
          className="h-8 px-2 flex items-center gap-1 border-white/10 text-[#aaa] hover:text-white"
        >
          <span>Próxima</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </Button>
      </div>
    </div>
  );
}
