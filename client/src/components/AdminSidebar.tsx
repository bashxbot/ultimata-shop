import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Users, Shield, Package, Zap, FileText, Home, Bell, Wrench, Settings, RefreshCw, Star, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: FolderOpen },
  { label: 'Orders', href: '/admin/orders', icon: FileText },
  { label: 'Discounts', href: '/admin/discounts', icon: Zap },
  { label: 'Refunds', href: '/admin/refunds', icon: RefreshCw },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Service Requests', href: '/admin/service-requests', icon: Wrench },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 border-r bg-muted/40 p-4 hidden md:block">
      <div className="flex items-center gap-2 mb-8 pb-4 border-b">
        <Shield className="h-6 w-6" />
        <h1 className="font-bold">Admin Panel</h1>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <a>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  data-testid={`button-admin-nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-4 border-t">
        <Link href="/">
          <a>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <Home className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
          </a>
        </Link>
      </div>
    </aside>
  );
}
