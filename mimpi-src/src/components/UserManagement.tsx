import { useState, useEffect, useCallback } from "react";

interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setMessage({ type: "error", text: "Gagal memuat daftar user" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateUser = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newUsername || !newPassword) return;
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: newUsername,
            password: newPassword,
            role: newRole,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setMessage({ type: "success", text: "User berhasil ditambahkan" });
          setNewUsername("");
          setNewPassword("");
          setShowCreateForm(false);
          loadUsers();
        } else {
          setMessage({
            type: "error",
            text: data.detail || "Gagal membuat user",
          });
        }
      } catch {
        setMessage({ type: "error", text: "Koneksi ke server gagal" });
      } finally {
        setLoading(false);
      }
    },
    [newUsername, newPassword, newRole, loadUsers],
  );

  const handleDeleteUser = useCallback(
    async (userId: number) => {
      if (!confirm("Yakin ingin menghapus user ini?")) return;
      try {
        const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok) {
          setMessage({ type: "success", text: "User berhasil dihapus" });
          loadUsers();
        } else {
          setMessage({
            type: "error",
            text: data.detail || "Gagal menghapus user",
          });
        }
      } catch {
        setMessage({ type: "error", text: "Koneksi ke server gagal" });
      }
    },
    [loadUsers],
  );

  const handleRoleChange = useCallback(
    async (userId: number, role: string) => {
      try {
        const res = await fetch(`/api/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });
        if (res.ok) {
          setMessage({ type: "success", text: "Role berhasil diubah" });
          loadUsers();
        }
      } catch {
        setMessage({ type: "error", text: "Koneksi ke server gagal" });
      }
    },
    [loadUsers],
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manajemen User</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          {showCreateForm ? "Batal" : "+ Tambah User"}
        </button>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Create User Form */}
      {showCreateForm && (
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Tambah User Baru
          </h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-surface-300 mb-1.5"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Username"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-surface-300 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Password"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-surface-300 mb-1.5"
                >
                  Role
                </label>
                <select
                  id="role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !newUsername || !newPassword}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </form>
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div className="text-center text-surface-400 py-8">Memuat...</div>
      ) : (
        <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                  Dibuat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-800/50">
                  <td className="px-6 py-4 text-sm text-surface-400">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-medium">
                    {user.username}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-400">
                    {new Date(user.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
