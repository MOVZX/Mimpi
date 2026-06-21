import { useState, useCallback } from "react";

export function LoginPage({
  onLogin,
}: {
  onLogin: (username: string, role?: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (data.ok) {
          onLogin(data.username, data.role || "user");
        } else {
          setError(data.error || "Login gagal");
        }
      } catch {
        setError("Koneksi ke server gagal");
      } finally {
        setLoading(false);
      }
    },
    [username, password, onLogin],
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/20 mb-4">
            <span className="text-3xl">🌙</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Mimpi</h1>
          <p className="text-surface-400">Dashboard AI Image Generation</p>
        </div>

        {/* Login Form */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="admin"
                required
                autoFocus
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-surface-900"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-surface-500 text-sm mt-6">
          © 2026 Mimpi Dashboard
        </p>
      </div>
    </div>
  );
}
