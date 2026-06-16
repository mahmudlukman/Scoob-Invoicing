import React, { useState } from "react";
import { Mail, Shield, Building2 } from "lucide-react";
import Button from "../../components/ui/Button";

const ContactPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    inquiryType: "product_support",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      alert(
        "Operational transmission captured securely. Our consulting desk will review your logs shortly.",
      );
      setForm({
        name: "",
        email: "",
        inquiryType: "product_support",
        message: "",
      });
    }, 1500);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8 text-slate-700 antialiased">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Information & Channels Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Corporate Office
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1 sm:text-4xl">
              Partner With Us
            </h1>
            <p className="text-slate-500 mt-3 text-sm sm:text-base leading-relaxed">
              Have technical interface questions regarding Skoob Invoice, or
              looking to engage CodePence for custom business workflow engines,
              security audits, or data integrations? Connect directly with our
              solutions team.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Parent Enterprise Entity
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  CodePence Global Enterprise
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start border-t border-slate-100 pt-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Communications Gateway
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  support@codepence.com
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start border-t border-slate-100 pt-4">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Response Baseline
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  All infrastructure & billing diagnostics addressed within 24
                  business hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* High-End Architecture Input Form Container */}
        <div className="lg:col-span-7 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Identity / Contact Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Lead Administrator"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@institution.org"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Inquiry Classification
              </label>
              <select
                value={form.inquiryType}
                onChange={(e) =>
                  setForm({ ...form, inquiryType: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-slate-800"
              >
                <option value="product_support">
                  Skoob Invoice App Support / Bug Filing
                </option>
                <option value="enterprise_consulting">
                  CodePence Custom Software / Discovery Request
                </option>
                <option value="security_compliance">
                  Regulatory Data Integrity / Audit Inquiries
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Operational Requirements / Message
              </label>
              <textarea
                rows={5}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Outline your application requirements or technical complications systematically..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all placeholder:text-slate-400 text-slate-800 resize-none leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="medium"
                isLoading={isSubmitting}
                fullWidth
                type="submit"
              >
                Transmit to Solutions Desk
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

// import React, { useState } from "react";
// import { Mail, HelpCircle } from "lucide-react";
// import Button from "../../components/ui/Button";

// const ContactPage = () => {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     subject: "",
//     message: "",
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     // Simulate API Network Request pipeline
//     setTimeout(() => {
//       setIsSubmitting(false);
//       alert(
//         "Message transmitted successfully to support desk records container.",
//       );
//       setForm({ name: "", email: "", subject: "", message: "" });
//     }, 1500);
//   };

//   return (
//     <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8 text-slate-700 antialiased">
//       <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
//         {/* Left Side: Contact Metadata Channels Panel */}
//         <div className="lg:col-span-5 space-y-6">
//           <div>
//             <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
//               Get In Touch
//             </span>
//             <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1 sm:text-4xl">
//               Connect With Us
//             </h1>
//             <p className="text-slate-500 mt-3 text-sm sm:text-base leading-relaxed">
//               Have system architectural questions or feature implementation
//               feedback regarding Skoob Invoice? Drop our operations desk a
//               direct digital line.
//             </p>
//           </div>

//           <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
//             <div className="flex gap-4 items-start">
//               <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
//                 <Mail className="w-4 h-4" />
//               </div>
//               <div>
//                 <h4 className="font-bold text-slate-900 text-sm">
//                   General Communications
//                 </h4>
//                 <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
//                   support@skoobinvoice.com
//                 </p>
//               </div>
//             </div>

//             <div className="flex gap-4 items-start border-t border-slate-100 pt-4">
//               <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
//                 <HelpCircle className="w-4 h-4" />
//               </div>
//               <div>
//                 <h4 className="font-bold text-slate-900 text-sm">
//                   Technical Escalations
//                 </h4>
//                 <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
//                   Response timeframe baseline averages &lt; 24 business hours
//                   cycle.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Side: High-End Contact Submission Form Container */}
//         <div className="lg:col-span-7 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-10">
//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div className="space-y-1.5">
//                 <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={form.name}
//                   onChange={(e) => setForm({ ...form, name: e.target.value })}
//                   placeholder="John Doe"
//                   className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all placeholder:text-slate-400 text-slate-800"
//                 />
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
//                   Email Address
//                 </label>
//                 <input
//                   type="email"
//                   required
//                   value={form.email}
//                   onChange={(e) => setForm({ ...form, email: e.target.value })}
//                   placeholder="johndoe@business.com"
//                   className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all placeholder:text-slate-400 text-slate-800"
//                 />
//               </div>
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
//                 Subject Line
//               </label>
//               <input
//                 type="text"
//                 required
//                 value={form.subject}
//                 onChange={(e) => setForm({ ...form, subject: e.target.value })}
//                 placeholder="Enterprise account inquiries..."
//                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all placeholder:text-slate-400 text-slate-800"
//               />
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
//                 Message Body
//               </label>
//               <textarea
//                 rows={5}
//                 required
//                 value={form.message}
//                 onChange={(e) => setForm({ ...form, message: e.target.value })}
//                 placeholder="Elaborate on your requirement protocols cleanly here..."
//                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all placeholder:text-slate-400 text-slate-800 resize-none leading-relaxed"
//               />
//             </div>

//             <div className="pt-2">
//               <Button
//                 variant="primary"
//                 size="medium"
//                 isLoading={isSubmitting}
//                 fullWidth
//                 type="submit"
//               >
//                 Transmit Secure Message
//               </Button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ContactPage;
