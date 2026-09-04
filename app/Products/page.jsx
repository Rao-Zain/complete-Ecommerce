import Products from "./Products";

// Static metadata — this page doesn't depend on a route param, so no
// generateMetadata()/fetch is needed, just a plain exported object.
export const metadata = {
    title: "All Products | ShopNest",
    description: "Browse our full catalog of products on ShopNest — the best picks across every category.",
};

export default function Page() {
    return <Products />;
}