import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import HomePage from "@/pages/home";
import StorePage from "@/pages/store";
import ProductDetailPage from "@/pages/product-detail";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import DashboardPage from "@/pages/dashboard";
import PurchaseDetailPage from "@/pages/purchase-detail";
import AdminDashboardPage from "@/pages/admin-dashboard";
import AdminProductsPage from "@/pages/admin-products";
import AdminProductDetailPage from "@/pages/admin-product-detail";
import AdminOrdersPage from "@/pages/admin-orders";
import AdminCategoriesPage from "@/pages/admin-categories";
import AdminUsersPage from "@/pages/admin-users";
import AdminAdminsPage from "@/pages/admin-admins";
import AdminDiscountsPage from "@/pages/admin-discounts";
import AdminNotificationsPage from "@/pages/admin-notifications";
import AdminServiceRequestsPage from "@/pages/admin-service-requests";
import AdminRefundsPage from "@/pages/admin-refunds";
import AdminReviewsPage from "@/pages/admin-reviews";
import AdminSettingsPage from "@/pages/admin-settings";
import WishlistPage from "@/pages/wishlist";
import FAQPage from "@/pages/faq";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import ContactPage from "@/pages/contact";
import AboutPage from "@/pages/about";
import SettingsPage from "@/pages/settings";
import FeaturedPage from "@/pages/featured";
import SupportPage from "@/pages/support";
import NotFoundPage from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={user ? HomePage : LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/store" component={StorePage} />
      <Route path="/products/:id" component={ProductDetailPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/purchases/:id" component={PurchaseDetailPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/admin/products" component={AdminProductsPage} />
      <Route path="/admin/products/:id" component={AdminProductDetailPage} />
      <Route path="/admin/orders" component={AdminOrdersPage} />
      <Route path="/admin/categories" component={AdminCategoriesPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/admins" component={AdminAdminsPage} />
      <Route path="/admin/discounts" component={AdminDiscountsPage} />
      <Route path="/admin/notifications" component={AdminNotificationsPage} />
      <Route path="/admin/service-requests" component={AdminServiceRequestsPage} />
      <Route path="/admin/refunds" component={AdminRefundsPage} />
      <Route path="/admin/reviews" component={AdminReviewsPage} />
      <Route path="/admin/settings" component={AdminSettingsPage} />
      <Route path="/wishlist" component={WishlistPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/featured" component={FeaturedPage} />
      <Route path="/support" component={SupportPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

export default function App() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Router />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}