import { useState, useCallback, useEffect } from "react";

interface SettingsPageProps {
  username: string;
  onUsernameChange: (username: string) => void;
}

interface ComfyServer {
  id: number;
  name: string;
  url: string;
  token_preview: string;
  is_active: number;
  created_at: string;
}

const emptyForm = { name: "", url: "", token: "" };

export function SettingsPage({
  username,
  onUsernameChange,
}: SettingsPageProps) {
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // ComfyUI Servers state
  const [servers, setServers] = useState<ComfyServer[]>([]);
  const [activeName, setActiveName] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load servers
  const loadServers = useCallback(async () => {
    try {
      const res = await fetch("/api/comfy-servers", { credentials: "include" });
      const data = await res.json();
      setServers(data.servers || []);
      const active = (data.servers || []).find((s: ComfyServer) => s.is_active);
      setActiveName(active?.name || "");
    } catch {}
  }, []);

  useEffect(() => {
    loadServers();
  }, [loadServers]);

  // Activate server
  const handleActivate = useCallback(
    async (name: string) => {
      try {
        const res = await fetch("/api/comfy-servers/activate", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (res.ok) {
          setActiveName(name);
          setMessage({ type: "success", text: `Server '${name}' aktif` });
          loadServers();
        }
      } catch {}
    },
    [loadServers],
  );

  // Save (add or update)
  const handleSaveServer = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.name.trim() || !form.url.trim()) return;
      setSaving(true);
      setMessage(null);
      try {
        const isEdit = editing !== null;
        const res = await fetch(`/api/comfy-servers`, {
          method: isEdit ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
          setMessage({
            type: "success",
            text: isEdit ? "Server diupdate" : "Server ditambahkan",
          });
          setForm(emptyForm);
          setEditing(null);
          loadServers();
        } else {
          setMessage({
            type: "error",
            text: data.detail || "Gagal menyimpan server",
          });
        }
      } catch {
        setMessage({ type: "error", text: "Koneksi gagal" });
      } finally {
        setSaving(false);
      }
    },
    [form, editing, loadServers],
  );

  // Edit prep
  const handleEdit = useCallback((s: ComfyServer) => {
    setForm({ name: s.name, url: s.url, token: "" });
    setEditing(s.name);
  }, []);

  // Delete
  const handleDelete = useCallback(
    async (name: string) => {
      if (!confirm(`Hapus server '${name}'?`)) return;
      try {
        const res = await fetch(
          `/api/comfy-servers/${encodeURIComponent(name)}`,
          { method: "DELETE", credentials: "include" },
        );
        if (res.ok) {
          setMessage({ type: "success", text: "Server dihapus" });
          loadServers();
        }
      } catch {}
    },
    [loadServers],
  );

  // Cancel edit
  const handleCancelEdit = useCallback(() => {
    setForm(emptyForm);
    setEditing(null);
  }, []);

  const handleUsernameChange = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newUsername.trim()) return;
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch("/api/user/username", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ new_username: newUsername.trim() }),
        });
        const data = await res.json();
        if (res.ok) {
          setMessage({ type: "success", text: "Username berhasil diubah" });
          onUsernameChange(newUsername.trim());
          setNewUsername("");
        } else {
          setMessage({
            type: "error",
            text: data.detail || "Gagal mengubah username",
          });
        }
      } catch {
        setMessage({ type: "error", text: "Koneksi ke server gagal" });
      } finally {
        setLoading(false);
      }
    },
    [newUsername, onUsernameChange],
  );

  const handlePasswordChange = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentPassword || !newPassword || newPassword !== confirmPassword)
        return;
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch("/api/user/password", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setMessage({ type: "success", text: "Password berhasil diubah" });
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else {
          setMessage({
            type: "error",
            text: data.detail || "Gagal mengubah password",
          });
        }
      } catch {
        setMessage({ type: "error", text: "Koneksi ke server gagal" });
      } finally {
        setLoading(false);
      }
    },
    [currentPassword, newPassword, confirmPassword],
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-white">Pengaturan</h1>

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

      {/* ── ComfyUI Servers ── */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          ComfyUI Servers
        </h2>

        {/* Active server selector */}
        {servers.length > 0 && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Server Aktif
            </label>
            <select
              value={activeName}
              onChange={(e) => handleActivate(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              {servers.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} {s.is_active ? "(aktif)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Server list */}
        <div className="space-y-2 mb-5">
          {servers.length === 0 && (
            <p className="text-sm text-surface-500">
              Belum ada server. Tambah server baru di bawah.
            </p>
          )}
          {servers.map((s) => (
            <div
              key={s.id}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                s.is_active
                  ? "bg-blue-500/10 border-blue-500/30"
                  : "bg-surface-800/50 border-surface-700"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white text-sm truncate">
                    {s.name}
                  </span>
                  {s.is_active && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-xs text-surface-400 truncate mt-0.5">
                  {s.url}
                </p>
                {s.token_preview && (
                  <p className="text-[10px] text-surface-500">
                    Token: {s.token_preview}...
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-3 shrink-0">
                <button
                  onClick={() => handleEdit(s)}
                  className="p-1.5 rounded-md text-surface-400 hover:text-white hover:bg-surface-700 transition-colors"
                  title="Edit"
                >
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(s.name)}
                  className="p-1.5 rounded-md text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Hapus"
                >
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit form */}
        <form
          onSubmit={handleSaveServer}
          className="space-y-3 border-t border-surface-700 pt-4"
        >
          <h3 className="text-sm font-medium text-surface-300">
            {editing ? `Edit Server: ${editing}` : "Tambah Server Baru"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1">
                Nama
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contoh: Server-1"
                disabled={editing !== null}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1">
                URL
              </label>
              <input
                type="text"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://comfyui.example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1">
                API Token (opsional)
              </label>
              <input
                type="text"
                value={form.token}
                onChange={(e) => setForm({ ...form, token: e.target.value })}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="token"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || !form.name.trim() || !form.url.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving
                ? "Menyimpan..."
                : editing
                  ? "Simpan Perubahan"
                  : "Tambah Server"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-surface-700 hover:bg-surface-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Change Username */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Username</h2>
        <form onSubmit={handleUsernameChange} className="space-y-4">
          <div>
            <label
              htmlFor="newUsername"
              className="block text-sm font-medium text-surface-300 mb-1.5"
            >
              Username Baru
            </label>
            <input
              id="newUsername"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Masukkan username baru"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newUsername.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "Menyimpan..." : "Ubah Username"}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-surface-300 mb-1.5"
            >
              Password Saat Ini
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Masukkan password saat ini"
              required
            />
          </div>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-surface-300 mb-1.5"
            >
              Password Baru
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Masukkan password baru"
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-surface-300 mb-1.5"
            >
              Konfirmasi Password Baru
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Ulangi password baru"
              required
            />
          </div>
          <button
            type="submit"
            disabled={
              loading ||
              !currentPassword ||
              !newPassword ||
              newPassword !== confirmPassword
            }
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "Menyimpan..." : "Ubah Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
