import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, Avatar, StatusDot, Button, Badge, SearchBar } from '../../components/ui';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { attendanceAPI } from '../../services/api';
import EmployeeAttendance from './EmployeeAttendance';
import EmployeeMyProfile from './EmployeeMyProfile';
import TimeOff from '../TimeOff';

// Icons
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

const LoadingSpinner = () => (
  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('attendance'); // Default to attendance
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);

  // Fetch today's attendance status on component mount
  const fetchTodayStatus = useCallback(async () => {
    try {
      setAttendanceLoading(true);
      setAttendanceError(null);
      
      const response = await attendanceAPI.getTodayStatus();
      
      if (response.success && response.data) {
        setIsCheckedIn(response.data.isCheckedIn);
        setIsCheckedOut(response.data.isCheckedOut);
        setCheckInTime(response.data.checkInTime);
        setCheckOutTime(response.data.checkOutTime);
      }
    } catch (error) {
      console.error('Error fetching today status:', error);
      setAttendanceError('Failed to fetch attendance status');
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayStatus();
  }, [fetchTodayStatus]);

  const handleMyProfile = () => {
    setShowMyProfile(true);
    setCurrentPage('myprofile');
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setAttendanceError(null);
      
      const response = await attendanceAPI.checkIn({
        location: 'Office',
        method: 'web'
      });
      
      if (response.success) {
        console.log('✅ Check-in successful');
        setIsCheckedIn(true);
        setIsCheckedOut(false);
        setCheckInTime(response.data?.checkIn?.time || new Date().toISOString());
        setCheckOutTime(null);
      } else {
        setAttendanceError(response.message || 'Check-in failed');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setAttendanceError(error.message || 'Failed to check in. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setAttendanceError(null);
      
      const response = await attendanceAPI.checkOut({
        location: 'Office',
        method: 'web'
      });
      
      if (response.success) {
        console.log('✅ Check-out successful');
        setIsCheckedOut(true);
        setCheckOutTime(response.data?.checkOut?.time || new Date().toISOString());
      } else {
        setAttendanceError(response.message || 'Check-out failed');
      }
    } catch (error) {
      console.error('Check-out error:', error);
      setAttendanceError(error.message || 'Failed to check out. Please try again.');
    } finally {
      setActionLoading(false);
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

  // Render main content
  const renderContent = () => {
    if (showMyProfile) {
      return <EmployeeMyProfile />;
    }

    switch (currentPage) {
      case 'attendance':
        return <EmployeeAttendance />;
      case 'timeoff':
        return <TimeOff isAdmin={false} isHR={false} />;
      default:
        return <EmployeeAttendance />;
    }
  };

  // Handle tab click
  const handleTabClick = (tabId) => {
    setShowMyProfile(false);
    setCurrentPage(tabId);
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
            </div>

            {/* Center Nav Tabs */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { id: 'attendance', label: 'Attendance' },
                { id: 'timeoff', label: 'Time Off' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`
                    px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200
                    ${currentPage === tab.id && !showMyProfile
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
              {/* Avatar with Dropdown */}
              <Dropdown
                align="right"
                trigger={
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-neutral-100/80 transition-all duration-200 cursor-pointer">
                    <div className="relative">
                      <Avatar 
                        name={user?.firstName || 'Employee'}
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
              {/* Loading State */}
              {attendanceLoading ? (
                <div className="space-y-4">
                  <div className="p-4 bg-neutral-100 rounded-xl animate-pulse">
                    <div className="h-4 bg-neutral-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-neutral-200 rounded w-32"></div>
                  </div>
                  <div className="h-10 bg-neutral-200 rounded-xl animate-pulse"></div>
                </div>
              ) : isCheckedIn && isCheckedOut ? (
                /* Already checked out for the day */
                <div className="space-y-4">
                  <div className="p-4 bg-primary-50 rounded-xl">
                    <div className="flex items-center gap-2 text-primary-600 mb-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-sm">Day Complete</span>
                    </div>
                    <p className="text-sm text-neutral-600">
                      Checked in at {formatTime(checkInTime)}
                    </p>
                    <p className="text-sm text-neutral-600">
                      Checked out at {formatTime(checkOutTime)}
                    </p>
                  </div>
                  <div className="text-center text-sm text-neutral-500">
                    See you tomorrow! 👋
                  </div>
                </div>
              ) : isCheckedIn ? (
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
                  {attendanceError && (
                    <div className="p-3 bg-error/10 rounded-lg">
                      <p className="text-sm text-error">{attendanceError}</p>
                    </div>
                  )}
                  <Button 
                    variant="secondary" 
                    className="w-full" 
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner /> Checking Out...
                      </span>
                    ) : (
                      'Check Out →'
                    )}
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
                    <p className="text-sm text-neutral-600">Mark your attendance for today</p>
                  </div>
                  {attendanceError && (
                    <div className="p-3 bg-error/10 rounded-lg">
                      <p className="text-sm text-error">{attendanceError}</p>
                    </div>
                  )}
                  <Button 
                    variant="primary" 
                    className="w-full" 
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner /> Checking In...
                      </span>
                    ) : (
                      'Check In →'
                    )}
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

export default EmployeeDashboard;

