import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

// 1. Fetch Store Settings to check visibility flag
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

// 2. Fetch Brand Banner Data
async function getBrandBanner() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/banner/brand`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json?.success ? json.data : null;
  } catch (error) {
    console.error("Failed to fetch brand banner:", error);
    return null;
  }
}

async function Official() {
  const [settings, data] = await Promise.all([
    getStoreSettings(),
    getBrandBanner(),
  ]);

  const isBrandBannerVisible =
    settings?.show_brand_banner === true ||
    settings?.show_brand_banner === 1 ||
    settings?.show_brand_banner === "1";

  // Completely remove from DOM if flag is inactive or banner data is unavailable
  if (!isBrandBannerVisible || !data) {
    return null;
  }

  const heading = data.name;
  const description = data.description;
  const buttonText = data.button_name || "Explore All Brands";
  const link = data.link || "#";

  const bgImage = data.image
    ? data.image.startsWith("http")
      ? data.image
      : `${IMAGE_BASE_URL}/${data.image}`
    : "";

  return (
    <section className="relative w-full bg-[#111827] overflow-hidden py-10 sm:py-14 px-6">
      {/* Background Image with Gradient Overlay */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-70 z-0"
          style={{ backgroundImage: `url('${bgImage}')` }}
        ></div>
      )}

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f17] via-[#0b0f17]/90 to-transparent z-10"></div>

      {/* Content Container */}
      <div className="relative z-10 px-3 sm:px-4 container mx-auto flex flex-col items-start text-left">
        {/* Official Partner Badge */}
        <div className="inline-flex items-center gap-1.5 bg-red-950/60 border border-red-900/50 text-red-400 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase mb-3">
          <span>👑</span>
          <span>Official Partner Showcase</span>
        </div>

        {/* Main Heading */}
        {heading && (
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-xl">
            {heading}
          </h1>
        )}

        {/* Description Paragraph */}
        {description && (
          <p className="text-gray-300 text-xs sm:text-sm mt-2 max-w-lg leading-relaxed">
            {description}
          </p>
        )}

        {/* Call to Action Button */}
        <div className="mt-5">
          <a href={link}>
            <button className="bg-white hover:bg-gray-100 text-zinc-900 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition duration-300 transform hover:scale-105">
              {buttonText}
              <svg className="w-4 h-4 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Official;