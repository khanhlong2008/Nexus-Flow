export function parseJsonObject(
  input: string,
): { value: Record<string, unknown> | undefined; error: string | null } {
  if (!input.trim()) {
    return { value: undefined, error: null };
  }

  try {
    const parsed = JSON.parse(input) as unknown;

    if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
      return {
        value: undefined,
        error: 'Payload JSON phải là object (ví dụ: {"reason":"..."}).',
      };
    }

    return { value: parsed as Record<string, unknown>, error: null };
  } catch {
    return { value: undefined, error: 'Payload phải là JSON hợp lệ.' };
  }
}
