import React from 'react';
import { Switch, Typography } from '@material-tailwind/react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-4">
      <Typography variant="h4" className={`mb-4 ${theme === 'dark' ? 'text-white' : 'text-blue-gray-900'}`}>
        Settings
      </Typography>
      <div className="flex items-center">
        <Switch
          id="theme-toggle"
          label={
            <div className="flex items-center">
              {theme === 'light' ? <SunIcon className="h-5 w-5 mr-1" /> : <MoonIcon className="h-5 w-5 mr-1 text-white" />}
              <span className={theme === 'dark' ? 'text-white' : 'text-blue-gray-900'}>
                {theme === 'light' ? 'Light' : 'Dark'}
              </span>
            </div>
          }
          checked={theme === 'dark'}
          onChange={toggleTheme}
        />
      </div>
    </div>
  );
};

export default Settings;