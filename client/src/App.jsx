/* eslint-disable */
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import AdminPromoCodes from "./pages/AdminPromoCodes";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Sidebar from "./components/common/Sidebar";
import ProviderPortal from "./pages/ProviderPortal";
import Qualifications from "./pages/Qualifications";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SidebarProvider, useSidebar } from "./contexts/SidebarContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProfileContent from "./pages/ProfileContent";
import Completion from "./pages/Completion";
import ProviderProfile from "./pages/ProviderProfile";

const App = () => {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div style={{ minHeight: "100vh", backgroundColor: "#FDF8F4" }}>
          <AppContent />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
          />
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
};

const AppContent = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isOpen, isMobile } = useSidebar();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Only show main navbar on non-admin routes */}
      {!isAdminRoute && <Navbar />}

      {/* Admin sidebar for admin routes */}
      {isAdminRoute && <Sidebar />}

      {/* Main content with appropriate margin based on route and sidebar state */}
      <div
        className={`flex-grow transition-all duration-300 ${
          isAdminRoute
            ? isMobile
              ? isOpen
                ? "md:ml-64"
                : ""
              : "md:ml-64"
            : ""
        }`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/provider-portal" element={<ProviderPortal />} />
          <Route path="/qualifications" element={<Qualifications />} />
          <Route path="/profile-content" element={<ProfileContent />} />
          <Route path="/completion" element={<Completion />} />
          <Route path="/provider-profile" element={<ProviderProfile />} />
          <Route
            path="/admin/promo-codes"
            element={
              <ProtectedRoute
                redirectAction={() =>
                  toast.error("You are not authenticated to access this page.")
                }
              >
                <AdminPromoCodes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={<AdminPlaceholder title="Dashboard" />}
          />
          <Route
            path="/admin/users"
            element={<AdminPlaceholder title="Users Management" />}
          />
          <Route
            path="/admin/orders"
            element={<AdminPlaceholder title="Orders Management" />}
          />
          <Route
            path="/admin/analytics"
            element={<AdminPlaceholder title="Analytics Dashboard" />}
          />
          <Route
            path="/admin/settings"
            element={<AdminPlaceholder title="Admin Settings" />}
          />
          <Route
            path="/admin/support"
            element={<AdminPlaceholder title="Support Center" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {/* Only show footer on non-admin routes */}
      {!isAdminRoute && <Footer />}
    </div>
  );
};

// Simple placeholder component for admin routes that aren't fully implemented yet
const AdminPlaceholder = ({ title }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-indigo-900">{title}</h1>
          <p className="text-gray-500 mt-2">This page is under development.</p>
        </header>
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <div className="bg-indigo-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Coming Soon
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            This section is currently under development. Please check back later
            for updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
