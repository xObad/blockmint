import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Database,
  DollarSign,
  Bell,
  Settings,
  Users,
  ArrowDownToLine,
  Eye,
  AlertTriangle,
  Edit2,
  Trash2,
  Save,
  Mail,
  Shield,
  Wallet,
  Menu,
  X,
  LogOut,
  FileText,
  Smartphone,
  Sliders,
  Plus,
  ArrowUpToLine,
} from "lucide-react";

const ADMIN_PASSWORD = "MiningClub2024!";

// Predefined config keys
const CONFIG_KEYS = {
  wallet: [
    { key: "wallet_btc_native", description: "Bitcoin Native (SegWit)" },
    { key: "wallet_btc_legacy", description: "Bitcoin Legacy" },
    { key: "wallet_btc_taproot", description: "Bitcoin Taproot" },
    { key: "wallet_eth_erc20", description: "Ethereum ERC-20" },
    { key: "wallet_usdt_trc20", description: "USDT TRC-20 (Tron)" },
    { key: "wallet_usdt_erc20", description: "USDT ERC-20 (Ethereum)" },
    { key: "wallet_usdt_bsc", description: "USDT BSC (BEP-20)" },
    { key: "wallet_usdt_ton", description: "USDT TON" },
    { key: "wallet_usdc_erc20", description: "USDC ERC-20" },
    { key: "wallet_usdc_trc20", description: "USDC TRC-20" },
    { key: "wallet_usdc_bsc", description: "USDC BSC" },
    { key: "wallet_usdc_ton", description: "USDC TON" },
    { key: "wallet_ltc_native", description: "Litecoin Native" },
  ],
  pricing: [
    { key: "price_btc_per_th", description: "BTC Price per TH/s" },
    { key: "price_ltc_per_mh", description: "LTC Price per MH/s" },
    { key: "price_eth_per_mh", description: "ETH Price per MH/s" },
    { key: "minimum_deposit_usd", description: "Minimum Deposit (USD)" },
    { key: "withdrawal_fee_btc", description: "BTC Withdrawal Fee" },
    { key: "withdrawal_fee_usdt", description: "USDT Withdrawal Fee" },
    { key: "withdrawal_fee_eth", description: "ETH Withdrawal Fee" },
  ],
  contracts: [
    { key: "contract_btc_starter_price", description: "BTC Starter Contract Price" },
    { key: "contract_btc_starter_hashrate", description: "BTC Starter Hashrate (TH/s)" },
    { key: "contract_btc_pro_price", description: "BTC Pro Contract Price" },
    { key: "contract_btc_pro_hashrate", description: "BTC Pro Hashrate (TH/s)" },
    { key: "contract_ltc_starter_price", description: "LTC Starter Contract Price" },
    { key: "contract_ltc_starter_hashrate", description: "LTC Starter Hashrate (MH/s)" },
    { key: "contract_ltc_pro_price", description: "LTC Pro Contract Price" },
    { key: "contract_ltc_pro_hashrate", description: "LTC Pro Hashrate (MH/s)" },
    { key: "contract_duration_days", description: "Default Contract Duration (days)" },
  ],
  discount: [
    { key: "discount_percentage", description: "Current Discount (%)" },
    { key: "discount_start_date", description: "Discount Start Date" },
    { key: "discount_end_date", description: "Discount End Date" },
    { key: "sale_active", description: "Sale Active (true/false)" },
    { key: "flash_sale_percentage", description: "Flash Sale Discount (%)" },
    { key: "referral_bonus_percentage", description: "Referral Bonus (%)" },
  ],
  forceUpdate: [
    { key: "force_update_enabled", description: "Force Update Enabled" },
    { key: "force_update_min_version", description: "Minimum Required Version" },
    { key: "force_update_android_url", description: "Google Play Store URL" },
    { key: "force_update_ios_url", description: "Apple App Store URL" },
    { key: "force_update_message", description: "Update Prompt Message" },
  ],
  settings: [
    { key: "app_name", description: "Application Name" },
    { key: "support_email", description: "Support Email Address" },
    { key: "support_phone", description: "Support Phone Number" },
    { key: "maintenance_mode", description: "Maintenance Mode (true/false)" },
    { key: "maintenance_message", description: "Maintenance Mode Message" },
    { key: "max_active_contracts", description: "Max Active Contracts per User" },
  ],
};

