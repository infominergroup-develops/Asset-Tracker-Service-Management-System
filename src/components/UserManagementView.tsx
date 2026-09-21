import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, UserProfile } from '../types';
import { Shield, Plus, X, Lock, Mail, User, Briefcase } from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const { users, addUser, updateUser } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('manager');
  const [designation, setDesignation] = useState('');
  
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) return;

    if (editingUserId) {
      updateUser(editingUserId, {
        name,
        email,
        ...(password ? { password } : {}),
        role,
        designation: designation || undefined,
      });
    } else {
      const newUser: UserProfile = {
        id: `USR-${Date.now()}`,
        name,
        email,
        password,
        role,
        designation: designation || undefined,
      };
      addUser(newUser);
    }
    setShowAddForm(false);
    setEditingUserId(null);
    
    // reset
    setName('');
    setEmail('');
    setPassword('');
    setRole('manager');
    setDesignation('');
  };

  const getRoleBadgeColor = (r: string) => {
    switch (r) {
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'director': return 'bg-purple-100 text-purple-800';
      case 'vendor': return 'bg-orange-100 text-orange-800';
      case 'admin': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#eb8a23]" />
            User Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage access for Directors, Managers, and Vendors.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUserId(null);
            setName('');
            setEmail('');
            setPassword('');
            setRole('manager');
            setDesignation('');
            setShowAddForm(true);
          }}
          className="bg-[#eb8a23] hover:bg-[#d97917] text-white px-4 py-2 rounded-lg font-medium shadow-xs transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-900">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Designation</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.filter(u => u.role !== 'employee').map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {user.designation || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setEditingUserId(user.id);
                        setName(user.name);
                        setEmail(user.email);
                        setPassword('');
                        setRole(user.role);
                        setDesignation(user.designation || '');
                        setShowAddForm(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{editingUserId ? 'Edit User' : 'Create New Login'}</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddUser} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#eb8a23]/50 focus:border-[#eb8a23] transition"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#eb8a23]/50 focus:border-[#eb8a23] transition"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Initial Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required={!editingUserId}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#eb8a23]/50 focus:border-[#eb8a23] transition"
                        placeholder={editingUserId ? "Leave blank to keep unchanged" : "Set a password"}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#eb8a23]/50 focus:border-[#eb8a23] transition"
                    >
                      <option value="manager">Manager</option>
                      <option value="director">Director</option>
                      <option value="vendor">Vendor</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Designation (Optional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#eb8a23]/50 focus:border-[#eb8a23] transition"
                        placeholder="e.g. Area Manager"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg font-medium bg-[#eb8a23] text-white hover:bg-[#d97917] transition shadow-xs text-sm"
                  >
                    {editingUserId ? 'Save Changes' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
