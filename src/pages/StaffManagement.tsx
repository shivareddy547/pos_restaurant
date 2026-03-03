import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Authentication helper - use this for all API calls
const getAuthToken = (): string | null => {
  const session = localStorage.getItem('pos_auth_session');
  if (!session) return null;
  try {
    const parsed = JSON.parse(session);
    return parsed.token ?? null;
  } catch (error) {
    console.error('Invalid session JSON');
    return null;
  }
};

// Helper function for authenticated API calls
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized - redirect to login or refresh token
      console.error('Unauthorized access');
    }
    throw new Error(`API call failed: ${response.statusText}`);
  }
  return response.json();
};

interface StaffMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'active' | 'on-break' | 'off-duty';
  avatar: string;
  created_at: string;
  updated_at: string;
}

const StaffManagement: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);

  const roles = ['all', 'manager', 'cashier', 'chef', 'waiter', 'cleaner'];

  // Fetch staff members from API
  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`${API_URL}/staff`);
      setStaffMembers(data);
    } catch (err) {
      setError('Failed to load staff members');
      console.error(err);
      // Fallback to dummy data if API fails (for development)
      setStaffMembers([
        {
          id: 1,
          name: 'John Doe',
          role: 'cashier',
          email: 'john@restaurant.com',
          phone: '+1 234-567-8901',
          status: 'active',
          avatar: 'JD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Jane Smith',
          role: 'manager',
          email: 'jane@restaurant.com',
          phone: '+1 234-567-8902',
          status: 'active',
          avatar: 'JS',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 3,
          name: 'Mike Johnson',
          role: 'chef',
          email: 'mike@restaurant.com',
          phone: '+1 234-567-8903',
          status: 'on-break',
          avatar: 'MJ',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Handle Add Staff
  const handleAddStaff = async (newStaff: Partial<StaffMember>) => {
    try {
      await fetchWithAuth(`${API_URL}/staff`, {
        method: 'POST',
        body: JSON.stringify(newStaff),
      });
      setShowAddModal(false);
      fetchStaff();
    } catch (err) {
      setError('Failed to add staff member');
      console.error(err);
    }
  };

  // Handle Edit Staff
  const handleEditStaff = async (id: number, updatedStaff: Partial<StaffMember>) => {
    try {
      await fetchWithAuth(`${API_URL}/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedStaff),
      });
      setShowEditModal(false);
      setCurrentStaff(null);
      fetchStaff();
    } catch (err) {
      setError('Failed to update staff member');
      console.error(err);
    }
  };

  // Handle Delete Staff
  const handleDeleteStaff = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      await fetchWithAuth(`${API_URL}/staff/${id}`, {
        method: 'DELETE',
      });
      fetchStaff();
    } catch (err) {
      setError('Failed to delete staff member');
      console.error(err);
    }
  };

  const filteredStaff =
    selectedRole === 'all' ? staffMembers : staffMembers.filter((s) => s.role === selectedRole);

  const getStatusColor = (status: StaffMember['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'on-break':
        return 'bg-yellow-100 text-yellow-700';
      case 'off-duty':
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusDot = (status: StaffMember['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'on-break':
        return 'bg-yellow-500';
      case 'off-duty':
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 lg:mt-[5%]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-600 mt-1">Manage restaurant staff and schedules</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          + Add Staff Member
        </button>
      </div>

      {/* Role Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                selectedRole === role
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-gray-500">Loading staff members...</div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 font-bold">✕</button>
        </div>
      )}

      {/* Staff Grid or Empty State */}
      {!loading && (
        <>
          {filteredStaff.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Staff Members Available Currently</h3>
              <p className="text-gray-500">
                {selectedRole === 'all' 
                  ? 'There are no staff members added yet. Click the "Add Staff Member" button to get started.' 
                  : `No staff members found with the role "${selectedRole}".`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                        {staff.avatar || staff.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{staff.role}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getStatusDot(staff.status)}`}></div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📧</span>
                        <span className="truncate">{staff.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📱</span>
                        <span>{staff.phone}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(staff.status)}`}>
                        {staff.status.replace('-', ' ')}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setCurrentStaff(staff);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteStaff(staff.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Staff Member</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddStaff({
                name: formData.get('name') as string,
                role: formData.get('role') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                status: formData.get('status') as StaffMember['status'],
                avatar: formData.get('name')?.toString().substring(0, 2).toUpperCase() || 'NA',
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input name="name" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select name="role" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {roles.filter(r => r !== 'all').map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input name="phone" type="tel" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="active">Active</option>
                    <option value="on-break">On Break</option>
                    <option value="off-duty">Off Duty</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Add Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && currentStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Staff Member</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleEditStaff(currentStaff.id, {
                name: formData.get('name') as string,
                role: formData.get('role') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                status: formData.get('status') as StaffMember['status'],
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input name="name" type="text" defaultValue={currentStaff.name} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select name="role" defaultValue={currentStaff.role} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {roles.filter(r => r !== 'all').map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" type="email" defaultValue={currentStaff.email} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input name="phone" type="tel" defaultValue={currentStaff.phone} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" defaultValue={currentStaff.status} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="active">Active</option>
                    <option value="on-break">On Break</option>
                    <option value="off-duty">Off Duty</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => {
                  setShowEditModal(false);
                  setCurrentStaff(null);
                }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Update Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
