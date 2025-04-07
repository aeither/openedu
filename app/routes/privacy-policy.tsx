import { createFileRoute } from '@tanstack/react-router';
import AppLayout from '@/components/layout/AppLayout';

export const Route = createFileRoute('/privacy-policy')({
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AppLayout title="Privacy Policy" showBackButton={true}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">
          Privacy Policy for OpenEdu
        </h1>
        <p className="mb-4">Last updated: {currentDate}</p>

        <p className="mb-4">
          At OpenEdu, we are committed to protecting your privacy and ensuring
          the security of your information. This Privacy Policy explains how we
          handle your data when you use our learning platform.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold">
          1. Information We Collect
        </h2>
        <p className="mb-4">
          OpenEdu collects certain information from you when you use our
          platform. This may include:
        </p>
        <ul className="mb-4 list-inside list-disc pl-4">
          <li>Username and password for account creation</li>
          <li>Progress and achievements within the platform</li>
          <li>Notes and learning materials you create</li>
          <li>
            Any information you choose to share with us through our support
            channels
          </li>
        </ul>

        <h2 className="mb-4 mt-6 text-2xl font-semibold">
          2. How We Use Your Information
        </h2>
        <p className="mb-4">
          We use the information we collect to provide and improve our services,
          including:
        </p>
        <ul className="mb-4 list-inside list-disc pl-4">
          <li>Personalizing your learning experience</li>
          <li>Tracking your progress and achievements</li>
          <li>Storing and organizing your notes and learning materials</li>
          <li>Providing customer support</li>
        </ul>

        <h2 className="mb-4 mt-6 text-2xl font-semibold">3. Data Security</h2>
        <p className="mb-4">
          We take data security seriously. We use industry-standard encryption
          protocols to protect your data during transmission and storage.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold">
          4. Third-Party Services
        </h2>
        <p className="mb-4">
          OpenEdu may use third-party services to provide certain features and
          functionality. These services may have their own data collection and
          privacy practices. We encourage you to review their privacy policies to
          understand how they handle your information.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold">
          5. Children&apos;s Privacy
        </h2>
        <p className="mb-4">
          OpenEdu does not knowingly collect or store any personal information
          from children under the age of 13. If you are under 13, please use our
          service only with the involvement of a parent or guardian.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold">
          6. Changes to This Privacy Policy
        </h2>
        <p className="mb-4">
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page and
          updating the &ldquo;Last updated&rdquo; date at the top of this Privacy
          Policy.
        </p>

        <h2 className="mb-4 mt-6 text-2xl font-semibold">7. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us
          at:
        </p>
        <p className="mb-4">
          OpenEdu
          <br />
          https://t.me/dailywiser
        </p>

        <p className="mt-8 text-sm text-gray-600">
          By using OpenEdu, you agree to the practices described in this
          Privacy Policy.
        </p>
      </div>
    </AppLayout>
  );
}
