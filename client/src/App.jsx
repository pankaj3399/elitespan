import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import AdminPromoCodes from './pages/AdminPromoCodes';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <AuthProvider>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#FDF8F4',
        }}
      >
        <Navbar />
        <AppContent />
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
        />
      </div>
    </AuthProvider>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {isAdminRoute && <Sidebar />}
      <div className={isAdminRoute ? 'ml-0 md:ml-64' : 'ml-0'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/admin/promo-codes"
            element={
              <ProtectedRoute
                redirectAction={() => toast.error('You are not authenticated to access this page.')}
              >
                <AdminPromoCodes />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
};

export default App;