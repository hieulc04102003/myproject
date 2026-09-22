'use client';

import { useAuthStore } from '@/store/auth-store';
import { User, Mail, Phone, Shield, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Please login to view your profile</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                {getInitials(user.fullName)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
                <span
                  className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                    user.role === 'Admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              
              <div className="grid gap-4">
                {user.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>
                )}

                {user.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-900">{user.phoneNumber}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium text-gray-900">{user.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-mono text-sm text-gray-600">{user.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Edit Profile
              </button>
              <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Change Password
              </button>
              <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Security Settings
              </button>
            </div>
          </div>

          <div className="rounded-lg border bg-blue-50 p-6">
            <h3 className="mb-2 text-lg font-semibold text-blue-900">Account Status</h3>
            <p className="text-sm text-blue-700">
              Your account is active and in good standing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
