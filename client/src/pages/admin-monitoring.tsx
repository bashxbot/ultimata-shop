import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity, Server, Database, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from '@/components/AdminSidebar';

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  memory?: any;
  database?: string;
  environment?: string;
  version?: string;
}

export default function AdminMonitoring() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: healthData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/health-status'],
    enabled: user?.role === 'admin',
    refetchInterval: 5000,
  });

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this page
            </p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const current = healthData?.current;
  const history = healthData?.history || [];

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  const formatMemory = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="flex min-h-screen relative overflow-hidden">
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

      <AdminSidebar />
      <div className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Service Monitor
          </h1>
          <p className="text-muted-foreground">
            Real-time uptime and health monitoring for your service
          </p>
        </motion.div>

        {/* Current Status */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : current ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge
                  variant={current.status === 'ok' ? 'default' : 'destructive'}
                  className="mb-2"
                  data-testid="badge-service-status"
                >
                  {current.status.toUpperCase()}
                </Badge>
                <p className="text-xs text-muted-foreground">Service operational</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="text-uptime">
                  {formatUptime(current.uptime)}
                </p>
                <p className="text-xs text-muted-foreground">Current session</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge
                  variant={current.database === 'connected' ? 'default' : 'destructive'}
                  data-testid="badge-db-status"
                >
                  {current.database}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">Connection OK</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="text-memory">
                  {current.memory ? formatMemory(current.memory.heapUsed) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Heap usage</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
              <CardDescription>Current system information and endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {current ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Last Check</p>
                      <p className="font-mono text-sm" data-testid="text-last-check">
                        {new Date(current.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Environment</p>
                      <p className="font-mono text-sm" data-testid="text-environment">
                        {current.environment || 'development'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Version</p>
                      <p className="font-mono text-sm" data-testid="text-version">
                        {current.version || 'unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Health Check Endpoint</p>
                    <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                      GET /health
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Total Checks</p>
                    <p className="text-lg font-bold" data-testid="text-total-checks">
                      {history.length}
                    </p>
                  </div>
                  <Button onClick={() => refetch()} className="w-full mt-4" data-testid="button-refresh-status">
                    Refresh Now
                  </Button>
                </>
              ) : (
                <Skeleton className="h-32" />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Monitor Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Setup Uptime Monitoring</CardTitle>
              <CardDescription>Configure external monitoring services to watch your app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-sm mb-2">For Render or UptimeRobot:</p>
                <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded break-all">
                  https://ultimata-shop.onrender.com/health
                </p>
              </div>
              <div>
                <p className="font-medium text-sm mb-2">This endpoint returns:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Service status (ok/degraded)</li>
                  <li>✓ Current uptime</li>
                  <li>✓ Database connection status</li>
                  <li>✓ Timestamp of check</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
