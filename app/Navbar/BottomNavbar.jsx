"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaBars, FaChevronDown, FaChevronRight } from "react-icons/fa";

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
    <div className="bg-white shadow-md hidden lg:block lg:sticky lg:top-0 z-20">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        {/* Flyout Category Menu */}
        <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={resetMenu}>
          <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2.5 w-64 h-9 bg-gray-100 text-gray-800 px-5">
            <FaBars className="text-sm" />
            <span className="font-semibold text-sm text-gray-900">All Categories</span>
            <FaChevronDown className="text-xs text-gray-500 ml-auto" />
          </button>

          <div className={`${isOpen ? "flex" : "hidden"} absolute left-0 top-full z-50 shadow-2xl`}>
            {/* Level 1 */}
            <div className="w-64 bg-white h-[420px] overflow-y-auto p-2 border border-gray-100">
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
              <div className="w-64 bg-white h-[420px] border-l border-gray-200 p-2 overflow-y-auto">
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
              <div className="w-64 bg-white h-[420px] border-l border-gray-200 p-2 overflow-y-auto">
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
        <div className="w-64 shrink-0" />
      </div>
    </div>
  );
};

export default BottomNavbar;