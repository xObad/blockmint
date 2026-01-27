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
  Fingerprint,
  KeyRound
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { logOut } from "@/lib/firebase";
import { useLocation } from "wouter";
import { InlineNotificationBell } from "@/components/InlineNotificationBell";
import { TwoFactorSetupModal } from "@/components/TwoFactorSetupModal";
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    // Load initial state from localStorage
    const saved = localStorage.getItem("safe_notifications_enabled");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [biometricsEnabled, setBiometricsEnabled] = useState(() => {
    const saved = localStorage.getItem("safe_biometrics_enabled");
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Delete account dialog state
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Handle delete account
  // (تمت إزالة التعريفات المكررة لدالة handleDeleteAccount)
  // Biometric test state
  const [biometricType, setBiometricType] = useState<string>('none');
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const [biometricAuthResult, setBiometricAuthResult] = useState<string>('');
  const [credentialResult, setCredentialResult] = useState<string>('');
  
  // 2FA status
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    const saved = localStorage.getItem("safe_2fa_enabled");
    return saved !== null ? JSON.parse(saved) : false;
  });

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

  // Handle notification toggle with actual effect
  const handleNotificationsToggle = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem("safe_notifications_enabled", JSON.stringify(enabled));
    
    if (enabled) {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          toast({
            title: "Notifications Enabled",
            description: "You will receive push notifications.",
          });
        } else {
          toast({
            title: "Permission Denied",
            description: "Please enable notifications in your browser settings.",
            variant: "destructive",
          });
          setNotificationsEnabled(false);
          localStorage.setItem("safe_notifications_enabled", "false");
        }
      }
    } else {
      toast({
        title: "Notifications Disabled",
        description: "You will no longer receive push notifications.",
      });
    }
  };

  // Handle biometrics toggle with actual effect
  const handleBiometricsToggle = async (enabled: boolean) => {
    if (enabled) {
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
      
      // Verify before enabling
      const result = await authenticateWithBiometrics("Enable biometric login");
      if (result.success) {
        setBiometricsEnabled(true);
        localStorage.setItem("safe_biometrics_enabled", "true");
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
      setBiometricsEnabled(false);
      localStorage.setItem("safe_biometrics_enabled", "false");
      toast({ 
        title: "Biometrics Disabled",
        description: "Biometric login has been disabled"
      });
    }
  };

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

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast({
        title: "Confirmation Required",
        description: "Please type DELETE to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }
    setIsDeletingAccount(true);
    try {
      const user = getUserInfo();
      if (!user?.id && !user?.uid) throw new Error("User not found");
      const userId = user.id || user.uid;
      // Get ID token if available (optional, for secure API)
      let idToken = null;
      try {
        const { getIdToken } = await import("@/lib/firebase");
        idToken = await getIdToken();
      } catch {}
      const response = await fetch(`/api/auth/account/${userId}`, {
        method: "DELETE",
        headers: {
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }
      toast({
        title: "Account Deleted",
        description: "Your account has been scheduled for deletion.",
      });
      localStorage.clear();
      setShowDeleteAccountDialog(false);
      setDeleteConfirmText("");
      setTimeout(() => setLocation("/login"), 1500);
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: (error && typeof error === 'object' && 'message' in error) ? (error as Error).message : "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your preferences</p>
          </div>
          <InlineNotificationBell />
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
          <SettingItem
            icon={KeyRound}
            label="Two-Factor Auth"
            description={twoFactorEnabled ? "Enabled" : "Not enabled"}
            onClick={() => setShow2FAModal(true)}
            rightElement={
              <Badge variant={twoFactorEnabled ? "default" : "outline"} className={twoFactorEnabled ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""}>
                {twoFactorEnabled ? "On" : "Off"}
              </Badge>
            }
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
                onCheckedChange={handleNotificationsToggle}
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
                onCheckedChange={handleBiometricsToggle}
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
            onClick={() => window.location.href = "mailto:support@hardisk.co?subject=Hardisk%20Support%20Request&body=Please%20describe%20your%20issue%20below%3A%0A%0A"}
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
          <SettingItem
            icon={Shield}
            label="Delete Account"
            description="Permanently delete your account"
            onClick={() => setShowDeleteAccountDialog(true)}
            destructive
          />
        </GlassCard>
      </motion.div>

        {/* Delete Account Dialog */}
        <AnimatePresence>
          {showDeleteAccountDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            >
              <div className="bg-background rounded-xl shadow-xl p-6 w-full max-w-md border border-border">
                <h2 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Delete Account
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  This action is <strong>permanent</strong> and will remove all your data from our system. Type <b>DELETE</b> to confirm.
                </p>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 mb-4"
                  placeholder="Type DELETE to confirm"
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value.toUpperCase())}
                  disabled={isDeletingAccount}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => { setShowDeleteAccountDialog(false); setDeleteConfirmText(""); }}
                    disabled={isDeletingAccount}
                  >Cancel</Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "DELETE" || isDeletingAccount}
                  >{isDeletingAccount ? "Deleting..." : "Delete My Account"}</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Account Deletion Dialog */}
      <AnimatePresence>
        {showDeleteAccountDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <div className="bg-background rounded-2xl shadow-xl p-6 max-w-md w-full border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-red-500" />
                <span className="font-bold text-lg text-red-500">Delete Account</span>
              </div>
              <p className="text-sm mb-2">This action is <b>permanent</b> and will delete all your account data. This cannot be undone.</p>
              <p className="text-xs text-muted-foreground mb-4">Type <b>DELETE</b> below to confirm.</p>
              <input
                type="text"
                className="w-full border rounded-md p-2 mb-4"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value.toUpperCase())}
                placeholder="Type DELETE"
                disabled={isDeletingAccount}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => { setShowDeleteAccountDialog(false); setDeleteConfirmText(""); }}
                  disabled={isDeletingAccount}
                >Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || isDeletingAccount}
                >{isDeletingAccount ? "Deleting..." : "Delete My Account"}</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="fixed inset-x-4 top-[15%] max-w-md mx-auto bg-background border border-border rounded-2xl p-6 z-50 shadow-xl"
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
              className="fixed inset-x-4 top-[15%] max-w-md mx-auto bg-background border border-border rounded-2xl p-6 z-50 shadow-xl"
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

      {/* Two-Factor Authentication Modal */}
      <TwoFactorSetupModal
        open={show2FAModal}
        onOpenChange={(open) => {
          setShow2FAModal(open);
          // Update local 2FA state when modal closes
          if (!open) {
            // Check if 2FA is now enabled via localStorage or API
            const user = getUserInfo();
            if (user?.id) {
              fetch(`/api/auth/2fa/status/${user.id}`)
                .then(res => res.json())
                .then(data => {
                  setTwoFactorEnabled(data.enabled || false);
                  localStorage.setItem("safe_2fa_enabled", JSON.stringify(data.enabled || false));
                })
                .catch(() => {});
            }
          }
        }}
        enabled={twoFactorEnabled}
      />
    </motion.div>
  );
}

export default SafeSettings;
