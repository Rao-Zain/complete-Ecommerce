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

      const url = `${API_BASE_URL}/api/cancel-order/${id}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(`Server ne invalid response diya (status ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(result?.message || `Server returned status ${response.status}`);
      }

      if (result?.success === false) {
        throw new Error(result?.message || "Order cancel nahi ho saka");
      }

      setOrderData((prev) => ({
        ...prev,
        status: "Cancelled",
      }));

      Swal.fire({
        title: "Cancelled!",
        text: "Order successfully cancel ho gaya.",
        icon: "success",
        confirmButtonColor: "#10b981",
      });
    } catch (err) {
      console.error("Error cancelling order:", err);
      const friendlyMsg =
        err.message === "Failed to fetch"
          ? "Server tak connection nahi ho saka. URL ya CORS setting check karein."
          : err.message;

      setCancelError(friendlyMsg);

      Swal.fire({
        title: "Error!",
        text: `Order cancel karte waqt error aayi: ${friendlyMsg}`,
        icon: "error",
        confirmButtonColor: "#f43f5e",
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <p className="text-gray-500 font-medium">Loading order details...</p>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center space-y-4">
        <p className="text-rose-600 font-medium">Error: {error || "Order not found"}</p>
        <button
          onClick={() => router.push('/order')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition cursor-pointer"
        >
          <ArrowLeft size={20} /> Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="container px-4 mx-auto sm:px-6 lg:px-10 space-y-6">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition cursor-pointer"
        >
          <ArrowLeft size={20} /> Back to Orders
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Order #{orderData.orderId}
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              📦 {orderData.placedDate}
            </p>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-600 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {orderData.status}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-4">
            📦 Order Items ({orderData.items.length})
          </h2>

          <div className="space-y-6">
            {orderData.items.map((item, index) => (
              <div
                key={item.id || index}
                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                  index !== orderData.items.length - 1 ? "border-b border-gray-200 pb-6" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultPic;
                    }}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-gray-100"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.name}
                    </h3>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-md font-medium">
                        Color: {item.color}
                      </span>
                      <span className="bg-purple-50 text-purple-600 text-xs px-2.5 py-1 rounded-md font-medium">
                        Size: {item.size}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-2 flex-wrap">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">
                        Quantity: {item.quantity}
                      </span>
                      <span>{item.priceEach} each</span>
                    </div>

                    {item.reviewed && (
                      <span className="text-xs text-emerald-600 flex items-center gap-1 mt-2 font-medium">
                        <CheckCircle2 size={14} /> Reviewed
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right w-full sm:w-auto">
                  <h4 className="text-xl font-bold text-emerald-600">
                    {item.totalPrice}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
            <span className="font-bold text-gray-800 text-base">Grand Total</span>
            <span className="text-xl font-extrabold text-emerald-600">
              {orderData.grandTotal}
            </span>
          </div>

          {orderData.status?.toLowerCase() === "pending" && (
            <div className="flex justify-end">
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                {cancelling ? (
                  "Cancelling..."
                ) : (
                  <>
                    &times; Cancel Order
                  </>
                )}
              </button>
            </div>
          )}

          {cancelError && (
            <p className="text-xs text-rose-600 text-right">{cancelError}</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default function Page() {
    return <OrderDetail />;
}