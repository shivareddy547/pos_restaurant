// File: /Users/sadudodla/shiva/user_projects/1/pos_restaurant/src/pages/FloorManagement.tsx
// Component: FloorManagement
// Project: pos_restaurant

// ⚠️ MODIFY existing component - fix API routes for tables (nested under floors)
// Tables API routes require floor_id: /api/floors/:floor_id/tables/:id

import React, { useState, useEffect, useCallback } from 'react';

// Types
type TableStatus = 'available' | 'occupied' | 'reserved' | 'billing';

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  orderId?: string;
  waiter?: string;
  timeSeated?: string;
  total?: string;
  floorId?: string;
}

interface Floor {
  id: string;
  name: string;
  tables: Table[];
}

// API Service Functions
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getAuthToken = (): string | null => {
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

// Fetch all floors
const fetchFloors = async (): Promise<any[]> => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found');

  const response = await fetch(`${API_URL}/floors`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

// Fetch single floor by ID
const fetchFloorById = async (floorId: string): Promise<any> => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found');

  const response = await fetch(`${API_URL}/floors/${floorId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Create floor
const createFloor = async (name: string): Promise<any> => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found');

  const response = await fetch(`${API_URL}/floors`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Update floor (PUT)
const updateFloor = async (floorId: string, name: string): Promise<any> => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found');

  const response = await fetch(`${API_URL}/floors/${floorId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Patch floor (PATCH)
const patchFloor = async (floorId: string, data: Partial<{ name: string }>): Promise<any> => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found');

  const response = await fetch(`${API_URL}/floors/${floorId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Delete floor
const deleteFloor = async (floorId: string): Promise<void> => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found');

  const response = await fetch(`${API_URL}/floors/${floorId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

// Create table - requires floorId (nested route)
const createTable = async (floorId: string, capacity: number): Promise<any> => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found');

  const response = await fetch(`${API_URL}/floors/${floorId}/tables`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ capacity })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Update table - requires floorId (nested route: /api/floors/:floor_id/tables/:id)
const updateTable = async (floorId: string, tableId: string, data: Partial<{ capacity: number; status: string; waiter: string }>): Promise<any> => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found');

  const response = await fetch(`${API_URL}/floors/${floorId}/tables/${tableId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Delete table - requires floorId (nested route: /api/floors/:floor_id/tables/:id)
const deleteTable = async (floorId: string, tableId: string): Promise<void> => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found');

  const response = await fetch(`${API_URL}/floors/${floorId}/tables/${tableId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

// Clear table - requires floorId (nested route: /api/floors/:floor_id/tables/:id/clear)
const clearTable = async (floorId: string, tableId: string): Promise<any> => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found');

  const response = await fetch(`${API_URL}/floors/${floorId}/tables/${tableId}/clear`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Start order for table - requires floorId (nested route)
const startOrderForTable = async (floorId: string, tableId: string): Promise<any> => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found');

  const response = await fetch(`${API_URL}/floors/${floorId}/tables/${tableId}/start_order`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const FloorManagement: React.FC = () => {
  // Initialize with empty array - no mock data
  const [floors, setFloors] = useState<Floor[]>([]);
  const [activeFloorId, setActiveFloorId] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Management UI States
  const [showAddFloorModal, setShowAddFloorModal] = useState(false);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [showEditFloorModal, setShowEditFloorModal] = useState(false);
  const [showDeleteFloorModal, setShowDeleteFloorModal] = useState(false);
  const [showEditTableModal, setShowEditTableModal] = useState(false);
  const [showDeleteTableModal, setShowDeleteTableModal] = useState(false);
  const [newFloorName, setNewFloorName] = useState('');
  const [editFloorName, setEditFloorName] = useState('');
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [deletingFloor, setDeletingFloor] = useState<Floor | null>(null);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [deletingTable, setDeletingTable] = useState<Table | null>(null);
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [editTableCapacity, setEditTableCapacity] = useState(4);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeFloor = floors.find(f => f.id === activeFloorId);

  // Helper: Show Toast
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Helper: Get floorId for a table
  const getTableFloorId = useCallback((tableId: string): string | null => {
    for (const floor of floors) {
      if (floor.tables.some(t => t.id === tableId)) {
        return floor.id;
      }
    }
    return null;
  }, [floors]);

  // Load floors from API on component mount
  useEffect(() => {
    const loadFloors = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiFloors = await fetchFloors();
        
        // Transform API response to match our local format
        const transformedFloors: Floor[] = apiFloors.map((apiFloor: any) => ({
          id: apiFloor.id.toString(),
          name: apiFloor.name,
          tables: apiFloor.tables ? apiFloor.tables.map((table: any) => ({
            id: table.id.toString(),
            number: table.number,
            capacity: table.capacity,
            status: table.status as TableStatus,
            orderId: table.order_id ? `#${table.order_id}` : undefined,
            waiter: table.waiter || undefined,
            timeSeated: table.time_seated ? new Date(table.time_seated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            total: table.total ? `$${parseFloat(table.total).toFixed(2)}` : undefined,
            floorId: apiFloor.id.toString()
          })) : []
        }));
        
        setFloors(transformedFloors);
        if (transformedFloors.length > 0) {
          setActiveFloorId(transformedFloors[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load floors:', err);
        setError('Failed to load floor data. Please try again.');
        // Keep empty state - don't use mock data
        setFloors([]);
      } finally {
        setLoading(false);
      }
    };

    loadFloors();
  }, []);

  // Simulate real-time updates - Modified to update floors state directly
  useEffect(() => {
    // Only run interval if there are floors
    if (floors.length === 0) return;
    
    const interval = setInterval(() => {
      setLastUpdated(new Date());
      if (Math.random() > 0.7) {
        setFloors(prevFloors => 
          prevFloors.map(floor => ({
            ...floor,
            tables: floor.tables.map(table => {
              // Only occasionally change status for demo purposes
              if (Math.random() > 0.95 && table.status === 'occupied') {
                return { ...table, status: 'billing' as TableStatus };
              }
              if (Math.random() > 0.98 && table.status === 'billing') {
                return { ...table, status: 'available' as TableStatus, orderId: undefined, waiter: undefined, timeSeated: undefined, total: undefined };
              }
              return table;
            })
          }))
        );
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [floors.length]);

  // Action: Add Floor
  const handleCreateFloor = async () => {
    if (!newFloorName.trim()) return;
    
    try {
      setLoading(true);
      const apiResponse = await createFloor(newFloorName);
      
      // Transform API response to match our local format
      const newFloor: Floor = {
        id: apiResponse.id.toString(),
        name: apiResponse.name,
        tables: []
      };
      
      setFloors([...floors, newFloor]);
      setActiveFloorId(newFloor.id);
      setNewFloorName('');
      setShowAddFloorModal(false);
      showToast(`Floor "${newFloorName}" created successfully`);
    } catch (err: any) {
      console.error('Failed to create floor:', err);
      setError('Failed to create floor');
      showToast('Failed to create floor', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Action: Update Floor
  const handleUpdateFloor = async () => {
    if (!editingFloor || !editFloorName.trim()) return;
    
    try {
      setLoading(true);
      const apiResponse = await updateFloor(editingFloor.id, editFloorName);
      
      const updatedFloors = floors.map(f => 
        f.id === editingFloor.id 
          ? { ...f, name: apiResponse.name }
          : f
      );
      
      setFloors(updatedFloors);
      setEditingFloor(null);
      setEditFloorName('');
      setShowEditFloorModal(false);
      showToast(`Floor renamed to "${editFloorName}" successfully`);
    } catch (err: any) {
      console.error('Failed to update floor:', err);
      setError('Failed to update floor');
      showToast('Failed to update floor', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Action: Delete Floor
  const handleDeleteFloor = async () => {
    if (!deletingFloor) return;
    
    try {
      setLoading(true);
      await deleteFloor(deletingFloor.id);
      
      const updatedFloors = floors.filter(f => f.id !== deletingFloor.id);
      setFloors(updatedFloors);
      
      // Set active floor to first available or empty
      if (activeFloorId === deletingFloor.id) {
        setActiveFloorId(updatedFloors.length > 0 ? updatedFloors[0].id : '');
      }
      
      setDeletingFloor(null);
      setShowDeleteFloorModal(false);
      showToast(`Floor "${deletingFloor.name}" deleted successfully`);
    } catch (err: any) {
      console.error('Failed to delete floor:', err);
      setError('Failed to delete floor');
      showToast('Failed to delete floor', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Action: Add Table
  const handleAddTable = async () => {
    if (!activeFloor) return;
    
    try {
      setLoading(true);
      const apiResponse = await createTable(activeFloorId, newTableCapacity);
      
      // Transform API response to match our local format
      const newTable: Table = {
        id: apiResponse.id.toString(),
        number: apiResponse.number,
        capacity: apiResponse.capacity,
        status: apiResponse.status as TableStatus,
        floorId: activeFloorId
      };
      
      const updatedFloors = floors.map(f => 
        f.id === activeFloorId 
          ? { ...f, tables: [...f.tables, newTable] }
          : f
      );
      
      setFloors(updatedFloors);
      setNewTableCapacity(4);
      setShowAddTableModal(false);
      showToast(`Table ${apiResponse.number} added to ${activeFloor.name}`);
    } catch (err: any) {
      console.error('Failed to add table:', err);
      setError('Failed to add table');
      showToast('Failed to add table', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Action: Update Table - FIXED: now uses nested route with floorId
  const handleUpdateTable = async () => {
    if (!editingTable || !activeFloor) return;
    
    // Get the floorId for this table
    const tableFloorId = editingTable.floorId || activeFloorId;
    
    try {
      setLoading(true);
      const apiResponse = await updateTable(tableFloorId, editingTable.id, { 
        capacity: editTableCapacity,
        status: editingTable.status 
      });
      
      const updatedFloors = floors.map(f => 
        f.id === tableFloorId 
          ? { 
              ...f, 
              tables: f.tables.map(t => 
                t.id === editingTable.id 
                  ? { 
                      ...t, 
                      capacity: apiResponse.capacity || editTableCapacity,
                      status: (apiResponse.status || editingTable.status) as TableStatus
                    }
                  : t
              )
            }
          : f
      );
      
      setFloors(updatedFloors);
      setEditingTable(null);
      setEditTableCapacity(4);
      setShowEditTableModal(false);
      showToast(`Table ${editingTable.number} updated successfully`);
    } catch (err: any) {
      console.error('Failed to update table:', err);
      setError('Failed to update table');
      showToast('Failed to update table', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Action: Delete Table - FIXED: now uses nested route with floorId
  const handleDeleteTable = async () => {
    if (!deletingTable) return;
    
    // Get the floorId for this table
    const tableFloorId = deletingTable.floorId || getTableFloorId(deletingTable.id);
    
    if (!tableFloorId) {
      showToast('Could not determine floor for this table', 'error');
      return;
    }
    
    try {
      setLoading(true);
      await deleteTable(tableFloorId, deletingTable.id);
      
      const updatedFloors = floors.map(f => 
        f.id === tableFloorId 
          ? { ...f, tables: f.tables.filter(t => t.id !== deletingTable.id) }
          : f
      );
      
      setFloors(updatedFloors);
      setSelectedTable(null);
      setDeletingTable(null);
      setShowDeleteTableModal(false);
      showToast(`Table ${deletingTable.number} deleted successfully`);
    } catch (err: any) {
      console.error('Failed to delete table:', err);
      setError('Failed to delete table');
      showToast('Failed to delete table', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Action: Start Order (Change Status to Occupied) - FIXED: now uses nested route with floorId
  const handleStartOrder = async (table: Table) => {
    // Get the floorId for this table
    const tableFloorId = table.floorId || getTableFloorId(table.id);
    
    if (!tableFloorId) {
      showToast('Could not determine floor for this table', 'error');
      return;
    }
    
    try {
      setLoading(true);
      // Call API to start order
      await startOrderForTable(tableFloorId, table.id);
      
      const updatedFloors = floors.map(f => ({
        ...f,
        tables: f.tables.map(t => 
          t.id === table.id 
            ? { 
                ...t, 
                status: 'occupied' as TableStatus, 
                orderId: `#${Math.floor(Math.random() * 9000) + 1000}`,
                waiter: 'Staff Member',
                timeSeated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                total: '$0.00'
              }
            : t
        )
      }));
      setFloors(updatedFloors);
      setSelectedTable(null);
      showToast(`Order started for ${table.number}`);
    } catch (err: any) {
      console.error('Failed to start order:', err);
      showToast('Failed to start order', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Action: Clear Table - FIXED: now uses nested route with floorId
  const handleClearTable = async (table: Table) => {
    // Get the floorId for this table
    const tableFloorId = table.floorId || getTableFloorId(table.id);
    
    if (!tableFloorId) {
      showToast('Could not determine floor for this table', 'error');
      return;
    }
    
    try {
      setLoading(true);
      // Call API to clear table
      await clearTable(tableFloorId, table.id);
      
      const updatedFloors = floors.map(f => ({
        ...f,
        tables: f.tables.map(t => 
          t.id === table.id 
            ? { 
                ...t, 
                status: 'available' as TableStatus, 
                orderId: undefined, 
                waiter: undefined, 
                timeSeated: undefined, 
                total: undefined 
              }
            : t
        )
      }));
      setFloors(updatedFloors);
      setSelectedTable(null);
      showToast(`${table.number} cleared and available`);
    } catch (err: any) {
      console.error('Failed to clear table:', err);
      showToast('Failed to clear table', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Action: Refresh single floor data
  const handleRefreshFloor = async (floorId: string) => {
    try {
      setLoading(true);
      const apiFloor = await fetchFloorById(floorId);
      
      const transformedFloor: Floor = {
        id: apiFloor.id.toString(),
        name: apiFloor.name,
        tables: apiFloor.tables ? apiFloor.tables.map((table: any) => ({
          id: table.id.toString(),
          number: table.number,
          capacity: table.capacity,
          status: table.status as TableStatus,
          orderId: table.order_id ? `#${table.order_id}` : undefined,
          waiter: table.waiter || undefined,
          timeSeated: table.time_seated ? new Date(table.time_seated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          total: table.total ? `$${parseFloat(table.total).toFixed(2)}` : undefined,
          floorId: apiFloor.id.toString()
        })) : []
      };
      
      const updatedFloors = floors.map(f => 
        f.id === floorId ? transformedFloor : f
      );
      
      setFloors(updatedFloors);
      setLastUpdated(new Date());
      showToast(`Floor data refreshed`);
    } catch (err: any) {
      console.error('Failed to refresh floor:', err);
      showToast('Failed to refresh floor data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', ring: 'focus:ring-green-200', label: 'Available', icon: '✨' };
      case 'occupied':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', ring: 'focus:ring-red-200', label: 'Occupied', icon: '🍽️' };
      case 'reserved':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', ring: 'focus:ring-yellow-200', label: 'Reserved', icon: '📅' };
      case 'billing':
        return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', ring: 'focus:ring-blue-200', label: 'Billing', icon: '💳' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', ring: 'focus:ring-gray-200', label: 'Unknown', icon: '❓' };
    }
  };

  const getTimeSinceSeated = (timeSeated?: string): string => {
    if (!timeSeated) return '-';
    try {
      const seatedTime = new Date();
      const [hours, minutes] = timeSeated.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1, 4) || ['0', '0', 'AM'];
      const hour = parseInt(hours);
      const minute = parseInt(minutes);
      const ampm = timeSeated.includes('PM') && hour !== 12 ? 'PM' : 'AM';
      
      seatedTime.setHours(ampm === 'PM' && hour !== 12 ? hour + 12 : hour, minute, 0, 0);
      
      const now = new Date();
      const diffMs = now.getTime() - seatedTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) {
        return `${diffMins} min ago`;
      } else {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${hours}h ${mins}m ago`;
      }
    } catch {
      return timeSeated;
    }
  };

  return (
    <div className="mt-0 sm:mt-[5%] space-y-4 sm:space-y-6 min-h-screen bg-gray-50 pb-20">
      {/* Loading Indicator */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg bg-red-600 text-white text-sm font-medium">
          {error}
          <button onClick={() => setError(null)} className="ml-4 text-red-200 hover:text-white">✕</button>
        </div>
      )}
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 px-4 sm:px-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Floor Management</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <p className="text-xs sm:text-sm text-gray-500">Live • Updated {lastUpdated.toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Legend - Only show when floors exist */}
        {floors.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {(['available', 'occupied', 'reserved', 'billing'] as TableStatus[]).map((status) => {
              const config = getStatusConfig(status);
              return (
                <div key={status} className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${config.bg.replace('100', '500')}`}></div>
                  <span className="text-xs font-medium text-gray-700">{config.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* No Floors Available Message */}
      {floors.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Floors Available</h2>
            <p className="text-gray-500 mb-6">
              Get started by creating your first floor plan. You can add tables and manage seating arrangements once a floor is created.
            </p>
            <button
              onClick={() => setShowAddFloorModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-all text-sm font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create First Floor
            </button>
          </div>
        </div>
      )}

      {/* Floor Selector - Only show when floors exist */}
      {floors.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <nav className="flex space-x-0 overflow-x-auto" aria-label="Floors">
              {floors.map((floor) => {
                const floorTables = floor.tables;
                const availableCount = floorTables.filter(t => t.status === 'available').length;
                const occupiedCount = floorTables.filter(t => t.status === 'occupied').length;
                
                return (
                  <button
                    key={floor.id}
                    onClick={() => setActiveFloorId(floor.id)}
                    className={`flex-1 min-w-max px-4 sm:px-6 py-3 sm:py-4 text-left border-b-2 transition-all ${
                      activeFloorId === floor.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className={`text-sm sm:text-base font-semibold ${
                        activeFloorId === floor.id ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {floor.name}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          {availableCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          {occupiedCount}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
              
              {/* Add Floor Button */}
              <button
                onClick={() => setShowAddFloorModal(true)}
                className="flex-1 min-w-max px-4 sm:px-6 py-3 sm:py-4 text-left border-b-2 border-transparent hover:bg-gray-50 text-gray-400 hover:text-blue-600 transition-colors"
                aria-label="Add new floor"
              >
                <div className="flex items-center justify-center h-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </button>
            </nav>
          </div>

          {/* Floor Action Bar */}
          <div className="flex items-center justify-between px-4 sm:px-0">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-800">
                {activeFloor?.name} ({activeFloor?.tables.length} tables)
              </h2>
              {activeFloor && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRefreshFloor(activeFloor.id)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Refresh floor data"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setEditingFloor(activeFloor);
                      setEditFloorName(activeFloor.name);
                      setShowEditFloorModal(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit floor"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setDeletingFloor(activeFloor);
                      setShowDeleteFloorModal(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete floor"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAddTableModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-all text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Table
            </button>
          </div>

          {/* Table Grid */}
          {activeFloor && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 px-4 sm:px-0">
              {activeFloor.tables.map((table) => {
                const config = getStatusConfig(table.status);
                return (
                  <div
                    key={table.id}
                    onClick={() => setSelectedTable({ ...table, floorId: activeFloorId })}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && setSelectedTable({ ...table, floorId: activeFloorId })}
                    className={`
                      relative group cursor-pointer focus:outline-none focus:ring-2 ${config.ring}
                      bg-white rounded-xl p-3 sm:p-4 shadow-sm border-2 transition-all duration-200
                      hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
                      ${config.border}
                    `}
                  >
                    {/* Table Number */}
                    <div className="flex items-start justify-between">
                      <span className="text-xl sm:text-2xl font-bold text-gray-800">{table.number}</span>
                      <span className="text-base sm:text-lg" aria-hidden="true">
                        {config.icon}
                      </span>
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center gap-1 mt-2 text-gray-500">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-xs sm:text-sm font-medium">{table.capacity} Seats</span>
                    </div>

                    {/* Status Badge */}
                    <div className={`mt-3 inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                      {config.label}
                    </div>

                    {/* Pulse Effect for Active Tables */}
                    {(table.status === 'occupied' || table.status === 'billing') && (
                      <div className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500"></span>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {activeFloor.tables.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-lg font-medium">No tables on this floor</p>
                  <p className="text-sm">Click "Add Table" to get started</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Table Action Modal */}
      {selectedTable && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setSelectedTable(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="table-modal-title"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 id="table-modal-title" className="text-lg sm:text-xl font-bold text-white">
                    {selectedTable.number} Details
                  </h3>
                  <p className="text-blue-100 text-sm capitalize flex items-center gap-2">
                    {getStatusConfig(selectedTable.status).icon}
                    {getStatusConfig(selectedTable.status).label}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="text-blue-100 hover:text-white transition-colors p-1 hover:bg-blue-500/50 rounded-full"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
              {/* Capacity */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">🪑</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Seating Capacity</p>
                  <p className="font-semibold text-gray-900 text-base sm:text-lg">{selectedTable.capacity} Guests</p>
                </div>
              </div>

              {/* Active Order Details */}
              {(selectedTable.status === 'occupied' || selectedTable.status === 'billing') && (
                <>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Current Order</p>
                    
                    {selectedTable.orderId && (
                      <div className="flex items-center gap-3 sm:gap-4 mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                          <span className="text-xl sm:text-2xl">🧾</span>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">Order ID</p>
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">{selectedTable.orderId}</p>
                        </div>
                      </div>
                    )}

                    {selectedTable.waiter && (
                      <div className="flex items-center gap-3 sm:gap-4 mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-xl flex items-center justify-center">
                          <span className="text-xl sm:text-2xl">👨‍🍳</span>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">Assigned Waiter</p>
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">{selectedTable.waiter}</p>
                        </div>
                      </div>
                    )}

                    {selectedTable.timeSeated && (
                      <div className="flex items-center gap-3 sm:gap-4 mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                          <span className="text-xl sm:text-2xl">⏰</span>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">Time Seated</p>
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">{selectedTable.timeSeated}</p>
                          <p className="text-xs text-gray-400">{getTimeSinceSeated(selectedTable.timeSeated)}</p>
                        </div>
                      </div>
                    )}

                    {selectedTable.total && (
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                          <span className="text-xl sm:text-2xl">💰</span>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">Current Total</p>
                          <p className="font-bold text-gray-900 text-base sm:text-lg">{selectedTable.total}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Reserved Details */}
              {selectedTable.status === 'reserved' && selectedTable.waiter && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Reservation</p>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                      <span className="text-xl sm:text-2xl">📅</span>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Reserved by</p>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">{selectedTable.waiter}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Available Status */}
              {selectedTable.status === 'available' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6 text-center">
                  <div className="text-3xl sm:text-4xl mb-2">✨</div>
                  <p className="text-green-800 font-semibold text-sm sm:text-base">Available for Seating</p>
                  <p className="text-green-600 text-xs sm:text-sm mt-1">Capacity: {selectedTable.capacity} guests</p>
                </div>
              )}
            </div>

            {/* Modal Footer - Actions */}
            <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100">
              <div className="grid grid-cols-1 gap-2">
                {selectedTable.status === 'available' && (
                  <button
                    onClick={() => handleStartOrder(selectedTable)}
                    className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
                  >
                    <span>🍽️</span> Start Order
                  </button>
                )}
                
                {(selectedTable.status === 'occupied' || selectedTable.status === 'billing' || selectedTable.status === 'reserved') && (
                  <button
                    onClick={() => handleClearTable(selectedTable)}
                    className="w-full py-2.5 sm:py-3 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg transition-colors text-sm sm:text-base flex items-center justify-center gap-2 border border-red-200"
                  >
                    <span>🧹</span> Clear Table
                  </button>
                )}

                {/* Edit Table Button */}
                <button
                  onClick={() => {
                    setEditingTable(selectedTable);
                    setEditTableCapacity(selectedTable.capacity);
                    setShowEditTableModal(true);
                  }}
                  className="w-full py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <span>✏️</span> Edit Table
                </button>

                {/* Delete Table Button */}
                <button
                  onClick={() => {
                    setDeletingTable(selectedTable);
                    setShowDeleteTableModal(true);
                  }}
                  className="w-full py-2 sm:py-2.5 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <span>🗑️</span> Delete Table
                </button>

                <button
                  onClick={() => setSelectedTable(null)}
                  className="w-full py-2 sm:py-2.5 text-gray-500 hover:text-gray-700 font-medium transition-colors text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Floor Modal */}
      {showAddFloorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAddFloorModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Floor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor Name</label>
                <input
                  type="text"
                  value={newFloorName}
                  onChange={(e) => setNewFloorName(e.target.value)}
                  placeholder="e.g. Rooftop, VIP Area"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddFloorModal(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button onClick={handleCreateFloor} disabled={!newFloorName.trim() || loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Creating...' : 'Create Floor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Floor Modal */}
      {showEditFloorModal && editingFloor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowEditFloorModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Floor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor Name</label>
                <input
                  type="text"
                  value={editFloorName}
                  onChange={(e) => setEditFloorName(e.target.value)}
                  placeholder="Enter floor name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowEditFloorModal(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button onClick={handleUpdateFloor} disabled={!editFloorName.trim() || loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Updating...' : 'Update Floor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Floor Confirmation Modal */}
      {showDeleteFloorModal && deletingFloor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteFloorModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Floor?</h3>
              <p className="text-gray-500">Are you sure you want to delete "{deletingFloor.name}"? This will also delete all {deletingFloor.tables.length} tables on this floor.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteFloorModal(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={handleDeleteFloor} disabled={loading} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Deleting...' : 'Delete Floor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAddTableModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Add Table to {activeFloor?.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Configure seating capacity for the new table.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Guests)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 4, 6, 8].map(cap => (
                    <button
                      key={cap}
                      onClick={() => setNewTableCapacity(cap)}
                      className={`py-3 rounded-lg font-medium border transition-all ${
                        newTableCapacity === cap 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddTableModal(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button onClick={handleAddTable} disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  {loading ? 'Adding...' : 'Add Table'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {showEditTableModal && editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowEditTableModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Edit {editingTable.number}</h3>
            <p className="text-sm text-gray-500 mb-4">Update table capacity.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Guests)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 4, 6, 8].map(cap => (
                    <button
                      key={cap}
                      onClick={() => setEditTableCapacity(cap)}
                      className={`py-3 rounded-lg font-medium border transition-all ${
                        editTableCapacity === cap 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowEditTableModal(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button onClick={handleUpdateTable} disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  {loading ? 'Updating...' : 'Update Table'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Table Confirmation Modal */}
      {showDeleteTableModal && deletingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteTableModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Table?</h3>
              <p className="text-gray-500">Are you sure you want to delete {deletingTable.number}? This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteTableModal(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={handleDeleteTable} disabled={loading} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Deleting...' : 'Delete Table'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorManagement;
