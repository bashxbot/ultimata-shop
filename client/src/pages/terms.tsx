import { motion } from 'framer-motion';
import { FileText, Shield, AlertTriangle, Scale } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing or using Ultimata Shop ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.

These Terms constitute a legally binding agreement between you and Ultimata Shop regarding your use of the Service. We reserve the right to update these terms at any time, and your continued use of the Service constitutes acceptance of any changes.`
    },
    {
      title: '2. Description of Service',
      content: `Ultimata Shop is a digital marketplace that provides:
      
- Gaming accounts and credentials
- Streaming service accounts  
- Digital combo lists for security research
- Custom development and programming services

All products are delivered digitally through our platform. We do not sell physical products or ship any items.`
    },
    {
      title: '3. Account Registration',
      content: `To purchase products or use certain features, you must create an account through our Replit authentication system.

You agree to:
- Provide accurate and complete information
- Maintain the security of your account credentials
- Notify us immediately of any unauthorized access
- Accept responsibility for all activities under your account

We reserve the right to suspend or terminate accounts that violate these terms.`
    },
    {
      title: '4. Purchases and Payment',
      content: `All prices are displayed in USD and are subject to change without notice. By making a purchase, you agree to pay the full amount at checkout.

Payment processing is handled securely through PayPal. We do not store your payment information. All sales are final unless the product is defective or does not work as described.

You acknowledge that digital products cannot be returned once delivered.`
    },
    {
      title: '5. Refund Policy',
      content: `Due to the digital nature of our products, refunds are granted on a case-by-case basis.

Refunds may be considered if:
- The product is defective or does not work as described
- You contact us within 24 hours of purchase
- You have not used or compromised the product

Refunds will NOT be granted for:
- Change of mind after purchase
- Products that have been used or accessed
- Requests made after 24 hours

To request a refund, please use the refund request feature in your dashboard.`
    },
    {
      title: '6. Acceptable Use',
      content: `You agree not to use our Service to:
      
- Violate any applicable laws or regulations
- Infringe upon intellectual property rights
- Distribute malware or harmful content
- Engage in fraudulent activities
- Resell products without authorization
- Access accounts or systems without permission

We reserve the right to terminate access for any violations.`
    },
    {
      title: '7. Intellectual Property',
      content: `All content on Ultimata Shop, including text, graphics, logos, and software, is the property of Ultimata Shop or its licensors.

You may not:
- Copy, modify, or distribute our content without permission
- Use our trademarks without authorization
- Reverse engineer our software or systems
- Remove any copyright or proprietary notices`
    },
    {
      title: '8. Disclaimer of Warranties',
      content: `THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.

We do not guarantee:
- Uninterrupted or error-free service
- That products will meet your specific needs
- The accuracy of product descriptions
- The longevity of account-based products

You use the Service at your own risk.`
    },
    {
      title: '9. Limitation of Liability',
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, ULTIMATA SHOP SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

Our total liability for any claim shall not exceed the amount you paid for the specific product in question.`
    },
    {
      title: '10. Indemnification',
      content: `You agree to indemnify and hold harmless Ultimata Shop, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your:

- Use of the Service
- Violation of these Terms
- Violation of any third-party rights`
    },
    {
      title: '11. Governing Law',
      content: `These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.

Any disputes arising from these Terms shall be resolved through arbitration or in the appropriate courts.`
    },
    {
      title: '12. Contact Information',
      content: `If you have any questions about these Terms of Service, please contact us through our Support page.

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
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Please read these terms carefully before using Ultimata Shop
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-6 flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-500 mb-1">Important Notice</h3>
              <p className="text-sm text-muted-foreground">
                By using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. 
                If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-6">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.03 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{section.content}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
