"use client";

import Link from "next/link";
import ProductCardContent from "@/app/ProductCardContent/ProductCardContent";
import ProductCardImage from "@/app/ProductCardImage/ProductCardImage";
import HoverImageScroll from "@/app/HoverImageScroll/HoverImageScroll";
import WishlistButton from "@/app/Wishlist/WishlistButton";

function mapToCardProduct(product) {
  const firstVariant = product.variants?.[0];
  const price = firstVariant ? Number(firstVariant.price) : Number(product.price || 0);
  const cutPrice = firstVariant?.cut_price ? Number(firstVariant.cut_price) : (product.cut_price ? Number(product.cut_price) : null);

  const discountPercent =
    cutPrice !== null && cutPrice > price
      ? Math.round(((cutPrice - price) / cutPrice) * 100)
      : (product.discount_percent ? Number(product.discount_percent) : null);

  const totalStock =
    product.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) ?? (product.stock || 0);
  const inStock = totalStock > 0;

  const reviews = product.reviews || [];
  const avgRating =
    product.avg_rating !== undefined && product.avg_rating !== null
      ? Number(product.avg_rating)
      : reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingCount =
    product.total_reviews ??
    product.reviews_count ??
    product.review_count ??
    reviews.length;

  return {
    title: product.name,
    rating: avgRating,
    ratingCount: Number(ratingCount) || 0,
    sold: Number(product.order_items_count ?? product.sold_count ?? product.sold ?? 0),
    price,
    originalPrice: cutPrice && cutPrice > price ? cutPrice : undefined,
    discountPercent: discountPercent || undefined,
    inStock,
    freeDelivery: product.free_delivery ?? inStock,
  };
}

const ProductCard = ({ product }) => {
  const cardProduct = mapToCardProduct(product);

  return (
    <Link
      href={`/Productdetail/${product.slug}`}
      className="group bg-white rounded-sm sm:rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300 relative flex flex-col h-full w-full"
    >
      {/* Central Image Component (houses HoverImageScroll & WishlistButton internally) */}
      <ProductCardImage
        product={product}
        
      />

      {/* Shared Content Component */}
      <ProductCardContent product={cardProduct} />
    </Link>
  );
};

export default ProductCard;