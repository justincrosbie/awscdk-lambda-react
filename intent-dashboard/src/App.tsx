import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MaterialThemeProvider } from "@material-tailwind/react";
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Analytics from './components/Analytics';

function App() {
  return (
    <MaterialThemeProvider>
      <ThemeProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </MaterialThemeProvider>
  );
}

export default App;