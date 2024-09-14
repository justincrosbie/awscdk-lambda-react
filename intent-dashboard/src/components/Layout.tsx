import React, { useState, useEffect } from 'react';
import {
  Navbar,
  Typography,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Drawer,
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
  HomeIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from '../contexts/ThemeContext';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

function NavList({ isDesktopSidebarOpen }: { isDesktopSidebarOpen: boolean }) {
  const { theme } = useTheme();
  const location = useLocation();

  const navItems = [
    { icon: HomeIcon, text: 'Dashboard', path: '/' },
    { icon: ChartBarIcon, text: 'Analytics', path: '/analytics' },
    { icon: Cog6ToothIcon, text: 'Settings', path: '/settings' },
  ];

  return (
    <nav>
      <ul>
        {navItems.map((item) => (
          <li key={item.path} className="mb-2">
            <Link
              to={item.path}
              className={`flex items-center p-2 rounded transition-colors duration-200 ${
                location.pathname === item.path
                  ? theme === 'dark'
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-50 text-blue-500'
                  : theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className={`h-5 w-5 mr-2 ${isDesktopSidebarOpen ? '' : 'mx-auto'}`} />
              {isDesktopSidebarOpen && <span>{item.text}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ProfileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);
  const { theme, colors } = useTheme();

  return (
        <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
        <MenuHandler>
            <IconButton variant="text" className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>
            <UserCircleIcon className="h-6 w-6" />
            </IconButton>
        </MenuHandler>
        <MenuList className={`p-1 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}`}
            style={{ backgroundColor: colors.background, borderColor: colors.border }}>
            <MenuItem onClick={closeMenu} className="flex items-center gap-2 rounded">
            <UserCircleIcon className="h-4 w-4" /> My Profile
            </MenuItem>
            <MenuItem onClick={closeMenu} className="flex items-center gap-2 rounded">
            <Cog6ToothIcon className="h-4 w-4" /> Settings
            </MenuItem>
            <hr className={`my-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
            <MenuItem onClick={closeMenu} className="flex items-center gap-2 rounded text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10">
            Sign Out
            </MenuItem>
        </MenuList>
        </Menu>
  );
}

export function Layout({ children }: LayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const { theme, colors } = useTheme();

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
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-700'}`}
    >
      <Navbar className={`sticky top-0 z-10 h-max max-w-full rounded-none py-2 px-4 lg:px-8 lg:py-4 
      ${theme === 'dark' ? 'bg-gray-800 border-none' : 'bg-white border-gray-200'}`}
      style={{ backgroundColor: colors.background, borderColor: colors.border }}>
        <div className="flex items-center justify-between">
          <Typography
            as="a"
            href="#"
            variant="h6"
            className="mr-4 cursor-pointer py-1.5 lg:ml-2 font-bold"
          >
            Trusst AI
          </Typography>
          <div className="hidden lg:flex gap-4 items-center">
            <IconButton variant="text" className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>
              <BellIcon className="h-5 w-5" />
            </IconButton>
            <ProfileMenu />
          </div>
          <IconButton
            variant="text"
            className="lg:hidden"
            onClick={toggleMobileSidebar}
          >
            {isMobileSidebarOpen ? (
              <XMarkIcon className="h-6 w-6" strokeWidth={2} />
            ) : (
              <Bars3Icon className="h-6 w-6" strokeWidth={2} />
            )}
          </IconButton>
        </div>
      </Navbar>
      <div className="flex">
        {/* Mobile Sidebar */}
        <Drawer
          open={isMobileSidebarOpen}
          onClose={toggleMobileSidebar}
          className={`p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className="mb-6 flex items-center justify-between">
            <Typography variant="h5" color={theme === 'dark' ? 'white' : 'blue-gray'}>
              Trusst AI
            </Typography>
            <IconButton variant="text" color={theme === 'dark' ? 'white' : 'blue-gray'} onClick={toggleMobileSidebar}>
              <XMarkIcon className="h-5 w-5" />
            </IconButton>
          </div>
          <NavList isDesktopSidebarOpen={true} />
        </Drawer>

        {/* Desktop Sidebar */}
        <aside className={`${
          isDesktopSidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 ease-in-out hidden lg:block ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-r`}
        style={{ backgroundColor: colors.background, borderColor: colors.border }}>
          <div className="p-4">
            <IconButton onClick={toggleDesktopSidebar} className="mb-4">
              {isDesktopSidebarOpen ? 
                <ChevronLeftIcon className="h-5 w-5" /> 
                : 
                <ChevronRightIcon className="h-5 w-5" />
              }
            </IconButton>
            <NavList isDesktopSidebarOpen={isDesktopSidebarOpen} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-6" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
          {children}
        </main>
      </div>
    </div>
  );
}