import React, { useState } from 'react';

interface StaffMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'active' | 'on-break' | 'off-duty';
  avatar: string;
}

const StaffManagement: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const roles = ['all', 'manager', 'cashier', 'chef', 'waiter', 'cleaner'];

  const staffMembers: StaffMember[] = [
    {
      id: 1,
      name: 'John Doe',
      role: 'cashier',
      email: 'john@restaurant.com',
      phone: '+1 234-567-8901',
      status: 'active',
      avatar: 'JD',
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'manager',
      email: 'jane@restaurant.com',
      phone: '+1 234-567-8902',
      status: 'active',
      avatar: 'JS',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'chef',
      email: 'mike@restaurant.com',
      phone: '+1 234-567-8903',
      status: 'on-break',
      avatar: 'MJ',
    },
    {
      id: 4,
      name: 'Sarah Williams',
      role: 'waiter',
      email: 'sarah@restaurant.com',
      phone: '+1 234-567-8904',
      status: 'active',
      avatar: 'SW',
    },
    {
      id: 5,
      name: 'Tom Brown',
      role: 'cleaner',
      email: 'tom@restaurant.com',
      phone: '+1 234-567-8905',
      status: 'off-duty',
      avatar: 'TB',
    },
    {
      id: 6,
      name: 'Emily Davis',
      role: 'waiter',
      email: 'emily@restaurant.com',
      phone: '+1 234-567-8906',
      status: 'active',
      avatar: 'ED',
    },
  ];

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-600 mt-1">Manage restaurant staff and schedules</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
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

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md"
          >
            <div className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                  {staff.avatar}
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
                  <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                    ✏️
                  </button>
                  <button className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffManagement;
