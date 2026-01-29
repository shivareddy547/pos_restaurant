import React, { useState, useEffect } from 'react';

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
}

interface Floor {
  id: string;
  name: string;
  tables: Table[];
}

const FloorManagement: React.FC = () => {
  // Mock Initial Data
  const initialFloors: Floor[] = [
    {
      id: 'ground',
      name: 'Ground Floor',
      tables: [
        { id: 't1', number: 'T1', capacity: 4, status: 'occupied', orderId: '#1001', waiter: 'John D.', timeSeated: '10:30 AM', total: '$45.00' },
        { id: 't2', number: 'T2', capacity: 2, status: 'available' },
        { id: 't3', number: 'T3', capacity: 6, status: 'reserved', waiter: 'Sarah M.' },
        { id: 't4', number: 'T4', capacity: 4, status: 'billing', orderId: '#1002', waiter: 'Mike R.', timeSeated: '09:15 AM', total: '$120.50' },
        { id: 't5', number: 'T5', capacity: 2, status: 'available' },
        { id: 't6', number: 'T6', capacity: 8, status: 'occupied', orderId: '#1003', waiter: 'Emily W.', timeSeated: '11:00 AM', total: '$85.00' },
      ]
    },
    {
      id: 'first',
      name: 'First Floor',
      tables: [
        { id: 't7', number: 'T7', capacity: 4, status: 'available' },
        { id: 't8', number: 'T8', capacity: 4, status: 'occupied', orderId: '#1004', waiter: 'John D.', timeSeated: '11:45 AM', total: '$0.00' },
        { id: 't9', number: 'T9', capacity: 10, status: 'reserved', waiter: 'Sarah M.' },
      ]
    },
    {
      id: 'outdoor',
      name: 'Outdoor',
      tables: [
        { id: 'o1', number: 'O1', capacity: 4, status: 'available' },
        { id: 'o2', number: 'O2', capacity: 4, status: 'available' },
        { id: 'o3', number: 'O3', capacity: 6, status: 'occupied', orderId: '#1005', waiter: 'Mike R.', timeSeated: '12:15 PM', total: '$60.00' },
      ]
    }
  ];

  const [activeFloorId, setActiveFloorId] = useState<string>('ground');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // REFACTOR: Use floors as state to allow modifications (CRUD)
  const [floors, setFloors] = useState<Floor[]>(initialFloors);

  // Management UI States
  const [showAddFloorModal, setShowAddFloorModal] = useState(false);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newFloorName, setNewFloorName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const activeFloor = floors.find(f => f.id === activeFloorId);

  // Simulate real-time updates - Modified to update floors state directly
  useEffect(() => {
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
  }, []);

  // Helper: Show Toast
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Action: Add Floor
  const handleCreateFloor = () => {
    if (!newFloorName.trim()) return;
    const newId = `floor-${Date.now()}`;
    const newFloor: Floor = { id: newId, name: newFloorName, tables: [] };
    setFloors([...floors, newFloor]);
    setActiveFloorId(newId);
    setNewFloorName('');
    setShowAddFloorModal(false);
    showToast(`Floor "${newFloorName}" created successfully`);
  };

  // Action: Add Table
  const handleAddTable = () => {
    if (!activeFloor) return;
    const newTableId = `t-${Date.now()}`;
    // Generate next table number
    const tableCount = activeFloor.tables.length + 1;
    const newTable: Table = {
      id: newTableId,
      number: `T${tableCount}`,
      capacity: newTableCapacity,
      status: 'available'
    };

    const updatedFloors = floors.map(f => 
      f.id === activeFloorId 
        ? { ...f, tables: [...f.tables, newTable] }
        : f
    );
    
    setFloors(updatedFloors);
    setNewTableCapacity(4);
    setShowAddTableModal(false);
    showToast(`Table T${tableCount} added to ${activeFloor.name}`);
  };

  // Action: Start Order (Change Status to Occupied)
  const handleStartOrder = (table: Table) => {
    const updatedFloors = floors.map(f => ({
      ...f,
      tables: f.tables.map(t => 
        t.id === table.id 
          ? { 
              ...t, 
              status: 'occupied' as TableStatus, 
              orderId: `#${Math.floor(Math.random() * 9000) + 1000}`,
              waiter: 'Staff Member', // Mock current user
              timeSeated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              total: '$0.00'
            }
          : t
      )
    }));
    setFloors(updatedFloors);
    setSelectedTable(null); // Close modal or refresh view
    showToast(`Order started for ${table.number}`);
  };

  // Action: Clear Table (Change Status to Available)
  const handleClearTable = (table: Table) => {
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
    <div className="space-y-4 sm:space-y-6 min-h-screen bg-gray-50 pb-20">
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

        {/* Legend */}
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
      </div>

      {/* Floor Selector */}
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
        <h2 className="text-lg font-semibold text-gray-800">
          {activeFloor?.name} ({activeFloor?.tables.length} tables)
        </h2>
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
                onClick={() => setSelectedTable(table)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && setSelectedTable(table)}
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
                <button onClick={handleCreateFloor} disabled={!newFloorName.trim()} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed">Create Floor</button>
              </div>
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
                <button onClick={handleAddTable} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Add Table</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorManagement;
