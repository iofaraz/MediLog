export type IpcResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
  message?: string;
};

export function isIpcResult<T = unknown>(value: unknown): value is IpcResult<T> {
  return typeof value === 'object' && value !== null && 'success' in value;
}

export function unwrapIpcResult<T>(value: unknown): IpcResult<T> {
  if (isIpcResult<T>(value)) {
    return value;
  }

  return {
    success: true,
    data: value as T,
  };
}

export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred.') {
  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallback;
}
