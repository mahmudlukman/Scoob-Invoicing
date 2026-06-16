import { useEffect, useState } from "react";
import { FileText, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "../layout/ProfileDropdown";
import Button from "../ui/Button";
import { useSelector } from "react-redux";
import type { RootState } from "../../@types";
import { useLogoutMutation } from "../../redux/features/auth/authApi";
import Modal from "../ui/Modal";
import Login from "../../pages/auth/Login";
import ForgotPassword from "../../pages/auth/ForgotPassword";
import SignUp from "../../pages/auth/SignUp";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [logout] = useLogoutMutation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout({}).unwrap();
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "py-3 bg-white/70 backdrop-blur-md border-b border-slate-200/50 shadow-[0_4px_30px_rgba(15,23,42,0.03)]"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 transition-all duration-500">
            {/* Logo Section */}
            <div
              onClick={() => navigate("/")}
              className="flex items-center space-x-3 group cursor-pointer"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-900 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/10 border border-blue-400/20 transition-transform duration-300 group-hover:scale-105">
                <FileText className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-xl font-light tracking-tight text-slate-900">
                Skoob{" "}
                <span className="font-semibold text-blue-600">Invoice</span>
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex lg:items-center lg:space-x-10">
              {["features", "testimonials", "faq"].map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  className="text-sm font-medium text-slate-600 hover:text-slate-950 capitalize tracking-wide transition-colors duration-200 relative py-1 after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0"
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Action Buttons / Profile Control */}
            <div className="hidden lg:flex items-center space-x-5">
              {user ? (
                <ProfileDropdown
                  isOpen={profileDropdownOpen}
                  onToggle={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  companyName={user?.name || ""}
                  email={user?.email || ""}
                  onLogout={handleLogout}
                />
              ) : (
                <>
                  <button
                    onClick={() => {
                      setCurrentPage("login");
                      setOpenAuthModal(true);
                    }}
                    className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors duration-200 px-3 py-2 cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage("signup");
                      setOpenAuthModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-950 to-blue-900 hover:brightness-110 text-white px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_25px_rgba(15,23,42,0.15)] cursor-pointer"
                  >
                    Sign Up Free
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button Trigger */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 transition-all duration-200 focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Premium Mobile Slide-Down Overlay */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xl transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <div className="px-4 pt-3 pb-6 space-y-2">
            {["features", "testimonials", "faq"].map((item) => (
              <a
                key={item}
                href={`#${item}`}
                className="block px-4 py-3 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-50 font-medium capitalize transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            ))}

            <div className="border-t border-slate-100 my-4" />

            {user ? (
              <div className="px-4 pt-2">
                <Button
                  onClick={() => {
                    navigate("/dashboard");
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-950 to-blue-900 text-white rounded-xl py-3 font-semibold shadow-md"
                >
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 px-4 pt-2">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setCurrentPage("login");
                    setOpenAuthModal(true);
                  }}
                  className="w-full text-center py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setCurrentPage("signup");
                    setOpenAuthModal(true);
                  }}
                  className="w-full text-center py-3 bg-gradient-to-r from-blue-950 to-blue-900 text-white rounded-xl font-semibold shadow-sm transition-transform active:scale-95"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal Asset Configuration */}
      <Modal
        isOpen={openAuthModal}
        onClose={() => {
          setOpenAuthModal(false);
          setCurrentPage("login");
        }}
        hideHeader
      >
        <div>
          {currentPage === "login" && (
            <Login
              setCurrentPage={setCurrentPage}
              closeModal={() => {
                setOpenAuthModal(false);
                setCurrentPage("login");
              }}
            />
          )}
          {currentPage === "signup" && (
            <SignUp setCurrentPage={setCurrentPage} />
          )}
          {currentPage === "forgotPassword" && (
            <ForgotPassword setCurrentPage={setCurrentPage} />
          )}
        </div>
      </Modal>
    </>
  );
};

export default Header;
