"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { AddToCartButton } from "./cart/AddToCartButton";

interface ProductVariant {
  id: string;
  unit: string;
  amount: number;
  price: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  variants?: ProductVariant[]; // Optional since API might not include variants
}

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const imageUrl = product.images[0] || '/placeholder-product.jpg';

  // Handle cases where variants might not be loaded
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants[0]?.id || null
  );

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return variants.find(v => v.id === selectedVariantId) || variants[0];
  }, [variants, selectedVariantId, hasVariants]);

  const minPrice = hasVariants ? Math.min(...variants.map(v => v.price)) : 0;
  const maxPrice = hasVariants ? Math.max(...variants.map(v => v.price)) : 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price / 100);

  const formatUnit = (unit: string, amount: number) => {
    const unitMap: { [key: string]: string } = {
      PIECE: "piece",
      KG: "kg",
      G: "g",
      LITER: "L",
      ML: "ml",
      OTHER: "unit",
    };
    return `${amount}${unitMap[unit] || unit.toLowerCase()}`;
  };

  return (
    <Card className={`${compact ? 'p-2 sm:p-2' : 'p-2 sm:p-3 md:p-4'} hover:shadow-lg transition-shadow`}>
      <Link href={`/products/${product.slug}`} className="block">
        <div className={`${compact ? 'mb-2' : 'mb-2 sm:mb-3 md:mb-4'} aspect-square relative`}>
          {imageUrl.includes('.s3.') || imageUrl.includes('amazonaws.com') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={`${product.name} - Fresh ${product.name.toLowerCase()} available for delivery from TaYaima grocery store`}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
          ) : (
            <Image
              src={imageUrl}
              alt={`${product.name} - Fresh ${product.name.toLowerCase()} available for delivery from TaYaima grocery store`}
              fill
              className="object-cover rounded-lg"
              loading="lazy"
            />
          )}
        </div>
        <h3 className={`font-semibold ${compact ? 'text-xs sm:text-sm' : 'text-xs sm:text-sm md:text-lg'} line-clamp-2`}>{product.name}</h3>
      </Link>

      {/* Variant selector */}
      {hasVariants && variants.length > 1 && (
        <div className={`${compact ? 'mt-2 gap-1' : 'mt-2'} flex flex-wrap gap-1.5`}>
          {variants.map((variant) => (
            <button
              key={variant.id}
              onClick={(e) => {
                e.preventDefault();
                setSelectedVariantId(variant.id);
              }}
              className={`px-2 py-1 rounded-md border text-xs sm:text-sm transition-colors ${
                selectedVariant?.id === variant.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {formatUnit(variant.unit, variant.amount)}
            </button>
          ))}
        </div>
      )}

      <div className={`${compact ? 'mt-2' : 'mt-2 sm:mt-3'} flex items-center justify-between`}>
        <div className={`${compact ? 'text-sm' : 'text-sm sm:text-base md:text-lg'} font-bold text-green-600`}>
          {!hasVariants ? (
            <span className="text-gray-500">Price not available</span>
          ) : selectedVariant ? (
            formatPrice(selectedVariant.price)
          ) : minPrice === maxPrice ? (
            formatPrice(minPrice)
          ) : (
            `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
          )}
        </div>
        {selectedVariant && (
          <AddToCartButton
            productId={product.id}
            variantId={selectedVariant.id}
            productName={product.name}
            variantUnit={selectedVariant.unit}
            variantAmount={selectedVariant.amount}
            price={selectedVariant.price}
            imageUrl={product.images[0]}
            className={`${compact ? 'h-8 text-xs' : 'h-8 sm:h-9 text-xs sm:text-sm'}`}
          >
            Add
          </AddToCartButton>
        )}
        {!hasVariants && (
          <Link href={`/products/${product.slug}`}>
            <Button className={`${compact ? 'h-8 text-xs' : 'h-8 sm:h-9 text-xs sm:text-sm'}`}>
              View Details
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
