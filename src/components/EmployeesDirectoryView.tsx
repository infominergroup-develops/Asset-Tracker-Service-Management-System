import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Employee } from '../types';
import {
  Search,
  Plus,
  Phone,
  MapPin,
  Building2,
  Edit2,
  X,
  Users,
} from 'lucide-react';

export const EmployeesDirectoryView: React.FC = () => {
  const { employees, role, createEmployee, updateEmployee, departments, entities, locations } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState(departments[0] || '');
  const [entity, setEntity] = useState(entities[0] || '');
  const [location, setLocation] = useState(locations[0] || '');

  const openAddModal = () => {
    setEditingEmployee(null);
    setId(`EMP-${Math.floor(Math.random() * 900) + 100}`);
    setName('');
    setPhone('');
    setDepartment(departments[0] || '');
    setEntity(entities[0] || '');
    setLocation(locations[0] || '');
    setShowModal(true);
  };

  const openEditModal = (e: Employee) => {
    setEditingEmployee(e);
    setId(e.id);
    setName(e.name);
    setPhone(e.phone);
    setDepartment(e.department);
    setEntity(e.entity);
    setLocation(e.location);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        name,
        phone,
        department,
        entity,
        location,
      });
    } else {
      createEmployee({
        id,
        name,
        phone,
        department,
        entity,
        location,
      });
    }
    setShowModal(false);
  };

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'All' || e.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8 space-y-6" id="employees-directory-view">
      {/* Top Banner */}
      <div className="bg-[#2d3e50] text-white rounded-xl p-6 shadow-md border border-[#1e293b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">Employee Directory</h1>
          <p className="text-slate-300 text-xs mt-1">
            Manage organization employees, their departments, and contact details.
          </p>
        </div>
        {(role === 'manager' || role === 'admin' || role === 'director') && (
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee name or ID..."
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg w-52 sm:w-72 focus:outline-hidden focus:border-[#eb8a23]"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23]"
          >
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Total Employees: <strong>{filteredEmployees.length}</strong>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <div
            key={employee.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-[#eb8a23] transition p-5 space-y-4 text-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-[#eb8a23] text-xs block mb-0.5">
                  {employee.id}
                </span>
                <h3 className="font-bold text-base text-[#2d3e50]">{employee.name}</h3>
                <span className="text-[11px] text-slate-500 block">{employee.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 p-1.5 rounded-md text-blue-900 font-black font-mono">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                {(role === 'manager' || role === 'admin' || role === 'director') && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditModal(employee);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition relative z-10"
                    title="Edit Employee"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{employee.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{employee.entity}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{employee.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Employee Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-[#2d3e50] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base">{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee ID</label>
                  <input required type="text" value={id} onChange={(e) => setId(e.target.value)} disabled={!!editingEmployee} className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500 font-mono" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input required type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Entity</label>
                  <select value={entity} onChange={(e) => setEntity(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                    {entities.map((ent) => (
                      <option key={ent} value={ent}>{ent}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold rounded-lg">{editingEmployee ? 'Save Changes' : 'Create Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
