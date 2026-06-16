const PrivacyPolicyPage = () => {
  const lastUpdated = "June 2026";

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8 text-slate-700 antialiased">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-sm rounded-2xl p-8 sm:p-12">
        {/* Header */}
        <div className="border-b border-slate-100 pb-8 mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              1. Introduction
            </h2>
            <p>
              Welcome to Skoob Invoice. We value your privacy and are committed
              to protecting your personal data. This Privacy Policy explains how
              Skoob Invoice collects, uses, discloses, and safeguards your
              information when you utilize our platform to generate, manage, and
              track business invoices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              2. Information We Collect
            </h2>
            <p className="mb-3">
              To provide our invoice generation services, we process the
              following categories of information:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account Information:</strong> Name, email address,
                password, corporate identity details, and business role.
              </li>
              <li>
                <strong>Invoicing Data:</strong> Client names, billing
                addresses, financial amounts, descriptions of services rendered,
                dates, and metadata embedded within your generated invoices.
              </li>
              <li>
                <strong>Technical Data:</strong> IP addresses, browser types,
                device identifiers, and system interaction usage logs collected
                via analytics systems.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              3. How We Use Your Information
            </h2>
            <p className="mb-3">
              Skoob Invoice utilizes collected records purely to maintain
              operational workflow pipelines:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                To compile, format, and generate downloadable PDF invoices.
              </li>
              <li>
                To authenticate your session identity and guard dashboard access
                blocks.
              </li>
              <li>
                To provide customer support and optimize application features.
              </li>
              <li>
                To ensure full regulatory compliance under governing local data
                frameworks.
              </li>
            </ul>
            <p className="mt-3 font-semibold text-slate-900">
              Important: Skoob Invoice is an administrative document preparation
              platform. We do not process, collect, or store client payment
              methods, bank accounts, or credit card transactions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              4. Data Retention & Security
            </h2>
            <p>
              Your invoicing ledgers are encrypted at rest and in transit using
              industry-standard protocols. We retain your data for as long as
              your corporate account remains active or as required to meet
              administrative legal obligations. You maintain absolute custody
              over your historical data records and can request modification or
              erasure profiles at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              5. Sharing of Information
            </h2>
            <p>
              We do not sell, rent, or trade your personal information or
              invoicing records to third-party brokers. Data is only shared with
              trusted infrastructure sub-processors (such as cloud hosting
              providers and database engines) strictly necessary to run the
              application securely.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              6. Your Rights
            </h2>
            <p>
              Depending on your jurisdiction, you have the right to access the
              personal data we hold, correct inaccuracies, or delete your
              account records completely. To execute these privacy privileges,
              please contact our support desk.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
