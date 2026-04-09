import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Activity, ArrowRightLeft, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { getIncomingRequests, getOutgoingRequests } from '../services/approval-requests.service';
import type { ApprovalRequestResponse } from '../types/approval-request';

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const [incoming, setIncoming] = useState<ApprovalRequestResponse[]>([]);
  const [outgoing, setOutgoing] = useState<ApprovalRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [incomingData, outgoingData] = await Promise.all([
          getIncomingRequests(),
          getOutgoingRequests(),
        ]);
        if (!cancelled) {
          setIncoming(incomingData);
          setOutgoing(outgoingData);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const statusSummary = useMemo(() => {
    const all = [...incoming, ...outgoing];
    return {
      pending: all.filter((item) => item.status === 'PENDING').length,
      inReview: all.filter((item) => item.status === 'IN_REVIEW').length,
      approved: all.filter((item) => item.status === 'APPROVED').length,
      rejected: all.filter((item) => item.status === 'REJECTED').length,
    };
  }, [incoming, outgoing]);

  return (
    <section className="page-stack">
      <header className="section-head">
        <h2>Tổng quan phê duyệt</h2>
        <p>Theo dõi nhanh inbox và outbox theo vai trò hiện tại.</p>
      </header>

      <div className="stats-grid">
        <StatCard title="Chờ duyệt" value={statusSummary.pending} icon={<Clock3 size={18} />} />
        <StatCard title="Đang review" value={statusSummary.inReview} icon={<Activity size={18} />} />
        <StatCard title="Đã duyệt" value={statusSummary.approved} icon={<CheckCircle2 size={18} />} />
        <StatCard title="Từ chối" value={statusSummary.rejected} icon={<XCircle size={18} />} />
      </div>

      <article className="board-card">
        <div className="board-head">
          <h3>Phân bổ luồng công việc</h3>
          <ArrowRightLeft size={16} />
        </div>
        <div className="board-content">
          <div>
            <p className="muted-small">Incoming</p>
            <strong>{incoming.length}</strong>
            <span>yêu cầu cần xử lý</span>
          </div>
          <div>
            <p className="muted-small">Outgoing</p>
            <strong>{outgoing.length}</strong>
            <span>yêu cầu đang theo dõi</span>
          </div>
        </div>
        {loading && <p className="muted-small">Đang đồng bộ dữ liệu...</p>}
      </article>
    </section>
  );
}
