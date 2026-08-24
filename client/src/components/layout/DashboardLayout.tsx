import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Briefcase, LogOut, Menu, X } from "lucide-react";

import { NAVIGATION_MENU } from "../../utils/data";
import ProfileDropdown from "./ProfileDropdown";

import { useSelector } from "react-redux";
import { useLogoutMutation } from "../../redux/features/auth/authApi";
import type { RootState } from "../../redux/store";

interface NavigationItemType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavigationItemProps {
  item: NavigationItemType;
  isActive: boolean;
  onClick: (id: string) => void;
  isCollapsed: boolean;
}

const NavigationItem = ({
  item,
  isActive,
  onClick,
  isCollapsed,
}: NavigationItemProps) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
        isActive
          ? "bg-blue-50 text-blue-900 shadow-sm shadow-blue-50"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <Icon
        className={`h-5 w-5 flex-shrink-0 ${
          isActive ? "text-blue-900" : "text-gray-500"
        }`}
      />

      {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
    </button>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [logout] = useLogoutMutation();

  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /*
   * Determine the active menu item directly from the current URL.
   *
   * Examples:
   * /dashboard       -> dashboard
   * /invoices        -> invoices
   * /customers       -> customers
   * /settings        -> settings
   * /profile         -> profile
   * /analytics       -> analytics
   */
  const activeNavItem = location.pathname.split("/")[1] || "dashboard";

  /*
   * Handle responsive behaviour
   */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;

      setIsMobile(mobile);

      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /*
   * Close profile dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = () => {
      if (profileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  /*
   * Navigate to a menu item
   */
  const handleNavigation = (itemId: string) => {
    navigate(`/${itemId}`);

    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  /*
   * Toggle mobile sidebar
   */
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  /*
   * Logout
   */
  const handleLogout = async () => {
    try {
      await logout({}).unwrap();
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  /*
   * Sidebar is currently never collapsed on desktop.
   * Keeping this variable makes it easy to add collapse functionality later.
   */
  const sidebarCollapsed = false;

  /*
   * Only show navigation items allowed for the user's role.
   */
  const visibleMenuItems = NAVIGATION_MENU.filter((item) =>
    item.visible.some((role) => role === user?.role),
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform ${
          isMobile
            ? sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        } ${
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-white border-r border-gray-200`}
      >
        {/* Company Logo */}
        <div className="flex items-center h-16 border-b border-gray-200 px-6">
          <Link className="flex items-center space-x-3" to="/dashboard">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>

            {!sidebarCollapsed && (
              <span className="text-gray-900 font-bold text-xl">
                Skoob Invoice
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {visibleMenuItems.map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              isActive={activeNavItem === item.id}
              onClick={handleNavigation}
              isCollapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            type="button"
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-100 hover:text-red-900 transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 flex-shrink-0 text-red-500" />

            {!sidebarCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/10 bg-opacity-25 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <button
                type="button"
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                onClick={toggleSidebar}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5 text-gray-600" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600" />
                )}
              </button>
            )}

            <div>
              <h1 className="text-base font-semibold text-gray-900">
                Welcome back, {user?.name}!
              </h1>

              <p className="text-sm text-gray-500 hidden sm:block">
                Here's your invoice overview.
              </p>
            </div>
          </div>

          {/* Profile */}
          <div className="flex items-center space-x-3">
            <ProfileDropdown
              isOpen={profileDropdownOpen}
              onToggle={() => {
                setProfileDropdownOpen((prev) => !prev);
              }}
              companyName={user?.name || ""}
              email={user?.email || ""}
              onLogout={handleLogout}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
