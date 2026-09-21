import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

// 1. Fetch Store Settings to verify visibility flag
async function getStoreSettings() {
  try {
    const res = await fetch("https://stores.hexalogicx.com/api/store-settings", {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json?.data ?? json;
  } catch (error) {
    console.error("Failed to fetch store settings:", error);
    return null;
  }
}

// 2. Fetch Featured Banner Data
async function getFeaturedBanner() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/banner/featured`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json?.success ? json.data : null;
  } catch (error) {
    console.error("Failed to fetch featured banner:", error);
    return null;
  }
}

async function Special() {
  const [settings, data] = await Promise.all([
    getStoreSettings(),
    getFeaturedBanner(),
  ]);

  const isFeaturedBannerVisible =
    settings?.show_featured_banner === true ||
    settings?.show_featured_banner === 1 ||
    settings?.show_featured_banner === "1";

  // Hide completely if setting is disabled or if banner data fails to return
  if (!isFeaturedBannerVisible || !data) {
    return null;
  }

  const badge = "Special Selection";
  const heading = data.name;
  const description = data.description;
  const buttonText = data.button_name || "Explore Featured Range";
  
  // Format internal routes safely
  const rawLink = data.link || "Products";
  const formattedLink = rawLink.startsWith("http")
    ? rawLink
    : rawLink.startsWith("/")
    ? rawLink
    : `/${rawLink}`;

  const bgImage = data.image
    ? data.image.startsWith("http")
      ? data.image
      : `${IMAGE_BASE_URL}/${data.image}`
    : "";

  return (
    <section
      className="relative w-full bg-zinc-900 bg-cover bg-center sm:bg-fixed overflow-hidden py-14 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: bgImage ? `url('${bgImage}')` : undefined }}
    >
      {/* Background Dim / Gradient Layer */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/65 z-0 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
        {/* Badge */}
        <span
          className="text-white text-[10px] sm:text-xs font-bold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full uppercase tracking-wider mb-3 sm:mb-4 shadow-sm"
          style={{ backgroundColor: "#fe9900" }}
        >
          {badge}
        </span>

        {/* Heading */}
        {heading && (
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight sm:leading-tight mb-2.5 sm:mb-4 px-2">
            {heading}
          </h2>
        )}

        {/* Description */}
        {description && (
          <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-6 sm:mb-8 px-2 sm:px-0">
            {description}
          </p>
        )}

        {/* Action Button */}
        <div>
          {formattedLink.startsWith("http") ? (
            <a
              href={formattedLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-zinc-900 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg transition duration-200 active:scale-95 sm:hover:scale-105"
            >
              <svg
                className="w-4 h-4 text-zinc-900 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>{buttonText}</span>
            </a>
          ) : (
            <Link
              href={formattedLink}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-zinc-900 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg transition duration-200 active:scale-95 sm:hover:scale-105"
            >
              <svg
                className="w-4 h-4 text-zinc-900 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>{buttonText}</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default Special;