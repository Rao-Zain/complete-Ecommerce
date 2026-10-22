"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaBars, FaChevronDown, FaChevronRight } from "react-icons/fa";

/**
 * Dropdown height = Hero slider height (same aspect-ratio logic)
 * ---------------------------------------------------------------------------
 * Hero.jsx sizes the slider with:  md:aspect-[4/1]   ->  height = width / 4
 * The dropdown is only visible from `lg` up, so that 4:1 ratio is the one
 * that applies, and the slider is full width.
 *
 * We use the same ratio here. `100cqw` = 100% of the width of the nearest
 * container (the navbar bar below is marked as a container), which is the same
 * width the full-width slider has. So:
 *
 *   dropdown height = 100cqw / 4  +  DD_GAP
 *
 * DD_GAP is the bar's bottom padding (py-2 = 0.5rem). The dropdown opens from the
 * bottom of the button, that far above the slider's top edge, so adding it makes
 * the bottoms line up exactly.
 *
 * Keep HERO_RATIO in sync with the ratio used in Hero.jsx at `md` and above.
 */
const HERO_RATIO = 4; // width / height  (Hero: md:aspect-[4/1])
const DD_GAP = "0.5rem"; // bar's bottom padding (py-2)

const DD_STYLE = {
  "--dd-w": "16rem",
  "--dd-h": `calc(100cqw / ${HERO_RATIO} + ${DD_GAP})`,
};

const BottomNavbar = ({ categoriesData, loading }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeMain, setActiveMain] = useState(null);
  const [activeSub, setActiveSub] = useState(null);

  const resetMenu = () => {
    setIsOpen(false);
    setActiveMain(null);
    setActiveSub(null);
  };

  const activeMainCat = categoriesData.find((c) => c.id === activeMain);
  const activeSubCat = activeMainCat?.children?.find((s) => s.id === activeSub);
  const quickLinkCategories = categoriesData.slice(0, 4);

  return (
    <div className="bg-white shadow-md hidden lg:block lg:sticky lg:top-0 z-20 [container-type:inline-size]">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        {/* Flyout Category Menu */}
        <div
          className="relative"
          style={DD_STYLE}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={resetMenu}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2.5 w-[var(--dd-w)] h-9 bg-gray-100 text-gray-800 px-5"
          >
            <FaBars className="text-sm" />
            <span className="font-semibold text-sm text-gray-900">All Categories</span>
            <FaChevronDown className="text-xs text-gray-500 ml-auto" />
          </button>

          <div className={`${isOpen ? "flex" : "hidden"} absolute left-0 top-full z-50 shadow-2xl`}>
            {/* Level 1 */}
            <div className="w-[var(--dd-w)] shrink-0 bg-white h-[var(--dd-h)] overflow-y-auto custom-scrollbar p-2 border border-gray-100">
              {loading && categoriesData.length === 0 ? (
                <div className="p-4 text-xs text-gray-500 text-center">Loading...</div>
              ) : (
                <ul className="space-y-0.5">
                  {categoriesData.map((mainCat) => (
                    <li key={mainCat.id}>
                      <div
                        onMouseEnter={() => { setActiveMain(mainCat.id); setActiveSub(null); }}
                        onClick={() => { resetMenu(); router.push(`/Categories/${mainCat.slug}`); }}
                        className={`flex items-center justify-between py-2 px-3 rounded-md cursor-pointer text-gray-700 hover:bg-gray-50 ${activeMain === mainCat.id ? "bg-blue-50 text-blue-600" : ""}`}
                      >
                        <span className="text-sm font-semibold">{mainCat.name}</span>
                        {mainCat.children?.length > 0 && <FaChevronRight className="text-xs text-gray-400" />}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Level 2 */}
            {activeMainCat?.children?.length > 0 && (
              <div className="w-[var(--dd-w)] shrink-0 bg-white h-[var(--dd-h)] border-l border-gray-200 p-2 overflow-y-auto custom-scrollbar">
                <ul className="space-y-0.5">
                  {activeMainCat.children.map((subCat) => (
                    <li key={subCat.id}>
                      <div
                        onMouseEnter={() => setActiveSub(subCat.id)}
                        className={`flex items-center justify-between py-2 px-3 rounded-md cursor-pointer text-gray-700 hover:bg-gray-50 ${activeSub === subCat.id ? "bg-blue-50 text-blue-600" : ""}`}
                      >
                        <Link href={`/Categories/${activeMainCat.slug}/${subCat.slug}`} onClick={resetMenu} className="text-sm font-semibold flex-1">
                          {subCat.name}
                        </Link>
                        {subCat.children?.length > 0 && <FaChevronRight className="text-xs text-gray-400" />}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Level 3 */}
            {activeSubCat?.children?.length > 0 && (
              <div className="w-[var(--dd-w)] shrink-0 bg-white h-[var(--dd-h)] border-l border-gray-200 p-2 overflow-y-auto custom-scrollbar">
                <ul className="space-y-0.5">
                  {activeSubCat.children.map((childCat) => (
                    <li key={childCat.id}>
                      <Link
                        href={`/ExploreProducts/${activeMainCat.slug}/${activeSubCat.slug}/${childCat.slug}`}
                        onClick={resetMenu}
                        className="block py-2 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        {childCat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-8 text-sm font-semibold text-gray-800 mx-auto min-h-[24px]">
          <Link href="/Products" className="hover:text-green-600 transition whitespace-nowrap ms-6">All Products</Link>
          <Link href="/ExploreProducts" className="hover:text-green-600 transition whitespace-nowrap">Categories</Link>
          {quickLinkCategories.length > 0 ? (
            quickLinkCategories.map((cat) => (
              <Link key={cat.id} href={`/Categories/${cat.slug}`} className="hover:text-green-600 transition whitespace-nowrap">
                {cat.name}
              </Link>
            ))
          ) : (
            <div className="flex items-center gap-8 animate-pulse">
              <div className="h-3.5 w-24 bg-gray-200 rounded-full" />
              <div className="h-3.5 w-28 bg-gray-200 rounded-full" />
            </div>
          )}
        </div>
        <div className="w-[var(--dd-w)] shrink-0" />
      </div>

      {/* Thin, light scrollbar for the dropdown panels (matches reference site) */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        /* Firefox (Chrome/Edge/Safari use the rules above) */
        @supports not selector(::-webkit-scrollbar) {
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #d1d5db #f3f4f6;
          }
        }
      `}</style>
    </div>
  );
};

export default BottomNavbar;