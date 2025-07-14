'use client';

import { toast } from 'sonner';

export function useToast() {
  const showSuccessToast = (message: string) => {
    toast.success('Success', {
      description: message,
    });
  };

  const showErrorToast = (message: string) => {
    toast.error('Error', {
      description: message,
    });
  };

  return { showSuccessToast, showErrorToast };
}
