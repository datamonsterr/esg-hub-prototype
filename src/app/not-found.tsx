import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      <div className="p-8 bg-white shadow-lg rounded-full mb-8">
        <SearchX className="h-24 w-24 text-brand-primary" />
      </div>
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mt-4 mb-2">Page Not Found</h2>
      <p className="text-gray-500 max-w-md mb-8">
        Oops! The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Button asChild className="bg-brand-primary hover:bg-brand-primary/90 rounded-brand">
        <Link href="/">
          Go Back Home
        </Link>
      </Button>
    </div>
  );
} 