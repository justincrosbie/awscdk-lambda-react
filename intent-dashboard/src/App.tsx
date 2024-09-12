import React from 'react';
import { ThemeProvider } from "@material-tailwind/react";
import Dashboard from './components/Dashboard';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <Dashboard />
      </div>
    </ThemeProvider>
  );
}

export default App;