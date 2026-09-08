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
        <section className="container mx-auto px-3 sm:px-4 mb-2">
            <div className="">
                <div className="mb-3 mt-2">
                    {/* Top Row: Icon Badge + Heading */}
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center text-green-600 border border-green-100 shadow-sm mt-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                        <h2 className="text-xl sm:text-2xl mt-1 sm:mt-2 font-bold text-gray-900 flex items-center gap-2">
                            Our Services
                        </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">
                        We provide the best features and benefits for your shopping experience
                    </p>
                </div>

                {/* Main Box */}
                <div className="flex flex-col lg:flex-row justify-around items-center bg-white border border-gray-200 py-3 lg:py-8 px-4 sm:px-6 rounded-lg shadow-sm divide-y divide-gray-100 lg:divide-y-0">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        const isLast = index === services.length - 1;
                        return (
                            <div
                                key={index}
                                className={`flex items-center justify-start py-4 lg:py-0 pl-2 lg:pl-0 lg:justify-center flex-1 p-3 w-full lg:w-auto relative ${!isLast
                                        ? "lg:after:content-[''] lg:after:absolute lg:after:right-0 lg:after:top-1/2 lg:after:-translate-y-1/2 lg:after:h-10 lg:after:w-[1px] lg:after:bg-green-600"
                                        : ""
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className="mr-4 text-green-600 shrink-0 bg-green-50 p-2 lg:bg-transparent lg:p-0 rounded-lg">
                                        <Icon className="w-7 h-7 lg:w-8 lg:h-8" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900 mb-0.5">
                                            {service.title}
                                        </h3>
                                        <p className="text-xs text-gray-500">{service.subtitle}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Services;