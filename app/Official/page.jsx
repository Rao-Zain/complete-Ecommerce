import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

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
  const data = await getBrandBanner();

  const heading = data?.name || "Shop Premium Brands You Trust";
  const description =
    data?.description ||
    "Explore products directly sourced from top-rated industry leaders. Guaranteed authenticity, premium build, and exclusive collection updates waiting just for you.";
  const buttonText = data?.button_name || "Explore All Brands";

  const bgImage = data?.image
    ? data.image.startsWith("http")
      ? data.image
      : `${IMAGE_BASE_URL}/${data.image}`
    : "/girls.jpg";

  return (
    <section className="relative w-full bg-[#111827] overflow-hidden py-10 sm:py-14 px-6 sm:px-10 lg:px-16">
      {/* Background Image with Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed opacity-70 z-0"
        style={{ backgroundImage: `url('${bgImage}')` }}
      ></div>

      {/* Dark Gradient Overlay to match screenshot depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f17] via-[#0b0f17]/90 to-transparent z-10"></div>

      {/* Content Container (Left Aligned as per screenshot) */}
      <div className="relative z-20 max-w-7xl mx-auto flex flex-col items-start text-left">

        {/* Official Partner Badge */}
        <div className="inline-flex items-center gap-1.5 bg-red-950/60 border border-red-900/50 text-red-400 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
          <span>👑</span>
          <span>Official Partner Showcase</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-xl">
          {heading}
        </h1>

        {/* Description Paragraph */}
        <p className="text-gray-300 text-xs sm:text-sm mt-2 max-w-lg leading-relaxed">
          {description}
        </p>

        {/* Call to Action Button */}
        <div className="mt-5">
          <button className="bg-white hover:bg-gray-100 text-zinc-900 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition duration-300 transform hover:scale-105">
            {buttonText}
            <svg className="w-4 h-4 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
}

export default Official;