const ARTICLE_CATEGORIES = [
  "Basics",
  "Strategy",
  "Advanced",
  "Security",
  "Economics",
  "Tutorial",
  "News",
];

type NavItem = "users" | "deposits" | "withdrawals" | "notifications" | "articles" | "update-app" | "config";

interface DepositRequest {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  network: string;
  walletAddress: string;
  status: string;
  createdAt: string;
  confirmedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  userEmail?: string;
  userDisplayName?: string;
}

interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
  isActive: boolean;
  role?: string;
}

interface AppConfig {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  isActive: boolean;
}

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  icon?: string;
  image?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export function DatabaseAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeNav, setActiveNav] = useState<NavItem>("deposits");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  
  // Config states
  const [newConfigKey, setNewConfigKey] = useState("");
  const [newConfigValue, setNewConfigValue] = useState("");
  const [newConfigCategory, setNewConfigCategory] = useState("wallet");
  const [newConfigDescription, setNewConfigDescription] = useState("");
  const [editingConfig, setEditingConfig] = useState<AppConfig | null>(null);
  const [editConfigValue, setEditConfigValue] = useState("");
  const [deleteConfigId, setDeleteConfigId] = useState<string | null>(null);
  
  // Update app states
  const [forceUpdateEnabled, setForceUpdateEnabled] = useState(false);
  const [updateMinVersion, setUpdateMinVersion] = useState("");
  const [updateAndroidUrl, setUpdateAndroidUrl] = useState("");
  const [updateIosUrl, setUpdateIosUrl] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  
  // Article states
  const [articleTitle, setArticleTitle] = useState("");
  const [articleDescription, setArticleDescription] = useState("");
  const [articleCategory, setArticleCategory] = useState("Basics");
  const [articleIcon, setArticleIcon] = useState("");
  const [articleImage, setArticleImage] = useState("");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteArticleId, setDeleteArticleId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const auth = sessionStorage.getItem("dbAdminAuth");
    if (auth === "true") setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("dbAdminAuth", "true");
      toast({ title: "Authenticated", description: "Welcome to admin panel." });
    } else {
      toast({ title: "Invalid Password", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("dbAdminAuth");
    toast({ title: "Logged out successfully" });
  };

  // Queries
  const { data: pendingDeposits = [] } = useQuery<DepositRequest[]>({
    queryKey: ["/api/admin/deposits/pending"],
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const { data: allDeposits = [] } = useQuery<DepositRequest[]>({
    queryKey: ["/api/admin/deposits/all"],
    enabled: isAuthenticated && activeNav === "deposits",
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && activeNav === "users",
    refetchInterval: 10000,
  });

  const { data: config = [] } = useQuery<AppConfig[]>({
    queryKey: ["/api/admin/config"],
    enabled: isAuthenticated && activeNav === "config",
  });

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
    enabled: isAuthenticated && activeNav === "articles",
  });

  // Mutations
  const confirmDeposit = useMutation({
    mutationFn: async (depositId: string) =>
      fetch(`/api/admin/deposits/${depositId}/confirm`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits/all"] });
      toast({ title: "Deposit Confirmed", description: "User balance has been credited" });
      setConfirmDialogOpen(false);
      setSelectedDeposit(null);
    },
  });

  const rejectDeposit = useMutation({
    mutationFn: async ({ depositId, reason }: { depositId: string; reason: string }) =>
      fetch(`/api/admin/deposits/${depositId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits/all"] });
      toast({ title: "Deposit Rejected", variant: "destructive" });
      setRejectDialogOpen(false);
      setSelectedDeposit(null);
      setRejectionReason("");
    },
  });

  const broadcastNotification = useMutation({
    mutationFn: async (data: { title: string; message: string }) =>
      fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: (data) => {
      toast({ title: "Broadcast Sent", description: `Notified ${data.count} users` });
      setBroadcastTitle("");
      setBroadcastMessage("");
    },
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User status updated" });
    },
  });

  const adjustBalance = useMutation({
    mutationFn: async (data: { userId: string; symbol: string; amount: number; type: string; reason: string }) =>
      fetch(`/api/admin/users/${data.userId}/adjust-balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Balance adjusted successfully" });
    },
  });

  const addConfig = useMutation({
    mutationFn: async (data: { key: string; value: string; category: string; description: string }) =>
      fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ title: "Configuration added" });
      setNewConfigKey("");
      setNewConfigValue("");
      setNewConfigDescription("");
    },
  });

  const updateConfig = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: string }) =>
      fetch(`/api/admin/config/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ title: "Configuration updated" });
      setEditingConfig(null);
    },
  });

  const deleteConfig = useMutation({
    mutationFn: async (id: string) =>
      fetch(`/api/admin/config/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ title: "Configuration deleted" });
      setDeleteConfigId(null);
    },
  });

  const createArticle = useMutation({
    mutationFn: async (data: { title: string; description: string; category?: string; icon?: string; image?: string; order: number }) =>
      fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, isActive: true }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({ title: "Article created successfully" });
      setArticleTitle("");
      setArticleDescription("");
      setArticleCategory("Basics");
      setArticleIcon("");
      setArticleImage("");
    },
  });

  const updateArticle = useMutation({
    mutationFn: async (data: { id: string; title: string; description: string; category?: string; icon?: string; image?: string; order: number }) =>
      fetch(`/api/admin/articles/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({ title: "Article updated successfully" });
      setEditingArticle(null);
    },
  });

  const deleteArticle = useMutation({
    mutationFn: async (id: string) =>
      fetch(`/api/admin/articles/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({ title: "Article deleted" });
      setDeleteArticleId(null);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-border rounded-xl p-8 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-primary/10 rounded-full">
                <Shield className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">Admin Panel</h1>
            <p className="text-sm text-muted-foreground text-center mb-6">Enter password to continue</p>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="h-12"
              />
              <Button onClick={handleLogin} className="w-full h-12">
                <Shield className="w-4 h-4 mr-2" />
                Authenticate
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: "users" as NavItem, icon: Users, label: "Users" },
    { id: "deposits" as NavItem, icon: ArrowDownToLine, label: "Deposits", badge: pendingDeposits.length },
    { id: "withdrawals" as NavItem, icon: ArrowUpToLine, label: "Withdrawals" },
    { id: "notifications" as NavItem, icon: Bell, label: "Notifications" },
  ];

  const settingsItems = [
    { id: "articles" as NavItem, icon: FileText, label: "Articles" },
    { id: "update-app" as NavItem, icon: Smartphone, label: "Update App" },
    { id: "config" as NavItem, icon: Sliders, label: "Config" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="hidden lg:flex w-64 border-r border-border flex-col bg-card"
      >
        {/* Logo / Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">Database Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeNav === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge className="ml-auto bg-amber-500">{item.badge}</Badge>
              )}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-border">
            <p className="px-4 text-xs font-semibold text-muted-foreground mb-2">SETTINGS</p>
            {settingsItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeNav === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 flex flex-col lg:hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Database className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Admin Panel</h2>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveNav(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeNav === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge className="ml-auto bg-amber-500">{item.badge}</Badge>
                    )}
                  </button>
                ))}

                <div className="pt-4 mt-4 border-t border-border">
                  <p className="px-4 text-xs font-semibold text-muted-foreground mb-2">SETTINGS</p>
                  {settingsItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveNav(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeNav === item.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </nav>

              <div className="p-4 border-t border-border">
                <Button onClick={handleLogout} variant="outline" className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-card border-b border-border p-4 flex items-center justify-between">
          <Button size="icon" variant="ghost" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="font-bold capitalize">{activeNav.replace("-", " ")}</h1>
          <div className="w-10" />
        </div>

        {/* Content Area */}
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNav}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Users Tab */}
              {activeNav === "users" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">User Management</h2>
                    <p className="text-muted-foreground">Manage all registered users</p>
                  </div>

                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Display Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>{user.displayName || "—"}</TableCell>
                            <TableCell>
                              <Badge variant={user.isActive ? "default" : "destructive"}>
                                {user.isActive ? "Active" : "Blocked"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    toggleUserStatus.mutate({ userId: user.id, isActive: !user.isActive });
                                  }}
                                >
                                  {user.isActive ? "Block" : "Unblock"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const symbol = prompt("Enter currency (BTC, USDT, ETH, etc.):");
                                    if (!symbol) return;
                                    const amount = prompt("Enter amount to add:");
                                    if (!amount) return;
                                    const reason = prompt("Enter reason:") || "Admin adjustment";
                                    adjustBalance.mutate({
                                      userId: user.id,
                                      symbol,
                                      amount: parseFloat(amount),
                                      type: "add",
                                      reason,
                                    });
                                  }}
                                >
                                  Add Balance
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const symbol = prompt("Enter currency (BTC, USDT, ETH, etc.):");
                                    if (!symbol) return;
                                    const amount = prompt("Enter amount to deduct:");
                                    if (!amount) return;
                                    const reason = prompt("Enter reason:") || "Admin adjustment";
                                    adjustBalance.mutate({
                                      userId: user.id,
                                      symbol,
                                      amount: parseFloat(amount),
                                      type: "deduct",
                                      reason,
                                    });
                                  }}
                                >
                                  Deduct Balance
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Deposits Tab */}
              {activeNav === "deposits" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Deposit Management</h2>
                    <p className="text-muted-foreground">Review and approve deposit requests</p>
                  </div>

                  {/* Pending Deposits */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-semibold">Pending Deposits</h3>
                      <Badge variant="secondary">{pendingDeposits.length}</Badge>
                    </div>

                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      {pendingDeposits.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>No pending deposits</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Network</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingDeposits.map((deposit) => (
                              <TableRow key={deposit.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{deposit.userEmail || "Unknown"}</div>
                                    {deposit.userDisplayName && (
                                      <div className="text-sm text-muted-foreground">{deposit.userDisplayName}</div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    {deposit.amount} {deposit.currency}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{deposit.network}</Badge>
                                </TableCell>
                                <TableCell>{new Date(deposit.createdAt).toLocaleString()}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setSelectedDeposit(deposit);
                                        setConfirmDialogOpen(true);
                                      }}
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => {
                                        setSelectedDeposit(deposit);
                                        setRejectDialogOpen(true);
                                      }}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </div>

                  {/* Deposit History */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recent Deposits</h3>
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allDeposits.slice(0, 20).map((deposit) => (
                            <TableRow key={deposit.id}>
                              <TableCell className="font-medium">{deposit.userEmail || "Unknown"}</TableCell>
                              <TableCell>
                                {deposit.amount} {deposit.currency}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    deposit.status === "confirmed"
                                      ? "default"
                                      : deposit.status === "rejected"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {deposit.status === "confirmed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                  {deposit.status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                                  {deposit.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                                  {deposit.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(deposit.createdAt).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}

              {/* Withdrawals Tab */}
              {activeNav === "withdrawals" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Withdrawal Management</h2>
                    <p className="text-muted-foreground">Review and process withdrawal requests</p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <ArrowUpToLine className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-muted-foreground">No withdrawal requests at this time</p>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeNav === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Broadcast Notifications</h2>
                    <p className="text-muted-foreground">Send notifications to all users</p>
                  </div>

                  <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder="Notification title"
                      />
                    </div>
                    <div>
                      <Label>Message</Label>
                      <Textarea
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Notification message"
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={() => broadcastNotification.mutate({ title: broadcastTitle, message: broadcastMessage })}
                      disabled={!broadcastTitle || !broadcastMessage}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Send Broadcast
                    </Button>
                  </div>
                </div>
              )}

              {/* Articles Tab */}
              {activeNav === "articles" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Learn & Earn Articles</h2>
                    <p className="text-muted-foreground">Manage educational content</p>
                  </div>

                  {/* Create Article */}
                  <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                    <h3 className="font-semibold">Create New Article</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={articleTitle}
                          onChange={(e) => setArticleTitle(e.target.value)}
                          placeholder="Article title"
                        />
                      </div>
                      <div>
                        <Label>Icon (emoji or URL)</Label>
                        <Input
                          value={articleIcon}
                          onChange={(e) => setArticleIcon(e.target.value)}
                          placeholder="📚 or image URL"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Image URL (optional)</Label>
                      <Input
                        value={articleImage}
                        onChange={(e) => setArticleImage(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label>Description (HTML supported)</Label>
                      <Textarea
                        value={articleDescription}
                        onChange={(e) => setArticleDescription(e.target.value)}
                        placeholder="<p>Content here...</p>"
                        rows={6}
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={articleCategory} onValueChange={setArticleCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {ARTICLE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() =>
                        createArticle.mutate({
                          title: articleTitle,
                          description: articleDescription,
                          category: articleCategory,
                          icon: articleIcon || undefined,
                          image: articleImage || undefined,
                          order: articles.length,
                        })
                      }
                      disabled={!articleTitle || !articleDescription}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Article
                    </Button>
                  </div>

                  {/* Existing Articles */}
                  <div>
                    <h3 className="font-semibold mb-4">Existing Articles</h3>
                    <div className="space-y-4">
                      {articles.map((article) => (
                        <div key={article.id} className="bg-card rounded-xl border border-border p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {article.icon && <span className="text-2xl">{article.icon}</span>}
                                <h4 className="font-semibold">{article.title}</h4>
                                <Badge variant={article.isActive ? "default" : "secondary"}>
                                  {article.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <div
                                className="text-sm text-muted-foreground line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: article.description }}
                              />
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingArticle(article);
                                  setArticleTitle(article.title);
                                  setArticleDescription(article.description);
                                  setArticleCategory(article.category || "Basics");
                                  setArticleIcon(article.icon || "");
                                  setArticleImage(article.image || "");
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteArticleId(article.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Update App Tab */}
              {activeNav === "update-app" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Force Update Settings</h2>
                    <p className="text-muted-foreground">Configure mandatory app updates</p>
                  </div>

                  <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="force-update"
                        checked={forceUpdateEnabled}
                        onChange={(e) => setForceUpdateEnabled(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="force-update" className="font-medium">
                        Enable Force Update
                      </label>
                    </div>

                    {forceUpdateEnabled && (
                      <div className="space-y-4 pt-4 border-t">
                        <div>
                          <Label>Minimum Required Version</Label>
                          <Input
                            value={updateMinVersion}
                            onChange={(e) => setUpdateMinVersion(e.target.value)}
                            placeholder="1.0.0"
                          />
                        </div>
                        <div>
                          <Label>Android Update URL (Google Play)</Label>
                          <Input
                            value={updateAndroidUrl}
                            onChange={(e) => setUpdateAndroidUrl(e.target.value)}
                            placeholder="https://play.google.com/store/apps/details?id=..."
                          />
                        </div>
                        <div>
                          <Label>iOS Update URL (App Store)</Label>
                          <Input
                            value={updateIosUrl}
                            onChange={(e) => setUpdateIosUrl(e.target.value)}
                            placeholder="https://apps.apple.com/app/..."
                          />
                        </div>
                        <div>
                          <Label>Update Message</Label>
                          <Textarea
                            value={updateMessage}
                            onChange={(e) => setUpdateMessage(e.target.value)}
                            placeholder="Please update to the latest version"
                            rows={3}
                          />
                        </div>
                        <Button>
                          <Save className="w-4 h-4 mr-2" />
                          Save Update Settings
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Config Tab */}
              {activeNav === "config" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Configuration Management</h2>
                    <p className="text-muted-foreground">Manage wallet addresses and app settings</p>
                  </div>

                  {/* Add New Config */}
                  <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                    <h3 className="font-semibold">Add New Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Select value={newConfigCategory} onValueChange={(value) => {
                          setNewConfigCategory(value);
                          setNewConfigKey(""); // Reset key when category changes
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wallet">Wallet Addresses</SelectItem>
                            <SelectItem value="pricing">Pricing</SelectItem>
                            <SelectItem value="contracts">Mining Contracts</SelectItem>
                            <SelectItem value="discount">Discounts & Sales</SelectItem>
                            <SelectItem value="forceUpdate">Force Update</SelectItem>
                            <SelectItem value="settings">App Settings</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Config Key</Label>
                        <Select 
                          value={newConfigKey} 
                          onValueChange={(value) => {
                            setNewConfigKey(value);
                            // Auto-fill description
                            const key = CONFIG_KEYS[newConfigCategory as keyof typeof CONFIG_KEYS]?.find(
                              (k) => k.key === value
                            );
                            if (key) setNewConfigDescription(key.description);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select config key" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONFIG_KEYS[newConfigCategory as keyof typeof CONFIG_KEYS]?.map((key) => (
                              <SelectItem key={key.key} value={key.key}>
                                {key.description}
                              </SelectItem>
                            )) || <SelectItem value="">No keys available</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input
                          value={newConfigValue}
                          onChange={(e) => setNewConfigValue(e.target.value)}
                          placeholder={
                            newConfigCategory === "wallet" ? "bc1q... or 0x..." :
                            newConfigCategory === "pricing" ? "0.00" :
                            newConfigCategory === "discount" ? "10" :
                            "Value"
                          }
                        />
                      </div>
                      <div>
                        <Label>Description (Auto-filled)</Label>
                        <Input
                          value={newConfigDescription}
                          onChange={(e) => setNewConfigDescription(e.target.value)}
                          placeholder="Description"
                          disabled
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        addConfig.mutate({
                          key: newConfigKey,
                          value: newConfigValue,
                          category: newConfigCategory,
                          description: newConfigDescription,
                        })
                      }
                      disabled={!newConfigKey || !newConfigValue}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Configuration
                    </Button>
                  </div>

                  {/* Existing Config */}
                  <div>
                    <h3 className="font-semibold mb-4">Current Configuration</h3>
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Key</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {config.map((cfg) => (
                            <TableRow key={cfg.id}>
                              <TableCell className="font-mono text-sm">{cfg.key}</TableCell>
                              <TableCell>
                                {editingConfig?.id === cfg.id ? (
                                  <Input
                                    value={editConfigValue}
                                    onChange={(e) => setEditConfigValue(e.target.value)}
                                    className="max-w-xs"
                                  />
                                ) : (
                                  <span className="font-mono text-sm">{cfg.value}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{cfg.category}</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{cfg.description || "—"}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {editingConfig?.id === cfg.id ? (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          updateConfig.mutate({ id: cfg.id, value: editConfigValue });
                                        }}
                                      >
                                        <Save className="w-4 h-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => setEditingConfig(null)}>
                                        Cancel
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingConfig(cfg);
                                          setEditConfigValue(cfg.value);
                                        }}
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => setDeleteConfigId(cfg.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Confirm Deposit Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deposit</DialogTitle>
            <DialogDescription>
              Approve this deposit and credit {selectedDeposit?.amount} {selectedDeposit?.currency} to user's account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedDeposit && confirmDeposit.mutate(selectedDeposit.id)}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Deposit Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Deposit</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this deposit</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
            />
            <div className="flex flex-wrap gap-2">
              {["Deposit not detected on blockchain", "Incorrect amount sent", "Sent to wrong address"].map(
                (template) => (
                  <Button
                    key={template}
                    size="sm"
                    variant="outline"
                    onClick={() => setRejectionReason(template)}
                  >
                    {template}
                  </Button>
                )
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedDeposit &&
                rejectDeposit.mutate({ depositId: selectedDeposit.id, reason: rejectionReason })
              }
              disabled={!rejectionReason}
            >
              Reject Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Config Dialog */}
      <Dialog open={!!deleteConfigId} onOpenChange={() => setDeleteConfigId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Configuration</DialogTitle>
            <DialogDescription>Are you sure you want to delete this configuration entry?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfigId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteConfigId && deleteConfig.mutate(deleteConfigId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Article Dialog */}
      <Dialog open={!!deleteArticleId} onOpenChange={() => setDeleteArticleId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>Are you sure you want to delete this article?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteArticleId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteArticleId && deleteArticle.mutate(deleteArticleId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      <Dialog open={!!editingArticle} onOpenChange={() => setEditingArticle(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input value={articleTitle} onChange={(e) => setArticleTitle(e.target.value)} />
              </div>
              <div>
                <Label>Icon</Label>
                <Input value={articleIcon} onChange={(e) => setArticleIcon(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={articleImage} onChange={(e) => setArticleImage(e.target.value)} />
            </div>
            <div>
              <Label>Description (HTML)</Label>
              <Textarea
                value={articleDescription}
                onChange={(e) => setArticleDescription(e.target.value)}
                rows={8}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={articleCategory} onValueChange={setArticleCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ARTICLE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingArticle(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                editingArticle &&
                updateArticle.mutate({
                  id: editingArticle.id,
                  title: articleTitle,
                  description: articleDescription,
                  category: articleCategory,
                  icon: articleIcon || undefined,
                  image: articleImage || undefined,
                  order: editingArticle.order,
                })
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
