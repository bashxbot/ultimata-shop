// API routes for Ultimata Shop

import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createEmailAuthRouter } from "./emailAuth";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { initializeMega, uploadFileToMega, getFileDownloadLink, deleteFileFromMega } from "./mega";

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const userId = (req.session as any).userId;
  if (!userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
}

// Middleware to check if user is admin
export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  const session = req.session as any;
  const userId = session.userId;

  // Check if admin via session flag (from /api/admin/login)
  if (session.isAdmin === true) {
    return next();
  }

  // Check if user is authenticated
  if (!userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Check if user has admin role in database
  try {
    const user = await storage.getUser(userId);
    if (user?.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: 'Admin access required' });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ message: 'Failed to verify admin status' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Mega storage
  await initializeMega();

  // ============================================================================
  // EMAIL/PASSWORD AUTH ROUTES
  // ============================================================================

  app.use('/api/auth', createEmailAuthRouter());

  // ============================================================================
  // PUBLIC ROUTES
  // ============================================================================

  // Admin login endpoint
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      // Check credentials
      if (username === 'admin' && password === 'admin123') {
        // Store admin flag in session
        (req.session as any).isAdmin = true;
        res.json({ message: 'Admin authenticated successfully' });
      } else {
        res.status(401).json({ message: 'Invalid admin credentials' });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Failed to authenticate" });
    }
  });

  // Get all products (public)
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      // Filter out sensitive data for public endpoint
      const publicProducts = products.map(({ accountUsername, accountPassword, ...product }) => product);
      res.json(publicProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get single product (public)
  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProductById(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      // Remove sensitive data
      const { accountUsername, accountPassword, ...publicProduct } = product;
      res.json(publicProduct);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Get all categories (public)
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Create category (admin only)
  app.post('/api/categories', isAdmin, async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Update category (admin only)
  app.put('/api/categories/:id', isAdmin, async (req, res) => {
    try {
      const updated = await storage.updateCategory(parseInt(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  // Delete category (admin only)
  app.delete('/api/categories/:id', isAdmin, async (req, res) => {
    try {
      await storage.deleteCategory(parseInt(req.params.id));
      res.json({ message: "Category deleted" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Service requests (public - doesn't require auth)
  app.post('/api/service-requests', async (req, res) => {
    try {
      const { name, email, serviceType, description, budget } = req.body;
      const request = await storage.createServiceRequest({ name, email, serviceType, description, budget });
      res.json({ message: 'Request received successfully', id: request.id });
    } catch (error) {
      console.error("Error processing service request:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // Admin: Get all service requests
  app.get('/api/admin/service-requests', isAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllServiceRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  // Admin: Update service request
  app.put('/api/admin/service-requests/:id', isAdmin, async (req, res) => {
    try {
      const updated = await storage.updateServiceRequest(parseInt(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ message: "Service request not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating service request:", error);
      res.status(500).json({ message: "Failed to update service request" });
    }
  });

  // Support tickets (public - doesn't require auth)
  app.post('/api/support-tickets', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      // TODO: Save to database or send email notification
      console.log('Support ticket received:', { name, email, subject });
      res.json({ message: 'Ticket submitted successfully' });
    } catch (error) {
      console.error("Error processing support ticket:", error);
      res.status(500).json({ message: "Failed to submit ticket" });
    }
  });

  // ============================================================================
  // AUTHENTICATED USER ROUTES
  // ============================================================================

  // Cart operations
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { productId, quantity } = req.body;
      const cartItem = await storage.addToCart({ userId, productId, quantity });
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put('/api/cart/:id', isAuthenticated, async (req, res) => {
    try {
      const { quantity } = req.body;
      const updated = await storage.updateCartItem(parseInt(req.params.id), quantity);
      if (!updated) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.removeFromCart(parseInt(req.params.id));
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // User profile update
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { name, email, phone } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updated = await storage.upsertUser({
        ...user,
        firstName: name?.split(' ')[0] || user.firstName,
        lastName: name?.split(' ').slice(1).join(' ') || user.lastName,
      });

      res.json({ ...updated, password: undefined });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // User password update
  app.put('/api/user/password', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // TODO: Verify current password before updating (would need bcrypt comparison)
      // For now, just update the password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password in database directly
      await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // User orders
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { items, total, currency, paymentMethod } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ message: "Order must have items" });
      }

      if (!paymentMethod || !['paypal', 'gcash', 'binance'].includes(paymentMethod)) {
        return res.status(400).json({ message: "Invalid payment method" });
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create order with auto-success payment (for testing/demo)
      const order = await storage.createOrder({
        orderNumber,
        userId,
        totalAmount: total,
        currency: currency || 'USD',
        paymentMethod: paymentMethod.toLowerCase(),
        paymentStatus: 'paid',
        status: 'completed',
      });

      // Create order items
      const orderItems = items.map((item: any) => ({
        orderId: order.id,
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        productName: item.product.name,
        productType: item.product.type,
      }));

      await storage.createOrderItems(orderItems);

      // Deduct stock for each product
      for (const item of items) {
        const product = await storage.getProductById(item.product.id);
        if (product && product.stock >= item.quantity) {
          await storage.updateProduct(item.product.id, {
            stock: product.stock - item.quantity,
          });
        }
      }

      // Clear user's cart
      await storage.clearCart(userId);

      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const orders = await storage.getOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const order = await storage.getOrderById(parseInt(req.params.id));

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Ensure user owns this order or is admin
      const dbUser = await storage.getUser(userId);
      if (order.userId !== userId && dbUser?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const orderItems = await storage.getOrderItemsByOrderId(order.id);
      res.json({ ...order, items: orderItems });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // ============================================================================
  // ADMIN ROUTES
  // ============================================================================

  // Product management
  app.post('/api/admin/products', isAdmin, async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/admin/products/:id', isAdmin, async (req, res) => {
    try {
      const updated = await storage.updateProduct(parseInt(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/admin/products/:id', isAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(parseInt(req.params.id));
      res.json({ message: "Product deleted" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Adjust product stock
  app.post('/api/admin/products/:id/adjust-stock', isAdmin, async (req, res) => {
    try {
      const { adjustment } = req.body;
      if (typeof adjustment !== 'number') {
        return res.status(400).json({ message: "Invalid adjustment value" });
      }
      const product = await storage.getProductById(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const newStock = Math.max(0, product.stock + adjustment);
      const updated = await storage.updateProduct(parseInt(req.params.id), { stock: newStock });
      res.json(updated);
    } catch (error) {
      console.error("Error adjusting stock:", error);
      res.status(500).json({ message: "Failed to adjust stock" });
    }
  });

  // Get product purchase history (buyers of a product)
  app.get('/api/admin/products/:id/buyers', isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const orders = await storage.getAllOrders();

      const buyers = [];
      for (const order of orders) {
        const orderItems = await storage.getOrderItemsByOrderId(order.id);
        for (const item of orderItems) {
          if (item.productId === productId) {
            const user = await storage.getUser(order.userId);
            buyers.push({
              buyerId: order.userId,
              buyerEmail: user?.email,
              buyerName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
              quantity: item.quantity,
              purchaseDate: order.createdAt,
              orderId: order.id,
              orderStatus: order.status,
              paymentStatus: order.paymentStatus,
            });
          }
        }
      }
      res.json(buyers);
    } catch (error) {
      console.error("Error fetching product buyers:", error);
      res.status(500).json({ message: "Failed to fetch buyers" });
    }
  });

  // Category management
  app.post('/api/admin/categories', isAdmin, async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Order management
  app.get('/api/admin/orders', isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.put('/api/admin/orders/:id', isAdmin, async (req, res) => {
    try {
      const updated = await storage.updateOrder(parseInt(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Discount codes management
  app.get('/api/admin/discount-codes', isAdmin, async (req, res) => {
    try {
      const codes = await storage.getAllDiscountCodes();
      res.json(codes);
    } catch (error) {
      console.error("Error fetching discount codes:", error);
      res.status(500).json({ message: "Failed to fetch discount codes" });
    }
  });

  app.post('/api/admin/discount-codes', isAdmin, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const code = await storage.createDiscountCode({ ...req.body, createdBy: userId });
      res.json(code);
    } catch (error) {
      console.error("Error creating discount code:", error);
      res.status(500).json({ message: "Failed to create discount code" });
    }
  });

  app.put('/api/admin/discount-codes/:id', isAdmin, async (req, res) => {
    try {
      const updated = await storage.updateDiscountCode(parseInt(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ message: "Discount code not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating discount code:", error);
      res.status(500).json({ message: "Failed to update discount code" });
    }
  });

  app.delete('/api/admin/discount-codes/:id', isAdmin, async (req, res) => {
    try {
      await storage.deleteDiscountCode(parseInt(req.params.id));
      res.json({ message: "Discount code deleted" });
    } catch (error) {
      console.error("Error deleting discount code:", error);
      res.status(500).json({ message: "Failed to delete discount code" });
    }
  });

  // File upload to Google Drive
  app.post('/api/admin/upload-file', isAdmin, async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { originalname, buffer, mimetype } = req.file;

      console.log(`File upload request: ${originalname}, size: ${buffer.length}, type: ${mimetype}`);

      // Check if Mega is configured
      if (!process.env.MEGA_EMAIL || !process.env.MEGA_PASSWORD) {
        return res.status(400).json({ 
          message: 'Mega is not configured. Please set up MEGA_EMAIL and MEGA_PASSWORD.' 
        });
      }

      const result = await uploadFileToMega(originalname, buffer, mimetype);

      if (result) {
        console.log(`Upload successful: ${JSON.stringify(result)}`);
        res.json(result);
      } else {
        console.error('uploadFileToMega returned null');
        res.status(500).json({ message: 'Failed to upload file to Mega. Please check your credentials.' });
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: error.message || 'Failed to upload file. Please try again.' });
    }
  });

  // File download endpoint - for authenticated users who purchased the product
  app.get('/api/products/:productId/download', isAuthenticated, async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const userId = (req.session as any).userId;

      // Get the product
      const product = await storage.getProductById(productId);
      if (!product || !product.googleDriveFileId) {
        return res.status(404).json({ message: 'File not found for this product' });
      }

      // Check if user has purchased this product
      const userOrders = await storage.getUserOrders(userId);
      const hasPurchased = userOrders.some(order =>
        order.orderItems?.some((item: any) => item.productId === productId)
      );

      if (!hasPurchased) {
        return res.status(403).json({ message: 'You must purchase this product to download the file' });
      }

      // Get download link
      const downloadLink = await getFileDownloadLink(product.googleDriveFileId);
      if (!downloadLink) {
        return res.status(500).json({ message: 'Failed to generate download link' });
      }

      res.json({ downloadLink, fileName: product.fileName });
    } catch (error) {
      console.error('Error getting download link:', error);
      res.status(500).json({ message: 'Failed to get download link' });
    }
  });

  // Credentials pool management
  app.get('/api/admin/credentials', isAdmin, async (req, res) => {
    try {
      const credentials = await storage.getAllCredentials();
      res.json(credentials);
    } catch (error) {
      console.error("Error fetching credentials:", error);
      res.status(500).json({ message: "Failed to fetch credentials" });
    }
  });

  app.post('/api/admin/credentials', isAdmin, async (req, res) => {
    try {
      const credential = await storage.createCredential(req.body);
      res.json(credential);
    } catch (error) {
      console.error("Error creating credential:", error);
      res.status(500).json({ message: "Failed to create credential" });
    }
  });

  // User management
  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(u => ({ ...u, password: undefined }))); // Don't send passwords
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:id/role', isAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Update user role by setting role in user table
      const updated = await storage.upsertUser({ ...user, role });
      res.json({ ...updated, password: undefined });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Download purchased file - validate user has purchased the product
  app.get('/api/download/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const productId = parseInt(req.params.productId);

      // Get the product
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check if user has purchased this product
      const orders = await storage.getOrdersByUserId(userId);
      const hasPurchased = orders.some(order => {
        const items = (order as any).items || [];
        return items.some((item: any) => item.productId === productId);
      });

      if (!hasPurchased) {
        return res.status(403).json({ message: 'You have not purchased this product' });
      }

      // Get the Mega file ID
      const fileId = product.googleDriveFileId;
      if (!fileId) {
        return res.status(404).json({ message: 'File not available for download' });
      }

      // Generate Mega download link and redirect
      const downloadLink = `https://mega.nz/file/${fileId}`;
      res.json({ downloadUrl: downloadLink, fileName: product.fileName });
    } catch (error) {
      console.error('Error preparing download:', error);
      res.status(500).json({ message: 'Failed to prepare download' });
    }
  });

  // Validate discount code (public endpoint)
  app.post('/api/validate-discount', async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: 'Code required' });
      }
      const discountCode = await storage.getDiscountCodeByCode(code);
      if (!discountCode || !discountCode.active) {
        return res.status(404).json({ message: 'Invalid discount code' });
      }
      if (discountCode.totalUses !== -1 && discountCode.usedCount >= discountCode.totalUses) {
        return res.status(400).json({ message: 'Discount code exhausted' });
      }
      if (discountCode.expiresAt && new Date(discountCode.expiresAt) < new Date()) {
        return res.status(400).json({ message: 'Discount code expired' });
      }
      res.json({
        discountPercentage: parseFloat(discountCode.discountPercentage as any),
        code: discountCode.code,
      });
    } catch (error) {
      console.error("Error validating discount:", error);
      res.status(500).json({ message: "Failed to validate discount" });
    }
  });

  // Fake payment processing (for testing) - Always succeeds for dev/test
  app.post('/api/fake-payment', isAuthenticated, async (req: any, res) => {
    try {
      const { amount, method, description } = req.body;
      if (!amount || !method) {
        return res.status(400).json({ message: 'Amount and method required' });
      }
      // Always succeed for testing
      res.json({
        transactionId: 'test_' + Date.now(),
        status: 'completed',
        amount,
        method,
        description,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  // ============================================================================
  // NOTIFICATION ROUTES
  // ============================================================================

  // Get user's notifications
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Get unread notification count
  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  // Mark notification as read
  app.post('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      await storage.markNotificationAsRead(parseInt(req.params.id), userId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read
  app.post('/api/notifications/read-all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Admin: Get all notifications
  app.get('/api/admin/notifications', isAdmin, async (req, res) => {
    try {
      const notifications = await storage.getAllNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching all notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Admin: Create broadcast notification (global)
  app.post('/api/admin/notifications/broadcast', isAdmin, async (req, res) => {
    try {
      const { title, message, type = 'announcement' } = req.body;
      if (!title || !message) {
        return res.status(400).json({ message: "Title and message are required" });
      }
      const notification = await storage.createNotification({
        title,
        message,
        type: type as any,
        isGlobal: true,
        userId: null,
      });
      res.json(notification);
    } catch (error) {
      console.error("Error creating broadcast:", error);
      res.status(500).json({ message: "Failed to create broadcast" });
    }
  });

  // Admin: Create notification for specific user
  app.post('/api/admin/notifications/user/:userId', isAdmin, async (req, res) => {
    try {
      const { title, message, type = 'system_alert' } = req.body;
      const { userId } = req.params;
      if (!title || !message) {
        return res.status(400).json({ message: "Title and message are required" });
      }
      const notification = await storage.createNotification({
        title,
        message,
        type: type as any,
        isGlobal: false,
        userId,
      });
      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  // Admin: Delete notification
  app.delete('/api/admin/notifications/:id', isAdmin, async (req, res) => {
    try {
      await storage.deleteNotification(parseInt(req.params.id));
      res.json({ message: "Notification deleted" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // ============================================================================
  // REFUND ROUTES
  // ============================================================================

  // User: Request refund
  app.post('/api/refunds', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { orderId, reason, amount } = req.body;
      const refund = await storage.createRefund({ orderId, userId, reason, amount });
      res.json(refund);
    } catch (error) {
      console.error("Error creating refund request:", error);
      res.status(500).json({ message: "Failed to create refund request" });
    }
  });

  // User: Get my refunds
  app.get('/api/refunds', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const refunds = await storage.getRefundsByUserId(userId);
      res.json(refunds);
    } catch (error) {
      console.error("Error fetching refunds:", error);
      res.status(500).json({ message: "Failed to fetch refunds" });
    }
  });

  // Admin: Get all refunds
  app.get('/api/admin/refunds', isAdmin, async (req, res) => {
    try {
      const refunds = await storage.getAllRefunds();
      res.json(refunds);
    } catch (error) {
      console.error("Error fetching all refunds:", error);
      res.status(500).json({ message: "Failed to fetch refunds" });
    }
  });

  // Admin: Update refund status
  app.put('/api/admin/refunds/:id', isAdmin, async (req: any, res) => {
    try {
      const adminId = (req.session as any).userId;
      const { status, adminNotes } = req.body;
      const updates: any = { status, adminNotes };
      if (status === 'processed' || status === 'approved' || status === 'rejected') {
        updates.processedBy = adminId;
        updates.processedAt = new Date();
      }
      const updated = await storage.updateRefund(parseInt(req.params.id), updates);
      if (!updated) {
        return res.status(404).json({ message: "Refund not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating refund:", error);
      res.status(500).json({ message: "Failed to update refund" });
    }
  });

  // ============================================================================
  // WISHLIST ROUTES
  // ============================================================================

  // Get user's wishlist
  app.get('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const items = await storage.getWishlist(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  // Add to wishlist
  app.post('/api/wishlist/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const productId = parseInt(req.params.productId);
      const item = await storage.addToWishlist(userId, productId);
      res.json(item);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  // Remove from wishlist
  app.delete('/api/wishlist/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const productId = parseInt(req.params.productId);
      await storage.removeFromWishlist(userId, productId);
      res.json({ message: "Removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // Check if product is in wishlist
  app.get('/api/wishlist/:productId/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const productId = parseInt(req.params.productId);
      const isInWishlist = await storage.isInWishlist(userId, productId);
      res.json({ isInWishlist });
    } catch (error) {
      console.error("Error checking wishlist:", error);
      res.status(500).json({ message: "Failed to check wishlist" });
    }
  });

  // ============================================================================
  // REVIEW ROUTES
  // ============================================================================

  // Get product reviews (public)
  app.get('/api/products/:productId/reviews', async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Submit review
  app.post('/api/products/:productId/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const productId = parseInt(req.params.productId);
      const { rating, title, comment, orderId } = req.body;
      const review = await storage.createReview({ userId, productId, rating, title, comment, orderId });
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Admin: Get all reviews
  app.get('/api/admin/reviews', isAdmin, async (req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching all reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Admin: Update review (approve/reject)
  app.put('/api/admin/reviews/:id', isAdmin, async (req, res) => {
    try {
      const updated = await storage.updateReview(parseInt(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  // Admin: Delete review
  app.delete('/api/admin/reviews/:id', isAdmin, async (req, res) => {
    try {
      await storage.deleteReview(parseInt(req.params.id));
      res.json({ message: "Review deleted" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // ============================================================================
  // ACTIVITY LOG & SETTINGS ROUTES
  // ============================================================================

  // Admin: Get activity logs
  app.get('/api/admin/activity-logs', isAdmin, async (req, res) => {
    try {
      const logs = await storage.getActivityLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Admin: Get all settings
  app.get('/api/admin/settings', isAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Admin: Update setting
  app.put('/api/admin/settings/:key', isAdmin, async (req, res) => {
    try {
      const { value } = req.body;
      const setting = await storage.setSetting(req.params.key, value);
      res.json(setting);
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Admin dashboard stats
  app.get('/api/admin/stats', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const products = await storage.getAllProducts();
      const orders = await storage.getAllOrders();
      const discountCodes = await storage.getAllDiscountCodes();

      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount as any), 0);
      const totalOrders = orders.length;
      const totalUsers = users.length;
      const totalProducts = products.length;
      const totalDiscountCodes = discountCodes.length;
      const activeDiscounts = discountCodes.filter(c => c.active).length;

      res.json({
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        totalDiscountCodes,
        activeDiscounts,
        completedOrders: orders.filter(o => o.status === 'completed').length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}