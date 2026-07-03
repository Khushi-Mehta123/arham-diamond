import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { token, user } = response.data;
      login(token, user);
      navigate('/admin');
    } catch (err: any) {
      console.error('Login request error:', err);
      setError(
        err.response?.data?.message || 'Login failed. Please verify your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="glass-card rounded-2xl p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-400 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Admin Authentication</h2>
          <p className="text-slate-400 text-sm mt-1">
            Access credentials required to update fields, sections, or diamonds.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center space-x-2 bg-red-950/30 border border-red-900/50 rounded-lg p-3 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold tracking-wide shadow-lg shadow-indigo-600/25 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            Default credentials are set to <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300">admin</code> / <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
};
