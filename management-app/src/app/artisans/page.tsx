"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Artisan } from "@/lib/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

export default function ArtisansPage() {
  const { token, isAuthenticated } = useAuth();
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArtisan, setNewArtisan] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchArtisans();
    }
  }, [isAuthenticated, token]);

  const fetchArtisans = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/admin/artisans`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setArtisans(data.artisans || []);
      } else {
        throw new Error("Failed to fetch artisans");
      }
    } catch (err) {
      console.error("Error fetching artisans:", err);
      setError("Failed to load artisans");
    } finally {
      setLoading(false);
    }
  };

  const createArtisan = async () => {
    if (!newArtisan.name) {
      alert("Name is required");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch(`${BACKEND_URL}/admin/artisans`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newArtisan),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewArtisan({ name: "", email: "", phone: "", role: "" });
        fetchArtisans();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to create artisan");
      }
    } catch (err) {
      console.error("Error creating artisan:", err);
      alert("Failed to create artisan");
    } finally {
      setCreating(false);
    }
  };

  const filteredArtisans = artisans.filter((artisan) => {
    const matchesSearch =
      artisan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.role?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || artisan.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const uniqueRoles = [...new Set(artisans.map((a) => a.role).filter(Boolean))];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading artisans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Artisans</h1>
          <p className="text-gray-400 mt-1">Manage your manufacturing team</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Artisan
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-sm text-gray-400">Total Artisans</p>
          <p className="text-2xl font-bold text-white mt-1">
            {artisans.length}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-sm text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {artisans.filter((a) => a.active).length}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-sm text-gray-400">Total Completed</p>
          <p className="text-2xl font-bold text-white mt-1">
            {artisans.reduce((sum, a) => sum + (a.completed_orders || 0), 0)}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-sm text-gray-400">Avg Rating</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {artisans.length > 0
              ? (
                  artisans.reduce(
                    (sum, a) => sum + (a.average_rating || 0),
                    0,
                  ) / artisans.length
                ).toFixed(1)
              : "0"}{" "}
            ⭐
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          {uniqueRoles.length > 0 && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={fetchArtisans}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Artisans Grid */}
      {artisans.length === 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <p className="text-gray-400 text-lg mb-2">No artisans yet</p>
          <p className="text-gray-500 text-sm mb-6">
            Add your first artisan to get started
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition"
          >
            Add First Artisan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtisans.map((artisan) => (
            <div
              key={artisan.id}
              className={`bg-gray-900 rounded-xl border ${artisan.active ? "border-gray-800" : "border-red-900/30"} p-6 hover:border-gray-700 transition`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${artisan.active ? "bg-amber-500/20 text-amber-400" : "bg-gray-700 text-gray-400"}`}
                  >
                    {artisan.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{artisan.name}</h3>
                    <p className="text-sm text-gray-500">
                      {artisan.role || "No role"}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${artisan.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                >
                  {artisan.active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Contact */}
              <div className="space-y-2 mb-4">
                {artisan.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {artisan.email}
                  </div>
                )}
                {artisan.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {artisan.phone}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-lg font-bold text-white">
                    {artisan.completed_orders || 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="text-lg font-bold text-amber-400">
                    {artisan.average_rating || "-"} ⭐
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Artisan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">
              Add New Artisan
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newArtisan.name}
                  onChange={(e) =>
                    setNewArtisan({ ...newArtisan, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newArtisan.email}
                  onChange={(e) =>
                    setNewArtisan({ ...newArtisan, email: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  value={newArtisan.phone}
                  onChange={(e) =>
                    setNewArtisan({ ...newArtisan, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={newArtisan.role}
                  onChange={(e) =>
                    setNewArtisan({ ...newArtisan, role: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Master Weaver, QC Specialist"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={createArtisan}
                disabled={creating || !newArtisan.name}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-medium rounded-lg transition"
              >
                {creating ? "Creating..." : "Create Artisan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
