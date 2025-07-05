import { ResourceSection } from '../../../types/resources';

export const securitySection: ResourceSection = {
  id: "security",
  title: "Security & Privacy",
  description: "Protecting your data and maintaining client confidentiality",
  colorScheme: "from-red-500 to-orange-500",
  icon: "Shield",
  content: [
    {
      title: "Account Security",
      description: "Safeguarding your ACS account and credentials",
      details: [
        "Password Management: Change passwords regularly in Settings",
        "Session Management: Secure login with automatic timeout",
        "Unauthorized Access: Automatic logout on suspicious activity",
        "Two-Factor Authentication: Enhanced security (if available)"
      ],
      tips: [
        "Use strong, unique passwords",
        "Log out when using shared computers",
        "Enable two-factor authentication if available"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Password Update",
          description: "Regular password updates for account security",
          clientAction: "Go to Settings → Security → Change Password",
          systemResponse: "Verify current password and set new secure password",
          expectedOutcome: "Updated password with enhanced security",
          timeEstimate: "2-3 minutes"
        },
        {
          step: 2,
          title: "Session Review",
          description: "Review active sessions and logout unused devices",
          clientAction: "Check Settings → Security → Active Sessions",
          systemResponse: "Display all active login sessions",
          expectedOutcome: "Control over account access from multiple devices",
          timeEstimate: "1-2 minutes"
        }
      ],
      interactiveElements: [
        {
          name: "Security Settings",
          location: "Settings → Security tab",
          purpose: "Manage account security preferences",
          howToUse: "Navigate to security settings to update preferences",
          bestPractices: ["Enable two-factor authentication", "Set strong passwords", "Review session activity regularly"]
        }
      ]
    },
    {
      title: "Data Protection",
      description: "Comprehensive data security and privacy measures",
      details: [
        "Encryption: All data encrypted in transit and at rest",
        "Client-Side Security: Sensitive information never exposed",
        "Access Controls: Strict permission-based data access",
        "Compliance: Meets real estate industry privacy standards"
      ],
      tips: [
        "Never share login credentials",
        "Report suspicious activity immediately",
        "Regularly review account access"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Privacy Review",
          description: "Regular review of data sharing and privacy settings",
          clientAction: "Check Settings → Privacy to review data sharing",
          systemResponse: "Display current privacy settings and data usage",
          expectedOutcome: "Understanding of how data is used and protected",
          timeEstimate: "3-5 minutes"
        }
      ]
    },
    {
      title: "Email Security",
      description: "Protecting your email communications",
      details: [
        "Spam Filtering: Advanced filtering to protect against threats",
        "Email Validation: Verification of email authenticity",
        "Secure Transmission: Encrypted email delivery",
        "Privacy Controls: You control data sharing and visibility"
      ],
      tips: [
        "Review spam folder regularly",
        "Be cautious with email attachments",
        "Verify sender authenticity before responding"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Spam Review",
          description: "Daily review of spam folder for legitimate emails",
          clientAction: "Check Junk folder in Email tab",
          systemResponse: "Display filtered emails with option to mark as not spam",
          expectedOutcome: "Recovery of any legitimate emails caught by filters",
          timeEstimate: "2-3 minutes"
        }
      ],
      interactiveElements: [
        {
          name: "Spam Management",
          location: "Email → Junk folder",
          purpose: "Review and recover filtered emails",
          howToUse: "Click 'Not Spam' on legitimate emails",
          bestPractices: ["Check daily", "Report false positives", "Train spam filter"]
        }
      ]
    }
  ]
};
