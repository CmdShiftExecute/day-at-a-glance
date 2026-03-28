'use client';

import { ReactNode } from 'react';

// Simple tooltip provider — wraps children, no external dependencies
export function TooltipProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
