import Image from 'next/image';
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

async function getBanners() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/banner/main`, {
      // har 60 seconds baad revalidate ho, ya cache: 'no-store' bhi kar sakte hain
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

// API se "40% OFF" jaisi description string se sirf number nikalne k liye
function extractDiscount(description) {
  if (!description) return null;
  const match = description.match(/(\d+)\s*%/);
  return match ? match[1] : null;
}

async function Banners() {
  const rawBanners = await getBanners();

  // API response ko sort_order k hisab se sort kar dein taake order guaranteed rahe
  const sortedBanners = [...rawBanners].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  // API koi "position" field nahi deti, is liye sort_order k basis par
  // pehla banner "large" aur agle do "small" maan k chalte hain
  const apiLarge = sortedBanners[0];
  const apiSmall = sortedBanners.slice(1, 3);

  const largeBanner = apiLarge
    ? {
        id: apiLarge.id,
        title: apiLarge.name,
        subtitle: apiLarge.description,
        discount: extractDiscount(apiLarge.description),
        image: apiLarge.image,
        buttonText: apiLarge.buttonText, // API abhi ye field nahi deti, undefined rahega
        link: apiLarge.link,
      }
    : {
        id: "fallback-large",
        title: "Summer Collection",
        subtitle: "Up to 50% OFF",
        discount: "70",
        image: "/img7.jfif",
        buttonText: "Shop Now",
      };

  const fallbackSmall = [
    {
      id: "fallback-small-1",
      title: "New Arrival",
      subtitle: "Dress, Pouch, Hat, Sandals",
      discount: "40",
      image: "/banners/1788430203_1721825245.png",
    },
    {
      id: "fallback-small-2",
      title: "Exclusive Deals",
      image: "/banners/1788430306_1721825269.png",
    },
  ];

  // API field names (name/description) ko component ke expected shape (title/subtitle) mein map karo
  const largeBanner = banners[0]
    ? {
        id: banners[0].id,
        title: banners[0].name,
        subtitle: banners[0].description,
        discount: extractDiscount(banners[0].description),
        image: banners[0].image,
        buttonText: banners[0].buttonText ?? null,
        link: banners[0].link ?? null,
      }
    : fallbackLarge;

  const smallBanners =
    apiSmall.length > 0
      ? apiSmall.map((b) => ({
          id: b.id,
          title: b.name,
          subtitle: b.description,
          discount: extractDiscount(b.description),
          image: b.image,
        }))
      : fallbackSmall;

  // Image path build karne ka helper — agar image already full URL hai tou wahi use ho,
  // warna IMAGE_BASE_URL k sath jor dein
  const getImageUrl = (path) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http")) return path;
    return `${IMAGE_BASE_URL}${path}`;
  };

  return (
    <section className="container mx-auto py-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Left Big Banner */}
        <div className="lg:col-span-6 relative rounded-2xl overflow-hidden shadow-md h-[300px] sm:h-[415px] flex flex-col justify-end p-6 sm:p-8 bg-stone-300">
          <div className="absolute inset-0 z-0">
            <Image
              src={getImageUrl(largeBanner.image)}
              alt={largeBanner.title || "Banner"}
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-start pl-4 pointer-events-none select-none overflow-hidden opacity-25">
            <span className="text-[140px] sm:text-[180px] font-serif font-black tracking-tighter text-white">
              Sale
            </span>
          </div>

          <div className="relative z-10">
            <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
              {largeBanner.title}
            </h2>
            {largeBanner.subtitle && (
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

          {largeBanner.discount && (
            <div className="absolute bottom-6 right-6 z-10 bg-stone-200/80 backdrop-blur-sm px-3 py-1.5 rounded-xl text-center">
              <span className="block text-[10px] uppercase font-bold text-gray-600">Up to</span>
              <span className="block text-lg font-black text-gray-900">{largeBanner.discount}%</span>
            </div>
          )}
        </div>

        {/* Right Side Stacked Banners */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {smallBanners.slice(0, 2).map((banner, index) => (
            <div
              key={banner.id}
              className={`relative rounded-2xl overflow-hidden shadow-md h-[200px] sm:h-[200px] flex flex-col justify-between p-6 ${
                index === 0 ? "bg-stone-800" : "bg-indigo-950"
              }`}
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src={getImageUrl(banner.image)}
                  alt={banner.title || "Banner"}
                  fill
                  className="object-cover object-center"
                />
                <div
                  className={`absolute inset-0 ${
                    index === 0 ? "bg-black/40" : "bg-indigo-950/60"
                  }`}
                ></div>
              </div>

              {index === 0 && banner.subtitle && (
                <div className="relative z-10">
                  <span className="text-[11px] uppercase tracking-widest text-gray-200 font-medium block whitespace-pre-line">
                    {banner.subtitle}
                  </span>
                </div>
              )}

              {index === 1 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-20">
                  <span className="text-[100px] sm:text-[120px] font-black tracking-widest text-white">
                    {/* SALE */}
                  </span>
                </div>
              )}

              <div className="relative z-10 flex items-center justify-between mt-auto">
                <h3 className="text-white font-bold text-lg">{banner.title}</h3>
                {banner.discount && (
                  <span className="text-white font-black text-4xl sm:text-5xl tracking-tighter">
                    {banner.discount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Banners;