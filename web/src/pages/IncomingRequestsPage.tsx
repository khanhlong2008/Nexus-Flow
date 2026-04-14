import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import {
  approveRequest,
  getIncomingRequests,
  rejectRequest,
} from '../services/approval-requests.service';
import { RequestTable } from '../components/RequestTable';
import type { ApprovalRequestResponse } from '../types/approval-request';
import { PageHeader } from '../shared/components/PageHeader';
import { useAsyncTask } from '../shared/hooks/useAsyncTask';
import { getApiErrorMessage } from '../shared/utils/error';

export default function IncomingRequestsPage() {
  const [requests, setRequests] = useState<ApprovalRequestResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { isLoading, run } = useAsyncTask();

  const load = useCallback(async () => {
    await run(async () => {
      const data = await getIncomingRequests();
      setError(null);
      setRequests(data);
    }).catch((err: unknown) => {
      setError(getApiErrorMessage(err, 'Không tải được danh sách yêu cầu đến.'));
    });
  }, [run]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleApprove = async (request: ApprovalRequestResponse) => {
    const comment = window.prompt('Nhập ghi chú phê duyệt (có thể bỏ trống):', '') ?? undefined;
    try {
      await approveRequest(request.id, comment);
      setBanner({ type: 'success', message: 'Đã phê duyệt thành công.' });
      await load();
    } catch (err: unknown) {
      setBanner({ type: 'error', message: getApiErrorMessage(err, 'Phê duyệt thất bại.') });
    }
  };

  const handleReject = async (request: ApprovalRequestResponse) => {
    const comment = window.prompt('Nhập lý do từ chối (bắt buộc):', '');
    if (!comment || !comment.trim()) {
      return;
    }
    try {
      await rejectRequest(request.id, comment.trim());
      setBanner({ type: 'success', message: 'Đã từ chối yêu cầu.' });
      await load();
    } catch (err: unknown) {
      setBanner({ type: 'error', message: getApiErrorMessage(err, 'Từ chối yêu cầu thất bại.') });
    }
  };

  return (
    <section className="page-stack">
      <PageHeader
        title="Hàng đợi duyệt"
        description="Incoming theo role: Branch Lead duyệt PENDING, Director duyệt IN_REVIEW."
      />

      {banner && <div className={`alert ${banner.type}`}>{banner.message}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="quick-actions">
        <div><CheckCircle2 size={16} /> Duyệt để đẩy request lên bước tiếp theo</div>
        <div><XCircle size={16} /> Từ chối và lưu lý do vào lịch sử</div>
      </div>

      <RequestTable
        requests={requests}
        isLoading={isLoading}
        onApprove={handleApprove}
        onReject={handleReject}
        emptyMessage="Không có request nào cần xử lý lúc này."
      />
    </section>
  );
}
