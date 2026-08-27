// components/ProductReviews.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { IMAGE_BASE_URL } from "@/lib/config";

function timeAgo(dateString) {
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [label, secs] of units) {
    const val = Math.floor(diff / secs);
    if (val >= 1) return `${val} ${label}${val > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

export default function ProductReviews({ product }) {
  const [modalIndex, setModalIndex] = useState(null); // null = closed, otherwise index into reviewsWithImages

  if (!product) return null;

  const avgRating = Number(product.avg_rating) || 0;
  const totalReviews = product.total_reviews ?? 0;
  const reviews = (product.reviews || []).filter((r) => r.is_approved === 1);

  const mainImage =
    product.images?.find((img) => img.is_main)?.image_path ||
    product.images?.[0]?.image_path;

  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star: `${star} Star`, count, pct };
  });

  // Every review currently renders the same product mainImage, so the
  // swipeable modal lets you page through one slide per review that has an image.
  const reviewsWithImages = mainImage
    ? reviews.map((r) => ({ id: r.id, image: mainImage }))
    : [];

  const openModal = (reviewId) => {
    const idx = reviewsWithImages.findIndex((r) => r.id === reviewId);
    if (idx !== -1) setModalIndex(idx);
  };

  const closeModal = () => setModalIndex(null);

  return (
    <div className="mt-10 border-t border-gray-200 pt-6">
      <h2 className="text-lg font-bold text-gray-800 mb-5">Customer Reviews</h2>

      {/* Rating Summary */}
      <div className="w-full bg-gray-50 rounded-lg border border-gray-200 px-4 py-5">
        <div className="flex items-center">
          <div className="w-[155px] shrink-0 flex flex-col items-center justify-center border-r border-gray-200 pr-6">
            <span className="text-4xl font-extrabold leading-none text-gray-900">
              {avgRating.toFixed(1)}
            </span>
            <div className="flex text-yellow-400 text-sm mt-2">
              {"★".repeat(Math.round(avgRating))}
              {"☆".repeat(5 - Math.round(avgRating))}
            </div>
            <span className="text-[10px] text-gray-500 mt-1">
              Based on {totalReviews} Review{totalReviews !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex-1 pl-6 flex flex-col gap-[6px]">
            {starCounts.map((row, idx) => (
              <div key={idx} className="flex items-center gap-3 text-[11px] text-gray-600">
                <span className="w-[40px] shrink-0">{row.star}</span>
                <div className="flex-1 h-[8px] bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="w-4 text-right shrink-0">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="mt-6">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Recent Reviews</h3>

        {reviews.length === 0 && (
          <p className="text-xs text-gray-500">No reviews yet.</p>
        )}

        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    {review.user?.name?.[0]?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-800">
                      {review.user?.name || "Verified Customer"}
                    </p>
                    <div className="flex items-center">
                      <span className="text-yellow-400 text-[10px]">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </span>
                      <span className="text-gray-400 text-[9px] ml-2">
                        • {timeAgo(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {review.is_approved === 1 && (
                  <span className="text-[8px] bg-green-50 text-green-600 border border-green-200 px-2 py-[2px] rounded-full font-medium">
                    ● Verified
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                {review.comment}
              </p>

              {mainImage && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => openModal(review.id)}
                    className="relative w-[32px] h-[32px] rounded overflow-hidden border border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="View review image"
                  >
                    <Image
                      src={`${IMAGE_BASE_URL}/${mainImage}`}
                      alt="Reviewed product"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {modalIndex !== null && reviewsWithImages.length > 0 && (
        <div className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center">
          {/* Close button — the ONLY way to close this modal */}
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close image viewer"
            className="absolute top-4 right-4 z-[1000] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>

          <div
            className="w-full h-full max-w-4xl max-h-[85vh] px-4"
            // Stop any click inside the viewer area from bubbling to a
            // parent handler — belt-and-braces since there is no
            // backdrop-close handler here to begin with.
            onClick={(e) => e.stopPropagation()}
          >
            <Swiper
              modules={[Navigation, Keyboard]}
              navigation
              keyboard={{ enabled: true }}
              initialSlide={modalIndex}
              className="w-full h-full review-image-swiper"
            >
              {reviewsWithImages.map((item, idx) => (
                <SwiperSlide
                  key={`${item.id}-${idx}`}
                  className="flex items-center justify-center"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={`${IMAGE_BASE_URL}/${item.image}`}
                      alt="Reviewed product full view"
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      {modalIndex !== null && (
        <style jsx global>{`
          .review-image-swiper .swiper-button-next,
          .review-image-swiper .swiper-button-prev {
            color: #fff;
          }
          .review-image-swiper .swiper-button-next::after,
          .review-image-swiper .swiper-button-prev::after {
            font-size: 22px;
          }
        `}</style>
      )}
    </div>
  );
}