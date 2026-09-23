import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../layout';
import { 
  EmployeeDirectory, 
  EmployeeProfile, 
  MyProfile, 
  Attendance, 
  TimeOff,
  Analytics 
} from '../../pages';
import { useAuth } from '../../context/AuthContext';
import { employeeAPI, attendanceAPI } from '../../services/api';

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
    address: employee.address ? 
      `${employee.address.street || ''}, ${employee.address.city || ''}, ${employee.address.state || ''} ${employee.address.zipCode || ''}`.trim() : 
      'Not provided',
    role: employee.designation || employee.role || 'Employee',
    department: employee.department || 'General',
    employeeId: employee.employeeId,
    joinDate: employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'Not set',
    employmentType: employee.employmentType || 'Full-time',
    status: status,
    avatar: employee.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=FFD966&color=000&size=150`,
    attendance: employee.attendanceSummary || { present: 0, absent: 0, leave: 0, late: 0 },
    // Keep original data for profile view - includes private info
    originalData: employee,
  };
};

// Helper to format current user profile
const formatCurrentUserProfile = (employee) => {
  const fullName = `${employee.firstName} ${employee.lastName}`.trim();
  
  return {
    id: employee._id,
    name: fullName,
    email: employee.email,
    phone: employee.phone || '',
    address: employee.address ? 
      `${employee.address.street || ''}, ${employee.address.city || ''}, ${employee.address.state || ''} ${employee.address.zipCode || ''}`.trim() : 
      '',
    role: employee.designation || employee.role || 'Employee',
    department: employee.department || 'General',
    employeeId: employee.employeeId,
    joinDate: employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'Not set',
    avatar: employee.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=FFD966&color=000&size=150`,
    emergencyContact: employee.emergencyContact?.name || '',
    emergencyPhone: employee.emergencyContact?.phone || '',
    originalData: employee,
  };
};

const HRDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Navigation state
  const [currentPage, setCurrentPage] = useState('employees');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showMyProfile, setShowMyProfile] = useState(false);
  
  // Search state
  const [searchValue, setSearchValue] = useState('');
  
  // Attendance state
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Current user profile from API
  const [currentUser, setCurrentUser] = useState(null);
  
  // Employees state from API
  const [employees, setEmployees] = useState([]);

  // Fetch employees from API
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeAPI.getAll();
      
      if (response.success && response.data) {
        const formattedEmployees = response.data.map(emp => formatEmployeeData(emp));
        setEmployees(formattedEmployees);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch current user's profile
  const fetchMyProfile = useCallback(async () => {
    try {
      const response = await employeeAPI.getMyProfile();
      
      if (response.success && response.data) {
        setCurrentUser(formatCurrentUserProfile(response.data));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Fallback to user from auth context if API fails
      if (user) {
        setCurrentUser({
          id: user.id || user._id,
          name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'HR User',
          email: user.email || 'hr@dayflow.com',
          phone: '',
          address: '',
          role: user.accountType || 'hr',
          department: 'Human Resources',
          employeeId: user.employeeId || 'HR001',
          joinDate: 'Not set',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || 'HR')}&background=FFD966&color=000&size=150`,
          emergencyContact: '',
          emergencyPhone: '',
        });
      }
    }
  }, [user]);

  // Fetch today's attendance status
  const fetchTodayStatus = useCallback(async () => {
    try {
      const response = await attendanceAPI.getTodayStatus();
      
      if (response.success && response.data) {
        const { isCheckedIn: checkedIn, isCheckedOut: checkedOut, checkInTime: checkInTimeStr, checkOutTime: checkOutTimeStr } = response.data;
        setIsCheckedIn(!!checkedIn);
        setIsCheckedOut(!!checkedOut);
        setCheckInTime(checkInTimeStr ? new Date(checkInTimeStr) : null);
        setCheckOutTime(checkOutTimeStr ? new Date(checkOutTimeStr) : null);
      }
    } catch (err) {
      console.error('Error fetching today status:', err);
      // Not critical, just log the error
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchEmployees();
    fetchMyProfile();
    fetchTodayStatus();
  }, [fetchEmployees, fetchMyProfile, fetchTodayStatus]);

  // Calculate user status based on check-in
  const userStatus = isCheckedIn ? 'present' : 'not-checked-in';

  // Navigation handlers
  const handleNavigate = useCallback((page) => {
    setCurrentPage(page);
    setSelectedEmployee(null);
    setShowMyProfile(false);
  }, []);

  const handleEmployeeClick = useCallback(async (employee) => {
    try {
      // Fetch full employee data for detailed profile view
      const response = await employeeAPI.getById(employee.id);
      
      if (response.success && response.data) {
        // Format with full data from API
        const fullData = formatEmployeeData(response.data);
        setSelectedEmployee(fullData);
      } else {
        // Fallback to basic data if fetch fails
        setSelectedEmployee(employee);
      }
    } catch (err) {
      console.error('Error fetching employee details:', err);
      // Fallback to basic data
      setSelectedEmployee(employee);
    }
    setShowMyProfile(false);
  }, []);

  const handleMyProfile = useCallback(() => {
    setShowMyProfile(true);
    setSelectedEmployee(null);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedEmployee(null);
    setShowMyProfile(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/signin');
  }, [logout, navigate]);

  const handleNewEmployee = useCallback(() => {
    console.log('Creating new employee...');
    alert('New employee form coming soon!');
  }, []);

  // Attendance handlers
  const handleCheckIn = useCallback(async () => {
    try {
      const response = await attendanceAPI.checkIn();
      
      if (response.success) {
        setIsCheckedIn(true);
        setCheckInTime(new Date());
        // Refresh employees to update status
        await fetchEmployees();
        console.log('✅ Check-in successful');
      } else {
        alert(response.message || 'Failed to check in');
      }
    } catch (err) {
      console.error('Check-in error:', err);
      alert(err.message || 'Failed to check in. Please try again.');
    }
  }, [fetchEmployees]);

  const handleCheckOut = useCallback(async () => {
    try {
      const response = await attendanceAPI.checkOut();
      
      if (response.success) {
        const workedHours = checkInTime ? ((new Date() - checkInTime) / (1000 * 60 * 60)).toFixed(2) : 0;
        setIsCheckedOut(true);
        setCheckOutTime(new Date());
        // Refresh employees to update status
        await fetchEmployees();
        console.log(`✅ Check-out successful. Worked ${workedHours} hours`);
      } else {
        alert(response.message || 'Failed to check out');
      }
    } catch (err) {
      console.error('Check-out error:', err);
      alert(err.message || 'Failed to check out. Please try again.');
    }
  }, [fetchEmployees, checkInTime]);

  // Profile save handler
  const handleSaveProfile = useCallback(async (data) => {
    try {
      // Transform data for API
      const apiData = {
        firstName: data.name?.split(' ')[0] || '',
        lastName: data.name?.split(' ').slice(1).join(' ') || '',
        phone: data.phone,
        address: {
          street: data.address?.split(',')[0]?.trim() || '',
          city: data.address?.split(',')[1]?.trim() || '',
          state: data.address?.split(',')[2]?.trim()?.split(' ')[0] || '',
          zipCode: data.address?.split(',')[2]?.trim()?.split(' ')[1] || '',
        },
        emergencyContact: {
          name: data.emergencyContact,
          phone: data.emergencyPhone,
        },
      };

      const response = await employeeAPI.updateMyProfile(apiData);
      
      if (response.success && response.data) {
        setCurrentUser(formatCurrentUserProfile(response.data));
        return response;
      }
      
      throw new Error(response.message || 'Failed to update profile');
    } catch (err) {
      console.error('Save profile error:', err);
      throw err;
    }
  }, []);

  // Render the appropriate page content
  const renderContent = () => {
    // If viewing an employee profile
    if (selectedEmployee) {
      return (
        <EmployeeProfile 
          employee={selectedEmployee}
          onBack={handleBack}
        />
      );
    }

    // If viewing own profile
    if (showMyProfile) {
      return (
        <MyProfile 
          user={currentUser || {}}
          onBack={handleBack}
          onSave={handleSaveProfile}
        />
      );
    }

    // Main page content based on current page
    switch (currentPage) {
      case 'employees':
        // Show loading state
        if (loading) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <span className="ml-3 text-gray-600">Loading employees...</span>
            </div>
          );
        }

        // Show error state
        if (error) {
          return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-red-500 text-lg mb-4">{error}</div>
              <button 
                onClick={fetchEmployees}
                className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          );
        }

        return (
          <EmployeeDirectory 
            employees={employees}
            onEmployeeClick={handleEmployeeClick}
            onNewEmployee={handleNewEmployee}
            searchValue={searchValue}
          />
        );
      case 'attendance':
        return <Attendance currentUser={currentUser || {}} />;
      case 'timeoff':
        return <TimeOff isHR={true} />;
      case 'analytics':
        return <Analytics />;
      default:
        return (
          <EmployeeDirectory 
            employees={employees}
            onEmployeeClick={handleEmployeeClick}
            onNewEmployee={handleNewEmployee}
            searchValue={searchValue}
          />
        );
    }
  };

  return (
    <MainLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      searchValue={searchValue}
      onSearch={setSearchValue}
      currentUser={currentUser || { name: 'Loading...', email: '', avatar: '' }}
      userStatus={userStatus}
      onMyProfile={handleMyProfile}
      onLogout={handleLogout}
      isCheckedIn={isCheckedIn}
      isCheckedOut={isCheckedOut}
      checkInTime={checkInTime}
      checkOutTime={checkOutTime}
      onCheckIn={handleCheckIn}
      onCheckOut={handleCheckOut}
      showAttendancePanel={currentPage === 'employees' && !selectedEmployee && !showMyProfile}
    >
      {renderContent()}
    </MainLayout>
  );
};

export default HRDashboard;
