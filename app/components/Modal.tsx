'use client';

import { useEffect, useRef, type ReactNode } from 'react';

let scrollLocks = 0;
let originalOverflow = '';

/** Native modal focus containment, Escape and background inertness. Mount only while open. */
export default function Modal({ children, label, onClose, className = '' }: {
  children: ReactNode; label: string; onClose: () => void; className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (scrollLocks++ === 0) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    dialog.showModal();
    return () => {
      dialog.close();
      if (--scrollLocks === 0) document.body.style.overflow = originalOverflow;
    };
  }, []);
  return <dialog ref={ref} aria-label={label} onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    className={`fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0 text-inherit backdrop:bg-black/45 backdrop:backdrop-blur-xs ${className}`}>
    {children}
  </dialog>;
}
