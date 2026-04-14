import { useMemo, useState, type ReactNode } from 'react';
import { StateCard } from './StateCard';

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T, index: number) => string;
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  pagination?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function DataTable<T>({
  data,
  columns,
  rowKey,
  isLoading = false,
  loadingMessage = 'Đang tải dữ liệu...',
  emptyMessage = 'Không có dữ liệu.',
  pagination = true,
  initialPageSize = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: DataTableProps<T>) {
  const normalizedPageSizeOptions = useMemo(() => {
    const options = [...new Set(pageSizeOptions)].filter((item) => item > 0).sort((a, b) => a - b);
    if (!options.includes(initialPageSize)) {
      options.push(initialPageSize);
      options.sort((a, b) => a - b);
    }
    return options;
  }, [initialPageSize, pageSizeOptions]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = data.length;
  const totalPages = pagination ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1;
  const currentPage = Math.min(page, totalPages);

  const pagedData = useMemo(() => {
    if (!pagination) return data;
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [currentPage, data, pageSize, pagination]);

  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = totalItems === 0 ? 0 : from + pagedData.length - 1;

  if (isLoading) {
    return <StateCard message={loadingMessage} />;
  }

  if (totalItems === 0) {
    return <StateCard message={emptyMessage} />;
  }

  return (
    <div className="data-table">
      <div className="table-wrap">
        <table className="request-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.id} className={column.headerClassName}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedData.map((row, index) => (
              <tr key={rowKey(row, index)}>
                {columns.map((column) => (
                  <td key={column.id} className={column.className}>
                    {column.cell(row, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="table-pagination">
          <div className="pagination-info">
            Hiển thị {from}-{to} / {totalItems}
          </div>

          <div className="pagination-actions">
            <label htmlFor="page-size" className="pagination-size-label">
              Số dòng
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              {normalizedPageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn ghost"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </button>
            <span className="pagination-page">
              Trang {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

