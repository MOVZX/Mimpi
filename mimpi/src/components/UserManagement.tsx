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

  const inputCls =
    "w-full px-3 py-2 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-surface-800 dark:text-surface-200 text-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors";

  return (
    <div className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-surface-800 dark:text-surface-100">
          👤 Manajemen User
        </h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showCreateForm ? "Batal" : "+ Tambah"}
        </button>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm mb-3 ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white dark:bg-surface-900/80 border border-surface-200/80 dark:border-surface-700/80 rounded-xl p-4 mb-4 shadow-sm">
          <h2 className="text-sm font-semibold text-surface-800 dark:text-surface-100 mb-3">
            Tambah User Baru
          </h2>
          <form onSubmit={handleCreateUser} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className={inputCls}
                  placeholder="Username"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputCls}
                  placeholder="Password"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className={inputCls}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !newUsername || !newPassword}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center text-surface-400 py-8">Memuat...</div>
      ) : (
        <div className="bg-white dark:bg-surface-900/80 border border-surface-200/80 dark:border-surface-700/80 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                    Dibuat
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-700/50">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-surface-500 dark:text-surface-400">
                      {user.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-800 dark:text-surface-100 font-medium">
                      {user.username}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/25"
                            : "bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/25"
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-500 dark:text-surface-400">
                      {new Date(user.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
