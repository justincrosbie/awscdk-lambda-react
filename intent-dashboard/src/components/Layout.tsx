import React, { useState, useEffect } from 'react';
import {
  Navbar,
  Typography,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

function NavList({ isDesktopSidebarOpen }: { isDesktopSidebarOpen: boolean }) {
  const { theme } = useTheme();

  return (
    <nav>
      <ul>
        <li className="mb-2">
          <Link
            to="/"
            className={`flex items-center p-2 rounded ${
              theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-50 text-gray-900'
            }`}
          >
            <Bars3Icon className="h-5 w-5 mr-2" />
            {isDesktopSidebarOpen && <span>Dashboard</span>}
          </Link>
        </li>
        <li className="mb-2">
          <Link
            to="/analytics"
            className={`flex items-center p-2 rounded ${
              theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-50 text-gray-900'
            }`}
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            {isDesktopSidebarOpen && <span>Analytics</span>}
          </Link>
        </li>
        <li className="mb-2">
          <Link
            to="/settings"
            className={`flex items-center p-2 rounded ${
              theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-50 text-gray-900'
            }`}
          >
            <Cog6ToothIcon className="h-5 w-5 mr-2" />
            {isDesktopSidebarOpen && <span>Settings</span>}
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function ProfileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
      <MenuHandler>
        <IconButton variant="text" className={textColor}>
          <UserCircleIcon className="h-6 w-6" />
        </IconButton>
      </MenuHandler>
      <MenuList className={`p-4 z-50 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <MenuItem onClick={closeMenu}>My Profile</MenuItem>
        <MenuItem onClick={closeMenu}>Settings</MenuItem>
        <MenuItem onClick={closeMenu}>Sign Out</MenuItem>
      </MenuList>
    </Menu>
  );
}

export function Layout({ children }: LayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

  const toggleMobileSidebar = () => setIsMobileSidebarOpen((cur) => !cur);
  const toggleDesktopSidebar = () => setIsDesktopSidebarOpen((cur) => !cur);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 960) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Navbar className={`sticky top-0 z-10 h-max max-w-full rounded-none py-2 px-4 lg:px-8 lg:py-4 
        ${theme === 'dark' ? 'bg-gray-800 border-none' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between">
            <Typography
            as="a"
            href="#"
            variant="h6"
            className={`mr-4 cursor-pointer py-1.5 lg:ml-2 ${textColor}`}
            >
            Trusst AI
            </Typography>
            <div className="hidden lg:block">
            <ProfileMenu />
            </div>
            <div className="flex items-center gap-4 lg:hidden">
            <IconButton
                variant="text"
                className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                onClick={toggleMobileSidebar}
            >
                {isMobileSidebarOpen ? (
                <XMarkIcon className="h-6 w-6" strokeWidth={2} />
                ) : (
                <Bars3Icon className="h-6 w-6" strokeWidth={2} />
                )}
            </IconButton>
            <IconButton variant="text" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                <BellIcon className="h-6 w-6" />
            </IconButton>
            </div>
        </div>
        </Navbar>
      <div className="flex">
        {/* Mobile Sidebar */}
        <aside 
          className={`fixed inset-y-0 left-0 z-50 w-64 transform ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out lg:hidden border-r border-gray-200 shadow-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
        >
          <div className="p-4">
            <IconButton onClick={toggleMobileSidebar} className="mb-4" color={theme === 'dark' ? 'white' : 'blue-gray'}>
              <XMarkIcon className="h-5 w-5" />
            </IconButton>
            <NavList isDesktopSidebarOpen={true} />
          </div>
        </aside>

        {/* Desktop Sidebar */}
        <aside className={`${isDesktopSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out hidden lg:block border-r border-gray-200 shadow-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <div className="p-4">
            <IconButton onClick={toggleDesktopSidebar} className="mb-4">
              {isDesktopSidebarOpen ? 
              <ChevronLeftIcon className="h-5 w-5" color={theme === 'dark' ? 'white' : 'black'}/> 
              : 
              <ChevronRightIcon className="h-5 w-5" color={theme === 'dark' ? 'white' : 'black'}/>}
            </IconButton>
            <NavList isDesktopSidebarOpen={isDesktopSidebarOpen} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-4">
          {children}
        </main>
      </div>
    </div>
  );
}