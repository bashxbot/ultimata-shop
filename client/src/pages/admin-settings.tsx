import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings, Save, Store, Globe, Mail, Palette, Shield, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useLocation } from 'wouter';

interface SiteSetting {
  id: number;
  key: string;
  value: any;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState({
    siteName: 'Ultimata Shop',
    siteDescription: 'Premium digital marketplace',
    supportEmail: 'support@ultimata.shop',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
    maxCartItems: 10,
    defaultCurrency: 'USD',
    primaryColor: '#8B5CF6',
    accentColor: '#3B82F6',
    footerText: 'All rights reserved.',
    discordUrl: '',
    twitterUrl: '',
    telegramUrl: '',
  });

  const { data: savedSettings = [], isLoading } = useQuery<SiteSetting[]>({
    queryKey: ['/api/admin/settings'],
    enabled: user?.role === 'admin',
  });

  useEffect(() => {
    if (savedSettings.length > 0) {
      const newSettings = { ...settings };
      savedSettings.forEach(s => {
        if (s.key in newSettings) {
          (newSettings as any)[s.key] = s.value;
        }
      });
      setSettings(newSettings);
    }
  }, [savedSettings]);

  const saveMutation = useMutation({
    mutationFn: async (key: string) => {
      const value = (settings as any)[key];
      return await apiRequest('PUT', `/api/admin/settings/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({ title: 'Setting saved' });
    },
    onError: () => {
      toast({ title: 'Failed to save setting', variant: 'destructive' });
    },
  });

  const saveAllMutation = useMutation({
    mutationFn: async () => {
      const promises = Object.keys(settings).map(key => 
        apiRequest('PUT', `/api/admin/settings/${key}`, { value: (settings as any)[key] })
      );
      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({ title: 'All settings saved' });
    },
    onError: () => {
      toast({ title: 'Failed to save settings', variant: 'destructive' });
    },
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2">Site Settings</h1>
              <p className="text-muted-foreground">Configure your marketplace settings</p>
            </div>
            <Button
              onClick={() => saveAllMutation.mutate()}
              disabled={saveAllMutation.isPending}
              data-testid="button-save-all-settings"
            >
              {saveAllMutation.isPending ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save All
                </>
              )}
            </Button>
          </motion.div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : (
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList>
                <TabsTrigger value="general" data-testid="tab-general">
                  <Store className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="appearance" data-testid="tab-appearance">
                  <Palette className="h-4 w-4 mr-2" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="security" data-testid="tab-security">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="social" data-testid="tab-social">
                  <Globe className="h-4 w-4 mr-2" />
                  Social
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>General Settings</CardTitle>
                      <CardDescription>Basic site configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="siteName">Site Name</Label>
                          <Input
                            id="siteName"
                            value={settings.siteName}
                            onChange={(e) => updateSetting('siteName', e.target.value)}
                            data-testid="input-site-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supportEmail">Support Email</Label>
                          <Input
                            id="supportEmail"
                            type="email"
                            value={settings.supportEmail}
                            onChange={(e) => updateSetting('supportEmail', e.target.value)}
                            data-testid="input-support-email"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="siteDescription">Site Description</Label>
                        <Textarea
                          id="siteDescription"
                          value={settings.siteDescription}
                          onChange={(e) => updateSetting('siteDescription', e.target.value)}
                          rows={3}
                          data-testid="textarea-site-description"
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="defaultCurrency">Default Currency</Label>
                          <Input
                            id="defaultCurrency"
                            value={settings.defaultCurrency}
                            onChange={(e) => updateSetting('defaultCurrency', e.target.value)}
                            data-testid="input-default-currency"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxCartItems">Max Cart Items</Label>
                          <Input
                            id="maxCartItems"
                            type="number"
                            value={settings.maxCartItems}
                            onChange={(e) => updateSetting('maxCartItems', parseInt(e.target.value))}
                            data-testid="input-max-cart-items"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footerText">Footer Text</Label>
                        <Input
                          id="footerText"
                          value={settings.footerText}
                          onChange={(e) => updateSetting('footerText', e.target.value)}
                          data-testid="input-footer-text"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="appearance">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Appearance</CardTitle>
                      <CardDescription>Customize the look of your site</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="primaryColor">Primary Color</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="primaryColor"
                              type="color"
                              value={settings.primaryColor}
                              onChange={(e) => updateSetting('primaryColor', e.target.value)}
                              className="w-12 h-10 p-1"
                              data-testid="input-primary-color"
                            />
                            <Input
                              value={settings.primaryColor}
                              onChange={(e) => updateSetting('primaryColor', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accentColor">Accent Color</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="accentColor"
                              type="color"
                              value={settings.accentColor}
                              onChange={(e) => updateSetting('accentColor', e.target.value)}
                              className="w-12 h-10 p-1"
                              data-testid="input-accent-color"
                            />
                            <Input
                              value={settings.accentColor}
                              onChange={(e) => updateSetting('accentColor', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">
                          Color preview will be shown here. Changes require a page refresh to take effect.
                        </p>
                        <div className="flex gap-4 mt-4">
                          <div 
                            className="w-16 h-16 rounded-md" 
                            style={{ backgroundColor: settings.primaryColor }}
                          />
                          <div 
                            className="w-16 h-16 rounded-md" 
                            style={{ backgroundColor: settings.accentColor }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="security">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>Access and security configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Maintenance Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Temporarily disable site access for visitors
                          </p>
                        </div>
                        <Switch
                          checked={settings.maintenanceMode}
                          onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                          data-testid="switch-maintenance-mode"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Allow Registration</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow new users to create accounts
                          </p>
                        </div>
                        <Switch
                          checked={settings.allowRegistration}
                          onCheckedChange={(checked) => updateSetting('allowRegistration', checked)}
                          data-testid="switch-allow-registration"
                        />
                      </div>
                      {settings.maintenanceMode && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-500">Maintenance Mode Active</p>
                            <p className="text-sm text-yellow-500/80">
                              Visitors will see a maintenance message instead of the site.
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="social">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Social Links</CardTitle>
                      <CardDescription>Connect your social media accounts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="discordUrl">Discord Server URL</Label>
                        <Input
                          id="discordUrl"
                          value={settings.discordUrl}
                          onChange={(e) => updateSetting('discordUrl', e.target.value)}
                          placeholder="https://discord.gg/..."
                          data-testid="input-discord-url"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitterUrl">Twitter/X URL</Label>
                        <Input
                          id="twitterUrl"
                          value={settings.twitterUrl}
                          onChange={(e) => updateSetting('twitterUrl', e.target.value)}
                          placeholder="https://twitter.com/..."
                          data-testid="input-twitter-url"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telegramUrl">Telegram URL</Label>
                        <Input
                          id="telegramUrl"
                          value={settings.telegramUrl}
                          onChange={(e) => updateSetting('telegramUrl', e.target.value)}
                          placeholder="https://t.me/..."
                          data-testid="input-telegram-url"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}
