import ExploreProducts from "./ExploreProducts";
import { API_BASE_URL } from "@/lib/config";

// Walks the category tree to find the node matching `slug`, at any depth.
const findNodeBySlug = (categories, slug) => {
    for (const cat of categories || []) {
        if (cat.slug === slug) return cat;
        const children = cat.all_children || cat.children || [];
        if (children.length > 0) {
            const found = findNodeBySlug(children, slug);
            if (found) return found;
        }
    }
    return null;
};

/**
 * Runs on the SERVER before the page is sent to the browser — this is what
 * lets search engines and shared-link previews see the correct title, and
 * avoids the "flash of generic title" you'd get from setting document.title
 * client-side after the page has already loaded.
 */
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const pathSegments = slug || [];

    if (pathSegments.length === 0) {
        return {
            title: "Explore Products | ShopNest",
            description: "Browse and filter all products on ShopNest by category, price, color, size, and brand.",
        };
    }

    try {
        const categoryPath = pathSegments.join('/');
        const currentSlug = pathSegments[pathSegments.length - 1];

        const res = await fetch(`${API_BASE_URL}/api/category-sidebar/${categoryPath}`, {
            next: { revalidate: 60 },
        });
        const data = await res.json();
        const node = findNodeBySlug(data?.categories, currentSlug);

        return {
            title: node?.name ? `${node.name} Products | ShopNest` : "Explore Products | ShopNest",
            description: node?.name
                ? `Filter and shop ${node.name} products by price, color, size, and brand on ShopNest.`
                : "Browse and filter all products on ShopNest.",
        };
    } catch (err) {
        console.error("generateMetadata (ExploreProducts) error:", err);
        return { title: "Explore Products | ShopNest" };
    }
}

export default function Page() {
    return <ExploreProducts />;
}