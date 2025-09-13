import AddToCartButton from './AddToCartButton';
import { formatCurrency } from '../src/lib/format';
import Image from 'next/image';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    price: any;
    imageUrl?: string | null;
    category?: { name: string } | null;
  };
  compactCategory?: boolean;
}

export default function ProductCard({ product, compactCategory }: ProductCardProps) {
  return (
    <div className="flex flex-col p-4 space-y-2 bg-white border rounded-lg shadow-sm">
      <div className="flex-1 space-y-2">
        {product.category && (
          <div className={`text-xs font-medium text-brand ${compactCategory ? '' : 'block'}`}>{product.category.name}</div>
        )}
        <a href={`/products/${product.slug}`} className="block font-semibold hover:underline">{product.name}</a>
        {product.imageUrl && (
          <div className="w-full overflow-hidden rounded aspect-square bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-cover w-full h-full"
              loading="lazy"
            />
          </div>
        )}
        {product.description && (
          <div className="text-xs text-neutral-600 line-clamp-3">{product.description}</div>
        )}
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="font-semibold">{formatCurrency(Number(product.price))}</span>
        <AddToCartButton productId={product.id} qty={1} className="!text-xs" label="+ Carrito" />
      </div>
    </div>
  );
}
