import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { ApprovalRequestResponse, ApprovalStatus } from '../types/approval-request';
import { APPROVAL_STATUS_LABELS, REQUEST_TYPE_LABELS } from '../types/approval-request';
import { useAuthStore } from '../store/auth.store';
import { DataTable, type DataTableColumn } from '../shared/components/DataTable';
import { formatDateTimeVi } from '../shared/utils/date';

const STATUS_CLASS_MAP: Record<ApprovalStatus, string> = {
  DRAFT: 'status-badge status-draft',
  PENDING: 'status-badge status-pending',
  IN_REVIEW: 'status-badge status-review',
  APPROVED: 'status-badge status-approved',
  REJECTED: 'status-badge status-rejected',
};

interface RequestTableProps {
  requests: ApprovalRequestResponse[];
  isLoading?: boolean;
  emptyMessage?: string;
  onApprove?: (request: ApprovalRequestResponse) => void;
  onReject?: (request: ApprovalRequestResponse) => void;
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  return <span className={STATUS_CLASS_MAP[status]}>{APPROVAL_STATUS_LABELS[status]}</span>;
}

function canTakeAction(role: string | null, request: ApprovalRequestResponse): boolean {
  if (role === 'BRANCH_LEAD') {
    return request.status === 'PENDING';
  }
  if (role === 'DIRECTOR' || role === 'ADMIN') {
    return request.status === 'IN_REVIEW' && request.creator?.role === 'BRANCH_LEAD';
  }
  return false;
}

function PayloadModal({
  request,
  onClose,
}: {
  request: ApprovalRequestResponse;
  onClose: () => void;
}) {
  const formattedPayload = useMemo(() => {
    try {
      return JSON.stringify(request.payload, null, 2);
    } catch {
      return String(request.payload ?? '{}');
    }
  }, [request.payload]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div>
            <p className="muted-small">Chi tiết payload</p>
            <h3>{request.title}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        <pre className="payload-view">{formattedPayload}</pre>
      </div>
    </div>
  );
}

export function RequestTable({
  requests,
  isLoading = false,
  emptyMessage = 'Không có yêu cầu phù hợp.',
  onApprove,
  onReject,
}: RequestTableProps) {
  const role = useAuthStore((state) => state.user?.role ?? null);
  const [expanded, setExpanded] = useState<ApprovalRequestResponse | null>(null);

  const columns: DataTableColumn<ApprovalRequestResponse>[] = [
    {
      id: 'title',
      header: 'Tiêu đề',
      cell: (request) => (
        <>
          <div className="cell-main">{request.title}</div>
          <div className="cell-sub">#{request.id.slice(0, 8).toUpperCase()}</div>
        </>
      ),
    },
    {
      id: 'creator',
      header: 'Người tạo',
      cell: (request) => request.creator?.name ?? request.creatorId.slice(0, 8),
    },
    {
      id: 'type',
      header: 'Loại',
      cell: (request) => REQUEST_TYPE_LABELS[request.requestType] ?? request.requestType,
    },
    {
      id: 'status',
      header: 'Trạng thái',
      cell: (request) => <StatusBadge status={request.status} />,
    },
    {
      id: 'updatedAt',
      header: 'Cập nhật',
      cell: (request) => formatDateTimeVi(request.updatedAt),
    },
    {
      id: 'actions',
      header: 'Thao tác',
      headerClassName: 'actions-col',
      cell: (request) => {
        const allowAction = canTakeAction(role, request);
        return (
          <div className="table-actions">
            <button type="button" className="btn ghost" onClick={() => setExpanded(request)}>
              Xem
            </button>
            {allowAction && (
              <>
                <button type="button" className="btn success" onClick={() => onApprove?.(request)}>
                  Duyệt
                </button>
                <button type="button" className="btn danger" onClick={() => onReject?.(request)}>
                  Từ chối
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        data={requests}
        columns={columns}
        rowKey={(request) => request.id}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 20]}
      />

      {expanded && <PayloadModal request={expanded} onClose={() => setExpanded(null)} />}
    </>
  );
}
