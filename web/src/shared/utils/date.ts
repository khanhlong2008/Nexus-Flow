export function formatDateTimeVi(input: string): string {
  return new Date(input).toLocaleString('vi-VN');
}
