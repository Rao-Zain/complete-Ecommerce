"use client";

import { Truck, RotateCcw, CreditCard, MessageCircle } from "lucide-react";

const services = [
    {
        icon: Truck,
        title: "Free Delivery",
        subtitle: "For all orders over PKR6999",
    },
    {
        icon: RotateCcw,
        title: "15 Days Return",
        subtitle: "If goods have problems",
    },
    {
        icon: CreditCard,
        title: "Secure Payment",
        subtitle: "100% secure payment",
    },
    {
        icon: MessageCircle,
        title: "24/7 Support",
        subtitle: "Dedicated support",
    },
];

const Services = () => {
    return (
        <div className="container mx-auto px-3 sm:px-6 md:px-7 py-6">
            {/* Heading */}
            <div className="mb-4">
                <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900">
                    <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                    </svg>
                    Our Services
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    We provide the best features and benefits for your shopping experience
                </p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-5 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 lg:gap-y-0 lg:divide-x lg:divide-green-600">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <div 
                                key={index} 
                                className={`flex items-center lg:px-6 first:pl-0 last:pr-0`}
                            >
                                <div className="flex items-center gap-3 sm:gap-4 w-full">
                                    <Icon
                                        className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 flex-shrink-0"
                                        strokeWidth={1.5}
                                    />
                                    <div>
                                        <h4 className="font-semibold text-sm sm:text-base text-gray-900">
                                            {service.title}
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                            {service.subtitle}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Services;