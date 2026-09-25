import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Plus, Edit2, Trash2, X, Check, Building2 } from 'lucide-react';

export const LocationsView: React.FC = () => {
  const { locations, addLocation, updateLocation, deleteLocation, role } = useApp();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editAddress, setEditAddress] = useState('');

  const canEdit = ['admin', 'manager', 'director'].includes(role);

  const handleAdd = async () => {
    if (!newAddress.trim()) return;
    await addLocation(newAddress.trim());
    setNewAddress('');
    setIsAdding(false);
  };

  const handleUpdate = async (oldAddress: string) => {
    if (!editAddress.trim()) return;
    await updateLocation(oldAddress, editAddress.trim());
    setEditingIndex(null);
    setEditAddress('');
  };

  const handleDelete = async (address: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      await deleteLocation(address);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-600" />
            Locations & Addresses
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage company locations for assets and tickets.</p>
        </div>
        
        {canEdit && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm font-medium transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Location
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {isAdding && (
            <li className="p-4 bg-slate-50/50 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                className="flex-1 px-3 py-1.5 border border-purple-300 focus:ring-2 focus:ring-purple-500 rounded-lg outline-none text-sm"
                placeholder="Enter new address..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <button onClick={handleAdd} className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setIsAdding(false)} className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </li>
          )}
          
          {locations.map((loc, idx) => (
            <li key={idx} className="p-4 hover:bg-slate-50 transition flex items-center justify-between group">
              {editingIndex === idx ? (
                <div className="flex-1 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-purple-500 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    className="flex-1 px-3 py-1.5 border border-purple-300 focus:ring-2 focus:ring-purple-500 rounded-lg outline-none text-sm"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate(loc)}
                  />
                  <button onClick={() => handleUpdate(loc)} className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingIndex(null)} className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
                    <span className="text-sm font-medium text-slate-700">{loc}</span>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingIndex(idx); setEditAddress(loc); }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(loc)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
          {locations.length === 0 && !isAdding && (
            <li className="p-8 text-center text-slate-500 text-sm">No locations found. Add one to get started.</li>
          )}
        </ul>
      </div>
    </div>
  );
};
