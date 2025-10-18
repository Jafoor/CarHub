// app/layout.tsx or app/providers.tsx
'use client';

import { useEffect } from 'react';
import { isTokenExpired, clearTokens } from '@/lib/auth';
import { ToastProvider } from '@/components/providers/toast-provider';
import "./globals.css";
export function TokenCleanupProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Clean up expired tokens on app start
    if (isTokenExpired()) {
      console.log('Cleaning up expired tokens...');
      clearTokens();
    }
  }, []);

  return <>{children}</>;
}

// Use in your root layout:
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TokenCleanupProvider>
          <ToastProvider />
          {children}
        </TokenCleanupProvider>
      </body>
    </html>
  );
}