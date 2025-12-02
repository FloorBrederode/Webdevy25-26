import { useEffect } from 'react';

export function useBodyClass(bodyClass: string): void {
  useEffect(() => {
    document.body.classList.add(bodyClass);
    return () => document.body.classList.remove(bodyClass);
  }, [bodyClass]);
}
