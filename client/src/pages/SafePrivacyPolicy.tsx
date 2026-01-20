/**
 * Safe Privacy Policy (Compliance Mode)
 * 
 * This is a separate Privacy Policy page for Safe Mode.
 * NO crypto, mining, or financial references.
 * Appears as a "Server Management Utility" privacy policy.
 */

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export function SafePrivacyPolicy() {
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
          <h1 className="text-lg font-semibold">Privacy Policy</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-3xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-gray-400">BlockMint Node Manager</p>
          <p className="text-sm text-gray-500 mt-2">Last updated: January 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">1. Introduction</h2>
          <p className="text-gray-300 leading-relaxed">
            BlockMint Node Manager ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our server monitoring application.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">2. Information We Collect</h2>
          <p className="text-gray-300 leading-relaxed">
            We collect information you provide directly to us:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li><strong>Account Information:</strong> Email address, display name, and authentication credentials</li>
            <li><strong>Usage Data:</strong> How you interact with the application, features used, and preferences</li>
            <li><strong>Device Information:</strong> Device type, operating system, and app version</li>
            <li><strong>Log Data:</strong> Access times, pages viewed, and error reports</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">3. How We Use Your Information</h2>
          <p className="text-gray-300 leading-relaxed">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>Provide and maintain the Service</li>
            <li>Send you notifications about server status and alerts</li>
            <li>Improve and personalize your experience</li>
            <li>Respond to your inquiries and support requests</li>
            <li>Detect and prevent security threats</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">4. Data Security</h2>
          <p className="text-gray-300 leading-relaxed">
            We implement appropriate technical and organizational security measures to protect your personal information, including:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>Encryption of data in transit and at rest</li>
            <li>Secure authentication mechanisms</li>
            <li>Regular security assessments</li>
            <li>Access controls and monitoring</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">5. Data Sharing</h2>
          <p className="text-gray-300 leading-relaxed">
            We do not sell your personal information. We may share information only in the following circumstances:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>With service providers who assist our operations</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">6. Data Retention</h2>
          <p className="text-gray-300 leading-relaxed">
            We retain your information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">7. Your Rights</h2>
          <p className="text-gray-300 leading-relaxed">
            Depending on your location, you may have the right to:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">8. Cookies and Tracking</h2>
          <p className="text-gray-300 leading-relaxed">
            We use essential cookies to maintain your session and preferences. We do not use third-party tracking or advertising cookies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">9. Children's Privacy</h2>
          <p className="text-gray-300 leading-relaxed">
            Our Service is not intended for users under 13 years of age. We do not knowingly collect personal information from children.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">10. Changes to This Policy</h2>
          <p className="text-gray-300 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy and updating the "Last updated" date.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-400">11. Contact Us</h2>
          <p className="text-gray-300 leading-relaxed">
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <p className="text-cyan-400">privacy@blockmint.cloud</p>
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

export default SafePrivacyPolicy;
