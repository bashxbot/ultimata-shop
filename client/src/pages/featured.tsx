import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { Shield, Zap, Lock, ArrowRight } from 'lucide-react';

export default function Featured() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [30, 0, 30] }}
          transition={{ duration: 10, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-20 left-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* About Header */}
            <div className="space-y-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                About Ultimata Shop
              </h1>
              <p className="text-lg text-muted-foreground">
                Your trusted platform for premium digital products and secure transactions
              </p>
            </div>

            {/* Story */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed text-base">
                Ultimata Shop was built with a simple purpose: to create a secure, transparent, and user-friendly marketplace for digital products. We believe that buying and selling digital assets should be straightforward, safe, and rewarding for everyone involved.
              </p>
              <p className="text-muted-foreground leading-relaxed text-base">
                Whether you're looking to purchase gaming accounts, exclusive combo lists, or access premium digital services, Ultimata Shop provides a platform you can trust with advanced encryption, multiple payment options, and 24/7 customer support.
              </p>
            </div>

            {/* Why Us */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">What Makes Us Different</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover-elevate active-elevate-2 h-full">
                    <CardContent className="p-6 space-y-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">Bank-Grade Security</h3>
                      <p className="text-sm text-muted-foreground">
                        Encrypted credentials, secure payment gateways, and protected user data ensure your transactions are always safe.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover-elevate active-elevate-2 h-full">
                    <CardContent className="p-6 space-y-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">Instant Delivery</h3>
                      <p className="text-sm text-muted-foreground">
                        No waiting, no emails - access your purchases immediately through your secure dashboard.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover-elevate active-elevate-2 h-full">
                    <CardContent className="p-6 space-y-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">Privacy Protected</h3>
                      <p className="text-sm text-muted-foreground">
                        Your personal information and purchase history are encrypted and never shared with third parties.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover-elevate active-elevate-2 h-full">
                    <CardContent className="p-6 space-y-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ArrowRight className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">Customer First</h3>
                      <p className="text-sm text-muted-foreground">
                        Our 24/7 support team is here to help with any questions or concerns about your purchases.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            {/* Values Section */}
            <div className="space-y-6 border-t border-border/50 pt-12">
              <h2 className="text-2xl font-semibold">Our Core Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="space-y-3"
                >
                  <h3 className="font-semibold text-lg">Transparency</h3>
                  <p className="text-muted-foreground">
                    We believe in clear communication. No hidden fees, no surprises - just honest, straightforward transactions.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <h3 className="font-semibold text-lg">Reliability</h3>
                  <p className="text-muted-foreground">
                    Our platform is built to be dependable. Fast, secure, and always available when you need us.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  <h3 className="font-semibold text-lg">Community</h3>
                  <p className="text-muted-foreground">
                    We're more than a marketplace. We're building a community of trusted buyers and sellers.
                  </p>
                </motion.div>
              </div>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-6 border-t border-border/50 pt-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold">Ready to Join Us?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience the difference with Ultimata Shop. Browse our products, make secure purchases, and access instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="gap-2 group">
                  <Link href="/store">
                    Explore Store
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
