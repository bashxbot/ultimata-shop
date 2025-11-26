import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown, Search, MessageSquare, Shield, CreditCard, Package, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const faqCategories = [
  {
    title: 'Getting Started',
    icon: HelpCircle,
    faqs: [
      {
        question: 'How do I create an account?',
        answer: 'Creating an account is simple! Click the "Login" button at the top of the page. Your account will be automatically created when you sign in.'
      },
      {
        question: 'What types of products do you sell?',
        answer: 'We specialize in digital products including gaming accounts, streaming service accounts, combo lists for security testing, and custom development services.'
      },
      {
        question: 'How do I find products?',
        answer: 'You can browse our store by visiting the Store page. Use the search bar or filter by category to find exactly what you\'re looking for.'
      },
    ]
  },
  {
    title: 'Orders & Delivery',
    icon: Package,
    faqs: [
      {
        question: 'How do I receive my purchase?',
        answer: 'After a successful payment, your digital product will be available immediately in your Dashboard. You can download the credentials or access information directly from there.'
      },
      {
        question: 'Can I track my order?',
        answer: 'Yes! Visit your Dashboard to see all your orders and their status. Each order includes details about delivery and any associated credentials.'
      },
      {
        question: 'What if my product doesn\'t work?',
        answer: 'If you experience any issues with your purchase, please contact our support team within 24 hours. We\'ll work to resolve the issue or provide a replacement.'
      },
    ]
  },
  {
    title: 'Payments',
    icon: CreditCard,
    faqs: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept PayPal for secure payments. More payment options may be added in the future.'
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Absolutely! We never store your payment details. All transactions are processed securely through PayPal\'s encrypted payment system.'
      },
      {
        question: 'Do you offer discounts?',
        answer: 'Yes! Check our Featured page for current promotions. You can also use discount codes at checkout when available.'
      },
    ]
  },
  {
    title: 'Refunds & Returns',
    icon: RefreshCw,
    faqs: [
      {
        question: 'Can I get a refund?',
        answer: 'Due to the digital nature of our products, refunds are handled on a case-by-case basis. If the product doesn\'t work as described, please contact support within 24 hours.'
      },
      {
        question: 'How do I request a refund?',
        answer: 'Navigate to your Dashboard, find the order in question, and click "Request Refund". Provide details about the issue and our team will review your request.'
      },
      {
        question: 'How long does a refund take?',
        answer: 'Once approved, refunds are typically processed within 3-5 business days. The exact timing depends on your payment provider.'
      },
    ]
  },
  {
    title: 'Security & Privacy',
    icon: Shield,
    faqs: [
      {
        question: 'Is my account information secure?',
        answer: 'Yes! We use industry-standard security measures to protect your data. Your account is secured through our secure authentication system.'
      },
      {
        question: 'Do you sell my personal information?',
        answer: 'Never! We respect your privacy and do not sell or share your personal information with third parties. See our Privacy Policy for details.'
      },
      {
        question: 'What happens to my data if I delete my account?',
        answer: 'Upon account deletion, your personal data is permanently removed from our systems within 30 days, as outlined in our Privacy Policy.'
      },
    ]
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Find answers to common questions about our products, orders, and services
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-xl mx-auto mb-12"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-faq-search"
          />
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-8">
        {filteredCategories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card>
              <CardContent className="p-12 text-center">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any FAQs matching your search
                </p>
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          filteredCategories.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + categoryIndex * 0.05 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle>{category.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.faqs.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                          <AccordionTrigger className="text-left" data-testid={`faq-question-${categoryIndex}-${faqIndex}`}>
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-16"
      >
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Link href="/support">
              <Button data-testid="button-contact-support">
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
