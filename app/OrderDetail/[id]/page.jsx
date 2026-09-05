import OrderDetail from "./OrderDetail.jsx";
import { API_BASE_URL } from "@/lib/config";

export async function generateMetadata({ params }) {
    const { id } = await params;

    try {
        const res = await fetch(`${API_BASE_URL}/api/orders-detail/${id}`, {
            headers: { Accept: "application/json" },
        });
        const data = await res.json();
        const order = data?.data || data?.order || data;
        const orderNumber = order?.order_number || id;

        return {
            title: `Order #${orderNumber} | ShopNest`,
            description: `Details for order #${orderNumber} on ShopNest.`,
        };
    } catch (err) {
        console.error("generateMetadata (OrderDetail) error:", err);
        return {
            title: `Order #${id} | ShopNest`,
        };
    }
}

export default function Page() {
    return <OrderDetail />;
}