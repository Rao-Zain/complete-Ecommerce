import Image from 'next/image';
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

// 1. Fetch Store Settings to check visibility flags
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

// 2. Fetch Banners
async function getBanners() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/banner/main`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const json = await res.json();
    return json?.data ?? [];
  } catch (error) {
    console.error("Failed to fetch banners:", error);
    return [];
  }
}

function extractDiscount(description) {
  if (!description) return null;
  const match = description.match(/(\d+)\s*%/);
  return match ? match[1] : null;
}

// Helper to reliably evaluate numeric or boolean truthy flags (1, "1", true)
const isFlagActive = (flag) => Number(flag) === 1 || flag === true;

async function Banners() {
  const [settings, rawBanners] = await Promise.all([
    getStoreSettings(),
    getBanners(),
  ]);

  const isMidBannersVisible =
    settings?.show_mid_banners === true ||
    settings?.show_mid_banners === 1 ||
    settings?.show_mid_banners === "1";

  if (!isMidBannersVisible) {
    return null;
  }

  const sortedBanners = [...rawBanners].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  const apiLarge = sortedBanners[0];
  const apiSmall = sortedBanners.slice(1, 3);

  const largeBanner = apiLarge
    ? {
        id: apiLarge.id,
        title: apiLarge.name || apiLarge.heading,
        subtitle: apiLarge.description,
        discount: extractDiscount(apiLarge.description),
        image: apiLarge.image,
        buttonText: apiLarge.buttonText ?? null,
        link: apiLarge.link ?? null,
        showImage: isFlagActive(apiLarge.is_image) && Boolean(apiLarge.image),
        showTitle: isFlagActive(apiLarge.is_title) && Boolean(apiLarge.name || apiLarge.heading),
        showDescription: isFlagActive(apiLarge.is_description) && Boolean(apiLarge.description),
      }
    : null;

  const smallBanners =
    apiSmall.length > 0
      ? apiSmall.map((b) => ({
          id: b.id,
          title: b.name || b.heading,
          subtitle: b.description,
          discount: extractDiscount(b.description),
          image: b.image,
          showImage: isFlagActive(b.is_image) && Boolean(b.image),
          showTitle: isFlagActive(b.is_title) && Boolean(b.name || b.heading),
          showDescription: isFlagActive(b.is_description) && Boolean(b.description),
        }))
      : [];

  if (!largeBanner && smallBanners.length === 0) {
    return null;
  }

  const getImageUrl = (path) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  };

  return (
    <section className="container mx-auto px-3 sm:px-4 py-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Left Big Banner */}
        {largeBanner && (
          <div className="lg:col-span-6 relative rounded-2xl overflow-hidden shadow-md h-[300px] sm:h-[415px] flex flex-col justify-end p-6 sm:p-8 bg-stone-300">
            {largeBanner.showImage && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={getImageUrl(largeBanner.image)}
                  alt={largeBanner.title || "Banner"}
                  fill
                  className="object-cover object-center"
                />
              </div>
            )}

            {/* Gradient shadow overlay only if text is displayed */}
            {(largeBanner.showTitle || largeBanner.showDescription) && (
              <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
            )}

            {/* Background watermark */}
            <div className="absolute inset-0 flex items-center justify-start pl-4 pointer-events-none select-none overflow-hidden opacity-25">
              <span className="text-[140px] sm:text-[180px] font-serif font-black tracking-tighter text-white">
                Sale
              </span>
            </div>

            <div className="relative z-10">
              {largeBanner.showTitle && (
                <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
                  {largeBanner.title}
                </h2>
              )}

              {largeBanner.showDescription && (
                <p className="text-gray-200 text-sm mt-1">{largeBanner.subtitle}</p>
              )}

              {largeBanner.buttonText && (
                <a href={largeBanner.link || "#"}>
                  <button className="mt-4 bg-white text-gray-900 font-medium text-sm px-5 py-2.5 rounded-full shadow hover:bg-gray-100 transition">
                    {largeBanner.buttonText}
                  </button>
                </a>
              )}
            </div>

            {largeBanner.showDescription && largeBanner.discount && (
              <div className="absolute bottom-6 right-6 z-10 bg-stone-200/80 backdrop-blur-sm px-3 py-1.5 rounded-xl text-center">
                <span className="block text-[10px] uppercase font-bold text-gray-600">Up to</span>
                <span className="block text-lg font-black text-gray-900">{largeBanner.discount}%</span>
              </div>
            )}
          </div>
        )}

        {/* Right Side Stacked Banners */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {smallBanners.slice(0, 2).map((banner, index) => {
            const hasOverlay = banner.showTitle || banner.showDescription;

            return (
              <div
                key={banner.id}
                className={`relative rounded-2xl overflow-hidden shadow-md h-[200px] sm:h-[200px] flex flex-col justify-between p-6 ${
                  index === 0 ? "bg-stone-800" : "bg-indigo-950"
                }`}
              >
                {banner.showImage && (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={getImageUrl(banner.image)}
                      alt={banner.title || "Banner"}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                )}

                {/* Dark tint overlay only if text is visible */}
                {hasOverlay && (
                  <div
                    className={`absolute inset-0 pointer-events-none ${
                      index === 0 ? "bg-black/40" : "bg-indigo-950/60"
                    }`}
                  />
                )}

                {index === 0 && banner.showDescription && (
                  <div className="relative z-10">
                    <span className="text-[11px] uppercase tracking-widest text-gray-200 font-medium block whitespace-pre-line">
                      {banner.subtitle}
                    </span>
                  </div>
                )}

                <div className="relative z-10 flex items-center justify-between mt-auto">
                  {banner.showTitle && (
                    <h3 className="text-white font-bold text-lg">{banner.title}</h3>
                  )}

                  {banner.showDescription && banner.discount && (
                    <span className="text-white font-black text-4xl sm:text-5xl tracking-tighter">
                      {banner.discount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default Banners;