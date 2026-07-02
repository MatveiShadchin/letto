'use client';

import * as React from 'react';

type ToastProps = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const listeners = new Set<(toasts: ToastProps[]) => void>();
let memoryState: ToastProps[] = [];

function dispatch(toasts: ToastProps[]) {
  memoryState = toasts;
  listeners.forEach((listener) => listener(toasts));
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>(memoryState);

  React.useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  return { toasts };
}

export function toast(props: Omit<ToastProps, 'id'>) {
  const id = String(Date.now());
  dispatch([...memoryState, { id, ...props }]);
  return { id };
}
