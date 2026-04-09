import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { ApprovalRequestResponse, ApprovalStatus } from '../types/approval-request';
import { APPROVAL_STATUS_LABELS, REQUEST_TYPE_LABELS } from '../types/approval-request';
import { useAuthStore } from '../store/auth.store';

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

  if (isLoading) {
    return <div className="card-state">Đang tải dữ liệu...</div>;
  }

  if (requests.length === 0) {
    return <div className="card-state">{emptyMessage}</div>;
  }

  return (
    <>
      <div className="table-wrap">
        <table className="request-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Người tạo</th>
              <th>Loại</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
              <th className="actions-col">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => {
              const allowAction = canTakeAction(role, request);
              const author = request.creator?.name ?? request.creatorId.slice(0, 8);
              const updatedAt = new Date(request.updatedAt).toLocaleString('vi-VN');

              return (
                <tr key={request.id}>
                  <td>
                    <div className="cell-main">{request.title}</div>
                    <div className="cell-sub">#{request.id.slice(0, 8).toUpperCase()}</div>
                  </td>
                  <td>{author}</td>
                  <td>{REQUEST_TYPE_LABELS[request.requestType] ?? request.requestType}</td>
                  <td>
                    <StatusBadge status={request.status} />
                  </td>
                  <td>{updatedAt}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => setExpanded(request)}
                      >
                        Xem
                      </button>
                      {allowAction && (
                        <>
                          <button
                            type="button"
                            className="btn success"
                            onClick={() => onApprove?.(request)}
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            className="btn danger"
                            onClick={() => onReject?.(request)}
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {expanded && <PayloadModal request={expanded} onClose={() => setExpanded(null)} />}
    </>
  );
}
