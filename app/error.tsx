"use client";
interface GlobalErrorProps { error: Error & { digest?: string }; reset: () => void }
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <div className="p-10 space-y-4 text-center">
      <h1 className="text-2xl font-bold">Se produjo un error</h1>
      <p className="text-sm text-neutral-600">{error.message || 'Algo salió mal.'}</p>
      <button onClick={() => reset()} className="px-4 py-2 text-sm font-medium text-white rounded bg-brand">Reintentar</button>
      {error.digest && <div className="text-xs text-neutral-400">Código: {error.digest}</div>}
    </div>
  );
}
