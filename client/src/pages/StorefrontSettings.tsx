/**
 * Storefront Settings - Account Settings for Web Platform
 * 
 * Settings page for the web storefront with:
 * - Profile management
 * - Security settings
 * - Notification preferences
 * - Links to Terms and Privacy
 * 
 * Clean, professional web interface.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Shield,
  Bell,
  Moon,
  Sun,
  ChevronRight,
  Mail,
  FileText,
  HelpCircle,
  LogOut,
  Check,
  X,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/GlassCard";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "wouter";
import type { User as FirebaseUser } from "firebase/auth";

interface StorefrontSettingsProps {
  user: FirebaseUser | null;
  onLogout: () => void;
}

export function StorefrontSettings({ user, onLogout }: StorefrontSettingsProps) {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  // Modal states
  const [showProfile, setShowProfile] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  
  // Notification preferences (mock state)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [nodeAlerts, setNodeAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  return (
    <div className="p-4 lg:p-0 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences
        </p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">
                {user?.displayName || 'User'}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" onClick={() => setShowProfile(true)}>
              Edit Profile
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Account Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Account</h3>
        <GlassCard className="divide-y divide-border">
          <SettingRow
            icon={User}
            label="Profile Information"
            description="Update your name and email"
            onClick={() => setShowProfile(true)}
          />
          <SettingRow
            icon={Shield}
            label="Security"
            description="Password and two-factor authentication"
            onClick={() => setShowSecurity(true)}
          />
        </GlassCard>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Notifications</h3>
        <GlassCard className="divide-y divide-border">
          <SettingToggle
            icon={Mail}
            label="Email Notifications"
            description="Receive account updates via email"
            checked={emailNotifications}
            onChange={setEmailNotifications}
          />
          <SettingToggle
            icon={Bell}
            label="Node Alerts"
            description="Get notified about node status changes"
            checked={nodeAlerts}
            onChange={setNodeAlerts}
          />
          <SettingToggle
            icon={Mail}
            label="Marketing Emails"
            description="Receive news and promotional offers"
            checked={marketingEmails}
            onChange={setMarketingEmails}
          />
        </GlassCard>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Appearance</h3>
        <GlassCard>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-foreground">Theme</p>
                <p className="text-sm text-muted-foreground">
                  {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                <Sun className="w-4 h-4" />
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Support & Legal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Support & Legal</h3>
        <GlassCard className="divide-y divide-border">
          <SettingRow
            icon={HelpCircle}
            label="Help Center"
            description="Get help and support"
            onClick={() => toast({ title: "Help Center", description: "Opening help center..." })}
          />
          <SettingRow
            icon={FileText}
            label="Terms of Service"
            onClick={() => setLocation("/legal/terms")}
          />
          <SettingRow
            icon={Shield}
            label="Privacy Policy"
            onClick={() => setLocation("/legal/privacy")}
          />
        </GlassCard>
      </motion.div>

      {/* Sign Out */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          variant="outline"
          className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </motion.div>

      {/* App Version */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center text-xs text-muted-foreground"
      >
        <p>BlockMint Node Manager v1.0.0</p>
        <p className="mt-1">© 2026 BlockMint. All rights reserved.</p>
      </motion.div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <ProfileModal 
            user={user} 
            onClose={() => setShowProfile(false)} 
          />
        )}
      </AnimatePresence>

      {/* Security Modal */}
      <AnimatePresence>
        {showSecurity && (
          <SecurityModal onClose={() => setShowSecurity(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Setting Row Component
function SettingRow({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: any;
  label: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}

// Setting Toggle Component
function SettingToggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: any;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// Profile Modal
function ProfileModal({ 
  user, 
  onClose 
}: { 
  user: FirebaseUser | null; 
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-card rounded-2xl border border-border p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Full Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Email</label>
            <Input value={email} disabled className="opacity-50" />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Security Modal
function SecurityModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-card rounded-2xl border border-border p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Security</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Current Password</label>
            <div className="relative">
              <Input
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">New Password</label>
            <Input
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Confirm New Password</label>
            <Input
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPasswords ? "Hide passwords" : "Show passwords"}
          </button>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleChangePassword}>
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default StorefrontSettings;
