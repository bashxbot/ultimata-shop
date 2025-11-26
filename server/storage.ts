// Storage interface and implementation for Ultimata Shop

import {
  users,
  products,
  categories,
  cartItems,
  orders,
  orderItems,
  discountCodes,
  credentialsPool,
  notifications,
  userNotificationReads,
  serviceRequests,
  refunds,
  wishlist,
  reviews,
  activityLogs,
  siteSettings,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type DiscountCode,
  type InsertDiscountCode,
  type Credential,
  type InsertCredential,
  type Notification,
  type InsertNotification,
  type UserNotificationRead,
  type ServiceRequest,
  type InsertServiceRequest,
  type Refund,
  type InsertRefund,
  type WishlistItem,
  type Review,
  type InsertReview,
  type ActivityLog,
  type SiteSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, or, isNull, notInArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<void>;

  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order | undefined>;

  // Order items operations
  getOrderItemsByOrderId(orderId: number): Promise<(OrderItem & { product: Product })[]>;

  // Discount codes operations
  getAllDiscountCodes(): Promise<DiscountCode[]>;
  getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined>;
  createDiscountCode(code: InsertDiscountCode): Promise<DiscountCode>;
  updateDiscountCode(id: number, updates: Partial<InsertDiscountCode>): Promise<DiscountCode | undefined>;
  deleteDiscountCode(id: number): Promise<void>;

  // Credentials pool operations
  getAllCredentials(): Promise<Credential[]>;
  getCredentialsByProductId(productId: number): Promise<Credential[]>;
  createCredential(credential: InsertCredential): Promise<Credential>;
  markCredentialAsUsed(id: number, userId: string): Promise<Credential | undefined>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  getAllNotifications(): Promise<Notification[]>;
  markNotificationAsRead(id: number, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(id: number): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  // Service request operations
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  getAllServiceRequests(): Promise<ServiceRequest[]>;
  updateServiceRequest(id: number, updates: Partial<ServiceRequest>): Promise<ServiceRequest | undefined>;

  // Refund operations
  createRefund(refund: InsertRefund): Promise<Refund>;
  getAllRefunds(): Promise<Refund[]>;
  getRefundsByUserId(userId: string): Promise<Refund[]>;
  updateRefund(id: number, updates: Partial<Refund>): Promise<Refund | undefined>;

  // Wishlist operations
  addToWishlist(userId: string, productId: number): Promise<WishlistItem>;
  removeFromWishlist(userId: string, productId: number): Promise<void>;
  getWishlist(userId: string): Promise<(WishlistItem & { product: Product })[]>;
  isInWishlist(userId: string, productId: number): Promise<boolean>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getProductReviews(productId: number): Promise<Review[]>;
  getAllReviews(): Promise<Review[]>;
  updateReview(id: number, updates: Partial<Review>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<void>;

  // Activity log operations
  createActivityLog(log: Partial<ActivityLog>): Promise<ActivityLog>;
  getActivityLogs(): Promise<ActivityLog[]>;

  // Site settings operations
  getSetting(key: string): Promise<SiteSetting | undefined>;
  setSetting(key: string, value: any): Promise<SiteSetting>;
  getAllSettings(): Promise<SiteSetting[]>;
}

export class DatabaseStorage implements IStorage {
  // ============================================================================
  // USER OPERATIONS
  // ============================================================================

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async upsertUser(userData: UpsertUser & { role?: string }): Promise<User> {
    const { role, ...rest } = userData;
    const roleValue = (role || 'user') as 'user' | 'admin';
    const [user] = await db
      .insert(users)
      .values({ ...rest, role: roleValue })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...rest,
          role: roleValue,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // ============================================================================
  // CATEGORY OPERATIONS
  // ============================================================================

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db
      .update(categories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // ============================================================================
  // PRODUCT OPERATIONS
  // ============================================================================

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // ============================================================================
  // CART OPERATIONS
  // ============================================================================

  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    const items = await db
      .select()
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));

    return items.map(item => ({
      ...item.cart_items,
      product: item.products!
    }));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    const [item] = await db
      .insert(cartItems)
      .values(cartItem)
      .onConflictDoUpdate({
        target: [cartItems.userId, cartItems.productId],
        set: {
          quantity: sql`${cartItems.quantity} + ${cartItem.quantity}`,
          updatedAt: new Date()
        }
      })
      .returning();
    return item;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // ============================================================================
  // ORDER OPERATIONS
  // ============================================================================

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]> {
    if (items.length === 0) return [];
    const createdItems = await db.insert(orderItems).values(items).returning();
    return createdItems;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  // ============================================================================
  // ORDER ITEMS OPERATIONS
  // ============================================================================

  async getOrderItemsByOrderId(orderId: number): Promise<(OrderItem & { product: Product })[]> {
    const items = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    return items.map(item => ({
      ...item.order_items,
      product: item.products!
    }));
  }

  // ============================================================================
  // DISCOUNT CODES OPERATIONS
  // ============================================================================

  async getAllDiscountCodes(): Promise<DiscountCode[]> {
    return await db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt));
  }

  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
    const [result] = await db.select().from(discountCodes).where(eq(discountCodes.code, code));
    return result;
  }

  async createDiscountCode(code: InsertDiscountCode): Promise<DiscountCode> {
    const [result] = await db.insert(discountCodes).values(code).returning();
    return result;
  }

  async updateDiscountCode(id: number, updates: Partial<InsertDiscountCode>): Promise<DiscountCode | undefined> {
    const [result] = await db
      .update(discountCodes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(discountCodes.id, id))
      .returning();
    return result;
  }

  async deleteDiscountCode(id: number): Promise<void> {
    await db.delete(discountCodes).where(eq(discountCodes.id, id));
  }

  // ============================================================================
  // CREDENTIALS POOL OPERATIONS
  // ============================================================================

  async getAllCredentials(): Promise<Credential[]> {
    return await db.select().from(credentialsPool).orderBy(desc(credentialsPool.createdAt));
  }

  async getCredentialsByProductId(productId: number): Promise<Credential[]> {
    return await db.select().from(credentialsPool).where(eq(credentialsPool.productId, productId));
  }

  async createCredential(credential: InsertCredential): Promise<Credential> {
    const [result] = await db.insert(credentialsPool).values(credential).returning();
    return result;
  }

  async markCredentialAsUsed(id: number, userId: string): Promise<Credential | undefined> {
    const [result] = await db
      .update(credentialsPool)
      .set({ isUsed: true, usedBy: userId, usedAt: new Date() })
      .where(eq(credentialsPool.id, id))
      .returning();
    return result;
  }

  // ============================================================================
  // NOTIFICATION OPERATIONS
  // ============================================================================

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [result] = await db.insert(notifications).values(notification).returning();
    return result;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    // Get user-specific notifications + global notifications
    const userNotifs = await db
      .select()
      .from(notifications)
      .where(
        or(
          eq(notifications.userId, userId),
          eq(notifications.isGlobal, true)
        )
      )
      .orderBy(desc(notifications.createdAt));

    // For global notifications, check if user has read them
    const readGlobalIds = await db
      .select({ notificationId: userNotificationReads.notificationId })
      .from(userNotificationReads)
      .where(eq(userNotificationReads.userId, userId));

    const readIds = new Set(readGlobalIds.map(r => r.notificationId));

    // Map notifications with proper isRead status for global notifications
    return userNotifs.map(notif => {
      if (notif.isGlobal && !notif.userId) {
        return { ...notif, isRead: readIds.has(notif.id) };
      }
      return notif;
    });
  }


  async getAllNotifications(): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number, userId: string): Promise<void> {
    const [notif] = await db.select().from(notifications).where(eq(notifications.id, id));

    if (notif?.isGlobal) {
      // For global notifications, add to user_notification_reads
      await db.insert(userNotificationReads)
        .values({ userId, notificationId: id })
        .onConflictDoNothing();
    } else {
      // For user-specific notifications, update isRead directly
      await db.update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    // Mark all user-specific notifications as read
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));

    // Mark all global notifications as read for this user
    const globalNotifs = await db.select({ id: notifications.id })
      .from(notifications)
      .where(eq(notifications.isGlobal, true));

    for (const notif of globalNotifs) {
      await db.insert(userNotificationReads)
        .values({ userId, notificationId: notif.id })
        .onConflictDoNothing();
    }
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    // Count unread user-specific notifications
    const userNotifs = await db.select({ id: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

    // Count global notifications not read by user
    const globalNotifs = await db.select({ id: notifications.id })
      .from(notifications)
      .where(eq(notifications.isGlobal, true));

    const readGlobalIds = await db
      .select({ notificationId: userNotificationReads.notificationId })
      .from(userNotificationReads)
      .where(eq(userNotificationReads.userId, userId));

    const readIds = new Set(readGlobalIds.map(r => r.notificationId));
    const unreadGlobalCount = globalNotifs.filter(n => !readIds.has(n.id)).length;

    return userNotifs.length + unreadGlobalCount;
  }

  // ============================================================================
  // SERVICE REQUEST OPERATIONS
  // ============================================================================

  async createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const [result] = await db.insert(serviceRequests).values(request).returning();
    return result;
  }

  async getAllServiceRequests(): Promise<ServiceRequest[]> {
    return await db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt));
  }

  async updateServiceRequest(id: number, updates: Partial<ServiceRequest>): Promise<ServiceRequest | undefined> {
    const [result] = await db
      .update(serviceRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(serviceRequests.id, id))
      .returning();
    return result;
  }

  // ============================================================================
  // REFUND OPERATIONS
  // ============================================================================

  async createRefund(refund: InsertRefund): Promise<Refund> {
    const [result] = await db.insert(refunds).values(refund).returning();
    return result;
  }

  async getAllRefunds(): Promise<Refund[]> {
    return await db.select().from(refunds).orderBy(desc(refunds.createdAt));
  }

  async getRefundsByUserId(userId: string): Promise<Refund[]> {
    return await db.select().from(refunds).where(eq(refunds.userId, userId)).orderBy(desc(refunds.createdAt));
  }

  async updateRefund(id: number, updates: Partial<Refund>): Promise<Refund | undefined> {
    const [result] = await db
      .update(refunds)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(refunds.id, id))
      .returning();
    return result;
  }

  // ============================================================================
  // WISHLIST OPERATIONS
  // ============================================================================

  async addToWishlist(userId: string, productId: number): Promise<WishlistItem> {
    const [result] = await db
      .insert(wishlist)
      .values({ userId, productId })
      .onConflictDoNothing()
      .returning();
    return result || { id: 0, userId, productId, createdAt: new Date() };
  }

  async removeFromWishlist(userId: string, productId: number): Promise<void> {
    await db.delete(wishlist).where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
  }

  async getWishlist(userId: string): Promise<(WishlistItem & { product: Product })[]> {
    const items = await db
      .select()
      .from(wishlist)
      .leftJoin(products, eq(wishlist.productId, products.id))
      .where(eq(wishlist.userId, userId))
      .orderBy(desc(wishlist.createdAt));

    return items.map(item => ({
      ...item.wishlist,
      product: item.products!
    }));
  }

  async isInWishlist(userId: string, productId: number): Promise<boolean> {
    const [item] = await db.select().from(wishlist).where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
    return !!item;
  }

  // ============================================================================
  // REVIEW OPERATIONS
  // ============================================================================

  async createReview(review: InsertReview): Promise<Review> {
    const [result] = await db.insert(reviews).values(review).returning();
    return result;
  }

  async getProductReviews(productId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true))).orderBy(desc(reviews.createdAt));
  }

  async getAllReviews(): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async updateReview(id: number, updates: Partial<Review>): Promise<Review | undefined> {
    const [result] = await db
      .update(reviews)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return result;
  }

  async deleteReview(id: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  // ============================================================================
  // ACTIVITY LOG OPERATIONS
  // ============================================================================

  async createActivityLog(log: Partial<ActivityLog>): Promise<ActivityLog> {
    const [result] = await db.insert(activityLogs).values(log as any).returning();
    return result;
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(500);
  }

  // ============================================================================
  // SITE SETTINGS OPERATIONS
  // ============================================================================

  async getSetting(key: string): Promise<SiteSetting | undefined> {
    const [result] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return result;
  }

  async setSetting(key: string, value: any): Promise<SiteSetting> {
    const [result] = await db
      .insert(siteSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value, updatedAt: new Date() }
      })
      .returning();
    return result;
  }

  async getAllSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings);
  }
}

export const storage = new DatabaseStorage();