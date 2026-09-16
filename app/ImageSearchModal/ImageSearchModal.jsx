"use client";

import { useState, useRef, useEffect } from "react";
import { FaTimes, FaCloudUploadAlt, FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { analyzeImage } from "@/lib/clientImageSearch";
export default function ImageSearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Handle Clipboard Paste (Ctrl+V) anywhere when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) handleImageFile(file);
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleImageFile = (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload & Search immediately
    searchWithImage(file);
  };



// Replace your old searchWithImage with this:
const searchWithImage = async (file) => {
  setLoading(true);
  setError("");

  try {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const analysis = await analyzeImage(img);

    onClose();
    setPreview(null);

    const queryParams = new URLSearchParams();

    // If a fashion keyword was resolved
    if (analysis.keyword) {
      queryParams.set("search", analysis.keyword);
    }

    // If a dominant color was detected, append both cases or match your DB standard
 if (analysis.color) {
  queryParams.append("color[]", analysis.color.toLowerCase());
}

const targetUrl = `/ExploreProducts?${queryParams.toString()}`;

onClose();
setPreview(null);

// If already on ExploreProducts, force Next.js router transition
if (window.location.pathname.includes("/ExploreProducts")) {
  router.replace(targetUrl);
} else {
  router.push(targetUrl);
}

router.push(`/ExploreProducts?${queryParams.toString()}`);
  } catch (err) {
    console.error("Client vision search failed:", err);
    setError("Could not analyze image.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white text-gray-800 rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg p-6 relative">
        {/* Close Button */}
        <button
          onClick={() => {
            onClose();
            setPreview(null);
            setError("");
          }}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition p-1 cursor-pointer"
        >
          <FaTimes className="text-lg" />
        </button>

        {/* Modal Title */}
        <div className="text-center mb-5">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">
            Search by Image
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Upload, drag and drop, or paste (<kbd className="bg-gray-100 px-1 py-0.5 rounded text-[10px] font-mono border">Ctrl+V</kbd>) an image to find similar products
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Dropzone Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition min-h-[220px] ${
            dragActive
              ? "border-emerald-500 bg-emerald-50/40"
              : "border-gray-300 hover:border-gray-400 bg-gray-50/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <FaSpinner className="text-3xl text-emerald-600 animate-spin" />
              <p className="text-xs font-semibold text-gray-700">
                Analyzing image & finding products...
              </p>
            </div>
          ) : preview ? (
            <div className="relative flex flex-col items-center gap-2">
              <img
                src={preview}
                alt="Upload preview"
                className="max-h-36 rounded-lg object-contain border border-gray-200 shadow-sm"
              />
              <span className="text-xs text-gray-500 underline">
                Click or drop another image to replace
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mb-3">
                <FaCloudUploadAlt className="text-2xl" />
              </div>
              <p className="text-sm font-semibold text-gray-800">
                Drag and drop your image here
              </p>
              <p className="text-xs text-gray-400 mt-1">or click to browse from computer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}