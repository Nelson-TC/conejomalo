export default function ContactPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">Contacto</h1>
			<p className="text-neutral-600 max-w-prose text-sm">Puedes escribirnos para cualquier consulta relacionada a productos o pedidos. Esta página es un placeholder en la restauración.</p>
			<div className="p-4 space-y-3 bg-white border rounded max-w-md">
				<input disabled className="w-full px-3 py-2 text-sm border rounded bg-neutral-50" placeholder="Nombre" />
				<input disabled className="w-full px-3 py-2 text-sm border rounded bg-neutral-50" placeholder="Email" />
				<textarea disabled className="w-full px-3 py-2 text-sm border rounded bg-neutral-50" rows={4} placeholder="Mensaje" />
				<button disabled className="px-4 py-2 text-sm font-medium text-white rounded bg-brand/50">Enviar</button>
			</div>
		</div>
	);
}
