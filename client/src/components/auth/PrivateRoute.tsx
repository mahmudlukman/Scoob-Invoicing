// import { Navigate, Outlet } from "react-router-dom";
// import DashboardLayout from "../layout/DashboardLayout";
// import { useSelector } from "react-redux";
// import type { RootState } from "../../@types";
// import type { ReactNode } from "react";

// interface ProtectedRouteProps {
//   children?: ReactNode;
// }

// const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
//   const { user } = useSelector((state: RootState) => state.auth);

//   if (!user) {
//     return <Navigate to="/" replace />;
//   }

//   return (
//     <DashboardLayout activeMenu="">
//       {children ? children : <Outlet />}{" "}
//     </DashboardLayout>
//   );
// };

// export default ProtectedRoute;
import { Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import { useSelector } from "react-redux";
import type { RootState } from "../../@types";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children?: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Authenticated but role not allowed
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout activeMenu="">
      {children ? children : <Outlet />}
    </DashboardLayout>
  );
};

export default ProtectedRoute;