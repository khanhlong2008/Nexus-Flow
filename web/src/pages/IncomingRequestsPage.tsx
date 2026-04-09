import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import {
  approveRequest,
  getIncomingRequests,
  rejectRequest,
} from '../services/approval-requests.service';
import { RequestTable } from '../components/RequestTable';
import type { ApprovalRequestResponse } from '../types/approval-request';

export default function IncomingRequestsPage() {
  const [requests, setRequests] = useState<ApprovalRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getIncomingRequests();
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleApprove = async (request: ApprovalRequestResponse) => {
    const comment = window.prompt('Nhập ghi chú phê duyệt (có thể bỏ trống):', '') ?? undefined;
    await approveRequest(request.id, comment);
    setBanner('Đã phê duyệt thành công.');
    await load();
  };

  const handleReject = async (request: ApprovalRequestResponse) => {
    const comment = window.prompt('Nhập lý do từ chối (bắt buộc):', '');
    if (!comment || !comment.trim()) {
      return;
    }
    await rejectRequest(request.id, comment.trim());
    setBanner('Đã từ chối yêu cầu.');
    await load();
  };

  return (
    <section className="page-stack">
      <header className="section-head">
        <h2>Hàng đợi duyệt</h2>
        <p>Incoming theo role: Branch Lead duyệt PENDING, Director duyệt IN_REVIEW.</p>
      </header>

      {banner && <div className="alert success">{banner}</div>}

      <div className="quick-actions">
        <div><CheckCircle2 size={16} /> Duyệt để đẩy request lên bước tiếp theo</div>
        <div><XCircle size={16} /> Từ chối và lưu lý do vào lịch sử</div>
      </div>

      <RequestTable
        requests={requests}
        isLoading={loading}
        onApprove={handleApprove}
        onReject={handleReject}
        emptyMessage="Không có request nào cần xử lý lúc này."
      />
    </section>
  );
}
