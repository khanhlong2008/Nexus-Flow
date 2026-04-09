import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, ChevronLeft, Loader2 } from 'lucide-react';
import { createApprovalRequest } from '../services/approval-requests.service';
import { REQUEST_TYPE_OPTIONS } from '../types/approval-request';
import type { RequestType } from '../types/approval-request';

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const cardPayloadSchema = z.object({
  cardType: z.string().min(1, 'Loại thẻ không được để trống'),
  cardLimit: z.coerce.number().positive('Hạn mức phải lớn hơn 0'),
});

const savingsPayloadSchema = z.object({
  amount: z.coerce.number().positive('Số tiền phải lớn hơn 0'),
  term: z.coerce.number().int().positive('Kỳ hạn phải lớn hơn 0'),
  interestRate: z.coerce
    .number()
    .positive('Lãi suất phải lớn hơn 0')
    .max(100, 'Lãi suất không hợp lệ'),
});

const bondPayloadSchema = z.object({
  bondCode: z.string().min(1, 'Mã trái phiếu không được để trống'),
  faceValue: z.coerce.number().positive('Mệnh giá phải lớn hơn 0'),
  quantity: z.coerce.number().int().positive('Số lượng phải lớn hơn 0'),
});

const baseSchema = z.object({
  title: z
    .string()
    .min(1, 'Tiêu đề không được để trống')
    .max(255, 'Tiêu đề tối đa 255 ký tự'),
  requestType: z.enum(['CARD', 'SAVINGS', 'BOND'] as const),
  // CARD
  cardType: z.string().optional(),
  cardLimit: z.number().optional(),
  // SAVINGS
  amount: z.number().optional(),
  term: z.number().optional(),
  interestRate: z.number().optional(),
  // BOND
  bondCode: z.string().optional(),
  faceValue: z.number().optional(),
  quantity: z.number().optional(),
});

const formSchema = baseSchema.superRefine((data, ctx) => {
  const addIssue = (path: string, message: string) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });

  if (data.requestType === 'CARD') {
    const result = cardPayloadSchema.safeParse({
      cardType: data.cardType,
      cardLimit: data.cardLimit,
    });
    if (!result.success) {
      result.error.issues.forEach((issue) =>
        addIssue(issue.path[0] as string, issue.message),
      );
    }
  } else if (data.requestType === 'SAVINGS') {
    const result = savingsPayloadSchema.safeParse({
      amount: data.amount,
      term: data.term,
      interestRate: data.interestRate,
    });
    if (!result.success) {
      result.error.issues.forEach((issue) =>
        addIssue(issue.path[0] as string, issue.message),
      );
    }
  } else if (data.requestType === 'BOND') {
    const result = bondPayloadSchema.safeParse({
      bondCode: data.bondCode,
      faceValue: data.faceValue,
      quantity: data.quantity,
    });
    if (!result.success) {
      result.error.issues.forEach((issue) =>
        addIssue(issue.path[0] as string, issue.message),
      );
    }
  }
});

