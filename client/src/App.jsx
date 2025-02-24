import React from 'react';
import Home from './pages/Home';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

const App = () => {
  return (
    <>
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
    </>
  );
};

export default App;