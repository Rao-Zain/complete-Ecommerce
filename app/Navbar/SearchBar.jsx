"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaMicrophone, FaRegImage, FaLayerGroup } from "react-icons/fa";

export default function SearchBar({ onOpenImageSearch, onSelectResult }) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ categories: [], products: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const containerRef = useRef(null);

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ categories: [], products: [] });
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://stores.hexalogicx.com/api/live-search?query=${encodeURIComponent(searchQuery.trim())}`
        );
        const json = await res.json();
        const results = json?.data || json;

        setSearchResults({
          categories: Array.isArray(results?.categories) ? results.categories : [],
          products: Array.isArray(results?.products) ? results.products : [],
        });
        setShowDropdown(true);
      } catch (err) {
        console.error("Live search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Dismiss on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Form Submit -> ExploreProducts
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      if (onSelectResult) onSelectResult();
      router.push(`/ExploreProducts?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Voice Search handler
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);

      if (transcript.trim()) {
        setShowDropdown(false);
        if (onSelectResult) onSelectResult();
        router.push(`/ExploreProducts?search=${encodeURIComponent(transcript.trim())}`);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleItemClick = (url) => {
    setShowDropdown(false);
    setSearchQuery("");
    if (onSelectResult) onSelectResult();
    router.push(url);
  };

  const hasCategories = searchResults.categories?.length > 0;
  const hasProducts = searchResults.products?.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Pill Container with Green Glow Effect */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex items-center w-full h-[46px] sm:h-[50px] bg-white rounded-full border-2 border-[#10b981] shadow-[0_0_14px_rgba(16,185,129,0.38)] px-4 transition-all duration-300"
      >
        {/* Left Search Icon */}
        <FaSearch className="text-gray-400 text-sm shrink-0 mr-2.5" />

        {/* Text Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchQuery.trim() && (hasCategories || hasProducts)) {
              setShowDropdown(true);
            }
          }}
          placeholder="Search for products, brands and more..."
          className="w-full bg-transparent text-gray-800 text-xs sm:text-sm placeholder-gray-400 focus:outline-none pr-3"
        />

        {/* Right Icon Cluster */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          {/* Image Search Button */}
          <button
            type="button"
            onClick={onOpenImageSearch}
            title="Search by image"
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-0.5"
          >
            <FaRegImage className="text-base sm:text-lg" />
          </button>

          {/* Vertical Divider */}
          <span className="h-4 w-[1px] bg-gray-200" />

          {/* Microphone Voice Search Button */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            title={isListening ? "Listening... click to stop" : "Search by voice"}
            className={`transition cursor-pointer p-0.5 ${
              isListening ? "text-red-500 animate-pulse" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <FaMicrophone className="text-sm sm:text-base" />
          </button>

          {/* Circular Green Search Button */}
          <button
            type="submit"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#00c65e] hover:bg-[#00b053] text-white flex items-center justify-center transition-transform active:scale-95 shadow-sm cursor-pointer ml-1"
          >
            <FaSearch className="text-xs sm:text-sm" />
          </button>
        </div>
      </form>

      {/* Live Search Results Popup */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[200] max-h-[420px] overflow-y-auto">
          {isSearching && (
            <div className="p-4 text-center text-xs text-gray-400">Searching...</div>
          )}

          {!isSearching && !hasCategories && !hasProducts && (
            <div className="p-4 text-center text-xs text-gray-500">
              No matching results found for "{searchQuery}"
            </div>
          )}

          {/* Categories */}
          {hasCategories && (
            <div className="py-2 border-b border-gray-100">
              <span className="block px-4 py-1 text-[11px] font-bold tracking-wider uppercase text-gray-400">
                Categories
              </span>
              {searchResults.categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id || cat.slug}
                  onClick={() => handleItemClick(`/Categories/${cat.slug}`)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition"
                >
                  <FaLayerGroup className="text-gray-400 text-xs shrink-0" />
                  <span className="truncate">{cat.name || cat.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Products */}
          {hasProducts && (
            <div className="py-2">
              <span className="block px-4 py-1 text-[11px] font-bold tracking-wider uppercase text-gray-400">
                Products
              </span>
              {searchResults.products.map((prod) => (
                <button
                  type="button"
                  key={prod.id || prod.slug}
                  onClick={() => handleItemClick(`/Productdetail/${prod.slug}`)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition"
                >
                  <FaSearch className="text-gray-400 text-xs shrink-0" />
                  <span className="truncate">{prod.name || prod.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}