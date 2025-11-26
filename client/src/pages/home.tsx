import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { ShoppingBag, Package, Settings, Store } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome back, {user?.firstName || 'User'}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Here's what's happening with your account
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Link href="/store">
          <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Browse Store</CardTitle>
              <CardDescription>
                Explore our premium digital products
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard">
          <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>My Purchases</CardTitle>
              <CardDescription>
                Access your bought items and credentials
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/cart">
          <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Shopping Cart</CardTitle>
              <CardDescription>
                View and manage your cart items
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard#settings">
          <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your profile and preferences
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Featured Products Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link href="/store">
            <Button variant="ghost" data-testid="button-view-all">
              View All
            </Button>
          </Link>
        </div>
        
        <div className="text-center py-12 text-muted-foreground">
          <p>Featured products will appear here</p>
          <Link href="/store">
            <Button variant="outline" className="mt-4" data-testid="button-browse-store">
              Browse Store
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Orders</h2>
          <Link href="/dashboard">
            <Button variant="ghost" data-testid="button-view-orders">
              View All Orders
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>Your recent orders will appear here</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Quick Link */}
      {user?.role === 'admin' && (
        <div className="mt-12">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Admin Access</h3>
                  <p className="text-sm text-muted-foreground">
                    You have administrative privileges
                  </p>
                </div>
                <Link href="/admin">
                  <Button data-testid="button-admin-panel">
                    Go to Admin Panel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
