import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') return null;

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-[#0B0757] text-white p-4">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <nav>
        <ul className="space-y-4">
          <li>
            <NavLink
              to="/admin/promo-codes"
              className={({ isActive }) =>
                `block py-2 px-4 rounded ${isActive ? 'bg-[#1a237e]' : 'hover:bg-[#1a237e]'}`
              }
            >
              Manage Promo Codes
            </NavLink>
          </li>
          {/* Add more admin routes as needed */}
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center py-2 px-4 rounded hover:bg-[#1a237e] w-full text-left"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;