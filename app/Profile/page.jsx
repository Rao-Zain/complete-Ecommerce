"use client";

import React, { useState, useEffect } from 'react';
import { User, Lock, Camera, Check, ShieldCheck, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Profile = () => {
  // --- Profile Info States ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [loading, setLoading] = useState(true);

  // --- Password States ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch profile data from API on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('http://192.168.1.2:8008/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const data = await response.json();
        
        // Assume API returns fields like name, email, phone, shippingAddress, profilePic
        setName(data.name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setShippingAddress(data.shippingAddress || '');
        setProfilePic(data.profilePic || '');
      } catch (error) {
        console.error(error);
        toast.error('Failed to load profile data from server');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // --- Handlers ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://192.168.1.2:8008/api/profile/2', {
        method: 'PUT', // ya 'PATCH' jo bhi aapki API support kare
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          shippingAddress,
          profilePic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Profile information updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Error updating profile!');
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    toast.success('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePic(imageUrl);
      toast.success('Profile picture updated!');
    }
  };

  const handleRemoveImage = () => {
    setProfilePic('');
    toast.success('Profile picture removed!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Toaster position="top-right" />

      <div className="container px-4 mx-auto sm:px-6 lg:px-10 space-y-6">

        {/* Page Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal information, phone, address, and account security.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* LEFT 2 COLUMNS: Personal Information Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            {/* Section Header */}
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                <p className="text-xs text-gray-400">Update your profile details and account information</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">

              {/* Profile Picture Upload Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 shadow-sm">
                      <User size={32} />
                    </div>
                  )}

                  {/* Camera Icon Button */}
                  <label className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-all">
                    <Camera size={14} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>

                  {/* Cross (Remove) Icon Button */}
                  {profilePic && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full cursor-pointer shadow-md transition-all"
                      title="Remove Image"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Profile Picture</h3>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, or WEBP, Max size 2MB</p>
                </div>
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-800 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all text-sm"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-800 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all text-sm"
                  />
                </div>

                {/* Phone No */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-800 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all text-sm"
                  />
                </div>

                {/* Shipping Address */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Shipping Address</label>
                  <textarea
                    rows="3"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-800 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all text-sm resize-none"
                  />
                </div>

              </div>

              {/* Save Information Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-[#009e52] hover:bg-[#008644] text-white font-medium px-6 py-3 rounded-xl shadow-sm transition-all flex items-center space-x-2 text-sm cursor-pointer"
                >
                  <Check size={16} />
                  <span>Save Information</span>
                </button>
              </div>

            </form>
          </div>

          {/* RIGHT 1 COLUMN: Change Password Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            {/* Section Header */}
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
                <p className="text-xs text-gray-400">Keep your account secure</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-800 focus:bg-white focus:border-gray-800 focus:ring-1 focus:ring-gray-800 outline-none transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-800 focus:bg-white focus:border-gray-800 focus:ring-1 focus:ring-gray-800 outline-none transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-800 focus:bg-white focus:border-gray-800 focus:ring-1 focus:ring-gray-800 outline-none transition-all text-sm"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#111827] hover:bg-black text-white font-medium py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
                >
                  <ShieldCheck size={16} />
                  <span>Update Password</span>
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;