import React from 'react';
import { Avatar, SearchBar, StatusDot } from '../ui';
import { Dropdown, DropdownItem } from '../ui/Dropdown';

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

const Logo = () => (
  <div className="flex items-center">
    <span className="font-bold text-xl tracking-tight text-neutral-900">Dayflow</span>
  </div>
);
const Navbar = ({
  currentUser,
  userStatus,
  onMyProfile,
  onLogout
}) => {
  const navTabs = [
    { id: 'employees', label: 'Employees' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'timeoff', label: 'Time Off' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <nav className="glass-card sticky top-0 z-40 border-b border-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Nav Tabs */}
          <div className="hidden md:flex items-center gap-1">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm
                  transition-all duration-200
                  ${currentPage === tab.id 
                    ? 'bg-primary-400/20 text-neutral-900 tab-active' 
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <SearchBar 
              value={searchValue}
              onChange={onSearch}
              className="hidden sm:block w-64"
            />

            {/* User Avatar with Status & Dropdown */}
            <Dropdown
              align="right"
              trigger={
                <div className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-neutral-100 transition-colors">
                  <div className="relative">
                    <Avatar 
                      src={currentUser?.avatar}
                      name={currentUser?.name || 'User'}
                      size="sm"
                    />
                    {/* Status Dot */}
                    <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-white rounded-full">
                      <StatusDot status={userStatus} size="sm" showPulse={false} />
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              }
            >
              <div className="py-1">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="font-semibold text-neutral-900">{currentUser?.name}</p>
                  <p className="text-sm text-neutral-500">{currentUser?.email}</p>
                </div>
                <DropdownItem icon={<UserIcon />} onClick={onMyProfile}>
                  My Profile
                </DropdownItem>
                <DropdownItem icon={<LogoutIcon />} onClick={onLogout} danger>
                  Log Out
                </DropdownItem>
              </div>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden px-4 pb-3">
        <div className="flex gap-1">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`
                flex-1 px-3 py-2 rounded-lg font-medium text-sm text-center
                transition-all duration-200
                ${currentPage === tab.id 
                  ? 'bg-primary-400/20 text-neutral-900' 
                  : 'text-neutral-600 hover:bg-neutral-100'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

