/**
 * Safe Terms of Service (Compliance Mode)
 * 
 * This is a separate Terms of Service page for Safe Mode.
 * NO crypto, mining, or financial references.
 * Appears as a "Server Management Utility" terms.
 */

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export function SafeTermsOfService() {
  const [, setLocation] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">Terms of Service</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-3xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-gray-400">BlockMint Node Manager</p>
          <p className="text-sm text-gray-500 mt-2">Last updated: January 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">1. Acceptance of Terms</h2>
          <p className="text-gray-300 leading-relaxed">
            By accessing or using the BlockMint Node Manager application ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">2. Description of Service</h2>
          <p className="text-gray-300 leading-relaxed">
            BlockMint Node Manager is a server infrastructure monitoring and management application. The Service provides:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>Real-time server health monitoring</li>
            <li>Performance metrics and analytics</li>
            <li>Node status tracking and management</li>
            <li>Resource allocation monitoring</li>
            <li>System notifications and alerts</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">3. User Accounts</h2>
          <p className="text-gray-300 leading-relaxed">
            To access certain features of the Service, you must create an account. You are responsible for:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">4. Acceptable Use</h2>
          <p className="text-gray-300 leading-relaxed">
            You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>Use the Service in any way that violates applicable laws</li>
            <li>Attempt to gain unauthorized access to any systems</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Transmit any harmful code or malware</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">5. Data and Metrics</h2>
          <p className="text-gray-300 leading-relaxed">
            The metrics and data displayed in the Service are for informational purposes only. While we strive for accuracy, we do not guarantee the completeness or reliability of any data presented.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">6. Service Availability</h2>
          <p className="text-gray-300 leading-relaxed">
            We aim to provide continuous access to the Service but do not guarantee uninterrupted availability. The Service may be temporarily unavailable for maintenance, updates, or due to circumstances beyond our control.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">7. Intellectual Property</h2>
          <p className="text-gray-300 leading-relaxed">
            The Service and its original content, features, and functionality are owned by BlockMint and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">8. Limitation of Liability</h2>
          <p className="text-gray-300 leading-relaxed">
            To the maximum extent permitted by law, BlockMint shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">9. Changes to Terms</h2>
          <p className="text-gray-300 leading-relaxed">
            We reserve the right to modify these Terms at any time. We will notify users of any material changes. Continued use of the Service after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">10. Contact Information</h2>
          <p className="text-gray-300 leading-relaxed">
            For questions about these Terms, please contact us at:
          </p>
          <p className="text-cyan-400">support@blockmint.cloud</p>
        </section>

        <div className="pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 BlockMint Node Manager. All rights reserved.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default SafeTermsOfService;
