import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useTokenRefresh } from "./utils/userRefreshToken";
import PrivateRoute from "./components/auth/PrivateRoute";
import LandingPage from "./pages/LandingPage/LandingPage";
import ResetPassword from "./pages/auth/ResetPassword";
import Activation from "./pages/auth/Activation";
import Dashboard from "./pages/Dashboard/Dashboard";
import AllInvoices from "./pages/Invoices/AllInvoices";
import CreateInvoice from "./pages/Invoices/CreateInvoice";
import InvoiceDetail from "./pages/Invoices/InvoiceDetail";
import ProfilePage from "./pages/Profile/ProfilePage";
import NotFound from "./pages/NotFound";
import CustomizeInvoice from "./pages/Invoices/CustomizeInvoice";
import Analytics from "./pages/admin/Analytics";
import AllUsers from "./pages/admin/AllUsers";
import PrivacyPolicyPage from "./pages/LandingPage/PrivacyPolicyPage";
import TermsOfUsePage from "./pages/LandingPage/TermsOfUsePage";
import AboutPage from "./pages/LandingPage/AboutPage";
import ContactPage from "./pages/LandingPage/ContactPage";

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/activation/:activation_token", element: <Activation /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/privacy-policy", element: <PrivacyPolicyPage /> },
  { path: "/terms-of-use", element: <TermsOfUsePage /> },

  // admin protected routes
  {
    element: <PrivateRoute allowedRoles={["user", "admin"]} />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "invoices", element: <AllInvoices /> },
      { path: "invoices/new", element: <CreateInvoice /> },
      { path: "invoice/:id", element: <InvoiceDetail /> },
      { path: "invoice/customize", element: <CustomizeInvoice /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
  {
    element: <PrivateRoute allowedRoles={["admin"]} />,
    children: [
      { path: "analytics", element: <Analytics /> },
      { path: "all-users", element: <AllUsers /> },
    ],
  },
  // user protected routes
  { path: "*", element: <NotFound /> },
]);

const App = () => {
  useTokenRefresh();

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        toastOptions={{
          style: { fontSize: "13px" },
        }}
      />
    </>
  );
};

export default App;
