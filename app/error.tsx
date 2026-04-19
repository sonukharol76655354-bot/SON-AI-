'use client';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] text-white space-y-6">
      <h2 className="text-2xl font-black uppercase tracking-widest text-red-500">System Error Occurred</h2>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-red-500/20 text-red-500 border border-red-500/50 rounded-xl font-bold uppercase tracking-widest transition-transform hover:scale-105"
      >
        Retry Initialization
      </button>
    </div>
  );
}
