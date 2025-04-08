import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ChevronLeft, 
  LogOut, 
  Tag, 
  Home, 
  Settings, 
  Users, 
  ShoppingCart,
  BarChart3,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    document.body.setAttribute('data-sidebar-open', isOpen.toString());
    return () => document.body.removeAttribute('data-sidebar-open');
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
      else setIsOpen(false);
    };

    setIsOpen(!isMobile);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [location.pathname, isMobile]);

  if (!user || user.role !== 'admin') return null;

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/admin/dashboard' },
    { name: 'Promo Codes', icon: <Tag className="w-5 h-5" />, path: '/admin/promo-codes' },
    { name: 'Users', icon: <Users className="w-5 h-5" />, path: '/admin/users' },
    { name: 'Orders', icon: <ShoppingCart className="w-5 h-5" />, path: '/admin/orders' },
    { name: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, path: '/admin/analytics' },
    { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/admin/settings' },
    { name: 'Support', icon: <HelpCircle className="w-5 h-5" />, path: '/admin/support' },
  ];

  return (
    <>
      {/* Mobile toggle button - fixed position outside the sidebar */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full bg-indigo-900 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay for mobile - only visible when sidebar is open */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-indigo-900 to-indigo-800 text-white z-40 transition-all duration-300 ease-in-out shadow-xl ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} ${!isMobile && 'md:translate-x-0 md:w-64'}`}
      >
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-white rounded-md flex items-center justify-center">
                <span className="text-indigo-900 font-bold text-lg">E</span>
              </div>
              <h2 className="ml-3 text-xl font-bold">Elite Admin</h2>
            </div>
            {isMobile && (
              <button 
                onClick={toggleSidebar}
                className="p-1 rounded-full hover:bg-indigo-800"
                aria-label="Close sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-b border-indigo-800">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-indigo-700 flex items-center justify-center">
              <span className="font-medium text-sm">{user?.name?.[0] || 'A'}</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-indigo-300">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="mt-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-700 text-white shadow-md' : 'text-indigo-100 hover:bg-indigo-800'}`}
                  onClick={() => isMobile && toggleSidebar()}
                >
                  <span className={isActive ? 'text-white' : 'text-indigo-300'}>
                    {item.icon}
                  </span>
                  <span className="ml-3 text-sm font-medium">{item.name}</span>
                  {isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-white"></span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-3 rounded-lg hover:bg-indigo-800 transition-colors text-sm font-medium text-indigo-100"
          >
            <LogOut className="w-5 h-5 mr-3 text-indigo-300" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;