type FormValues = z.infer<typeof formSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPayload(data: FormValues): Record<string, unknown> {
  switch (data.requestType) {
    case 'CARD':
      return { cardType: data.cardType, cardLimit: data.cardLimit };
    case 'SAVINGS':
      return {
        amount: data.amount,
        term: data.term,
        interestRate: data.interestRate,
      };
    case 'BOND':
      return {
        bondCode: data.bondCode,
        faceValue: data.faceValue,
        quantity: data.quantity,
      };
    default:
      return {};
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}

function Field({ label, error, children, hint }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputClass =
  'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-50';

// ─── Dynamic Payload Fields ───────────────────────────────────────────────────

interface PayloadFieldsProps {
  requestType: RequestType;
  register: ReturnType<typeof useForm<FormValues>>['register'];
  errors: ReturnType<typeof useForm<FormValues>>['formState']['errors'];
}

function CardFields({ register, errors }: Omit<PayloadFieldsProps, 'requestType'>) {
  return (
    <>
      <Field label="Loại thẻ" error={errors.cardType?.message}>
        <select {...register('cardType')} className={inputClass}>
          <option value="">-- Chọn loại thẻ --</option>
          <option value="DEBIT">Thẻ ghi nợ (Debit)</option>
          <option value="CREDIT">Thẻ tín dụng (Credit)</option>
          <option value="PREPAID">Thẻ trả trước (Prepaid)</option>
        </select>
      </Field>
      <Field
        label="Hạn mức (VNĐ)"
        error={errors.cardLimit?.message}
        hint="Nhập hạn mức tín dụng hoặc số dư tối đa"
      >
        <input
          type="number"
          min={0}
          step={1000000}
          placeholder="Ví dụ: 50000000"
          {...register('cardLimit', { valueAsNumber: true })}
          className={inputClass}
        />
      </Field>
    </>
  );
}

function SavingsFields({ register, errors }: Omit<PayloadFieldsProps, 'requestType'>) {
  return (
    <>
      <Field label="Số tiền gửi (VNĐ)" error={errors.amount?.message}>
        <input
          type="number"
          min={0}
          step={1000000}
          placeholder="Ví dụ: 100000000"
          {...register('amount', { valueAsNumber: true })}
          className={inputClass}
        />
      </Field>
      <Field label="Kỳ hạn (tháng)" error={errors.term?.message}>
        <select {...register('term', { valueAsNumber: true })} className={inputClass}>
          <option value="">-- Chọn kỳ hạn --</option>
          {[1, 3, 6, 9, 12, 18, 24, 36].map((m) => (
            <option key={m} value={m}>
              {m} tháng
            </option>
          ))}
        </select>
      </Field>
      <Field
        label="Lãi suất (%/năm)"
        error={errors.interestRate?.message}
        hint="Lãi suất áp dụng theo chính sách ngân hàng"
      >
        <input
          type="number"
          step={0.1}
          min={0}
          max={100}
          placeholder="Ví dụ: 6.5"
          {...register('interestRate', { valueAsNumber: true })}
          className={inputClass}
        />
      </Field>
    </>
  );
}

function BondFields({ register, errors }: Omit<PayloadFieldsProps, 'requestType'>) {
  return (
    <>
      <Field label="Mã trái phiếu" error={errors.bondCode?.message}>
        <input
          type="text"
          placeholder="Ví dụ: VDB2024001"
          {...register('bondCode')}
          className={inputClass}
        />
      </Field>
      <Field label="Mệnh giá (VNĐ/trái phiếu)" error={errors.faceValue?.message}>
        <input
          type="number"
          min={0}
          step={100000}
          placeholder="Ví dụ: 1000000"
          {...register('faceValue', { valueAsNumber: true })}
          className={inputClass}
        />
      </Field>
      <Field label="Số lượng" error={errors.quantity?.message}>
        <input
          type="number"
          min={1}
          step={1}
          placeholder="Ví dụ: 10"
          {...register('quantity', { valueAsNumber: true })}
          className={inputClass}
        />
      </Field>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  });

  const selectedType = useWatch({ control, name: 'requestType' }) as
    | RequestType
    | undefined;

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    try {
      await createApprovalRequest({
        title: data.title,
        requestType: data.requestType,
        payload: buildPayload(data),
      });
      navigate('/requests/my');
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string | string[] } };
      };
      const msg = axiosError.response?.data?.message;
      setSubmitError(
        Array.isArray(msg)
          ? msg.join(', ')
          : (msg ?? 'Đã xảy ra lỗi. Vui lòng thử lại.'),
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Quay lại"
          >
            <ChevronLeft size={18} />
            Quay lại
          </button>
          <div className="h-5 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <FilePlus size={20} className="text-indigo-600" />
            <h1 className="text-lg font-semibold text-gray-800">
              Tạo yêu cầu mới
            </h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          {/* Thông tin chung */}
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Thông tin chung
            </h2>

            <Field label="Tiêu đề *" error={errors.title?.message}>
              <input
                type="text"
                placeholder="Nhập tiêu đề yêu cầu"
                maxLength={255}
                {...register('title')}
                className={inputClass}
              />
            </Field>

            <Field label="Loại yêu cầu *" error={errors.requestType?.message}>
              <select
                {...register('requestType')}
                className={inputClass}
                defaultValue=""
              >
                <option value="" disabled>
                  -- Chọn loại yêu cầu --
                </option>
                {REQUEST_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          </section>

          {/* Payload động */}
          {selectedType && (
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Thông tin chi tiết
                </h2>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {selectedType === 'CARD' && (
                <CardFields register={register} errors={errors} />
              )}
              {selectedType === 'SAVINGS' && (
                <SavingsFields register={register} errors={errors} />
              )}
              {selectedType === 'BOND' && (
                <BondFields register={register} errors={errors} />
              )}
            </section>
          )}

          {/* Error toàn form */}
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <FilePlus size={16} />
                  Gửi yêu cầu
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
