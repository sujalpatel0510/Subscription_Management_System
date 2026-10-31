'use client';

import { Toaster as SonnerToaster } from 'sonner';

export default function ToasterProvider() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      theme="system"
    />
  );
}
