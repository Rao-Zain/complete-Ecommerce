import Categories from "./Categories";
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
 * This runs on the SERVER before the page is sent to the browser, which is
 * what makes the title/description show up correctly for search engines
 * and link previews (unlike setting document.title client-side, which
 * only updates after the page has already loaded).
 */
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const pathSegments = slug || [];
    const currentSlug = pathSegments[pathSegments.length - 1];

    if (!currentSlug) {
        return {
            title: "All Categories | ShopNest",
            description: "Browse all categories on ShopNest and discover the best products across fashion, home, and lifestyle.",
        };
    }

    try {
        const categoryPath = pathSegments.join('/');
        const res = await fetch(`${API_BASE_URL}/api/category-sidebar/${categoryPath}`, {
            next: { revalidate: 60 }, // cache 60s so this doesn't hit the API on every request
        });
        const data = await res.json();
        const node = findNodeBySlug(data?.categories, currentSlug);

        return {
            title: node?.name ? `${node.name} | ShopNest` : "Categories | ShopNest",
            description: node?.name
                ? `Shop the latest ${node.name} products on ShopNest.`
                : "Browse categories on ShopNest.",
        };
    } catch (err) {
        console.error("generateMetadata (Categories) error:", err);
        return { title: "Categories | ShopNest" };
    }
}

export default function Page() {
    return <Categories />;
}