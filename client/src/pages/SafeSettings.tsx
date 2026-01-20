/**
 * Safe Settings Screen (Compliance Mode)
 * 
 * Settings screen accessible via bottom tab in Safe Mode.
 * Contains app settings with NO crypto/wallet references.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings,
  Bell,
  Shield,
  Moon,
  Sun,
  Globe,
  HelpCircle,
  FileText,
  Mail,
  ChevronRight,
  LogOut,
  User,
  Smartphone,
  Info,
  Lock,
  X,
  Fingerprint
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { logOut } from "@/lib/firebase";
import { useLocation } from "wouter";
import { 
  checkBiometricAvailability, 
  authenticateWithBiometrics,
  isNativePlatform 
} from "@/lib/nativeServices";

interface SettingItemProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}

function SettingItem({ icon: Icon, label, description, onClick, rightElement, destructive }: SettingItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
        destructive 
          ? 'hover:bg-red-500/10 text-red-400' 
          : 'hover:bg-muted/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          destructive ? 'bg-red-500/20' : 'bg-primary/10'
        }`}>
          <Icon className={`w-5 h-5 ${destructive ? 'text-red-400' : 'text-primary'}`} />
        </div>
        <div className="text-left">
          <div className={`font-medium ${destructive ? 'text-red-400' : 'text-foreground'}`}>
            {label}
          </div>
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
      {rightElement || <ChevronRight className="w-5 h-5 text-muted-foreground" />}
    </button>
  );
}

export function SafeSettings() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  // Biometric test state
  const [biometricType, setBiometricType] = useState<string>('none');
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const [biometricAuthResult, setBiometricAuthResult] = useState<string>('');
  const [credentialResult, setCredentialResult] = useState<string>('');

  async function testBiometrics() {
    const { checkBiometricAvailability, authenticateWithBiometrics, setCredentials, getCredentials } = await import('@/lib/nativeServices');
    const availability = await checkBiometricAvailability();
    setBiometricType(availability.biometryType);
    setBiometricAvailable(availability.isAvailable);
    if (availability.isAvailable) {
      const result = await authenticateWithBiometrics('Test Biometric Auth');
      setBiometricAuthResult(result.success ? 'Authenticated!' : `Failed: ${result.error}`);
      // Store credentials
      await setCredentials('blockmint-app', 'user@email.com', 'secure-token');
      // Retrieve credentials
      const creds = await getCredentials('blockmint-app');
      setCredentialResult(JSON.stringify(creds));
    } else {
      setBiometricAuthResult('Biometrics not available');
      setCredentialResult('');
    }
  }

  // Get user info from localStorage
  const getUserInfo = () => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        return JSON.parse(user);
      }
    } catch (e) {}
    return { displayName: "User", email: "user@example.com" };
  };

  const userInfo = getUserInfo();

  const handleSignOut = async () => {
    try {
      await logOut();
      localStorage.removeItem("user");
      setLocation("/login");
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-5 pb-24"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your preferences</p>
        {/* Biometric Test Section (for QA/dev) */}
        <div className="mt-4 p-3 rounded-lg bg-card/60 border border-primary/20">
          <div className="text-xs text-muted-foreground mb-1">Biometric Test</div>
          <div className="text-xs">Type: {biometricType}</div>
          <div className="text-xs">Available: {biometricAvailable ? 'Yes' : 'No'}</div>
          <div className="text-xs">Auth Result: {biometricAuthResult}</div>
          <div className="text-xs break-all">Credentials: {credentialResult}</div>
          <button className="mt-2 px-3 py-1 rounded bg-primary text-white text-xs" onClick={testBiometrics}>Run Biometric Test</button>
        </div>
      </motion.div>

      {/* Account Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Account</h3>
        <GlassCard className="divide-y divide-border/50">
          <SettingItem
            icon={User}
            label="Profile"
            description="Manage your account details"
            onClick={() => setShowProfileModal(true)}
          />
          <SettingItem
            icon={Lock}
            label="Security"
            description="Password and authentication"
            onClick={() => setShowSecurityModal(true)}
          />
        </GlassCard>
      </motion.div>

      {/* Preferences Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Preferences</h3>
        <GlassCard className="divide-y divide-border/50">
          <SettingItem
            icon={theme === 'dark' ? Moon : Sun}
            label="Dark Mode"
            description={theme === 'dark' ? 'Currently enabled' : 'Currently disabled'}
            rightElement={
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            }
          />
          <SettingItem
            icon={Bell}
            label="Notifications"
            description="Push notifications"
            rightElement={
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            }
          />
          <SettingItem
            icon={Smartphone}
            label="Biometric Lock"
            description="Use Face ID / Touch ID"
            rightElement={
              <Switch
                checked={biometricsEnabled}
                onCheckedChange={setBiometricsEnabled}
              />
            }
          />
          <SettingItem
            icon={Globe}
            label="Language"
            description="English"
            onClick={() => toast({ title: "Language", description: "Language settings coming soon" })}
          />
        </GlassCard>
      </motion.div>

      {/* Support Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Support</h3>
        <GlassCard className="divide-y divide-border/50">
          <SettingItem
            icon={HelpCircle}
            label="Help Center"
            description="FAQs and guides"
            onClick={() => toast({ title: "Help", description: "Help center coming soon" })}
          />
          <SettingItem
            icon={Mail}
            label="Contact Support"
            description="Get help from our team"
            onClick={() => toast({ title: "Support", description: "Opening support..." })}
          />
          <SettingItem
            icon={FileText}
            label="Terms of Service"
            onClick={() => setLocation("/legal/terms")}
          />
          <SettingItem
            icon={Shield}
            label="Privacy Policy"
            onClick={() => setLocation("/legal/privacy")}
          />
        </GlassCard>
      </motion.div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard className="p-4" variant="subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">BlockMint Node Manager</div>
                <div className="text-xs text-muted-foreground">Version 1.0.0</div>
              </div>
            </div>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
              Up to date
            </Badge>
          </div>
        </GlassCard>
      </motion.div>

      {/* Sign Out */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard>
          <SettingItem
            icon={LogOut}
            label="Sign Out"
            description="Sign out of your account"
            onClick={handleSignOut}
            destructive
          />
        </GlassCard>
      </motion.div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowProfileModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-background border border-border rounded-2xl p-6 z-50 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Profile</h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 hover:bg-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{userInfo.displayName || "User"}</p>
                    <p className="text-sm text-muted-foreground">{userInfo.email || "user@example.com"}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Display Name</p>
                    <p className="font-medium">{userInfo.displayName || "Not set"}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{userInfo.email || "Not set"}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Account ID</p>
                    <p className="font-medium font-mono text-xs">{userInfo.id || userInfo.uid || "N/A"}</p>
                  </div>
                </div>
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                  <p className="text-xs text-cyan-400">
                    💡 Profile settings can be changed from our web platform.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Security Modal */}
      <AnimatePresence>
        {showSecurityModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowSecurityModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-background border border-border rounded-2xl p-6 z-50 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Security</h2>
                <button
                  onClick={() => setShowSecurityModal(false)}
                  className="p-2 hover:bg-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowSecurityModal(false);
                    toast({ title: "Password Reset", description: "Check your email for reset instructions." });
                  }}
                  className="w-full p-4 bg-muted/50 rounded-xl text-left hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-xs text-muted-foreground">Update your password</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={async () => {
                    // Check if biometrics are available
                    const availability = await checkBiometricAvailability();
                    
                    if (!availability.isAvailable) {
                      toast({
                        title: "Biometrics Not Available",
                        description: availability.errorMessage || "Your device doesn't support biometric authentication",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    if (!biometricsEnabled) {
                      // Enabling - verify first
                      const result = await authenticateWithBiometrics("Enable biometric login");
                      if (result.success) {
                        setBiometricsEnabled(true);
                        toast({ 
                          title: "Biometrics Enabled",
                          description: `${availability.biometryType === 'face' ? 'Face ID' : 'Touch ID'} has been enabled`
                        });
                      } else {
                        toast({
                          title: "Authentication Failed",
                          description: result.error || "Could not verify your identity",
                          variant: "destructive"
                        });
                      }
                    } else {
                      // Disabling
                      setBiometricsEnabled(false);
                      toast({ 
                        title: "Biometrics Disabled",
                        description: "Biometric login has been disabled"
                      });
                    }
                  }}
                  className="w-full p-4 bg-muted/50 rounded-xl text-left hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Fingerprint className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Biometric Login</p>
                        <p className="text-xs text-muted-foreground">Use Face ID or Touch ID</p>
                      </div>
                    </div>
                    <Switch checked={biometricsEnabled} />
                  </div>
                </button>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="font-medium text-emerald-400">Account Secured</p>
                      <p className="text-xs text-muted-foreground">Your account is protected</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg mt-2">
                  <p className="text-xs text-cyan-400">
                    💡 Security settings can be changed from our web platform.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default SafeSettings;
