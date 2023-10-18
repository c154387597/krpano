import { useLayoutEffect, useRef } from "react";

export function useEventCallback<T>(callback: T): React.MutableRefObject<T> {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return callbackRef;
}
