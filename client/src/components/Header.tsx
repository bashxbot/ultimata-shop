import { useState } from 'react';
import { Menu, LogOut, Shield, Lock, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { ThemeToggle } from './ThemeToggle';
import { MiniCart } from './MiniCart';
import { NotificationCenter } from './NotificationCenter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import faviconUrl from '/favicon.svg';

export function Header() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      toast({ title: 'Logout failed', variant: 'destructive' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border backdrop-blur-md bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="button-mobile-menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b border-border md:hidden z-40">
            <nav className="flex flex-col gap-1 p-4">
              <Link 
                href="/store" 
                className="text-sm font-medium px-4 py-2 rounded-md hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-store"
              >
                Store
              </Link>
              <Link 
                href="/featured" 
                className="text-sm font-medium px-4 py-2 rounded-md hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-about"
              >
                About
              </Link>
              <Link 
                href="/support" 
                className="text-sm font-medium px-4 py-2 rounded-md hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-support"
              >
                Support
              </Link>
            </nav>
          </div>
        )}

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" data-testid="link-home">
          <div className="flex flex-col items-center leading-tight">
            <div className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-widest">
              ULTIMATA
            </div>
            <div className="text-xs font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent" style={{ letterSpacing: '0.35em' }}>
              S H O P
            </div>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/store" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-store">
            Store
          </Link>
          <Link href="/featured" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-about">
            About
          </Link>
          <Link href="/support" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-support">
            Support
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MiniCart />
          {user && <NotificationCenter />}
          
          {user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                title="My Dashboard"
                data-testid="button-dashboard"
              >
                <User className="h-5 w-5" />
              </Button>
              {user.role === 'admin' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/admin')}
                  title="Admin Panel"
                  data-testid="button-admin-panel"
                >
                  <Shield className="h-5 w-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Logout"
                data-testid="button-logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/login')}
              data-testid="button-login"
            >
              <Lock className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
