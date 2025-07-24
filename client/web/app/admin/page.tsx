"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + "/auth/me", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || !["admin", "staff"].includes(data.user.role)) {
          router.replace("/admin/signin");
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.replace("/admin/signin"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        <div className="mb-4">
          <span className="font-mono text-sm text-gray-500">
            Signed in as: {user.email} ({user.role})
          </span>
        </div>
        {/* Tabs or sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h2 className="font-bold mb-2">Staff Management</h2>
            {user.role === "admin" ? <StaffSection /> : <p>Admin only</p>}
          </div>
          <div>
            <h2 className="font-bold mb-2">User Management</h2>
            <UserSection />
          </div>
          <div>
            <h2 className="font-bold mb-2">Vibe Moderation</h2>
            <VibeModerationSection />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- StaffSection, UserSection, VibeModerationSection components below ---

function StaffSection() {
  // Fetch staff list, add/edit/delete staff
  // Use /api/admin/staff endpoints
  // ... implement as needed
  return <div>Staff management UI here</div>;
}

function UserSection() {
  // Fetch user list, ban/unban users
  // Use /api/admin/users endpoints
  // ... implement as needed
  return <div>User management UI here</div>;
}

function VibeModerationSection() {
  // Fetch pending vibes, approve/reject
  // Use /api/vibes/pending and /api/vibes/:id/moderate
  // ... implement as needed
  return <div>Vibe moderation UI here</div>;
}
