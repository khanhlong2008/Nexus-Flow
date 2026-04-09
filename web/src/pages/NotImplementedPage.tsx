import { Link } from 'react-router-dom';

export default function NotImplementedPage() {
  return (
    <section className="page-stack">
      <header className="section-head">
        <h2>Module đang được mở rộng</h2>
        <p>Trang này chưa có API tương ứng trong backend hiện tại.</p>
      </header>

      <article className="board-card">
        <p>
          Mình đã setup route và shell để khi backend mở endpoint mới, chúng ta có thể gắn vào nhanh.
          Bạn có thể tiếp tục sử dụng các màn hình đã hoàn thiện: dashboard, tạo yêu cầu, incoming, outgoing.
        </p>
        <Link className="btn primary" to="/dashboard">
          Quay về dashboard
        </Link>
      </article>
    </section>
  );
}
