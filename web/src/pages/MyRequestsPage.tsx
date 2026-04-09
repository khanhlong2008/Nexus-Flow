import { useEffect, useState } from 'react';
import { getOutgoingRequests } from '../services/approval-requests.service';
import { RequestTable } from '../components/RequestTable';
import type { ApprovalRequestResponse } from '../types/approval-request';

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<ApprovalRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getOutgoingRequests();
        setRequests(data);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <section className="page-stack">
      <header className="section-head">
        <h2>Yêu cầu của tôi</h2>
        <p>Danh sách request đã tạo và trạng thái mới nhất.</p>
      </header>

      <RequestTable
        requests={requests}
        isLoading={loading}
        emptyMessage="Bạn chưa tạo yêu cầu nào."
      />
    </section>
  );
}
