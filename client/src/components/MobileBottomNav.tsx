import { Home, Store, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/', testId: 'nav-home' },
    { icon: Store, label: 'Store', path: '/store', testId: 'nav-store' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', testId: 'nav-cart' },
    { icon: User, label: 'Account', path: '/dashboard', testId: 'nav-account' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border backdrop-blur-md bg-background/80 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[44px] min-h-[44px] transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid={item.testId}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-gradient-to-r from-primary to-accent rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
