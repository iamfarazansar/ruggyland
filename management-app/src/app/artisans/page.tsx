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
  const [statusTab, setStatusTab] = useState<"active" | "inactive">("active");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingArtisan, setEditingArtisan] = useState<Artisan | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newArtisan, setNewArtisan] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    active: true,
  });
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

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
        cache: "no-store",
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

  const openEditModal = (artisan: Artisan) => {
    setEditingArtisan(artisan);
    setEditForm({
      name: artisan.name,
      email: artisan.email || "",
      phone: artisan.phone || "",
      role: artisan.role || "",
      active: artisan.active,
    });
  };

  const updateArtisan = async () => {
    if (!editingArtisan || !editForm.name) return;

    setSaving(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/artisans/${editingArtisan.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        },
      );

      if (response.ok) {
        setEditingArtisan(null);
        fetchArtisans();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update artisan");
      }
    } catch (err) {
      console.error("Error updating artisan:", err);
      alert("Failed to update artisan");
    } finally {
      setSaving(false);
    }
  };

  const deleteArtisan = async (id: string) => {
    setDeletingId(id);

    try {
      const response = await fetch(`${BACKEND_URL}/admin/artisans/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchArtisans();
      } else {
        alert("Failed to delete artisan");
      }
    } catch (err) {
      console.error("Error deleting artisan:", err);
      alert("Failed to delete artisan");
    } finally {
      setDeletingId(null);
    }
  };

  const reactivateArtisan = async (artisan: Artisan) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/artisans/${artisan.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: artisan.name, active: true }),
        },
      );

      if (response.ok) {
        fetchArtisans();
      } else {
        alert("Failed to reactivate artisan");
      }
    } catch (err) {
      console.error("Error reactivating artisan:", err);
      alert("Failed to reactivate artisan");
    }
  };

  const filteredArtisans = artisans.filter((artisan) => {
    const matchesStatus = statusTab === "active" ? artisan.active : !artisan.active;

    const matchesSearch =
      artisan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.role?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || artisan.role === roleFilter;

    return matchesStatus && matchesSearch && matchesRole;
  });

  const uniqueRoles = [
    ...new Set(
      artisans
        .map((a) => a.role)
        .filter((r): r is string => r !== null && r !== undefined),
    ),
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading artisans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Artisans</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your manufacturing team</p>
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
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Artisans</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {artisans.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {artisans.filter((a) => a.active).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Completed</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {artisans.reduce((sum, a) => sum + (a.completed_orders || 0), 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Rating</p>
          <p className="text-2xl font-bold text-amber-500 dark:text-amber-400 mt-1">
            {artisans.length > 0
              ? (
                  artisans.reduce(
                    (sum, a) => sum + (a.average_rating || 0),
                    0,
                  ) / artisans.length
                ).toFixed(1)
              : "0"}{" "}
            <span className="text-lg">&#9733;</span>
          </p>
        </div>
      </div>

      {/* Tabs + Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setStatusTab("active")}
            className={`px-6 py-3 text-sm font-medium transition ${
              statusTab === "active"
                ? "text-amber-600 dark:text-amber-400 border-b-2 border-amber-500"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Active ({artisans.filter((a) => a.active).length})
          </button>
          <button
            onClick={() => setStatusTab("inactive")}
            className={`px-6 py-3 text-sm font-medium transition ${
              statusTab === "inactive"
                ? "text-amber-600 dark:text-amber-400 border-b-2 border-amber-500"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Inactive ({artisans.filter((a) => !a.active).length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {uniqueRoles.length > 0 && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition"
          >
            &#8635; Refresh
          </button>
        </div>
      </div>

      {/* Artisans Grid */}
      {filteredArtisans.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          {artisans.length === 0 ? (
            <>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No artisans yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                Add your first artisan to get started
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition"
              >
                Add First Artisan
              </button>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No {statusTab} artisans{searchQuery ? ` matching "${searchQuery}"` : ""}
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtisans.map((artisan) => (
            <div
              key={artisan.id}
              className={`bg-white dark:bg-gray-900 rounded-xl border ${artisan.active ? "border-gray-200 dark:border-gray-800" : "border-red-300 dark:border-red-900/30"} p-6 hover:border-gray-300 dark:hover:border-gray-700 transition`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${artisan.active ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"}`}
                  >
                    {artisan.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-medium">{artisan.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {artisan.role || "No role"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${artisan.active ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"}`}
                  >
                    {artisan.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2 mb-4">
                {artisan.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {artisan.completed_orders || 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                  <p className="text-lg font-bold text-amber-500 dark:text-amber-400">
                    {artisan.average_rating || "-"} <span>&#9733;</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => openEditModal(artisan)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                {artisan.active ? (
                  <button
                    onClick={() => {
                      if (confirm(`Deactivate "${artisan.name}"? They will move to the Inactive tab.`)) {
                        deleteArtisan(artisan.id);
                      }
                    }}
                    disabled={deletingId === artisan.id}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    {deletingId === artisan.id ? "..." : "Deactivate"}
                  </button>
                ) : (
                  <button
                    onClick={() => reactivateArtisan(artisan)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 rounded-lg transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Artisan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Add New Artisan
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newArtisan.name}
                  onChange={(e) =>
                    setNewArtisan({ ...newArtisan, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newArtisan.email}
                  onChange={(e) =>
                    setNewArtisan({ ...newArtisan, email: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  value={newArtisan.phone}
                  onChange={(e) =>
                    setNewArtisan({ ...newArtisan, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={newArtisan.role}
                  onChange={(e) =>
                    setNewArtisan({ ...newArtisan, role: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Master Weaver, QC Specialist"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition"
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

      {/* Edit Artisan Modal */}
      {editingArtisan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Edit Artisan
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Master Weaver, QC Specialist"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setEditForm({ ...editForm, active: !editForm.active })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${editForm.active ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${editForm.active ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
                <span className={`text-sm ${editForm.active ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>
                  {editForm.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingArtisan(null)}
                className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={updateArtisan}
                disabled={saving || !editForm.name}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-medium rounded-lg transition"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
