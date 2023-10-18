import { useEffect, useRef } from "react";

export function useMounted(cb: Function) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      cb();
    }
  }, []);
}
