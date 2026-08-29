"use client";

import React, { useState, useEffect } from 'react';
import { User, Lock, Camera, Check, ShieldCheck, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

const Profile = () => {
  // --- Profile Info States ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [profilePicFile, setProfilePicFile] = useState(null);

  // --- Password States ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- Password Field Error States ---
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Helper function to get headers with Bearer Token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
  
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  // Helper to get logged-in user ID securely from localStorage
  const getUserId = () => {
    return localStorage.getItem('userId');
  };

  const resolveImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
      return path;
    }
    return `${IMAGE_BASE_URL}/${path}`;
  };

  // Fetch profile data on mount using logged-in user ID
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userId = getUserId();
        const token = localStorage.getItem('token');

        if (!userId || !token) {
          toast.error('Please login first to view your profile.');
          setLoading(false);
          return;
        }

        const response_api = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
          method: 'GET',
          headers: getAuthHeaders(),
        });

        if (!response_api.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const response = await response_api.json();

        setName(response.data.name || '');
        setEmail(response.data.email || '');
        setPhone(response.data.phone || '');
        setShippingAddress(response.data.shippingAddress || '');
        setProfilePic(response.data.profilePic || '');
      } catch (error) {
        console.error(error);
        toast.error('Failed to load profile data from server');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // --- Profile Submit Handler ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = getUserId();
      const token = localStorage.getItem('token');

      if (!userId) {
        toast.error('User ID not found. Please login again.');
        return;
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('shippingAddress', shippingAddress);

      if (profilePicFile) {
        formData.append('profilePic', profilePicFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/profile/update/${userId}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to update profile');
      }

      const updatedPic = 
        resData.data?.profilePic || 
        resData.profilePic || 
        resData.user?.profilePic;

      if (updatedPic) {
        setProfilePic(updatedPic);
      }

      setProfilePicPreview('');
      setProfilePicFile(null);

      toast.success('Profile information updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Error updating profile!');
    }
  };

  // --- Password Submit Handler ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Reset previous inline errors
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    const userId = getUserId();
    if (!userId) {
      toast.error('User ID not found. Please login again.');
      return;
    }

    // Client-side validation: Check if new passwords match
    if (newPassword !== confirmPassword) {
      setNewPasswordError('New passwords do not match');
      setConfirmPasswordError('New passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/update-password/${userId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });

      if (response.redirected) {
        throw new Error('Session expired. Please login again.');
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response.');
      }

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Handle Laravel validation errors (e.g. current_password mismatch)
        if (resData.errors) {
          if (resData.errors.current_password) {
            setCurrentPasswordError(resData.errors.current_password[0]);
          }
          if (resData.errors.password) {
            setNewPasswordError(resData.errors.password[0]);
          }
          if (resData.errors.password_confirmation) {
            setConfirmPasswordError(resData.errors.password_confirmation[0]);
          }
          return;
        }
        throw new Error(resData.message || 'Failed to update password');
      }

      toast.success(resData.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Error updating password!');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
      toast.success('Profile picture selected!');
    }
  };

  const handleRemoveImage = () => {
    setProfilePicFile(null);
    setProfilePicPreview('');
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

  const displayImage = profilePicPreview || resolveImageUrl(profilePic);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Toaster position="top-right" />

      <div className="container px-4 mx-auto sm:px-6 lg:px-10 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal information, phone, address, and account security.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT 2 COLUMNS: Personal Information Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
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
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt="Profile"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-200 shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 shadow-sm">
                      <User size={32} />
                    </div>
                  )}

                  <label className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-all">
                    <Camera size={14} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>

                  {displayImage && (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (currentPasswordError) setCurrentPasswordError('');
                  }}
                  required
                  className={`w-full px-4 py-3 rounded-xl border ${
                    currentPasswordError ? 'border-red-500 bg-red-50/30' : 'border-gray-200 bg-gray-50/50'
                  } text-gray-800 focus:bg-white outline-none transition-all text-sm`}
                />
                {currentPasswordError && (
                  <p className="text-xs text-red-500 mt-1">{currentPasswordError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (newPasswordError) setNewPasswordError('');
                  }}
                  required
                  className={`w-full px-4 py-3 rounded-xl border ${
                    newPasswordError ? 'border-red-500 bg-red-50/30' : 'border-gray-200 bg-gray-50/50'
                  } text-gray-800 focus:bg-white outline-none transition-all text-sm`}
                />
                {newPasswordError && (
                  <p className="text-xs text-red-500 mt-1">{newPasswordError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmPasswordError) setConfirmPasswordError('');
                  }}
                  required
                  className={`w-full px-4 py-3 rounded-xl border ${
                    confirmPasswordError ? 'border-red-500 bg-red-50/30' : 'border-gray-200 bg-gray-50/50'
                  } text-gray-800 focus:bg-white outline-none transition-all text-sm`}
                />
                {confirmPasswordError && (
                  <p className="text-xs text-red-500 mt-1">{confirmPasswordError}</p>
                )}
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