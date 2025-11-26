import { motion } from 'framer-motion';
import { Shield, Eye, Database, Lock, Users, Globe, Mail, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  const sections = [
    {
      icon: Eye,
      title: '1. Information We Collect',
      content: `We collect information that you provide directly to us:

Personal Information:
- Name and email address (through Replit authentication)
- Account preferences and settings
- Payment information (processed securely through PayPal)

Usage Information:
- Pages visited and features used
- Device and browser information
- IP address and location data
- Order history and purchase details

We collect this information to provide and improve our services.`
    },
    {
      icon: Database,
      title: '2. How We Use Your Information',
      content: `We use the information we collect to:

- Process your orders and transactions
- Send order confirmations and updates
- Provide customer support
- Improve and personalize your experience
- Detect and prevent fraud or abuse
- Comply with legal obligations

We will not use your information for purposes other than those described in this policy without your consent.`
    },
    {
      icon: Users,
      title: '3. Information Sharing',
      content: `We do not sell, rent, or trade your personal information. We may share your information:

With Service Providers:
- Payment processors (PayPal)
- Analytics providers
- Hosting services

For Legal Reasons:
- To comply with legal obligations
- To protect our rights and safety
- To prevent fraud or illegal activity

With Your Consent:
- When you explicitly authorize sharing`
    },
    {
      icon: Lock,
      title: '4. Data Security',
      content: `We implement appropriate security measures to protect your information:

- Secure HTTPS connections
- Encrypted data storage
- Regular security audits
- Access controls and authentication
- Secure payment processing through PayPal

While we strive to protect your information, no method of transmission or storage is 100% secure. We cannot guarantee absolute security.`
    },
    {
      icon: Globe,
      title: '5. Cookies and Tracking',
      content: `We use cookies and similar technologies to:

- Remember your preferences
- Analyze site traffic and usage
- Provide personalized content
- Maintain session security

Types of Cookies:
- Essential: Required for site functionality
- Analytics: Help us understand usage patterns
- Preferences: Remember your settings

You can control cookies through your browser settings. Disabling cookies may affect site functionality.`
    },
    {
      icon: Shield,
      title: '6. Your Rights',
      content: `You have the right to:

- Access your personal information
- Correct inaccurate data
- Request deletion of your data
- Opt-out of marketing communications
- Export your data
- Restrict certain processing

To exercise these rights, please contact us through our Support page. We will respond within 30 days.`
    },
    {
      icon: Users,
      title: '7. Children\'s Privacy',
      content: `Our Service is not directed to children under 13 (or 16 in some jurisdictions).

We do not knowingly collect personal information from children. If we discover that we have collected information from a child, we will delete it promptly.

If you believe a child has provided us with personal information, please contact us.`
    },
    {
      icon: Globe,
      title: '8. International Transfers',
      content: `Your information may be transferred to and processed in countries other than your own.

We take steps to ensure adequate protection during international transfers, including:
- Standard contractual clauses
- Data processing agreements
- Compliance with applicable laws

By using our Service, you consent to the transfer of your information as described.`
    },
    {
      icon: AlertCircle,
      title: '9. Data Retention',
      content: `We retain your information for as long as:

- Your account is active
- Needed to provide our services
- Required by law

After account deletion:
- Personal data is deleted within 30 days
- Transaction records may be retained for legal compliance
- Anonymized data may be retained for analytics

You can request earlier deletion by contacting us.`
    },
    {
      icon: Mail,
      title: '10. Contact Us',
      content: `If you have questions about this Privacy Policy or our data practices, please contact us:

- Through our Support page
- By email at support@ultimata.shop

We will respond to your inquiry as soon as possible.

Last updated: November 2024`
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Your privacy is important to us. This policy explains how we collect, use, and protect your information.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Our Commitment to Privacy</h3>
            <p className="text-sm text-muted-foreground">
              At Ultimata Shop, we are committed to protecting your privacy and ensuring the security of your personal information. 
              We never sell your data to third parties and only collect information necessary to provide our services.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-6">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{section.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
