'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface ErrorComponentProps {
  title: string;
  description: string;
}

export function ErrorComponent({ title, description }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
      <div className="p-6 bg-red-100 rounded-full mb-6">
        <AlertTriangle className="h-16 w-16 text-red-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      <p className="text-gray-600 max-w-lg mt-2 mb-8">{description}</p>
      <Button onClick={() => router.back()} variant="outline">
        Go Back to Previous Page
      </Button>
    </div>
  );
} 