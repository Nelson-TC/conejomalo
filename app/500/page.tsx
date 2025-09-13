export const dynamic = 'force-static';
export default function Error500() {
  return (
    <div className="p-16 text-center space-y-4">
      <h1 className="text-4xl font-bold">500</h1>
      <p className="text-neutral-600">Error interno del servidor.</p>
      <a href="/" className="text-sm text-brand underline">Volver al inicio</a>
    </div>
  );
}
