import { FileText, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Button from "../ui/Button";
import { useState } from "react";
import Login from "../../pages/auth/Login";
import Modal from "../ui/Modal";
import SignUp from "../../pages/auth/SignUp";
import ForgotPassword from "../../pages/auth/ForgotPassword";

const Hero = () => {
  const [currentPage, setCurrentPage] = useState("signup");
  const [openAuthModal, setOpenAuthModal] = useState(false);
  return (
    <>
      <section className="relative min-h-screen pt-32 pb-20 flex items-center justify-center overflow-hidden bg-[#fafafa]">
        {/* Premium Background Ambient Glow Filters */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-indigo-500/10 blur-[140px]" />
          {/* Subtle dot matrix pattern overlay */}
          <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Block: Value Proposition Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Tagline Badge */}
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100/80 px-3 py-1.5 rounded-full text-blue-700 text-xs font-semibold tracking-wide uppercase shadow-sm mx-auto lg:mx-0">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Invoicing & Local Compliance</span>
              </div>

              {/* Main Premium Typography Hook */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-slate-900 leading-[1.1]">
                Professional invoices that <br />
                <span className="font-bold bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-950 bg-clip-text text-transparent">
                  generate real value.
                </span>
              </h1>

              {/* Strategic Subtext Description */}
              <p className="text-base sm:text-lg text-slate-600 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Streamline your entire invoicing cycle, secure rapid local
                client settlements, and guarantee full compliance with secure
                data processing standards. Built exclusively for modern
                enterprises.
              </p>

              {/* Action Buttons Interface */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  variant="primary"
                  size="large"
                  fullWidth
                  className="sm:w-auto"
                  onClick={() => {
                    setCurrentPage("signup");
                    setOpenAuthModal(true);
                  }}
                >
                  Start Free Trial
                </Button>

                <a
                  href="#features"
                  className="w-full sm:w-auto inline-flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-7 py-4 rounded-xl font-medium tracking-wide transition-all duration-200 cursor-pointer"
                >
                  Explore Features
                </a>
              </div>

              {/* Trust Anchors Row */}
              <div className="pt-8 border-t border-slate-200/60 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 text-slate-500 text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>NDPR Data Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Zero Setup Friction</span>
                </div>
              </div>
            </div>

            {/* Right Block: Interactive Visual Showcase Frame */}
            <div className="lg:col-span-5 relative w-full max-w-md mx-auto lg:max-w-none">
              {/* Visual Glass Base Card */}
              <div className="relative bg-white rounded-2xl border border-slate-200/80 shadow-[0_20px_50px_rgba(15,23,42,0.06)] p-6 transition-all duration-500 hover:shadow-[0_30px_60px_rgba(15,23,42,0.1)] group">
                {/* Premium Dashboard Frame Mockup Decor */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  </div>
                  <div className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-md">
                    skoob-invoice.app/preview
                  </div>
                </div>

                {/* Dynamic Sample App Invoice Element */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">
                        Invoice #INV-0042
                      </h4>
                      <p className="text-xs text-slate-400">
                        Due within 14 days
                      </p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-md font-semibold tracking-wide">
                      Active
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Client Corporate Unit</span>
                      <span className="font-medium text-slate-800">
                        Enterprise Solutions Ltd
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Issued Date</span>
                      <span className="font-medium text-slate-800">
                        June 06, 2026
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">
                      Total Outstanding Balance
                    </span>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-950 bg-clip-text text-transparent">
                      ₦1,450,000.00
                    </span>
                  </div>
                </div>

                {/* Float-out Accent Metric Block */}
                <div className="absolute bottom-[-20px] left-[-20px] hidden sm:flex items-center space-x-3 bg-slate-950 text-white p-4 rounded-xl shadow-xl transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      Generation Speed
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Instant PDF Delivery
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
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

export default Hero;
