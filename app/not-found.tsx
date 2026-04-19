export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] text-white">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-black">404</h1>
        <p className="text-xl font-bold uppercase tracking-widest text-indigo-400">Page Not Found</p>
        <a href="/" className="inline-block mt-8 px-6 py-3 bg-indigo-500 rounded-xl font-bold uppercase tracking-widest transition-transform hover:scale-105 active:scale-95">Back to SONAI Core</a>
      </div>
    </div>
  );
}
