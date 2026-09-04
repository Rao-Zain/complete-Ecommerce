import Image from 'next/image';
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

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
  const data = await getFeaturedBanner();

  // API doesn't return a badge or a CTA link, so these stay static.
  const badge = "Special Selection";

  const heading = data?.name || "Discover Excellence in Every Detail";
  const description =
    data?.description ||
    "Our handpicked featured collection brings you unmatched quality, trendsetting designs, and everyday reliability. Upgrade your style and elevate your lifestyle today.";
  const buttonText = data?.button_name || "Explore Featured Range";
  const link = "#"; // no link field in the API response — update if you add one

  const bgImage = data?.image
    ? data.image.startsWith("http")
      ? data.image
      : `${IMAGE_BASE_URL}/${data.image}`
    : "/prse.jpg";

  return (
    <section
      className="relative w-full bg-zinc-900 bg-fixed bg-cover bg-center overflow-hidden py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/80 to-zinc-950/60 z-0"></div>

      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        <span
          className="text-white text-[11px] font-bold px-3 py-1 rounded uppercase tracking-wider mb-3 shadow-sm"
          style={{ backgroundColor: '#fe9900' }}
        >
          {badge}
        </span>

        <h2 className="text-xl sm:text-3xl md:text-5xl font-extrabold text-white/100 tracking-tight mb-1 sm:mb-4">
          {heading}
        </h2>

        <p className="text-gray-300 text-[11px] sm:text-sm md:text-base leading-relaxed mb-3 sm:mb-6 line-clamp-2 sm:line-clamp-none">
          {description}
        </p>

        <div className="mt-6">
          <a href={link}>
            <button className="bg-white hover:bg-gray-100 text-zinc-900 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition duration-300 transform hover:scale-105">
              <svg className="w-4 h-4 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {buttonText}
            </button>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Special;