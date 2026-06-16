import { FileText } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";

const FooterLink = ({
  href,
  to,
  children,
}: {
  href?: string;
  to?: string;
  children: React.ReactNode;
}) => {
  const className =
    "block text-sm text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 transform ease-out";
  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
};

type SocialLinkProps = {
  href: string;
  children: React.ReactNode;
};

const SocialLink = ({ href, children }: SocialLinkProps) => {
  return (
    <a
      href={href}
      className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 hover:bg-gradient-to-br hover:from-blue-600 hover:to-indigo-900 transition-all duration-300 hover:scale-110 hover:shadow-[0_10px_20px_rgba(59,130,246,0.15)]"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

const Footer = () => {
  return (
    <footer className="relative bg-slate-950 border-t border-slate-900 text-white overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 pb-16">
          {/* Brand Info Column */}
          <div className="space-y-5 md:col-span-2 lg:col-span-2 pr-0 lg:pr-8">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-900 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10 border border-blue-400/20 transition-transform duration-300 group-hover:scale-105">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-light tracking-tight text-white">
                Skoob{" "}
                <span className="font-semibold text-blue-500">Invoice</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Streamlining business mechanics through modern financial
              frameworks. Create, track, and secure global invoices with zero
              friction.
            </p>
          </div>

          {/* Links Column: Product */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-slate-300 uppercase mb-5">
              Product
            </h3>
            <ul className="space-y-3.5">
              <li>
                <FooterLink href="#features">Features</FooterLink>
              </li>
              <li>
                <FooterLink href="#testimonials">Testimonials</FooterLink>
              </li>
              <li>
                <FooterLink href="#faq">FAQ Blueprint</FooterLink>
              </li>
            </ul>
          </div>

          {/* Links Column: Company */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-slate-300 uppercase mb-5">
              Company
            </h3>
            <ul className="space-y-3.5">
              <li>
                <FooterLink to="/about">About Us</FooterLink>
              </li>
              <li>
                <FooterLink to="/contact">Contact</FooterLink>
              </li>
            </ul>
          </div>

          {/* Links Column: Legal */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-slate-300 uppercase mb-5">
              Legal
            </h3>
            <ul className="space-y-3.5">
              <li>
                <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
              </li>
              <li>
                <FooterLink to="/terms-of-use">Terms of Service</FooterLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar Divider */}
        <div className="border-t border-slate-900/60 pt-8 mt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Skoob Invoice. Engineered with
              precision. All rights reserved.
            </p>

            {/* Social handles with dynamic interactions */}
            <div className="flex space-x-3.5">
              <SocialLink href="#">
                <FaXTwitter className="w-4 h-4" />
              </SocialLink>
              <SocialLink href="#">
                <FaGithub className="w-4 h-4" />
              </SocialLink>
              <SocialLink href="#">
                <FaLinkedin className="w-4 h-4" />
              </SocialLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
