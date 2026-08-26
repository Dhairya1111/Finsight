import {
  DependencyList,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type UseAsyncDataOptions = {
  immediate?: boolean;
  deps?: DependencyList;
};

export function useAsyncData<T>(
  loader: () => Promise<T>,
  options: UseAsyncDataOptions = {},
) {
  const { immediate = true, deps = [] } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(immediate);
  const loaderRef = useRef(loader);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const payload = await loaderRef.current();
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return null;
      }
      setData(payload);
      return payload;
    } catch (err) {
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return null;
      }
      setError(err instanceof Error ? err.message : "Unexpected error");
      return null;
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const dependencySignature = JSON.stringify(deps);

  useEffect(() => {
    if (immediate) {
      void run();
    }
  }, [dependencySignature, immediate, run]);

  return { data, error, loading, reload: run, setData, setError };
}
