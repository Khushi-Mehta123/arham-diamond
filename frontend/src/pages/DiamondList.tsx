import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Search, SlidersHorizontal, Diamond as DiamondIcon, X, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface Field {
  _id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
}

interface Diamond {
  _id: string;
  name: string;
  images: string[];
  dynamicData: Record<string, any>;
}

export const DiamondList: React.FC = () => {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [isFilterMode, setIsFilterMode] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Pagination State (only applies when not searching/filtering, as requested by route definition, though we can display all search/filter outcomes directly)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 9;

  // Toggle filter panel on mobile
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchFields();
  }, []);

  useEffect(() => {
    if (isSearchMode) {
      handleSearchSubmit();
    } else if (isFilterMode) {
      applyFilters();
    } else {
      fetchPaginatedDiamonds();
    }
  }, [page, isSearchMode, isFilterMode]);

  const fetchFields = async () => {
    try {
      const res = await api.get('/api/fields');
      setFields(res.data);
    } catch (err) {
      console.error('Error fetching fields:', err);
    }
  };

  const fetchPaginatedDiamonds = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/diamonds?page=${page}&limit=${limit}`);
      setDiamonds(res.data.diamonds);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
      setError('Failed to load diamonds catalog.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      handleReset();
      return;
    }
    setLoading(true);
    setError('');
    setIsSearchMode(true);
    setIsFilterMode(false);
    setActiveFilters({});

    try {
      const res = await api.get(`/api/diamonds/search?q=${encodeURIComponent(searchQuery)}`);
      setDiamonds(res.data);
      setTotalPages(1); // Non-paginated results returned directly
      setTotal(res.data.length);
    } catch (err) {
      console.error(err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (fieldName: string, value: string) => {
    const nextFilters = { ...activeFilters };
    if (value === '') {
      delete nextFilters[fieldName];
    } else {
      nextFilters[fieldName] = value;
    }
    setActiveFilters(nextFilters);
  };

  const handleFilterSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (Object.keys(activeFilters).length === 0) {
      handleReset();
      return;
    }
    setPage(1);
    setIsFilterMode(true);
    setIsSearchMode(false);
    setSearchQuery('');
    applyFilters();
    setShowMobileFilters(false);
  };

  const applyFilters = async () => {
    setLoading(true);
    setError('');
    try {
      // Build query string
      const params = new URLSearchParams();
      Object.entries(activeFilters).forEach(([k, v]) => {
        params.append(k, v);
      });
      const res = await api.get(`/api/diamonds/filter?${params.toString()}`);
      setDiamonds(res.data);
      setTotalPages(1);
      setTotal(res.data.length);
    } catch (err) {
      console.error(err);
      setError('Filtering failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setActiveFilters({});
    setIsFilterMode(false);
    setIsSearchMode(false);
    setPage(1);
    fetchPaginatedDiamonds();
  };

  // Get selectable fields for filtering
  const filterableFields = fields.filter(f => f.type === 'select' || f.type === 'boolean');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center justify-center space-x-2">
          <DiamondIcon className="w-8 h-8 text-indigo-500 fill-indigo-500/10" />
          <span>Exclusive Diamond Collection</span>
        </h1>
        <p className="text-slate-400 mt-2 max-w-xl mx-auto">
          Explore our certified natural diamonds. Search dynamically by cutting type, color index, clarity grade, and carat sizes.
        </p>
      </div>

      {/* Search Bar & Action Hooks */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by diamond name, serial, cutting description..."
            className="glass-input w-full pl-11 pr-24 py-3 rounded-xl text-sm placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center space-x-2 bg-slate-900 border border-slate-800 text-slate-300 px-4 py-3 rounded-xl text-sm hover:text-white transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters ({Object.keys(activeFilters).length})</span>
          </button>

          {(isSearchMode || isFilterMode) && (
            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 bg-slate-900/60 border border-slate-800 hover:bg-slate-850 text-indigo-400 px-4 py-3 rounded-xl text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTERS SIDEBAR - Desktop */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="glass-card rounded-xl p-5 sticky top-24 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-bold text-white flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                <span>Search Filters</span>
              </h3>
              {Object.keys(activeFilters).length > 0 && (
                <button onClick={handleReset} className="text-xs text-indigo-400 hover:text-indigo-300">
                  Clear
                </button>
              )}
            </div>

            {filterableFields.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No filters configurable yet.</p>
            ) : (
              <form onSubmit={handleFilterSubmit} className="space-y-4">
                {filterableFields.map((field) => (
                  <div key={field._id} className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {field.label}
                    </label>

                    {field.type === 'select' && (
                      <select
                        value={activeFilters[field.name] || ''}
                        onChange={(e) => handleFilterChange(field.name, e.target.value)}
                        className="glass-input w-full px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                      >
                        <option value="">All</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === 'boolean' && (
                      <select
                        value={activeFilters[field.name] || ''}
                        onChange={(e) => handleFilterChange(field.name, e.target.value)}
                        className="glass-input w-full px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                      >
                        <option value="">All</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-bold tracking-wide transition-colors"
                >
                  Apply Filter Specifications
                </button>
              </form>
            )}
          </div>
        </div>

        {/* MOBILE FILTERS DRAWER / OVERLAY */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-black/80 flex justify-end md:hidden animate-fade-in">
            <div className="w-80 bg-slate-950 border-l border-white/10 h-full p-6 space-y-6 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h3 className="font-bold text-white flex items-center space-x-2">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                    <span>Filter Panel</span>
                  </h3>
                  <button onClick={() => setShowMobileFilters(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {filterableFields.map((field) => (
                    <div key={field._id} className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {field.label}
                      </label>
                      {field.type === 'select' && (
                        <select
                          value={activeFilters[field.name] || ''}
                          onChange={(e) => handleFilterChange(field.name, e.target.value)}
                          className="glass-input w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                        >
                          <option value="">All</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                      {field.type === 'boolean' && (
                        <select
                          value={activeFilters[field.name] || ''}
                          onChange={(e) => handleFilterChange(field.name, e.target.value)}
                          className="glass-input w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                        >
                          <option value="">All</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-white/5">
                <button
                  onClick={handleFilterSubmit}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    handleReset();
                    setShowMobileFilters(false);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCT LIST GRID */}
        <div className="lg:col-span-3">
          {error && (
            <div className="mb-6 bg-red-950/20 border border-red-900/50 p-4 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl overflow-hidden animate-pulse aspect-[3/4] flex flex-col">
                  <div className="bg-slate-900 w-full h-48"></div>
                  <div className="p-5 flex-1 space-y-3.5">
                    <div className="h-4 bg-slate-900 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-900 rounded w-1/2"></div>
                    <div className="h-8 bg-slate-900 rounded pt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : diamonds.length === 0 ? (
            <div className="glass-card rounded-xl p-16 text-center text-slate-500">
              <DiamondIcon className="w-16 h-16 mx-auto mb-4 text-slate-800" />
              <h3 className="text-lg font-bold text-slate-400">No diamonds matching query</h3>
              <p className="text-sm mt-1 mb-4">Try clearing active search terms or filters.</p>
              <button
                onClick={handleReset}
                className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-900/50 px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {diamonds.map((d) => (
                  <div
                    key={d._id}
                    className="glass-card rounded-xl overflow-hidden flex flex-col group hover:border-indigo-500/35 hover:-translate-y-1 transition-all duration-350"
                  >
                    {/* Image frame */}
                    <div className="h-48 bg-slate-900 relative overflow-hidden border-b border-white/5">
                      {d.dynamicData.diamond_image ? (
                        <img
                          src={d.dynamicData.diamond_image}
                          alt={d.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <DiamondIcon className="w-12 h-12 text-slate-700/60 stroke-[1]" />
                        </div>
                      )}
                    </div>

                    {/* Metadata Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-3.5">
                        <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {d.name}
                        </h3>

                        {/* Attribute Badges preview */}
                        {d.dynamicData && Object.keys(d.dynamicData).length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(d.dynamicData)
                              .slice(0, 3)
                              .map(([k, v]) => {
                                if (v === true || v === 'true') {
                                  return (
                                    <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/40 text-indigo-300 border border-indigo-900/30 font-mono">
                                      {k}
                                    </span>
                                  );
                                }
                                if (v === false || v === 'false') return null;
                                return (
                                  <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                                    {v}
                                  </span>
                                );
                              })}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 italic">No features specified</p>
                        )}
                      </div>

                      <div className="pt-4 mt-4 border-t border-white/5">
                        <Link
                          to={`/diamonds/${d._id}`}
                          className="w-full block text-center bg-slate-900 border border-slate-800 group-hover:bg-indigo-600 group-hover:border-indigo-500 group-hover:text-white text-slate-300 py-2 rounded-lg text-xs font-semibold transition-all"
                        >
                          View Specifications
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginated Navigation (only if not searching/filtering) */}
              {!isSearchMode && !isFilterMode && totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-white/5 pt-6">
                  <div className="text-xs text-slate-500">
                    Showing <strong className="text-white">{diamonds.length}</strong> of{' '}
                    <strong className="text-white">{total}</strong> diamonds
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-300">
                      Page <strong className="text-white">{page}</strong> of{' '}
                      <strong className="text-white">{totalPages}</strong>
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
