import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";

let net = null;

// Map generic ImageNet classifications directly to typical apparel/fashion keywords
const FASHION_SYNONYM_MAP = {
  jersey: "shirt",
  sweatshirt: "shirt",
  cardigan: "sweater",
  cloak: "dress",
  gown: "dress",
  overskirt: "dress",
  kimono: "dress",
  abaya: "dress",
  sarong: "unstitched",
  stole: "shawl",
  suit: "suit",
  trench_coat: "coat",
  pajama: "trouser",
  sandal: "shoes",
  running_shoe: "shoes",
  sock: "accessories",
  boot: "shoes",
  jean: "jeans",
  wallet: "bag",
  purse: "bag",
};

export async function analyzeImage(imageElement) {
  if (!net) {
    net = await mobilenet.load({ version: 2, alpha: 1.0 });
  }

  // 1. Get raw model predictions
  const predictions = await net.classify(imageElement, 5);

  let detectedKeyword = "";

  if (predictions && predictions.length > 0) {
    for (const pred of predictions) {
      const label = pred.className.toLowerCase();
      
      // Match mapped keywords
      for (const [key, mappedWord] of Object.entries(FASHION_SYNONYM_MAP)) {
        if (label.includes(key)) {
          detectedKeyword = mappedWord;
          break;
        }
      }
      if (detectedKeyword) break;
    }

    // Fallback: If no fashion map hit, take first word of top prediction
    if (!detectedKeyword) {
      const topLabel = predictions[0].className.split(",")[0].trim().toLowerCase();
      // Clean generic noise
      detectedKeyword = topLabel.replace(/[^a-zA-Z\s]/g, "");
    }
  }

  // 2. Extract garment-centric color using HSL center sampling
  const dominantColor = extractGarmentColor(imageElement);

  return {
    keyword: detectedKeyword,
    color: dominantColor,
    rawPredictions: predictions,
  };
}

/**
 * Center-samples the garment and uses HSL to identify color accurately.
 */
// Exact palette definitions matching AVAILABLE_COLORS in CategorySidebar
const PALETTE = [
  { name: 'black',  r: 20,  g: 20,  b: 20  },
  { name: 'blue',   r: 37,  g: 99,  b: 235 },
  { name: 'navy',   r: 30,  g: 58,  b: 138 },
  { name: 'red',    r: 220, g: 38,  b: 38  },
  { name: 'maroon', r: 153, g: 27,  b: 27  },
  { name: 'green',  r: 22,  g: 163, b: 74  },
  { name: 'yellow', r: 250, g: 204, b: 21  },
  { name: 'pink',   r: 244, g: 114, b: 182 },
  { name: 'purple', r: 147, g: 51,  b: 234 },
  { name: 'gray',   r: 107, g: 114, b: 128 },
  { name: 'white',  r: 250, g: 250, b: 250 }
];

function extractGarmentColor(img) {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(img, 0, 0, 100, 100);

    // Sample the inner 60% of the image (focuses directly on the garment)
    const startX = 20;
    const startY = 20;
    const sampleWidth = 60;
    const sampleHeight = 60;

    const imgData = ctx.getImageData(startX, startY, sampleWidth, sampleHeight);
    const { data } = imgData;

    const votes = {};
    PALETTE.forEach(p => { votes[p.name] = 0; });

    let totalGarmentPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a < 128) continue; // Skip transparency

      // 1. Skip standard white/off-white studio photo backdrops
      if (r > 240 && g > 240 && b > 240) continue;

      // 2. Find the closest color in the palette using Euclidean distance
      let minDistance = Infinity;
      let closestColor = null;

      for (const color of PALETTE) {
        // Weighted Euclidean distance (adjusts for human eye sensitivity to R, G, B)
        const dR = r - color.r;
        const dG = g - color.g;
        const dB = b - color.b;
        const distance = 0.3 * (dR * dR) + 0.59 * (dG * dG) + 0.11 * (dB * dB);

        if (distance < minDistance) {
          minDistance = distance;
          closestColor = color.name;
        }
      }

      if (closestColor) {
        votes[closestColor]++;
        totalGarmentPixels++;
      }
    }

    if (totalGarmentPixels === 0) return null;

    // 3. Find the most dominant non-white color
    let topColor = null;
    let maxVotes = 0;

    for (const [colorName, count] of Object.entries(votes)) {
      if (colorName === "white") continue; // Avoid picking white backdrop remnants
      if (count > maxVotes) {
        maxVotes = count;
        topColor = colorName;
      }
    }

    // Require at least 15% of garment pixels to match that color
    if (topColor && maxVotes > totalGarmentPixels * 0.15) {
      return topColor;
    }

    return null;
  } catch (err) {
    console.error("Color classification error:", err);
    return null;
  }
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return [h, s * 100, l * 100];
}