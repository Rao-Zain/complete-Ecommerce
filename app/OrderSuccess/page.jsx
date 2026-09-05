import OrderSuccess from "./OrderSuccess";

export async function generateMetadata({ searchParams }) {
    const params = await searchParams;
    const orderId = params?.order;

    return {
        title: orderId
            ? `Order #${orderId} Confirmed | ShopNest`
            : "Order Confirmed | ShopNest",
        description: "Your order has been placed successfully on ShopNest.",
    };
}

export default function Page() {
    return <OrderSuccess />;
}