import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, Tabs, Button, Avatar, Badge } from '../../components/ui';
import { ProfileHeader, PrivateInfoTab, ResumeTab } from '../../components/profile';
import { SalaryInfoTab } from '../../components/salary';

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

const AdminProfile = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('resume');

  // Check if current user is admin
  const isAdminUser = isAdmin || user?.email === 'admin@gmail.com';

  // Mock employee data (in real app, fetch based on employeeId)
  const [employeeData, setEmployeeData] = useState({
    id: employeeId || '1',
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Admin User',
    email: user?.email || 'admin@gmail.com',
    phone: '+1 (555) 123-4567',
    loginId: 'EMP001',
    avatar: null,
    company: 'Dayflow Inc.',
    department: 'Administration',
    manager: 'CEO',
    location: 'San Francisco, CA',
    role: 'Administrator',
    // Private Info
    about: 'Experienced administrator with a passion for building efficient HR systems.',
    whatILove: 'I love creating streamlined processes that help teams work better together.',
    hobbies: 'Reading, hiking, and exploring new technologies.',
    skills: ['Leadership', 'HR Management', 'Strategic Planning', 'Team Building'],
    certifications: ['SHRM-CP', 'PHR Certified'],
    // Salary Info
    salaryData: {
      monthlyWage: 50000,
      yearlyWage: 600000,
    },
  });

  // Tab configuration - Salary Info only visible to admin
  const tabs = [
    { id: 'resume', label: 'Resume' },
    { id: 'privateInfo', label: 'Private Info' },
    ...(isAdminUser ? [{ id: 'salaryInfo', label: 'Salary Info' }] : []),
  ];

  const handleProfileUpdate = (data) => {
    setEmployeeData(prev => ({ ...prev, ...data }));
    console.log('Profile updated:', data);
  };

  const handlePrivateInfoUpdate = (data) => {
    setEmployeeData(prev => ({ ...prev, ...data }));
    console.log('Private info updated:', data);
  };

  const handleSalaryUpdate = (data) => {
    setEmployeeData(prev => ({ ...prev, salaryData: data }));
    console.log('Salary updated:', data);
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const renderTabContent = () => {
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
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {['Employees', 'Attendance', 'Time Off'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 rounded-xl font-medium text-sm text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/80 transition-all duration-200"
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Right Section - Avatar & Logout */}
            <div className="flex items-center gap-3">
              {/* Avatar with Status */}
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-neutral-100/80 transition-all duration-200 cursor-pointer">
                <div className="relative">
                  <Avatar 
                    name={employeeData.name}
                    size="sm"
                    className="w-8 h-8 text-xs"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-neutral-700 max-w-[100px] truncate">
                  {employeeData.name.split(' ')[0]}
                </span>
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-neutral-500 hover:text-error hover:bg-error/10 transition-all duration-200"
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
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-3 transition-colors duration-200 group"
            >
              <span className="w-6 h-6 rounded-lg bg-neutral-100 group-hover:bg-neutral-200 flex items-center justify-center transition-colors">
                <BackIcon />
              </span>
              <span className="font-medium">Back</span>
            </button>

            {/* Page Title */}
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">My Profile</h1>
            <p className="text-neutral-500 mt-1 text-sm">Manage your profile information</p>
          </div>
        </div>

        {/* Profile Header */}
        <div className="animate-fade-in">
          <ProfileHeader 
            employee={employeeData}
            onUpdate={handleProfileUpdate}
            isEditable={true}
            isAdmin={isAdminUser}
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

          {/* Tab Content with smooth transition */}
          <div className="animate-fade-in" key={activeTab}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
