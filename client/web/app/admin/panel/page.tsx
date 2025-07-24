"use client";

import React, { useEffect, useState } from "react";
import {
  IconUsers,
  IconUserCog,
  IconPhoto,
  IconMessageCircle,
  IconLogout,
  IconPlus,
  IconEdit,
  IconTrash,
  IconBan,
  IconCheck,
  IconX,
  IconRefresh,
} from "@tabler/icons-react";

// API endpoint
const API = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

// --- Reusable Modal ---
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
          onClick={onClose}
        >
          <IconX size={22} />
        </button>
        {title && (
          <h2 className="text-xl font-bold mb-4 text-gruvbox-orange">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}

// --- Sidebar Tabs ---
const tabs = [
  {
    id: "staff",
    label: "Staff Management",
    icon: <IconUserCog size={20} />,
  },
  {
    id: "users",
    label: "User Management",
    icon: <IconUsers size={20} />,
  },
  {
    id: "vibes",
    label: "Vibe Moderation",
    icon: <IconPhoto size={20} />,
  },
  {
    id: "comments",
    label: "Comment Moderation",
    icon: <IconMessageCircle size={20} />,
  },
];

// --- Main Admin Panel ---
export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("staff");
  const [error, setError] = useState("");

  // Auth check
  useEffect(() => {
    fetch(API + "/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || !["admin", "staff"].includes(data.user.role)) {
          window.location.href = "/admin/signin";
        } else {
          setUser(data.user);
        }
      })
      .catch(() => (window.location.href = "/admin/signin"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return null;

  // Logout
  const handleLogout = async () => {
    await fetch(API + "/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/admin/signin";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-gruvbox-orange font-mono">
            Old Vibes Admin Panel
          </span>
          <span className="ml-4 text-sm text-gray-500 font-mono">
            {user.email} ({user.role})
          </span>
        </div>
        <button
          className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded transition"
          onClick={handleLogout}
        >
          <IconLogout size={18} />
          Logout
        </button>
      </div>

      {/* Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-56 bg-white border-r flex flex-col py-6 px-2 gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-md transition-all
                ${
                  tab === t.id
                    ? "bg-gruvbox-orange text-white font-bold shadow"
                    : "text-gruvbox-gray hover:bg-gruvbox-orange/10"
                }
              `}
              onClick={() => setTab(t.id)}
            >
              {React.cloneElement(t.icon, {
                className: tab === t.id ? "text-white" : "text-gruvbox-orange",
              })}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-50">
          {error && (
            <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">
              {error}
            </div>
          )}
          {tab === "staff" && <StaffSection isAdmin={user.role === "admin"} />}
          {tab === "users" && <UserSection />}
          {tab === "vibes" && <VibeModerationSection />}
          {tab === "comments" && <CommentModerationSection />}
        </main>
      </div>
    </div>
  );
}

// --- STAFF MANAGEMENT ---
function StaffSection({ isAdmin }: { isAdmin: boolean }) {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch staff
  const fetchStaff = () => {
    setLoading(true);
    fetch(API + "/admin/staff", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setStaff(d.staff || []))
      .catch(() => setStaff([]))
      .finally(() => setLoading(false));
  };
  useEffect(fetchStaff, []);

  // Add staff
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch(API + "/admin/staff", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to add staff");
      } else {
        setSuccess("Staff added!");
        setModalOpen(false);
        setForm({ email: "", password: "", name: "", username: "" });
        fetchStaff();
      }
    } catch {
      setError("Network error");
    }
  };

  // Delete staff
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this staff member?")) return;
    await fetch(API + `/admin/staff/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchStaff();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Staff Management</h2>
        {isAdmin && (
          <button
            className="flex items-center gap-2 bg-gruvbox-orange text-white px-4 py-2 rounded font-semibold hover:bg-gruvbox-yellow transition"
            onClick={() => setModalOpen(true)}
          >
            <IconPlus size={18} /> Add Staff
          </button>
        )}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : staff.length === 0 ? (
        <div className="text-gray-500">No staff found.</div>
      ) : (
        <table className="w-full border mt-2 text-sm">
          <thead>
            <tr className="bg-gruvbox-light-bg1">
              <th className="p-2">Name</th>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.name}</td>
                <td>{s.email}</td>
                <td>{s.username}</td>
                <td>{s.role}</td>
                {isAdmin && (
                  <td>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(s.id)}
                    >
                      <IconTrash size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Staff Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Staff"
      >
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            className="w-full border p-2 rounded"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Username"
            value={form.username}
            onChange={(e) =>
              setForm((f) => ({ ...f, username: e.target.value }))
            }
            required
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            required
          />
          {error && <div className="text-red-600">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gruvbox-orange text-white py-2 rounded font-bold"
          >
            Add Staff
          </button>
        </form>
      </Modal>
      {success && (
        <div className="mt-2 text-green-600 bg-green-100 p-2 rounded">
          {success}
        </div>
      )}
    </div>
  );
}

// --- USER MANAGEMENT ---
function UserSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch users
  const fetchUsers = () => {
    setLoading(true);
    fetch(API + "/admin/users?limit=50", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };
  useEffect(fetchUsers, []);

  // Ban/unban
  const handleBan = async (id: string, banned: boolean) => {
    if (
      !window.confirm(
        banned
          ? "Unban this user?"
          : "Ban this user? They will not be able to login.",
      )
    )
      return;
    await fetch(API + `/admin/users/${id}/${banned ? "unban" : "ban"}`, {
      method: "PATCH",
      credentials: "include",
    });
    fetchUsers();
    setSuccess(banned ? "User unbanned" : "User banned");
    setTimeout(() => setSuccess(""), 2000);
  };

  // Filtered users
  const filtered = users.filter(
    (u) =>
      u.email.includes(search) ||
      u.username.includes(search) ||
      u.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">User Management</h2>
        <input
          className="border rounded px-3 py-1 text-sm"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500">No users found.</div>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gruvbox-light-bg1">
              <th className="p-2">Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Email Verified</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.name}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  {u.isActive ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-600">Banned</span>
                  )}
                </td>
                <td>
                  {u.isEmailVerified ? (
                    <IconCheck size={16} className="text-green-600 inline" />
                  ) : (
                    <IconX size={16} className="text-red-600 inline" />
                  )}
                </td>
                <td>
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString()
                    : ""}
                </td>
                <td>
                  <button
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      u.isActive
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-green-100 text-green-600 hover:bg-green-200"
                    }`}
                    onClick={() => handleBan(u.id, !u.isActive)}
                  >
                    {u.isActive ? (
                      <>
                        <IconBan size={14} className="inline" /> Ban
                      </>
                    ) : (
                      <>
                        <IconRefresh size={14} className="inline" /> Unban
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {error && (
        <div className="mt-2 text-red-600 bg-red-100 p-2 rounded">{error}</div>
      )}
      {success && (
        <div className="mt-2 text-green-600 bg-green-100 p-2 rounded">
          {success}
        </div>
      )}
    </div>
  );
}

// --- VIBE MODERATION ---
function VibeModerationSection() {
  const [vibes, setVibes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch pending vibes
  const fetchVibes = () => {
    setLoading(true);
    fetch(API + "/vibes/pending", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setVibes(d.vibes || []))
      .catch(() => setVibes([]))
      .finally(() => setLoading(false));
  };
  useEffect(fetchVibes, []);

  // Approve/Reject
  const moderate = async (
    id: string,
    action: "approve" | "reject",
    notes = "",
  ) => {
    await fetch(API + `/vibes/${id}/moderate`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes }),
    });
    fetchVibes();
    setSuccess(`Vibe ${action}d`);
    setModalOpen(false);
    setTimeout(() => setSuccess(""), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Vibe Moderation</h2>
        <button
          className="flex items-center gap-2 text-gruvbox-orange hover:underline"
          onClick={fetchVibes}
        >
          <IconRefresh size={16} /> Refresh
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : vibes.length === 0 ? (
        <div className="text-gray-500">No pending vibes.</div>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gruvbox-light-bg1">
              <th className="p-2">Item</th>
              <th>User</th>
              <th>Price</th>
              <th>Category</th>
              <th>Condition</th>
              <th>Posted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vibes.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="p-2 font-bold">{v.itemName}</td>
                <td>
                  {v.user?.username} <br />
                  <span className="text-xs text-gray-500">{v.user?.name}</span>
                </td>
                <td>${v.price}</td>
                <td>{v.category}</td>
                <td>{v.condition}</td>
                <td>
                  {v.createdAt ? new Date(v.createdAt).toLocaleString() : ""}
                </td>
                <td>
                  <button
                    className="text-gruvbox-blue hover:underline mr-2"
                    onClick={() => {
                      setSelected(v);
                      setModalOpen(true);
                    }}
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Review Modal */}
      <Modal
        open={modalOpen && !!selected}
        onClose={() => setModalOpen(false)}
        title="Review Vibe"
      >
        {selected && (
          <div>
            <div className="mb-2">
              <span className="font-bold">{selected.itemName}</span>
              <span className="ml-2 text-gray-500">${selected.price}</span>
            </div>
            <div className="mb-2 text-sm text-gray-700">
              <span className="font-bold">User:</span> {selected.user?.username}{" "}
              ({selected.user?.name})
            </div>
            <div className="mb-2 text-sm">
              <span className="font-bold">Description:</span>{" "}
              {selected.description}
            </div>
            <div className="mb-2 text-sm">
              <span className="font-bold">Category:</span> {selected.category} |{" "}
              <span className="font-bold">Condition:</span> {selected.condition}
            </div>
            <div className="mb-2 text-sm">
              <span className="font-bold">Tags:</span>{" "}
              {selected.tags?.join(", ")}
            </div>
            <div className="mb-2 text-sm">
              <span className="font-bold">Location:</span> {selected.location}
            </div>
            <div className="mb-2 flex gap-2">
              {selected.mediaFiles?.map((m: any, i: number) =>
                m.type === "image" ? (
                  <img
                    key={i}
                    src={m.url}
                    alt="media"
                    className="w-20 h-20 object-cover rounded border"
                  />
                ) : (
                  <video
                    key={i}
                    src={m.url}
                    controls
                    className="w-20 h-20 object-cover rounded border"
                  />
                ),
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded font-bold"
                onClick={() => moderate(selected.id, "approve")}
              >
                <IconCheck size={16} className="inline" /> Approve
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded font-bold"
                onClick={() => moderate(selected.id, "reject")}
              >
                <IconX size={16} className="inline" /> Reject
              </button>
            </div>
          </div>
        )}
      </Modal>
      {error && (
        <div className="mt-2 text-red-600 bg-red-100 p-2 rounded">{error}</div>
      )}
      {success && (
        <div className="mt-2 text-green-600 bg-green-100 p-2 rounded">
          {success}
        </div>
      )}
    </div>
  );
}

// --- COMMENT MODERATION (stub) ---
function CommentModerationSection() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Comment Moderation</h2>
      <p className="mb-4 text-gray-600">
        (Coming soon) Moderate user comments. Remove inappropriate or spammy
        content.
      </p>
    </div>
  );
}
