"use client";

import React, { useState } from "react";
import {
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
    FaPaperPlane,
} from "react-icons/fa";

const Contact = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Submitted:", form);
        alert("Message sent successfully!");
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 py-10">
            {/* Main Wrapper Container */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

                {/* Page Heading */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
                        Contact Us
                    </h1>
                    <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm">
                        We'd love to hear from you. Send us a message.
                    </p>
                </div>

                {/* Grid Layout */}
                <div className="grid lg:grid-cols-5 gap-8">

                    {/* Left Side: Contact Information & Map */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                            <h3 className="text-xl font-bold mb-6 text-gray-800">
                                Contact Information
                            </h3>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-red-100 flex justify-center items-center text-red-600 shrink-0">
                                        <FaMapMarkerAlt className="text-sm" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-800">Location</h4>
                                        <p className="text-gray-500 text-xs">
                                            Lodhran, Punjab, Pakistan
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex justify-center items-center text-green-600 shrink-0">
                                        <FaPhoneAlt className="text-sm" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-800">Phone</h4>
                                        <p className="text-gray-500 text-xs">
                                            +92 300 1234567
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex justify-center items-center text-blue-600 shrink-0">
                                        <FaEnvelope className="text-sm" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-800">Email</h4>
                                        <p className="text-gray-500 text-xs">
                                            info@example.com
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Google Map Container */}
                        <div className="rounded-2xl overflow-hidden shadow-lg bg-white p-2">
                            <iframe
                                title="map"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456!2d71.63!3d29.71!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3ALodhran!2sLodhran%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                                className="w-full h-60 rounded-xl border-0"
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>

                    {/* Right Side: Message Form */}
                    <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800">
                            Send Message
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Name Field */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={form.name}
                                        placeholder=" "
                                        onChange={handleChange}
                                        required
                                        className="peer w-full text-gray-800 border border-gray-300 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 bg-transparent"
                                    />
                                    <label
                                        htmlFor="name"
                                        className="absolute left-3 -top-2.5 bg-white px-1.5 text-gray-500 text-xs transition-all duration-200 
                                        peer-placeholder-shown:top-3.5 
                                        peer-placeholder-shown:text-sm 
                                        peer-placeholder-shown:text-gray-400
                                        peer-placeholder-shown:bg-transparent
                                        peer-focus:-top-2.5 
                                        peer-focus:text-xs 
                                        peer-focus:text-green-600
                                        peer-focus:bg-white"
                                    >
                                        Name
                                    </label>
                                </div>

                                {/* Email Field */}
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={form.email}
                                        placeholder=" "
                                        onChange={handleChange}
                                        required
                                        className="peer w-full text-gray-800 border border-gray-300 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 bg-transparent"
                                    />
                                    <label
                                        htmlFor="email"
                                        className="absolute left-3 -top-2.5 bg-white px-1.5 text-gray-500 text-xs transition-all duration-200 
                                        peer-placeholder-shown:top-3.5 
                                        peer-placeholder-shown:text-sm 
                                        peer-placeholder-shown:text-gray-400
                                        peer-placeholder-shown:bg-transparent
                                        peer-focus:-top-2.5 
                                        peer-focus:text-xs 
                                        peer-focus:text-green-600
                                        peer-focus:bg-white"
                                    >
                                        Email
                                    </label>
                                </div>
                            </div>

                            {/* Subject Field */}
                            <div className="relative">
                                <input
                                    type="text"
                                    name="subject"
                                    id="subject"
                                    value={form.subject}
                                    placeholder=" "
                                    onChange={handleChange}
                                    required
                                    className="peer w-full text-gray-800 border border-gray-300 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 bg-transparent"
                                />
                                <label
                                    htmlFor="subject"
                                    className="absolute left-3 -top-2.5 bg-white px-1.5 text-gray-500 text-xs transition-all duration-200 
                                    peer-placeholder-shown:top-3.5 
                                    peer-placeholder-shown:text-sm 
                                    peer-placeholder-shown:text-gray-400
                                    peer-placeholder-shown:bg-transparent
                                    peer-focus:-top-2.5 
                                    peer-focus:text-xs 
                                    peer-focus:text-green-600
                                    peer-focus:bg-white"
                                >
                                    Subject
                                </label>
                            </div>

                            {/* Message Field */}
                            <div className="relative">
                                <textarea
                                    name="message"
                                    id="message"
                                    rows="4"
                                    value={form.message}
                                    placeholder=" "
                                    onChange={handleChange}
                                    required
                                    className="peer w-full text-gray-800 border border-gray-300 rounded-xl px-4 pt-4 pb-2 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 resize-none bg-transparent"
                                ></textarea>
                                <label
                                    htmlFor="message"
                                    className="absolute left-3 -top-2.5 bg-white px-1.5 text-gray-500 text-xs transition-all duration-200 
                                    peer-placeholder-shown:top-3.5 
                                    peer-placeholder-shown:text-sm 
                                    peer-placeholder-shown:text-gray-400
                                    peer-placeholder-shown:bg-transparent
                                    peer-focus:-top-2.5 
                                    peer-focus:text-xs 
                                    peer-focus:text-green-600
                                    peer-focus:bg-white"
                                >
                                    Message
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="bg-[#00A651] hover:bg-green-700 text-white px-8 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 duration-300 cursor-pointer font-medium w-full sm:w-auto shadow-md"
                            >
                                <FaPaperPlane className="text-xs" />
                                Send Message
                            </button>
                        </form>
                    </div>

                </div>

            </div>
        </main>
    );
};

export default Contact;