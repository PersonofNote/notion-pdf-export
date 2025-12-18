import { Link } from 'react-router-dom';

export default function TermsOfUse() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      lineHeight: '1.6',
      color: '#333'
    }}>
      <Link to="/" style={{ color: '#0066cc', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
        ← Back to App
      </Link>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>Terms of Use</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Last Updated: December 18, 2025</p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>1. Acceptance of Terms</h2>
        <p>
          By accessing and using Notion PDF Exporter ("the Service"), you accept and agree to be bound by
          the terms and provisions of this agreement. If you do not agree to these Terms of Use, please
          do not use the Service.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>2. Description of Service</h2>
        <p>
          Notion PDF Exporter is a web-based service that allows you to export your Notion pages and
          databases to PDF format with custom letterhead branding. The Service integrates with Notion's
          API via OAuth authentication to access your content.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>3. User Obligations</h2>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>3.1 Account Security</h3>
        <p>You are responsible for:</p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Maintaining the security of your Notion account</li>
          <li>All activities that occur under your authenticated session</li>
          <li>Immediately notifying us of any unauthorized use</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>3.2 Acceptable Use</h3>
        <p>You agree to use the Service only for lawful purposes. You must not:</p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe on intellectual property rights of others</li>
          <li>Attempt to gain unauthorized access to the Service or its systems</li>
          <li>Use automated means (bots, scrapers) to access the Service</li>
          <li>Interfere with or disrupt the Service or servers</li>
          <li>Upload malicious code, viruses, or harmful content</li>
          <li>Use the Service to harass, abuse, or harm others</li>
          <li>Attempt to circumvent rate limits or security measures</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>3.3 Content Responsibility</h3>
        <p>
          You are solely responsible for the content you export through the Service. You represent and
          warrant that you have all necessary rights to export and use your Notion content, and that
          doing so does not violate any third-party rights or applicable laws.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>4. Notion Integration</h2>
        <p>
          The Service requires OAuth authentication with Notion. By connecting your Notion account, you
          grant us permission to:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Access pages and databases you've explicitly shared with our integration</li>
          <li>Read content from those pages and databases</li>
          <li>Retrieve metadata necessary for PDF generation</li>
        </ul>
        <p>
          You can revoke this access at any time through your Notion account settings. We do not have
          permission to modify, delete, or create content in your Notion workspace.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>5. Service Availability and Limitations</h2>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>5.1 Service Availability</h3>
        <p>
          We strive to provide reliable service but do not guarantee uninterrupted access. The Service
          may be temporarily unavailable due to maintenance, updates, or technical issues.
        </p>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>5.2 Rate Limits</h3>
        <p>To ensure fair use and service stability, we enforce the following rate limits:</p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>General API requests: 100 per 15 minutes</li>
          <li>PDF generation: 10 per minute</li>
          <li>Batch PDF generation: 5 per minute</li>
          <li>Notion content fetching: 30 per minute</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>5.3 Content Limitations</h3>
        <p>The Service has technical limitations including:</p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>PDF generation timeout: 30 seconds per document</li>
          <li>Logo image size: Maximum 10MB</li>
          <li>Database query limit: 100 rows per database</li>
          <li>URL length: Maximum 500 characters</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>6. Intellectual Property</h2>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>6.1 Your Content</h3>
        <p>
          You retain all rights to your content. We do not claim ownership of any content you export
          through the Service. By using the Service, you grant us a temporary, non-exclusive license
          to process your content solely for the purpose of generating PDFs.
        </p>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>6.2 Service Ownership</h3>
        <p>
          The Service, including all software, designs, and documentation, is owned by us and protected
          by intellectual property laws. You may not copy, modify, distribute, or reverse engineer any
          part of the Service.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>7. Disclaimers and Limitation of Liability</h2>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>7.1 "As Is" Service</h3>
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
        </p>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>7.2 No Warranty</h3>
        <p>We do not warrant that:</p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>The Service will meet your specific requirements</li>
          <li>The Service will be uninterrupted, timely, or error-free</li>
          <li>Generated PDFs will be free from defects or formatting issues</li>
          <li>All Notion content types will be perfectly rendered</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>7.3 Limitation of Liability</h3>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER
          INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE
          LOSSES RESULTING FROM:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Your use or inability to use the Service</li>
          <li>Any unauthorized access to or use of our servers</li>
          <li>Any bugs, viruses, or other harmful code</li>
          <li>Any errors or omissions in generated PDFs</li>
          <li>Any content obtained through the Service</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>8. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless Notion PDF Exporter and its affiliates from any
          claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Your use of the Service</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any third-party rights</li>
          <li>Content you export or generate through the Service</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>9. Beta Testing</h2>
        <p>
          The Service is currently in beta testing. Features may change, and the Service may experience
          bugs or unexpected behavior. We appreciate your feedback and patience during this phase.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>10. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your access to the Service at any time, with or
          without cause, with or without notice. Upon termination, your right to use the Service will
          immediately cease.
        </p>
        <p>
          You may discontinue use of the Service at any time by revoking OAuth access through your
          Notion account settings.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>11. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify users of material
          changes by updating the "Last Updated" date. Your continued use of the Service after changes
          constitutes acceptance of the modified Terms.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>12. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with applicable laws, without
          regard to conflict of law provisions. Any disputes arising from these Terms or use of the
          Service shall be resolved through binding arbitration.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>13. Severability</h2>
        <p>
          If any provision of these Terms is found to be unenforceable or invalid, that provision will
          be limited or eliminated to the minimum extent necessary so that these Terms will otherwise
          remain in full force and effect.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>14. Contact Information</h2>
        <p>
          If you have any questions about these Terms of Use, please contact us through the GitHub
          repository issues page.
        </p>
      </section>

      <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e0e0e0', color: '#666', fontSize: '0.9rem' }}>
        <Link to="/privacy" style={{ color: '#0066cc', textDecoration: 'none', marginRight: '1.5rem' }}>
          Privacy Policy
        </Link>
        <Link to="/" style={{ color: '#0066cc', textDecoration: 'none' }}>
          Back to App
        </Link>
      </footer>
    </div>
  );
}
