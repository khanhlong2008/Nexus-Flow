import { useState } from 'react';
import type { ApprovalRequestResponse, ApprovalStatus } from '../types/approval-request';
import { APPROVAL_STATUS_LABELS, REQUEST_TYPE_LABELS } from '../types/approval-request';
import { useAuthStore } from '../store/auth.store';

// ─── Constants ────────────────────────────────────────────────────────────────

const APPROVER_ROLES = new Set(['BRANCH_LEAD', 'DIRECTOR']);

const STATUS_BADGE_CLASSES: Record<ApprovalStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ApprovalStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[status]}`}
    >
      {APPROVAL_STATUS_LABELS[status]}
    </span>
  );
}

// ─── Payload Modal ────────────────────────────────────────────────────────────

interface PayloadModalProps {
  title: string;
  payload: unknown;
  onClose: () => void;
}

function PayloadModal({ title, payload, onClose }: PayloadModalProps) {
  const formatted = JSON.stringify(payload, null, 2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Chi tiết yêu cầu
            </p>
            <h2 className="mt-0.5 text-base font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Đóng"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6">
          <pre className="rounded-lg bg-gray-950 p-4 text-xs leading-relaxed text-green-400 overflow-x-auto">
            {formatted}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── RequestTable ─────────────────────────────────────────────────────────────

interface RequestTableProps {
  requests: ApprovalRequestResponse[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isLoading?: boolean;
}

export function RequestTable({
  requests,
  onApprove,
  onReject,
  isLoading = false,
}: RequestTableProps) {
  const role = useAuthStore((s) => s.role);
  const canApprove = role !== null && APPROVER_ROLES.has(role);

  const [detailRequest, setDetailRequest] = useState<ApprovalRequestResponse | null>(null);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const truncateId = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-500">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-500">
        Không có yêu cầu nào.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600">
                ID
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600">
                Tiêu đề
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600">
                Người tạo
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600">
                Loại
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600">
                Trạng thái
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600">
                Ngày tạo
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-center font-semibold text-gray-600">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((req) => {
              const isPending = req.status === 'PENDING';
              return (
                <tr key={req.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {truncateId(req.id)}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-medium text-gray-900">
                    {req.title}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                    {req.creator?.name ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                    {REQUEST_TYPE_LABELS[req.requestType] ?? req.requestType}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {formatDate(req.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {/* Xem chi tiết — always visible */}
                      <button
                        type="button"
                        onClick={() => setDetailRequest(req)}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        Chi tiết
                      </button>

                      {/* Duyệt / Từ chối — only for BRANCH_LEAD and DIRECTOR on PENDING requests */}
                      {canApprove && isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => onApprove?.(req.id)}
                            className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject?.(req.id)}
                            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
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

      {detailRequest && (
        <PayloadModal
          title={detailRequest.title}
          payload={detailRequest.payload}
          onClose={() => setDetailRequest(null)}
        />
      )}
    </>
  );
}
