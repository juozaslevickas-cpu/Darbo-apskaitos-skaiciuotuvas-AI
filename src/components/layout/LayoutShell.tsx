'use client';

import { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import ToastContainer from './ToastContainer';
import { useHydration } from '@/hooks/useHydration';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hydrated = useHydration();

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">
            DL
          </div>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile hamburger button */}
      <div className="fixed top-0 left-0 z-40 flex h-16 items-center px-4 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Atidaryti meniu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <main className="min-h-screen pt-16 md:pt-0 md:ml-64">{children}</main>

      <ToastContainer />
    </>
  );
}
