import { Search, X } from "lucide-react";
import { useGallery } from "@/context/GalleryContext";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterSidebar({ isOpen, onClose }: FilterSidebarProps) {
  const { filters, setFilters, models, columnCount, setColumnCount } =
    useGallery();

  return (
    <>
      {/* Mobile backdrop — separate from sidebar so it catches all outside clicks */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-surface-50 dark:bg-surface-950 border-r border-surface-200 dark:border-surface-800 flex flex-col shrink-0 transition-transform duration-200 lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-3 border-b border-surface-200 dark:border-surface-800">
          <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
            Filters
          </span>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-surface-400 hover:text-surface-600 hover:bg-surface-200 dark:hover:bg-surface-700"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400"
            />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters({ query: e.target.value })}
              placeholder="Search prompts, models..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {filters.query && (
              <button
                onClick={() => setFilters({ query: "" })}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-surface-400 hover:text-surface-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5 block">
              Sort
            </span>
            <div className="flex rounded-md bg-surface-100 dark:bg-surface-800 p-0.5 border border-surface-200 dark:border-surface-700">
              {(["newest", "oldest"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilters({ sort: opt })}
                  className={`flex-1 px-2.5 py-1 text-xs rounded font-medium transition-colors capitalize ${
                    filters.sort === opt
                      ? "bg-white dark:bg-surface-600 text-surface-800 dark:text-surface-100 shadow-sm"
                      : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Model filter */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5 block">
              Model
            </span>
            <select
              value={filters.model}
              onChange={(e) => setFilters({ model: e.target.value })}
              className="w-full text-xs rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Models</option>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Columns */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5 block">
              Columns
            </span>
            <div className="flex rounded-md bg-surface-100 dark:bg-surface-800 p-0.5 border border-surface-200 dark:border-surface-700">
              {[1, 2, 3, 4, 6, 8, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setColumnCount(n)}
                  className={`flex-1 px-2 py-1 text-xs rounded font-medium transition-colors ${
                    n > 4 ? "hidden lg:block" : ""
                  } ${
                    columnCount === n
                      ? "bg-white dark:bg-surface-600 text-surface-800 dark:text-surface-100 shadow-sm"
                      : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
