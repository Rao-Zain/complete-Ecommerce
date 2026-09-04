import Productdetail from "./Productdetail";
import { API_BASE_URL } from "@/lib/config";

function stripHtml(html) {
    return (html || "").replace(/<[^>]*>/g, "").trim();
}

/**
 * Runs on the SERVER so the tab title/link-preview show the actual product
 * name, before the client component even starts fetching.
 */
export async function generateMetadata({ params }) {
    const { slug } = await params;

    try {
        const res = await fetch(`${API_BASE_URL}/api/product/${slug}`, {
            next: { revalidate: 60 },
        });
        const data = await res.json();
        const product = data?.data || data;

        if (!product?.name) {
            return { title: "Product | ShopNest" };
        }

        const plainDescription = stripHtml(product.description).slice(0, 155);

        return {
            title: `${product.name} | ShopNest`,
            description: plainDescription || `Shop ${product.name} on ShopNest.`,
        };
    } catch (err) {
        console.error("generateMetadata (Productdetail) error:", err);
        return { title: "Product | ShopNest" };
    }
}

export default function Page() {
    return <Productdetail />;
}