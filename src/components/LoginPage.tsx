import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InfominerLogo } from './InfominerLogo';
import { Lock, Mail, ChevronRight, User } from 'lucide-react';

interface LoginPageProps {
  onBack?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const { login, setActiveTab } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errorMsg = await login(email, password);
    if (!errorMsg) {
      // success, context handles routing
    } else {
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 selection:bg-[#eb8a23]/20 selection:text-[#d97917]">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700/60">
        <div className="p-8 pb-6 border-b border-slate-700/60 bg-[#2d3e50]/40">
          <div className="flex justify-center mb-6">
            <InfominerLogo size="lg" variant="light" />
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-2">
            Sign In to Asset Tracker
          </h2>
          <p className="text-center text-slate-400 text-sm">
            Access the Service Management System
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-600 rounded-lg bg-slate-900/50 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#eb8a23] focus:border-transparent transition-shadow sm:text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-600 rounded-lg bg-slate-900/50 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#eb8a23] focus:border-transparent transition-shadow sm:text-sm"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-bold text-white bg-[#eb8a23] hover:bg-[#d97917] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-[#eb8a23] transition-colors"
            >
              Sign In
            </button>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-transparent hover:bg-slate-700 text-slate-300 rounded-xl transition text-sm font-medium border border-slate-600"
            >
              Back to Public Portal
            </button>
          )}
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/60">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">
              Login Roles
            </h3>
            <div className="text-xs text-slate-400 text-center space-y-1">
              <p>Manager, Director, or Vendor only.</p>
              <p>Contact your Director for access.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
