import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createApprovalRequest } from '../services/approval-requests.service';
import { getActiveRequestTypes } from '../services/request-types.service';
import type { RequestTypeItem } from '../types/request-type';
import { PageHeader } from '../shared/components/PageHeader';
import { getApiErrorMessage } from '../shared/utils/error';
import { parseJsonObject } from '../shared/utils/json';

const schema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(255, 'Tối đa 255 ký tự'),
  description: z.string().optional(),
  requestType: z.string().min(1, 'Loại yêu cầu không được để trống'),
  payloadText: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [requestTypes, setRequestTypes] = useState<RequestTypeItem[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      requestType: '',
      payloadText: '{\n  "reason": "..."\n}',
    },
  });

  useEffect(() => {
    let cancelled = false;

    const loadTypes = async () => {
      setLoadingTypes(true);
      try {
        const data = await getActiveRequestTypes();
        if (!cancelled) {
          setRequestTypes(data);
          if (data.length > 0) {
            setValue('requestType', data[0].code);
          }
        }
      } catch {
        if (!cancelled) {
          setServerError('Không tải được danh mục loại yêu cầu. Vui lòng thử lại.');
        }
      } finally {
        if (!cancelled) {
          setLoadingTypes(false);
        }
      }
    };

    void loadTypes();

    return () => {
      cancelled = true;
    };
  }, [setValue]);

  const hasRequestType = useMemo(() => requestTypes.length > 0, [requestTypes]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);

    const { value: payload, error } = parseJsonObject(values.payloadText ?? '');
    if (error) {
      setServerError(error);
      return;
    }

    try {
      await createApprovalRequest({
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        requestType: values.requestType.trim().toUpperCase(),
        payload,
      });
      navigate('/requests/mine');
    } catch (err: unknown) {
      setServerError(getApiErrorMessage(err, 'Gửi yêu cầu thất bại.'));
    }
  };

  return (
    <section className="page-stack">
      <PageHeader
        title="Tạo yêu cầu mới"
        description="Dữ liệu gửi lên backend: title, description, requestType, payload JSON."
      />

      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label>
          Tiêu đề
          <input {...register('title')} placeholder="Ví dụ: Đề xuất công tác" />
          {errors.title && <span className="field-error">{errors.title.message}</span>}
        </label>

        <label>
          Loại yêu cầu
          <select {...register('requestType')} disabled={loadingTypes || !hasRequestType}>
            {!hasRequestType && <option value="">Không có loại yêu cầu khả dụng</option>}
            {requestTypes.map((item) => (
              <option key={item.id} value={item.code}>
                {item.name} ({item.code})
              </option>
            ))}
          </select>
          {errors.requestType && <span className="field-error">{errors.requestType.message}</span>}
        </label>

        <label>
          Mô tả (tùy chọn)
          <textarea {...register('description')} rows={4} placeholder="Tóm tắt người cần duyệt và bối cảnh nghiệp vụ" />
        </label>

        <label>
          Payload JSON (tùy chọn)
          <textarea
            {...register('payloadText')}
            rows={8}
            className="mono"
            placeholder='{"amount": 12000000, "note": "tạm ứng"}'
          />
        </label>

        {serverError && <div className="alert error">{serverError}</div>}

        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={() => navigate(-1)}>
            Quay lại
          </button>
          <button type="submit" className="btn primary" disabled={isSubmitting || loadingTypes || !hasRequestType}>
            <Send size={14} /> {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </div>
      </form>
    </section>
  );
}
