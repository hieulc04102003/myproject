'use client';

import { Settings, Bell, Shield, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your application settings</p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <Settings size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
              <p className="text-sm text-gray-600">Basic application configuration</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Name</label>
              <input
                type="text"
                defaultValue="Bánh Mì Sài Gòn"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Support Email</label>
              <input
                type="email"
                defaultValue="support@banhmi.com"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-3 text-green-600">
              <Bell size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-600">Configure notification preferences</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Email notifications for new orders</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Email notifications for new users</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Daily summary reports</span>
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              <p className="text-sm text-gray-600">Manage security settings</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Two-factor authentication</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Require strong passwords</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Session timeout (30 minutes)</span>
            </label>
          </div>
        </div>

        {/* Database Settings */}
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-3 text-yellow-600">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Database</h2>
              <p className="text-sm text-gray-600">Database management</p>
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Backup Database
            </button>
            <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Optimize Tables
            </button>
            <button className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              Clear Cache
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </div>
  );
}
