import { useCallback, useState } from 'react';

export function useAsyncTask() {
  const [isLoading, setIsLoading] = useState(false);

  const run = useCallback(async <T,>(task: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    try {
      return await task();
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, run };
}
