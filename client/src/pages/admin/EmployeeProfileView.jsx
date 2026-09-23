import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, Tabs, Button, Avatar, Badge } from '../../components/ui';
import { ProfileHeader, PrivateInfoTab, ResumeTab } from '../../components/profile';
import { SalaryInfoTab } from '../../components/salary';
import { employeeAPI } from '../../services/api';

const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

// Format employee data from API
const formatEmployeeData = (employee) => {
  if (!employee) return null;
  
  const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown';
  
  return {
    id: employee._id,
    name: fullName,
    email: employee.email || 'N/A',
    phone: employee.phone || 'N/A',
    loginId: employee.employeeId || `EMP${employee._id?.slice(-4)}`,
    avatar: employee.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=FFD966&color=000&size=150`,
    company: 'Dayflow Inc.',
    department: employee.department || 'General',
    manager: employee.manager || 'Not assigned',
    location: employee.address?.city ? `${employee.address.city}, ${employee.address.state || ''}`.trim() : 'Not specified',
    role: employee.designation || employee.role || 'Employee',
    about: employee.about || '',
    whatILove: employee.whatILove || '',
    hobbies: employee.hobbies || '',
    skills: employee.skills || [],
    certifications: employee.certifications || [],
    salaryData: employee.salary || { monthlyWage: 0, yearlyWage: 0 },
    originalData: employee,
  };
};

// Loading skeleton
const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <Card className="p-6">
      <div className="flex gap-6">
        <div className="w-24 h-24 bg-neutral-200 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-neutral-200 rounded w-1/3" />
          <div className="h-4 bg-neutral-200 rounded w-1/4" />
          <div className="h-4 bg-neutral-200 rounded w-1/2" />
        </div>
      </div>
    </Card>
    <div className="mt-8">
      <div className="h-10 bg-neutral-200 rounded w-1/3 mb-6" />
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-4 bg-neutral-200 rounded w-full" />
          <div className="h-4 bg-neutral-200 rounded w-3/4" />
          <div className="h-4 bg-neutral-200 rounded w-1/2" />
        </div>
      </Card>
    </div>
  </div>
);

const EmployeeProfileView = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('resume');
  
  // API data states
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if current user is admin
  const isAdminUser = isAdmin || user?.email === 'admin@gmail.com';

  // Fetch employee data from API
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await employeeAPI.getById(employeeId);
        
        if (response.success && response.data) {
          setEmployeeData(formatEmployeeData(response.data));
        } else {
          setError('Employee not found');
        }
      } catch (err) {
        console.error('Error fetching employee:', err);
        setError('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  // Tab configuration - Salary Info only visible to admin
  const tabs = [
    { id: 'resume', label: 'Resume' },
    { id: 'privateInfo', label: 'Private Info' },
    ...(isAdminUser ? [{ id: 'salaryInfo', label: 'Salary Info' }] : []),
  ];

  const handleProfileUpdate = async (data) => {
    console.log('Profile updated:', data);
    // TODO: Call API to update employee profile
  };

  const handlePrivateInfoUpdate = async (data) => {
    console.log('Private info updated:', data);
    // TODO: Call API to update private info
  };

  const handleSalaryUpdate = async (data) => {
    console.log('Salary updated:', data);
    // TODO: Call API to update salary info
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const renderTabContent = () => {
    if (!employeeData) return null;
    
    switch (activeTab) {
      case 'resume':
        return <ResumeTab />;
      case 'privateInfo':
        return (
          <PrivateInfoTab 
            data={employeeData}
            onUpdate={handlePrivateInfoUpdate}
          />
        );
      case 'salaryInfo':
        return (
          <SalaryInfoTab 
            data={employeeData.salaryData}
            onUpdate={handleSalaryUpdate}
            isAdmin={isAdminUser}
            employeeId={employeeId}
            onSaveSuccess={() => {
              // Refresh employee data after save
              window.location.reload();
            }}
          />
        );
      default:
        return <ResumeTab />;
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
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-neutral-900 tracking-tight">Dayflow</span>
                <Badge variant="primary" size="sm">Admin</Badge>
              </div>
            </div>

            {/* Center Nav Tabs */}
            <div className="hidden md:flex items-center gap-1">
              {['Employees', 'Attendance', 'Time Off'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => navigate('/admin/dashboard')}
                  className={`
                    px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200
                    ${tab === 'Employees'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/80'
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-neutral-100/80 transition-all cursor-pointer">
                <Avatar name={user?.firstName || 'Admin'} size="sm" className="w-8 h-8 text-xs" />
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-neutral-500 hover:text-error hover:bg-error/10 transition-all"
              >
                <LogoutIcon />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button & Title Row */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-3 transition-colors group"
            >
              <span className="w-6 h-6 rounded-lg bg-neutral-100 group-hover:bg-neutral-200 flex items-center justify-center transition-colors">
                <BackIcon />
              </span>
              <span className="font-medium">Back to Employees</span>
            </button>

            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Employee Profile</h1>
            <p className="text-neutral-500 mt-1 text-sm">View and manage employee information</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && <ProfileSkeleton />}

        {/* Error State */}
        {error && !loading && (
          <Card className="text-center py-12">
            <div className="text-error mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-700">{error}</h3>
            <p className="text-neutral-500 mt-1">Please try again or go back to the employee directory</p>
            <Button variant="primary" className="mt-4" onClick={() => navigate('/admin/dashboard')}>
              Back to Employees
            </Button>
          </Card>
        )}

        {/* Profile Content */}
        {!loading && !error && employeeData && (
          <>
            {/* Profile Header */}
            <div className="animate-fade-in">
              <ProfileHeader 
                employee={employeeData}
                onUpdate={handleProfileUpdate}
                isEditable={isAdminUser}
                isAdmin={false}
              />
            </div>

            {/* Tabs Section */}
            <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <Tabs 
                tabs={tabs}
                activeTab={activeTab}
                onChange={setActiveTab}
                className="mb-6"
              />

              <div className="animate-fade-in" key={activeTab}>
                {renderTabContent()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfileView;
