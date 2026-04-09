import { type FormEvent, useEffect, useState } from 'react';
import { Eye, EyeOff, PlusCircle } from 'lucide-react';
import {
  createRequestType,
  getManageRequestTypes,
  updateRequestType,
} from '../services/request-types.service';
import { useAuthStore } from '../store/auth.store';
import type { RequestTypeItem } from '../types/request-type';

export default function AccessControlPage() {
  const role = useAuthStore((state) => state.user?.role ?? null);

  const [items, setItems] = useState<RequestTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const canManage = role === 'ADMIN' || role === 'DIRECTOR';

  const load = async () => {
    setLoading(true);
    try {
      const data = await getManageRequestTypes();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canManage) return;
    void load();
  }, [canManage]);

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    try {
      await createRequestType({
        code,
        name,
        description,
        isActive: true,
      });
      setCode('');
      setName('');
      setDescription('');
      setMessage('Đã thêm loại yêu cầu mới.');
      await load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message;
      setMessage(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Không thể thêm loại yêu cầu.');
    }
  };

  const toggleVisibility = async (item: RequestTypeItem) => {
    await updateRequestType(item.id, { isActive: !item.isActive });
    setMessage(`Đã ${item.isActive ? 'ẩn' : 'hiện'} ${item.code}.`);
    await load();
  };

  if (!canManage) {
    return (
      <section className="page-stack">
        <header className="section-head">
          <h2>Quản trị loại yêu cầu</h2>
          <p>Bạn không có quyền truy cập chức năng này.</p>
        </header>
      </section>
    );
  }

  return (
    <section className="page-stack">
      <header className="section-head">
        <h2>Quản trị loại yêu cầu</h2>
        <p>Admin và Director có quyền ngang nhau: thêm mới, ẩn/hiện danh mục cho toàn hệ thống.</p>
      </header>

      <form className="form-grid" onSubmit={onCreate}>
        <label>
          Mã loại yêu cầu
          <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="VD: ADVANCE" required />
        </label>

        <label>
          Tên hiển thị
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="VD: Tạm ứng" required />
        </label>

        <label>
          Mô tả
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Mô tả ngắn cho loại yêu cầu" />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn primary">
            <PlusCircle size={14} /> Thêm loại yêu cầu
          </button>
        </div>
      </form>

      {message && <div className="alert success">{message}</div>}

      <div className="table-wrap">
        <table className="request-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th className="actions-col">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5}>Đang tải...</td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5}>Chưa có loại yêu cầu nào.</td>
              </tr>
            )}
            {!loading &&
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td>{item.description || '—'}</td>
                  <td>
                    <span className={item.isActive ? 'status-badge status-approved' : 'status-badge status-draft'}>
                      {item.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn ghost" onClick={() => toggleVisibility(item)}>
                        {item.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                        {item.isActive ? 'Ẩn' : 'Hiện'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
