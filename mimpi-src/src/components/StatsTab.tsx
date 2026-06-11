import { useEffect, useState } from "react";
import { BarChart3, ImageIcon, Package, Repeat2, Calendar } from "lucide-react";
import { fetchStats } from "@/services/mimpi";
import { useToast } from "@/context/ToastContext";
import type { Stats } from "@/types";

export function StatsTab() {
  const { addToast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(() => addToast("Gagal memuat statistik", "error"));
  }, []);

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-surface-300 dark:border-surface-600 border-t-primary-500 animate-spin" />
      </div>
    );
  }

  const cards = [
    {
      icon: ImageIcon,
      label: "Total Gambar",
      value: stats.total,
      color: "text-primary-500",
    },
    {
      icon: Package,
      label: "Model Digunakan",
      value: stats.top_models?.length || 0,
      color: "text-violet-500",
    },
    {
      icon: Repeat2,
      label: "Sampler",
      value: stats.samplers?.length || 0,
      color: "text-amber-500",
    },
    {
      icon: Calendar,
      label: "Bulan Aktif",
      value: stats.monthly?.length || 0,
      color: "text-emerald-500",
    },
  ];

  const renderBar = (
    items: { name: string; count: number }[] | undefined,
    icon: string,
  ) => {
    if (!items?.length)
      return (
        <p className="text-sm text-surface-400 dark:text-surface-500">
          Belum ada data
        </p>
      );
    const maxVal = Math.max(...items.map((i) => i.count));
    return items.map((item) => {
      const pct = maxVal > 0 ? (item.count / maxVal) * 100 : 0;
      return (
        <div key={item.name} className="flex items-center gap-3">
          <span className="text-xs text-surface-600 dark:text-surface-400 w-32 truncate shrink-0">
            {icon} {item.name}
          </span>
          <div className="flex-1 h-5 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-500/80 dark:bg-primary-400/80 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-medium text-surface-700 dark:text-surface-300 w-8 text-right tabular-nums">
            {item.count}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto max-w-3xl mx-auto w-full">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {cards.map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-surface-900/80 rounded-xl border border-surface-200/80 dark:border-surface-700/80 p-4 shadow-sm"
          >
            <Icon size={20} className={`${color} mb-2`} />
            <p className="text-2xl font-bold text-surface-800 dark:text-surface-100 tabular-nums">
              {value}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-surface-900/80 rounded-xl border border-surface-200/80 dark:border-surface-700/80 p-4 shadow-sm mb-3">
        <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-100 flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-primary-500" /> 🏆 Model
          Terpopuler
        </h3>
        <div className="space-y-2">{renderBar(stats.top_models, "🔮")}</div>
      </div>

      <div className="bg-white dark:bg-surface-900/80 rounded-xl border border-surface-200/80 dark:border-surface-700/80 p-4 shadow-sm mb-3">
        <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-100 flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-amber-500" /> 📅 Timeline Bulanan
        </h3>
        <div className="space-y-2">
          {renderBar(
            stats.monthly?.map((m) => ({ name: m.month, count: m.count })),
            "📅",
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900/80 rounded-xl border border-surface-200/80 dark:border-surface-700/80 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-100 flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-violet-500" /> 🔄 Sampler yang
          Digunakan
        </h3>
        <div className="space-y-2">{renderBar(stats.samplers, "🔄")}</div>
      </div>
    </div>
  );
}
