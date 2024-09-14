import React from 'react';
import {
  Card,
  CardBody,
  Typography,
  Switch,
  Button,
  Select,
  Option
} from '@material-tailwind/react';
import { SunIcon, MoonIcon, BellIcon, GlobeAltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

// Custom Switch component in case Material Tailwind Switch doesn't work
const CustomSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <div 
    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer ${
      checked ? 'bg-blue-500' : 'bg-gray-300'
    }`}
    onClick={onChange}
  >
    <div 
      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`} 
    />
  </div>
);

const Settings: React.FC = () => {
  const { theme, colors, toggleTheme } = useTheme();

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const cardBgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const cardBorderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className="p-4">
      <Typography variant="h4" className={`mb-6 ${textColor}`}>Settings</Typography>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`shadow-lg rounded-lg ${cardBgColor} border ${cardBorderColor}`}
        style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <CardBody>
            <Typography variant="h6" className={`mb-4 ${textColor}`}>Appearance</Typography>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {theme === 'light' ? <SunIcon className="h-5 w-5 mr-2" /> : <MoonIcon className="h-5 w-5 mr-2" />}
                <span className={textColor}>
                  {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === 'dark'}
                onChange={toggleTheme}
                className="bg-blue-500" // Add this line to ensure proper styling
              />
              {/* Uncomment the line below and comment out the Switch above if it still doesn't work */}
              {/* <CustomSwitch checked={theme === 'dark'} onChange={toggleTheme} /> */}
            </div>
          </CardBody>
        </Card>

        <Card className={`shadow-lg rounded-lg ${cardBgColor} border ${cardBorderColor}`}
        style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <CardBody>
            <Typography variant="h6" className={`mb-4 ${textColor}`}>Notifications</Typography>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BellIcon className="h-5 w-5 mr-2" />
                <span className={textColor}>Push Notifications</span>
              </div>
              <Switch defaultChecked className="bg-blue-500" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BellIcon className="h-5 w-5 mr-2" />
                <span className={textColor}>Email Notifications</span>
              </div>
              <Switch defaultChecked className="bg-blue-500" />
            </div>
          </CardBody>
        </Card>

        <Card className={`shadow-lg rounded-lg ${cardBgColor} border ${cardBorderColor}`}
        style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <CardBody>
            <Typography variant="h6" className={`mb-4 ${textColor}`}>Language</Typography>
            <Select label="Select Language" defaultValue="en">
              <Option value="en">English</Option>
              <Option value="es">Español</Option>
              <Option value="fr">Français</Option>
              <Option value="de">Deutsch</Option>
            </Select>
          </CardBody>
        </Card>

        <Card className={`shadow-lg rounded-lg ${cardBgColor} border ${cardBorderColor}`}
        style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <CardBody>
            <Typography variant="h6" className={`mb-4 ${textColor}`}>Privacy</Typography>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <GlobeAltIcon className="h-5 w-5 mr-2" />
                <span className={textColor}>Public Profile</span>
              </div>
              <Switch defaultChecked className="bg-blue-500" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                <span className={textColor}>Two-Factor Authentication</span>
              </div>
              <Switch className="bg-blue-500" />
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button color="blue" ripple={true}>Save Changes</Button>
      </div>
    </div>
  );
};

export default Settings;