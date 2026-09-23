import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, Avatar, StatusDot, Button, Badge, SearchBar } from '../../components/ui';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { employeeAPI, attendanceAPI } from '../../services/api';
import Attendance from '../Attendance';
import TimeOff from '../TimeOff';

// Icons
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// Helper function to format employee data from API
const formatEmployeeData = (employee) => {
  const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown';
  
  // Use currentAttendanceStatus from employee model (updated by check-in/out)
  const status = employee.currentAttendanceStatus || 'not-checked-in';

  return {
    id: employee._id,
    name: fullName,
    email: employee.email,
    phone: employee.phone || 'Not provided',
    role: employee.designation || employee.role || 'Employee',
    department: employee.department || 'Other',
    status: status,
    avatar: employee.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=FFD966&color=000&size=150`,
    employeeId: employee.employeeId,
    loginId: employee.employeeId,
    company: 'Dayflow Inc.',
    manager: employee.manager || 'Not assigned',
    location: employee.address?.city || 'Not specified',
    joinDate: employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'Not set',
    originalData: employee,
  };
};

// Employee Card Component
const EmployeeCard = ({ employee, onClick }) => {
  return (
    <Card 
      hover 
      onClick={onClick}
      className="relative overflow-hidden group animate-fade-in cursor-pointer"
      padding="none"
    >
      <div className="absolute top-4 right-4 z-10">
        <StatusDot status={employee.status} size="md" />
      </div>

      <div className="p-6">
        <div className="flex justify-center mb-4">
          <Avatar 
            src={employee.avatar}
            name={employee.name}
            size="xl"
            className="ring-4 ring-primary-100 group-hover:ring-primary-200 transition-all duration-300"
          />
        </div>

        <div className="text-center space-y-1">
          <h3 className="font-semibold text-neutral-900 text-lg group-hover:text-primary-600 transition-colors">
            {employee.name}
          </h3>
          <p className="text-sm text-neutral-500">{employee.role}</p>
          {employee.department && (
            <Badge variant="primary" size="sm">
              {employee.department}
            </Badge>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-xs text-neutral-400 text-center truncate">
            {employee.email}
          </p>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Card>
  );
};

// Stat Card Component
const StatCard = ({ label, value, color }) => {
  const colorClasses = {
    neutral: 'from-neutral-100 to-neutral-50 text-neutral-900',
    success: 'from-success/10 to-success/5 text-success',
    warning: 'from-warning/10 to-warning/5 text-warning',
    info: 'from-info/10 to-info/5 text-info',
    error: 'from-error/10 to-error/5 text-error',
  };

  return (
    <div className={`rounded-card p-4 bg-gradient-to-br border border-white/50 ${colorClasses[color]}`}>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

// Loading Skeleton
const EmployeeCardSkeleton = () => (
  <Card className="animate-pulse" padding="none">
    <div className="p-6">
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 bg-neutral-200 rounded-full" />
      </div>
      <div className="text-center space-y-2">
        <div className="h-5 bg-neutral-200 rounded w-3/4 mx-auto" />
        <div className="h-4 bg-neutral-200 rounded w-1/2 mx-auto" />
        <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto" />
      </div>
    </div>
  </Card>
);

// Employee Directory Content
const EmployeeDirectoryContent = ({ 
  employees, 
  loading, 
  error, 
  searchValue, 
  onRefresh, 
  onEmployeeClick 
}) => {
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchValue.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchValue.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const stats = {
    total: employees.length,
    present: employees.filter(e => e.status === 'present').length,
    absent: employees.filter(e => e.status === 'absent').length,
    leave: employees.filter(e => e.status === 'leave').length,
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Employee Directory</h1>
          <p className="text-neutral-500 mt-1">Manage and view your team members</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            icon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button 
            variant="primary"
            icon={<PlusIcon />}
            onClick={() => alert('Add employee form coming soon!')}
          >
            New Employee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Employees" value={stats.total} color="neutral" />
        <StatCard label="Present Today" value={stats.present} color="success" />
        <StatCard label="Absent" value={stats.absent} color="warning" />
        <StatCard label="On Leave" value={stats.leave} color="info" />
      </div>

      {/* Error State */}
      {error && (
        <Card className="text-center py-8 mb-6 border-error/20 bg-error/5">
          <div className="text-error mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-700">{error}</h3>
          <Button variant="outline" className="mt-4" onClick={onRefresh}>
            Try Again
          </Button>
        </Card>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <EmployeeCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Employee Grid */}
      {!loading && !error && filteredEmployees.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <EmployeeCard 
              key={employee.id}
              employee={employee}
              onClick={() => onEmployeeClick(employee)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredEmployees.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-neutral-400 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-700">
            {searchValue ? 'No employees found' : 'No employees yet'}
          </h3>
          <p className="text-neutral-500 mt-1">
            {searchValue ? 'Try adjusting your search' : 'Add your first employee to get started'}
          </p>
        </Card>
      )}
    </>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState('employees');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);

  // API data states
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employees from API
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeAPI.getAll();
      
      if (response.success && response.data) {
        const formattedEmployees = response.data.map(emp => formatEmployeeData(emp));
        setEmployees(formattedEmployees);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees. Please try again.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch today's attendance status
  const fetchTodayStatus = useCallback(async () => {
    try {
      const response = await attendanceAPI.getTodayStatus();
      
      if (response.success && response.data) {
        const { isCheckedIn: checkedIn, checkInTime: checkInTimeStr } = response.data;
        if (checkedIn && checkInTimeStr) {
          setIsCheckedIn(true);
          setCheckInTime(new Date(checkInTimeStr));
        } else {
          setIsCheckedIn(false);
          setCheckInTime(null);
        }
      }
    } catch (err) {
      console.error('Error fetching today status:', err);
      // Not critical, just log the error
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchEmployees();
    fetchTodayStatus();
  }, [fetchEmployees, fetchTodayStatus]);

  const handleEmployeeClick = (employee) => {
    navigate(`/admin/employee/${employee.id}`);
  };

  const handleMyProfile = () => {
    navigate('/admin/my-profile');
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleCheckIn = async () => {
    try {
      const response = await attendanceAPI.checkIn();
      
      if (response.success) {
        setIsCheckedIn(true);
        setCheckInTime(new Date());
        // Optionally refresh employees to update status
        await fetchEmployees();
        console.log('✅ Check-in successful');
      } else {
        alert(response.message || 'Failed to check in');
      }
    } catch (err) {
      console.error('Check-in error:', err);
      alert(err.message || 'Failed to check in. Please try again.');
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await attendanceAPI.checkOut();
      
      if (response.success) {
        setIsCheckedIn(false);
        const workedHours = checkInTime ? ((new Date() - checkInTime) / (1000 * 60 * 60)).toFixed(2) : 0;
        setCheckInTime(null);
        // Optionally refresh employees to update status
        await fetchEmployees();
        console.log(`✅ Check-out successful. Worked ${workedHours} hours`);
      } else {
        alert(response.message || 'Failed to check out');
      }
    } catch (err) {
      console.error('Check-out error:', err);
      alert(err.message || 'Failed to check out. Please try again.');
    }
  };

  const userStatus = isCheckedIn ? 'present' : 'not-checked-in';

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Render main content based on current page
  const renderContent = () => {
    switch (currentPage) {
      case 'employees':
        return (
          <EmployeeDirectoryContent 
            employees={employees}
            loading={loading}
            error={error}
            searchValue={searchValue}
            onRefresh={fetchEmployees}
            onEmployeeClick={handleEmployeeClick}
          />
        );
      case 'attendance':
        return <Attendance isAdmin={true} />;
      case 'timeoff':
        return <TimeOff isAdmin={true} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-start to-bg-end">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-neutral-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Wordmark */}
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg text-neutral-900 tracking-tight">Dayflow</span>
              <Badge variant="primary" size="sm">Admin</Badge>
            </div>

            {/* Center Nav Tabs */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { id: 'employees', label: 'Employees' },
                { id: 'attendance', label: 'Attendance' },
                { id: 'timeoff', label: 'Time Off' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentPage(tab.id)}
                  className={`
                    px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200
                    ${currentPage === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/80'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Search - only show on employees page */}
              {currentPage === 'employees' && (
                <SearchBar 
                  value={searchValue}
                  onChange={setSearchValue}
                  className="hidden lg:block w-56"
                  placeholder="Search employees..."
                />
              )}

              {/* Avatar with Dropdown */}
              <Dropdown
                align="right"
                trigger={
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-neutral-100/80 transition-all duration-200 cursor-pointer">
                    <div className="relative">
                      <Avatar 
                        name={user?.firstName || 'Admin'}
                        size="sm"
                        className="w-8 h-8 text-xs"
                      />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${userStatus === 'present' ? 'bg-success' : 'bg-error'}`} />
                    </div>
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                }
              >
                <div className="py-1">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <p className="font-semibold text-neutral-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-neutral-500">{user?.email}</p>
                  </div>
                  <DropdownItem icon={<UserIcon />} onClick={handleMyProfile}>
                    My Profile
                  </DropdownItem>
                  <DropdownItem icon={<LogoutIcon />} onClick={handleLogout} danger>
                    Log Out
                  </DropdownItem>
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Content Area */}
          <main className="flex-1">
            {/* Mobile Search - only on employees page */}
            {currentPage === 'employees' && (
              <div className="lg:hidden mb-6">
                <SearchBar 
                  value={searchValue}
                  onChange={setSearchValue}
                  placeholder="Search employees..."
                />
              </div>
            )}

            {renderContent()}
          </main>

          {/* Right Sidebar - Check In/Out */}
          <aside className="hidden xl:block w-72 flex-shrink-0 self-start sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Attendance
                </h3>
                <StatusDot status={userStatus} size="md" />
              </div>
              
              {isCheckedIn ? (
                <div className="space-y-4">
                  <div className="p-4 bg-success/10 rounded-xl">
                    <div className="flex items-center gap-2 text-success mb-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium text-sm">Checked In</span>
                    </div>
                    <p className="text-sm text-neutral-600">Since {formatTime(checkInTime)}</p>
                  </div>
                  <Button variant="secondary" className="w-full" onClick={handleCheckOut}>
                    Check Out →
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-error/10 rounded-xl">
                    <div className="flex items-center gap-2 text-error mb-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-sm">Not Checked In</span>
                    </div>
                    <p className="text-sm text-neutral-600">Mark your attendance</p>
                  </div>
                  <Button variant="primary" className="w-full" onClick={handleCheckIn}>
                    Check In →
                  </Button>
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card>
              <h4 className="text-sm font-medium text-neutral-600 mb-3">This Week</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">Hours Worked</span>
                  <span className="font-semibold text-neutral-900">32h 15m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">Days Present</span>
                  <span className="font-semibold text-neutral-900">4 / 5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">Avg. Check-in</span>
                  <span className="font-semibold text-neutral-900">9:05 AM</span>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
