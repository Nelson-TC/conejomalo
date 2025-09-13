export const dynamic = 'force-dynamic';
export default function Legacy404() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Test 404 forced error');
  }
  return <div className="p-10 text-center">Página no encontrada (legacy 404)</div>;
}
