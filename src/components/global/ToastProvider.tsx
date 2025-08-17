// components/ToastProvider.tsx
'use client';

import { FC, ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => (
  <>
    {children}
    <ToastContainer
      position="bottom-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      pauseOnHover
      draggable
      theme="colored"
    />
  </>
);