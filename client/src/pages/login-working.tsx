import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Shield, ArrowRight, Mail, Lock, Zap } from 'lucide-react';
import { Link } from 'wouter';

export default function Login() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [30, 0, 30] }}
          transition={{ duration: 10, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Branding Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-2xl opacity-50" />
            <h1 className="relative text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ultimata Shop
            </h1>
          </div>
          <p className="text-muted-foreground flex items-center justify-center gap-1">
            <Zap className="h-4 w-4 text-primary" />
            Premium Digital Marketplace
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl hover-elevate transition-all">
            <CardHeader className="space-y-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
              </motion.div>
              <CardTitle className="text-2xl">Customer Login</CardTitle>
              <CardDescription>
                Sign in to access your account and purchases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={handleLogin}
                  className="w-full gap-2 group"
                  size="lg"
                  data-testid="button-replit-login"
                >
                  <Mail className="h-4 w-4" />
                  Sign in with Replit
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-xs text-muted-foreground"
              >
                Don't have an account? Sign in will create one automatically.
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3"
        >
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Secure Authentication</p>
            <p className="text-xs">We use Replit Auth for secure, passwordless sign-in</p>
          </div>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 flex justify-center gap-4 text-xs text-muted-foreground"
        >
          <Link href="/store">
            <button className="hover:text-foreground transition-colors" data-testid="link-browse">
              Browse Store
            </button>
          </Link>
          <div className="border-l border-border" />
          <Link href="/support">
            <button className="hover:text-foreground transition-colors" data-testid="link-support">
              Help
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
