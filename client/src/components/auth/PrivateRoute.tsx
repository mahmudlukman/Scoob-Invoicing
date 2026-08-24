import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { ReactNode } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import type { RootState } from "../../redux/store";

interface ProtectedRouteProps {
  children?: ReactNode;
  allowedRoles?: string[];
}

const PrivateRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isInitialized } = useSelector((state: RootState) => state.auth);

  if (!isInitialized) {
    return (
      <div className="auth-loading">
        <span className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout>{children ?? <Outlet />}</DashboardLayout>;
};

export default PrivateRoute;
