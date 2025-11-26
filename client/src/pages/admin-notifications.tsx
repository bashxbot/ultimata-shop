import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Send, Trash2, Megaphone, Package, AlertCircle, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  type: 'order_update' | 'announcement' | 'system_alert';
  title: string;
  message: string;
  isRead: boolean;
  isGlobal: boolean;
  userId: string | null;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export default function AdminNotifications() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'announcement' | 'system_alert'>('announcement');
  const [targetUserId, setTargetUserId] = useState<string>('all');

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/admin/notifications'],
    enabled: user?.role === 'admin',
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: user?.role === 'admin',
  });

  const broadcastMutation = useMutation({
    mutationFn: async () => {
      if (targetUserId === 'all') {
        return await apiRequest('POST', '/api/admin/notifications/broadcast', { title, message, type });
      } else {
        return await apiRequest('POST', `/api/admin/notifications/user/${targetUserId}`, { title, message, type });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
      toast({ title: targetUserId === 'all' ? 'Broadcast sent to all users' : 'Notification sent to user' });
      setDialogOpen(false);
      setTitle('');
      setMessage('');
      setType('announcement');
      setTargetUserId('all');
    },
    onError: () => {
      toast({ title: 'Failed to send notification', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/admin/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
      toast({ title: 'Notification deleted' });
    },
  });

  const getTypeIcon = (notifType: Notification['type']) => {
    switch (notifType) {
      case 'announcement':
        return <Megaphone className="h-4 w-4 text-purple-500" />;
      case 'order_update':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'system_alert':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (notifType: Notification['type']) => {
    const colors: Record<string, string> = {
      announcement: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      order_update: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      system_alert: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    };
    return <Badge className={colors[notifType]}>{notifType.replace('_', ' ')}</Badge>;
  };

  const stats = {
    total: notifications.length,
    global: notifications.filter(n => n.isGlobal).length,
    personal: notifications.filter(n => !n.isGlobal).length,
    announcements: notifications.filter(n => n.type === 'announcement').length,
  };

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-start justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2">Notification Center</h1>
              <p className="text-muted-foreground">Send broadcasts and manage notifications</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-new-notification">
                  <Plus className="h-4 w-4" />
                  New Notification
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Send Notification</DialogTitle>
                  <DialogDescription>
                    Create a new notification or broadcast to users
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recipient</label>
                    <Select value={targetUserId} onValueChange={setTargetUserId}>
                      <SelectTrigger data-testid="select-recipient">
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users (Broadcast)</SelectItem>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.firstName || u.email?.split('@')[0]} ({u.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select value={type} onValueChange={(v: 'announcement' | 'system_alert') => setType(v)}>
                      <SelectTrigger data-testid="select-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="system_alert">System Alert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Notification title"
                      data-testid="input-notification-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Notification message"
                      rows={4}
                      data-testid="input-notification-message"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => broadcastMutation.mutate()}
                    disabled={!title || !message || broadcastMutation.isPending}
                    className="gap-2"
                    data-testid="button-send-notification"
                  >
                    <Send className="h-4 w-4" />
                    {broadcastMutation.isPending ? 'Sending...' : 'Send'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Notifications', value: stats.total, icon: Bell, color: 'text-blue-500' },
              { label: 'Global Broadcasts', value: stats.global, icon: Users, color: 'text-purple-500' },
              { label: 'Personal', value: stats.personal, icon: AlertCircle, color: 'text-orange-500' },
              { label: 'Announcements', value: stats.announcements, icon: Megaphone, color: 'text-green-500' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                      <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>All Notifications ({notifications.length})</CardTitle>
                  <CardDescription>History of all sent notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No notifications sent yet</p>
                      <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                        Send First Notification
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {notifications.map((notif, index) => (
                              <motion.tr
                                key={notif.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.03 }}
                                className="hover:bg-muted/50 transition-colors"
                              >
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getTypeIcon(notif.type)}
                                    {getTypeBadge(notif.type)}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium max-w-[200px] truncate">
                                  {notif.title}
                                </TableCell>
                                <TableCell className="max-w-[250px] truncate text-muted-foreground">
                                  {notif.message}
                                </TableCell>
                                <TableCell>
                                  {notif.isGlobal ? (
                                    <Badge variant="outline" className="gap-1">
                                      <Users className="h-3 w-3" />
                                      All Users
                                    </Badge>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">
                                      {users.find(u => u.id === notif.userId)?.email?.split('@')[0] || 'User'}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteMutation.mutate(notif.id)}
                                    disabled={deleteMutation.isPending}
                                    data-testid={`button-delete-notification-${notif.id}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
