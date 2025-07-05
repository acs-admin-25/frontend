import { ResourceSection } from '../../../types/resources';

export const advancedFeaturesSection: ResourceSection = {
  id: "advanced-features",
  title: "Advanced Features",
  description: "Power-user features and customization options",
  colorScheme: "from-violet-500 to-purple-500",
  icon: "Settings",
  content: [
    {
      title: "Customization",
      description: "Personalize your ACS experience",
      details: [
        "Dashboard Layout: Customize dashboard layout and widgets",
        "Notifications: Set up personalized alert preferences",
        "Templates: Create custom email and response templates",
        "Workflows: Set up automated processes and sequences"
      ],
      tips: [
        "Start with basic customization and expand gradually",
        "Test new workflows before full implementation",
        "Regularly review and update custom settings"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Template Creation",
          description: "Create custom email templates for common scenarios",
          clientAction: "Go to Settings → Templates and create new template",
          systemResponse: "Save template for future use in email composition",
          expectedOutcome: "Consistent, professional communication templates",
          timeEstimate: "10-15 minutes per template"
        }
      ]
    },
    {
      title: "Integrations",
      description: "Connect ACS with your existing tools",
      details: [
        "Calendar Sync: Connect with external calendar applications",
        "CRM Integration: Sync with popular CRM platforms",
        "Email Clients: Connect multiple email accounts",
        "Third-Party Tools: Integration with marketing and analytics tools"
      ],
      tips: [
        "Start with essential integrations first",
        "Test integrations thoroughly before relying on them",
        "Keep integration credentials secure"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Integration Setup",
          description: "Set up essential integrations for workflow efficiency",
          clientAction: "Go to Settings → Integrations and connect required tools",
          systemResponse: "Establish secure connection with external services",
          expectedOutcome: "Seamless workflow between ACS and other tools",
          timeEstimate: "15-30 minutes per integration"
        }
      ]
    },
    {
      title: "Automation",
      description: "Streamline your workflow with automation",
      details: [
        "Auto-Responses: Set up automatic email responses",
        "Lead Routing: Automatically assign leads to team members",
        "Follow-up Sequences: Automated follow-up campaigns",
        "Reporting: Scheduled report generation and delivery"
      ],
      tips: [
        "Start with simple automations and build complexity",
        "Monitor automation performance regularly",
        "Maintain personal touch alongside automation"
      ],
      clientWorkflow: [
        {
          step: 1,
          title: "Automation Setup",
          description: "Configure automated workflows for efficiency",
          clientAction: "Go to Settings → Automation and set up desired workflows",
          systemResponse: "Create automated processes for common tasks",
          expectedOutcome: "Reduced manual work and improved consistency",
          timeEstimate: "20-30 minutes per automation"
        }
      ]
    }
  ]
};
