import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { login } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';

const DEMO_ACCOUNTS = [
  { role: 'DIRECTOR', email: 'director@nexusflow.vn', password: 'Director@123' },
  { role: 'ADMIN', email: 'admin@nexusflow.vn', password: 'Admin@123' },
  { role: 'BRANCH_LEAD', email: 'branchlead.hanoi@nexusflow.vn', password: 'BranchLead@123' },
  { role: 'STAFF', email: 'staff1.hanoi@nexusflow.vn', password: 'Staff@123' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState(DEMO_ACCOUNTS[2].email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS[2].password);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login({ email, password });
      setAuth(result.accessToken, result.user);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message;

      setError(Array.isArray(message) ? message.join(', ') : message ?? 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <p className="eyebrow">Nexus Flow Platform</p>
        <h1>Đăng nhập hệ thống phê duyệt</h1>
        <p className="subtle">Giao diện web đã được căn theo API backend NestJS và RBAC hiện tại.</p>

        <form onSubmit={onSubmit} className="form-stack">
          <label>
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
            />
          </label>

          <label>
            Mật khẩu
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
            />
          </label>

          {error && <div className="alert error">{error}</div>}

          <button type="submit" disabled={loading} className="btn primary full">
            <LogIn size={16} /> {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="demo-accounts">
          <p>Tài khoản test đăng nhập:</p>
          <ul>
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                >
                  <strong>{account.role}</strong>
                  <span>{account.email}</span>
                  <code>{account.password}</code>
                </button>
              </li>
            ))}
          </ul>
          <p className="muted-small">Nhấn vào từng dòng để tự động điền email và mật khẩu.</p>
        </div>
      </div>
    </div>
  );
}
