import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Plus, Edit, Trash2, ShieldAlert, ArrowLeft, ArrowRight, Eye, Grid } from 'lucide-react';

interface Diamond {
  _id: string;
  name: string;
  images: string[];
  dynamicData: Record<string, any>;
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const limit = 10;

  useEffect(() => {
    fetchDiamonds();
  }, [page]);

  const fetchDiamonds = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/diamonds?page=${page}&limit=${limit}`);
      setDiamonds(res.data.diamonds);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch diamonds.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this diamond record permanently?')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/diamonds/${id}`);
      setSuccess('Diamond record deleted successfully.');
      // Reload diamonds (or adjust page number if deleting last item)
      if (diamonds.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchDiamonds();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete diamond.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Diamond Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage active catalog listings, edit fields, and publish new diamonds.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Link
            to="/admin/diamonds/new"
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Diamond</span>
          </Link>
        </div>
      </div>

      {success && (
        <div className="mb-6 px-4 py-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/50 text-indigo-300 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 px-4 py-2.5 rounded-lg bg-red-950/30 border border-red-900/50 text-red-300 text-sm flex items-center space-x-1.5">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading active listings...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {diamonds.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center text-slate-500">
              <Grid className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p className="font-semibold text-slate-400">No diamonds listed yet</p>
              <p className="text-sm mt-1 mb-4">Click "Create Diamond" to write your first entry.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block glass-card rounded-xl overflow-hidden border border-white/5">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/40 text-slate-400 border-b border-white/5 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Image</th>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Date Registered</th>
                      <th className="px-6 py-4 font-semibold">Dynamic Details Preview</th>
                      <th className="px-6 py-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {diamonds.map((d) => (
                      <tr key={d._id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4">
                          {d.dynamicData.diamond_image ? (
                            <img
                              src={d.dynamicData.diamond_image}
                              alt={d.name}
                              className="w-12 h-12 object-cover rounded-lg border border-white/10"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg border border-white/5 bg-slate-900 flex items-center justify-center text-slate-600">
                              No Image
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">{d.name}</td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {new Date(d.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate text-xs text-slate-400">
                          {d.dynamicData && Object.keys(d.dynamicData).length > 0 ? (
                            <span className="font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                              {Object.entries(d.dynamicData)
                                .slice(0, 3)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(' | ')}
                              {Object.keys(d.dynamicData).length > 3 && ' ...'}
                            </span>
                          ) : (
                            <span className="italic text-slate-600">Empty spec sheet</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2.5">
                            <Link
                              to={`/diamonds/${d._id}`}
                              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                              title="Public View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/admin/diamonds/edit/${d._id}`}
                              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                              title="Edit Record"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(d._id)}
                              className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-950/30"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Layout */}
              <div className="grid md:hidden grid-cols-1 gap-4">
                {diamonds.map((d) => (
                  <div key={d._id} className="glass-card rounded-xl p-4 flex flex-col space-y-4 border border-white/5">
                    <div className="flex items-center space-x-3.5">
                      {d.images && d.images.length > 0 ? (
                        <img
                          src={d.images[0]}
                          alt={d.name}
                          className="w-14 h-14 object-cover rounded-lg border border-white/10"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 text-xs">
                          No Photo
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-white text-base">{d.name}</h3>
                        <p className="text-slate-500 text-xs">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {d.dynamicData && Object.keys(d.dynamicData).length > 0 && (
                      <div className="bg-slate-900/60 border border-slate-850 p-2.5 rounded text-xs text-slate-400 font-mono">
                        {Object.entries(d.dynamicData)
                          .slice(0, 3)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')}
                      </div>
                    )}

                    <div className="flex justify-end items-center space-x-3 pt-2 border-t border-white/5">
                      <Link
                        to={`/diamonds/${d._id}`}
                        className="flex items-center space-x-1 text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                      <Link
                        to={`/admin/diamonds/edit/${d._id}`}
                        className="flex items-center space-x-1 text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(d._id)}
                        className="flex items-center space-x-1 text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-950/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="text-sm text-slate-400">
                    Showing <strong className="text-white">{diamonds.length}</strong> of{' '}
                    <strong className="text-white">{total}</strong> records
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="flex items-center space-x-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 px-3 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Prev</span>
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="flex items-center space-x-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 px-3 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
