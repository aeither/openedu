import { createFileRoute } from '@tanstack/react-router';
import AppLayout from '@/components/layout/AppLayout';

export const Route = createFileRoute('/terms-of-service')({
  component: TermsOfService,
});

function TermsOfService() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AppLayout title="Terms of Service" showBackButton={true}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">
          Terms of Service for OpenEdu
        </h1>
        <p className="mb-4">Last updated: {currentDate}</p>

        <p className="mb-4">
          Welcome to OpenEdu. By accessing or using our platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold">
          1. Account Registration
        </h2>
        <p className="mb-4">
          To use certain features of our platform, you may need to create an account. When you register, you agree to provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold">
          2. User Conduct
        </h2>
        <p className="mb-4">
          When using our platform, you agree not to:
        </p>
        <ul className="mb-4 list-inside list-disc pl-4">
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe upon the rights of others</li>
          <li>Use the platform to distribute unauthorized or unsolicited advertising</li>
          <li>Upload or transmit viruses or malicious code</li>
          <li>Attempt to gain unauthorized access to the platform or other users' accounts</li>
        </ul>

        <h2 className="mb-4 mt-6 text-2xl font-semibold">
          3. Content
        </h2>
        <p className="mb-4">
          You retain all rights to the content you create, upload, or share on OpenEdu. By submitting content to our platform, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display the content solely for the purpose of providing our services.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold">
          4. Intellectual Property
        </h2>
        <p className="mb-4">
          All content, features, and functionality of our platform, including but not limited to text, graphics, logos, and software, are owned by OpenEdu or its licensors and are protected by copyright, trademark, and other intellectual property laws.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold">
          5. Termination
        </h2>
        <p className="mb-4">
          We reserve the right to suspend or terminate your access to our platform at any time and for any reason, including but not limited to a violation of these Terms of Service.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold">
          6. Disclaimer of Warranties
        </h2>
        <p className="mb-4">
          Our platform is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that our platform will be uninterrupted, error-free, or secure.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold">
          7. Limitation of Liability
        </h2>
        <p className="mb-4">
          To the maximum extent permitted by law, OpenEdu shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in connection with your use of our platform.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold">
          8. Changes to Terms
        </h2>
        <p className="mb-4">
          We may revise these Terms of Service from time to time. The most current version will always be posted on our platform. By continuing to use our platform after any changes, you accept the revised terms.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold">
          9. Governing Law
        </h2>
        <p className="mb-4">
          These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which OpenEdu operates, without regard to its conflict of law principles.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold">10. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about these Terms of Service, please contact us at:
        </p>
        <p className="mb-4">
          OpenEdu
          <br />
          https://t.me/dailywiser
        </p>

        <p className="mt-8 text-sm text-gray-600">
          By using OpenEdu, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.
        </p>
      </div>
    </AppLayout>
  );
}
