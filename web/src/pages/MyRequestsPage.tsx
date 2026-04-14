import { useEffect, useState } from 'react';
import { getOutgoingRequests } from '../services/approval-requests.service';
import { RequestTable } from '../components/RequestTable';
import type { ApprovalRequestResponse } from '../types/approval-request';
import { PageHeader } from '../shared/components/PageHeader';
import { useAsyncTask } from '../shared/hooks/useAsyncTask';
import { getApiErrorMessage } from '../shared/utils/error';

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<ApprovalRequestResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, run } = useAsyncTask();

  useEffect(() => {
    const load = async () => {
      await run(async () => {
        const data = await getOutgoingRequests();
        setError(null);
        setRequests(data);
      }).catch((err: unknown) => {
        setError(getApiErrorMessage(err, 'Không tải được danh sách yêu cầu của bạn.'));
      });
    };

    void load();
  }, [run]);

  return (
    <section className="page-stack">
      <PageHeader
        title="Yêu cầu của tôi"
        description="Danh sách request đã tạo và trạng thái mới nhất."
      />
      {error && <div className="alert error">{error}</div>}

      <RequestTable
        requests={requests}
        isLoading={isLoading}
        emptyMessage="Bạn chưa tạo yêu cầu nào."
      />
    </section>
  );
}
