// client/src/App.jsx

import React from 'react';
import Home from './pages/Home';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import { AuthProvider } from './contexts/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#FDF8F4', 
      }}>
        <Navbar />
        <div>
          <Home />
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;