import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Diamond, Menu, X, LogOut, LogIn, LayoutDashboard, Wrench, Search } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-panel sticky top-0 z-50 border-b border-white/5 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2 text-white group" onClick={() => setIsOpen(false)}>
          <Diamond className="w-8 h-8 text-indigo-500 fill-indigo-500/20 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            ARHAM DIAMONDS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
          >
            Browse Catalog
          </Link>

          {isAuthenticated && isAdmin && (
            <>
              <Link
                to="/admin"
                className={`text-sm font-medium flex items-center space-x-1.5 transition-colors ${isActive('/admin') ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin/form-builder"
                className={`text-sm font-medium flex items-center space-x-1.5 transition-colors ${isActive('/admin/form-builder') ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
              >
                <Wrench className="w-4 h-4" />
                <span>Form Builder</span>
              </Link>
            </>
          )}
        </div>

        {/* Auth Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Admin: <strong className="text-white font-semibold">{user?.username}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-900/50 px-3 py-1.5 rounded-lg text-sm transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium shadow-md shadow-indigo-600/20 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Admin Login</span>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-3 pt-3 pb-2 border-t border-white/5 space-y-2 animate-slide-up">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-lg text-base font-medium ${isActive('/') ? 'bg-slate-900 text-indigo-400' : 'text-slate-300 hover:bg-slate-900/50 hover:text-white'
              }`}
          >
            Browse Catalog
          </Link>

          {isAuthenticated && isAdmin && (
            <>
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium ${isActive('/admin') ? 'bg-slate-900 text-indigo-400' : 'text-slate-300 hover:bg-slate-900/50 hover:text-white'
                  }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin/form-builder"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium ${isActive('/admin/form-builder') ? 'bg-slate-900 text-indigo-400' : 'text-slate-300 hover:bg-slate-900/50 hover:text-white'
                  }`}
              >
                <Wrench className="w-5 h-5" />
                <span>Form Builder</span>
              </Link>
            </>
          )}

          <div className="pt-2 border-t border-white/5">
            {isAuthenticated ? (
              <div className="px-3 space-y-2">
                <div className="text-sm text-slate-400">
                  Logged in as: <strong className="text-white">{user?.username}</strong>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-1 bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-900/50 px-4 py-2 rounded-lg text-sm transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="px-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-indigo-600/20 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Admin Login</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
