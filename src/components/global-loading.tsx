'use client';

import { LoadingProgress } from './ui/loading-progress';

export function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <LoadingProgress />
    </div>
  );
} 