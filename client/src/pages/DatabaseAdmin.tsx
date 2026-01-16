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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Database,
  DollarSign,
  TrendingUp,
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

type NavItem = "users" | "deposits" | "withdrawals" | "notifications" | "articles" | "update-app" | "config" | "estimates";

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

interface AdminUserPurchasesResponse {
  orders: Array<{
    id: string;
    type: string;
    productId: string;
    productName: string;
    amount: number;
    currency: string;
    status?: string;
    createdAt?: string;
    completedAt?: string;
    details?: any;
  }>;
}

interface UserBalancesResponse {
  balances: Array<{ symbol: string; balance: number }>;
  pending: Record<string, number>;
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

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false);

  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const [terminatePurchaseId, setTerminatePurchaseId] = useState<string | null>(null);
  const [terminateReasonPreset, setTerminateReasonPreset] = useState<"expired" | "out_of_stock" | "custom">("expired");
  const [terminateCustomMessage, setTerminateCustomMessage] = useState("");

  // UI-only filters
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<"all" | "active" | "blocked">("all");
  const [depositSearch, setDepositSearch] = useState("");
  const [depositStatusFilter, setDepositStatusFilter] = useState<"all" | "pending" | "confirmed" | "rejected">("all");
  const [depositCurrencyFilter, setDepositCurrencyFilter] = useState<string>("all");
  
  // Config states
  const [newConfigKey, setNewConfigKey] = useState("");
  const [newConfigValue, setNewConfigValue] = useState("");
  const [newConfigCategory, setNewConfigCategory] = useState("wallet");
  const [newConfigDescription, setNewConfigDescription] = useState("");
  const [editingConfig, setEditingConfig] = useState<AppConfig | null>(null);
  const [editConfigValue, setEditConfigValue] = useState("");
  const [deleteConfigId, setDeleteConfigId] = useState<string | null>(null);

  // Estimates (UI settings)
  const [estimateInvestAprAnnual, setEstimateInvestAprAnnual] = useState("19");
  const [estimateMiningMultiplier, setEstimateMiningMultiplier] = useState("1");
  const [estimateSoloMultiplier, setEstimateSoloMultiplier] = useState("1");
  
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

  const { data: pendingWithdrawals = [], isLoading: isLoadingWithdrawals } = useQuery<any[]>({
    queryKey: ["/api/admin/withdrawals/pending"],
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && activeNav === "users",
    refetchInterval: 10000,
  });

  const { data: selectedUserBalances } = useQuery<UserBalancesResponse>({
    queryKey: ["/api/balances", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return { balances: [], pending: {} };
      const res = await fetch(`/api/balances/${selectedUserId}`);
      if (!res.ok) throw new Error("Failed to fetch balances");
      return res.json();
    },
    enabled: isAuthenticated && !!selectedUserId && userDetailsDialogOpen,
  });

  const { data: selectedUserPurchases } = useQuery<AdminUserPurchasesResponse>({
    queryKey: ["/api/admin/users", selectedUserId, "purchases"],
    queryFn: async () => {
      if (!selectedUserId) return { orders: [] };
      const res = await fetch(`/api/admin/users/${selectedUserId}/purchases`);
      if (!res.ok) throw new Error("Failed to fetch purchases");
      return res.json();
    },
    enabled: isAuthenticated && !!selectedUserId && userDetailsDialogOpen,
  });

  const selectedBalancesList = selectedUserBalances?.balances ?? [];
  const selectedOrders: AdminUserPurchasesResponse["orders"] = selectedUserPurchases?.orders ?? [];
  const selectedUser = selectedUserId ? users.find((u) => u.id === selectedUserId) : undefined;

  const activeMiningOrders = selectedOrders.filter(
    (o) => o.type === "mining_purchase" && o.details?.status === "active"
  );
  const activeEarnOrders = selectedOrders.filter(
    (o) => o.type === "earn_subscription" && o.details?.status === "active"
  );
  const totalSpent = selectedOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  const { data: config = [] } = useQuery<AppConfig[]>({
    queryKey: ["/api/admin/config"],
    enabled: isAuthenticated && (activeNav === "config" || activeNav === "estimates"),
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeNav !== "estimates") return;

    const getVal = (key: string, fallback: string) => {
      const row = config.find((c) => c.key === key);
      return row?.value ?? fallback;
    };

    setEstimateInvestAprAnnual(getVal("public_invest_apr_annual_percent", "19"));
    setEstimateMiningMultiplier(getVal("public_mining_estimate_multiplier", "1"));
    setEstimateSoloMultiplier(getVal("public_solo_estimate_multiplier", "1"));
  }, [activeNav, config, isAuthenticated]);

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
    enabled: isAuthenticated && activeNav === "articles",
    select: (data: any) => {
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.articles)) return data.articles;
      return [];
    },
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

  const processWithdrawal = useMutation({
    mutationFn: async ({ id, action, txHash, note }: { id: string; action: "approve" | "reject"; txHash?: string; note?: string }) => {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const adminId = user?.dbId || user?.id || user?.uid;

      const res = await fetch(`/api/admin/withdrawals/${id}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, action, txHash, note }),
      });
      if (!res.ok) throw new Error("Failed to process withdrawal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals/pending"] });
      toast({ title: "Withdrawal Processed" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Process Failed", 
        description: error.message || "Failed to process withdrawal",
        variant: "destructive" 
      });
    },
  });

  const handleProcessWithdrawal = (id: string, action: "approve" | "reject") => {
    if (action === "approve") {
      const txHash = prompt("Enter transaction hash or tracking number (optional):");
      processWithdrawal.mutate({ id, action, txHash: txHash || undefined });
    } else {
      const note = prompt("Enter rejection reason (optional):");
      processWithdrawal.mutate({ id, action, note: note || undefined });
    }
  };

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

  const terminateMiningPurchase = useMutation({
    mutationFn: async ({ purchaseId, reason }: { purchaseId: string; reason?: string }) => {
      const res = await fetch(`/api/admin/mining-purchases/${purchaseId}/terminate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to terminate purchase");
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/users", selectedUserId, "purchases"] });
      toast({ title: "Purchase terminated" });

      setTerminateDialogOpen(false);
      setTerminatePurchaseId(null);
      setTerminateReasonPreset("expired");
      setTerminateCustomMessage("");
    },
    onError: (error: any) => {
      toast({ title: "Terminate failed", description: error?.message || "Could not terminate purchase", variant: "destructive" });
    },
  });

  const openTerminateDialog = (purchaseId: string) => {
    setTerminatePurchaseId(purchaseId);
    setTerminateReasonPreset("expired");
    setTerminateCustomMessage("");
    setTerminateDialogOpen(true);
  };

  const computedTerminateReason =
    terminateReasonPreset === "expired"
      ? "Expired"
      : terminateReasonPreset === "out_of_stock"
        ? "Out of stock"
        : terminateCustomMessage.trim();

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
    { id: "estimates" as NavItem, icon: TrendingUp, label: "Estimates" },
    { id: "config" as NavItem, icon: Sliders, label: "Config" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Hamburger Sidebar Drawer (all screen sizes) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-card border-r border-border z-50 flex flex-col"
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
        {/* Header (all sizes) */}
        <div className="sticky top-0 z-30 bg-card/80 backdrop-blur border-b border-border px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold capitalize">{activeNav.replace("-", " ")}</h1>
              <p className="text-xs text-muted-foreground">Database admin tools</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                queryClient.invalidateQueries();
                toast({ title: "Refreshing…" });
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-card rounded-xl border border-border p-4">
                      <p className="text-xs text-muted-foreground">Total users</p>
                      <p className="text-2xl font-bold">{users.length}</p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-4">
                      <p className="text-xs text-muted-foreground">Active</p>
                      <p className="text-2xl font-bold">{users.filter(u => u.isActive).length}</p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-4">
                      <p className="text-xs text-muted-foreground">Blocked</p>
                      <p className="text-2xl font-bold">{users.filter(u => !u.isActive).length}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-card rounded-xl border border-border p-4 md:col-span-2">
                      <Label className="text-xs text-muted-foreground">Search users</Label>
                      <Input
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by email or display name…"
                        className="mt-2"
                      />
                    </div>
                    <div className="bg-card rounded-xl border border-border p-4">
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Select value={userStatusFilter} onValueChange={(v) => setUserStatusFilter(v as any)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
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
                        {users
                          .filter((u) => {
                            const q = userSearch.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              u.email.toLowerCase().includes(q) ||
                              (u.displayName || "").toLowerCase().includes(q)
                            );
                          })
                          .filter((u) => {
                            if (userStatusFilter === "all") return true;
                            if (userStatusFilter === "active") return !!u.isActive;
                            return !u.isActive;
                          })
                          .map((user) => (
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
                                    setSelectedUserId(user.id);
                                    setUserDetailsDialogOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
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
                </div>
              )}

              {/* Deposits Tab */}
              {activeNav === "deposits" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Deposit Management</h2>
                    <p className="text-muted-foreground">Review and approve deposit requests</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-card rounded-xl border border-border p-4">
                      <p className="text-xs text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{pendingDeposits.length}</p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-4">
                      <p className="text-xs text-muted-foreground">Showing recent</p>
                      <p className="text-2xl font-bold">{Math.min(allDeposits.length, 20)}</p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-4">
                      <p className="text-xs text-muted-foreground">Confirmed (recent)</p>
                      <p className="text-2xl font-bold">{allDeposits.slice(0, 20).filter(d => d.status === "confirmed").length}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="bg-card rounded-xl border border-border p-4 md:col-span-3">
                      <Label className="text-xs text-muted-foreground">Search deposits</Label>
                      <Input
                        value={depositSearch}
                        onChange={(e) => setDepositSearch(e.target.value)}
                        placeholder="Search by user email, currency, network…"
                        className="mt-2"
                      />
                    </div>
                    <div className="bg-card rounded-xl border border-border p-4 md:col-span-2">
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Select value={depositStatusFilter} onValueChange={(v) => setDepositStatusFilter(v as any)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-4 md:col-span-1">
                      <Label className="text-xs text-muted-foreground">Currency</Label>
                      <Select value={depositCurrencyFilter} onValueChange={setDepositCurrencyFilter}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="USDT">USDT</SelectItem>
                          <SelectItem value="BTC">BTC</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="LTC">LTC</SelectItem>
                          <SelectItem value="USDC">USDC</SelectItem>
                          <SelectItem value="BNB">BNB</SelectItem>
                          <SelectItem value="TON">TON</SelectItem>
                          <SelectItem value="ZCASH">ZCASH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={depositStatusFilter === "all" ? "default" : "outline"}
                      onClick={() => setDepositStatusFilter("all")}
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant={depositStatusFilter === "pending" ? "default" : "outline"}
                      onClick={() => setDepositStatusFilter("pending")}
                    >
                      Pending
                    </Button>
                    <Button
                      size="sm"
                      variant={depositStatusFilter === "confirmed" ? "default" : "outline"}
                      onClick={() => setDepositStatusFilter("confirmed")}
                    >
                      Confirmed
                    </Button>
                    <Button
                      size="sm"
                      variant={depositStatusFilter === "rejected" ? "default" : "outline"}
                      onClick={() => setDepositStatusFilter("rejected")}
                    >
                      Rejected
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setDepositSearch("");
                        setDepositStatusFilter("all");
                        setDepositCurrencyFilter("all");
                      }}
                    >
                      Clear
                    </Button>
                  </div>

                  {/* Pending Deposits */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-semibold">Pending Deposits</h3>
                      <Badge variant="secondary">{pendingDeposits.length}</Badge>
                    </div>

                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      {pendingDeposits
                        .filter((d) => {
                          const q = depositSearch.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            (d.userEmail || "").toLowerCase().includes(q) ||
                            (d.currency || "").toLowerCase().includes(q) ||
                            (d.network || "").toLowerCase().includes(q)
                          );
                        })
                        .filter((d) => {
                          if (depositCurrencyFilter === "all") return true;
                          return (d.currency || "").toUpperCase() === depositCurrencyFilter;
                        }).length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>No pending deposits match your filters</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
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
                            {pendingDeposits
                              .filter((d) => {
                                const q = depositSearch.trim().toLowerCase();
                                if (!q) return true;
                                return (
                                  (d.userEmail || "").toLowerCase().includes(q) ||
                                  (d.currency || "").toLowerCase().includes(q) ||
                                  (d.network || "").toLowerCase().includes(q)
                                );
                              })
                              .filter((d) => {
                                if (depositCurrencyFilter === "all") return true;
                                return (d.currency || "").toUpperCase() === depositCurrencyFilter;
                              })
                              .map((deposit) => (
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
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deposit History */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recent Deposits</h3>
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      <div className="overflow-x-auto">
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
                              {allDeposits
                                .slice(0, 20)
                                .filter((d) => {
                                  const q = depositSearch.trim().toLowerCase();
                                  if (!q) return true;
                                  return (
                                    (d.userEmail || "").toLowerCase().includes(q) ||
                                    (d.currency || "").toLowerCase().includes(q) ||
                                    (d.network || "").toLowerCase().includes(q) ||
                                    (d.status || "").toLowerCase().includes(q)
                                  );
                                })
                                .filter((d) => {
                                  if (depositCurrencyFilter === "all") return true;
                                  return (d.currency || "").toUpperCase() === depositCurrencyFilter;
                                })
                                .filter((d) => {
                                  if (depositStatusFilter === "all") return true;
                                  return (d.status || "").toLowerCase() === depositStatusFilter;
                                })
                                .map((deposit) => (
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
                </div>
              )}

              {/* Withdrawals Tab */}
              {activeNav === "withdrawals" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Withdrawal Management</h2>
                      <p className="text-muted-foreground">Review and process withdrawal requests</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals/pending"] })}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>

                  {isLoadingWithdrawals ? (
                    <div className="bg-card rounded-xl border border-border p-8 text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                      <p className="text-muted-foreground">Loading withdrawal requests...</p>
                    </div>
                  ) : pendingWithdrawals && pendingWithdrawals.length > 0 ? (
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Network</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Fee</TableHead>
                            <TableHead>Net Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingWithdrawals.map((withdrawal: any) => (
                            <TableRow key={withdrawal.id}>
                              <TableCell className="text-xs">
                                {new Date(withdrawal.requestedAt).toLocaleString()}
                              </TableCell>
                              <TableCell className="font-medium">{withdrawal.userId}</TableCell>
                              <TableCell className="font-mono">
                                {withdrawal.amount} {withdrawal.symbol}
                              </TableCell>
                              <TableCell className="text-xs">{withdrawal.network}</TableCell>
                              <TableCell className="text-xs font-mono">
                                {withdrawal.toAddress?.substring(0, 10)}...
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {withdrawal.fee} {withdrawal.symbol}
                              </TableCell>
                              <TableCell className="font-mono">
                                {withdrawal.netAmount} {withdrawal.symbol}
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  withdrawal.status === "completed" ? "default" :
                                  withdrawal.status === "pending" ? "secondary" :
                                  "destructive"
                                }>
                                  {withdrawal.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {withdrawal.status === "pending" && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => handleProcessWithdrawal(withdrawal.id, "approve")}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleProcessWithdrawal(withdrawal.id, "reject")}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="bg-card rounded-xl border border-border p-8 text-center">
                      <ArrowUpToLine className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-muted-foreground">No withdrawal requests at this time</p>
                    </div>
                  )}
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

              {/* Estimates Tab */}
              {activeNav === "estimates" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Earnings Estimates</h2>
                    <p className="text-muted-foreground">Controls the "Estimated earnings today" cards in Mining / Invest / Solo pages</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Invest */}
                    <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Invest</p>
                          <p className="text-lg font-bold">Annual APR (%)</p>
                        </div>
                        <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">Editable</Badge>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">APR</Label>
                        <Input value={estimateInvestAprAnnual} onChange={(e) => setEstimateInvestAprAnnual(e.target.value)} />
                        <p className="text-[11px] text-muted-foreground mt-2">
                          Preview: ${((1000 * (Number(estimateInvestAprAnnual || 0) / 100)) / 365).toFixed(2)} / day per $1,000
                        </p>
                      </div>

                      <Button
                        onClick={() =>
                          addConfig.mutate({
                            key: "public_invest_apr_annual_percent",
                            value: String(Number(estimateInvestAprAnnual || 19)),
                            category: "estimates",
                            description: "Public: Invest annual APR percent (used for Estimated earnings today)",
                          })
                        }
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>

                    {/* Mining */}
                    <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Mining</p>
                          <p className="text-lg font-bold">Estimate multiplier</p>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/25">Global</Badge>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Multiplier</Label>
                        <Input value={estimateMiningMultiplier} onChange={(e) => setEstimateMiningMultiplier(e.target.value)} />
                        <p className="text-[11px] text-muted-foreground mt-2">
                          1.0 = normal • 2.0 = double • 0.5 = half
                        </p>
                      </div>

                      <Button
                        onClick={() =>
                          addConfig.mutate({
                            key: "public_mining_estimate_multiplier",
                            value: String(Number(estimateMiningMultiplier || 1)),
                            category: "estimates",
                            description: "Public: Mining estimate multiplier (affects live earnings displays)",
                          })
                        }
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>

                    {/* Solo */}
                    <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Solo</p>
                          <p className="text-lg font-bold">Estimate multiplier</p>
                        </div>
                        <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/25">Global</Badge>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Multiplier</Label>
                        <Input value={estimateSoloMultiplier} onChange={(e) => setEstimateSoloMultiplier(e.target.value)} />
                        <p className="text-[11px] text-muted-foreground mt-2">
                          Multiplies the Solo "Estimated earnings today" display
                        </p>
                      </div>

                      <Button
                        onClick={() =>
                          addConfig.mutate({
                            key: "public_solo_estimate_multiplier",
                            value: String(Number(estimateSoloMultiplier || 1)),
                            category: "estimates",
                            description: "Public: Solo estimate multiplier (affects live earnings displays)",
                          })
                        }
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl border border-border p-4">
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      These settings are used for UI estimates only ("live" counters). They do not change stored wallet balances.
                    </p>
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

      {/* User Details Dialog */}
      <Dialog
        open={userDetailsDialogOpen}
        onOpenChange={(open) => {
          setUserDetailsDialogOpen(open);
          if (!open) setSelectedUserId(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              {selectedUser ? `${selectedUser.email}${selectedUser.displayName ? ` • ${selectedUser.displayName}` : ""}` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">Wallet Balances</p>
                <div className="mt-2 space-y-1">
                  {selectedBalancesList.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No balances</p>
                  ) : (
                    selectedBalancesList
                      .slice()
                      .sort((a, b) => a.symbol.localeCompare(b.symbol))
                      .map((b) => (
                        <div key={b.symbol} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{b.symbol}</span>
                          <span>{Number(b.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 8 })}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">Active Products</p>
                <div className="mt-2 space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Mining:</span> {activeMiningOrders.length}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Earn:</span> {activeEarnOrders.length}
                  </div>
                  {(activeMiningOrders.length > 0 || activeEarnOrders.length > 0) && (
                    <div className="pt-2 space-y-1 text-xs text-muted-foreground">
                      {[...activeMiningOrders, ...activeEarnOrders].slice(0, 4).map((o) => (
                        <div key={o.id} className="truncate">• {o.productName}</div>
                      ))}
                      {[...activeMiningOrders, ...activeEarnOrders].length > 4 && (
                        <div>…and more</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="mt-2 text-2xl font-bold">{totalSpent.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">Sum of recorded orders</p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Mining Purchases</h3>
                <p className="text-xs text-muted-foreground">Active and past mining packages</p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Package</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hashrate</TableHead>
                      <TableHead>Bought</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrders.filter((o) => o.type === "mining_purchase").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No mining purchases found
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedOrders
                        .filter((o) => o.type === "mining_purchase")
                        .slice(0, 50)
                        .map((o) => {
                          const status = o.details?.status || o.status || "—";
                          const bought = o.details?.purchaseDate || o.createdAt;
                          const expires = o.details?.expiryDate;
                          const isExpired = expires ? new Date(expires).getTime() < Date.now() : false;

                          return (
                            <TableRow key={o.id}>
                              <TableCell className="font-medium">{o.productName}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span>{status}</span>
                                  {isExpired && status === "active" ? (
                                    <Badge variant="destructive">Expired</Badge>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell>
                                {o.details?.hashrate ? `${o.details.hashrate} ${o.details.hashrateUnit}` : "—"}
                              </TableCell>
                              <TableCell>{bought ? new Date(bought).toLocaleDateString() : "—"}</TableCell>
                              <TableCell>{expires ? new Date(expires).toLocaleDateString() : "—"}</TableCell>
                              <TableCell className="text-right">
                                {status === "active" ? (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={terminateMiningPurchase.isPending}
                                    onClick={() => openTerminateDialog(o.productId)}
                                  >
                                    Terminate
                                  </Button>
                                ) : (
                                  "—"
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <AlertDialog open={terminateDialogOpen} onOpenChange={setTerminateDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Terminate this purchase?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark the mining purchase as completed and stop it from counting as active.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-3">
                  <Label>Message to user</Label>
                  <RadioGroup
                    value={terminateReasonPreset}
                    onValueChange={(v) => setTerminateReasonPreset(v as any)}
                    className="grid gap-3"
                  >
                    <Label className="flex items-center gap-3 cursor-pointer">
                      <RadioGroupItem value="expired" />
                      <span>Expired</span>
                    </Label>
                    <Label className="flex items-center gap-3 cursor-pointer">
                      <RadioGroupItem value="out_of_stock" />
                      <span>Out of stock</span>
                    </Label>
                    <Label className="flex items-center gap-3 cursor-pointer">
                      <RadioGroupItem value="custom" />
                      <span>Custom message</span>
                    </Label>
                  </RadioGroup>

                  {terminateReasonPreset === "custom" ? (
                    <Textarea
                      value={terminateCustomMessage}
                      onChange={(e) => setTerminateCustomMessage(e.target.value)}
                      placeholder="Write a message the user will see…"
                      rows={3}
                    />
                  ) : null}
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setTerminateDialogOpen(false);
                      setTerminatePurchaseId(null);
                      setTerminateReasonPreset("expired");
                      setTerminateCustomMessage("");
                    }}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (!terminatePurchaseId) return;
                      terminateMiningPurchase.mutate({ purchaseId: terminatePurchaseId, reason: computedTerminateReason });
                    }}
                    disabled={
                      terminateMiningPurchase.isPending ||
                      !terminatePurchaseId ||
                      (terminateReasonPreset === "custom" && computedTerminateReason.length === 0)
                    }
                  >
                    Terminate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Spend / Order History</h3>
                <p className="text-xs text-muted-foreground">Latest orders for this user</p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedOrders.slice(0, 50).map((o) => (
                        <TableRow key={o.id}>
                          <TableCell>
                            {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : (o.details?.purchaseDate ? new Date(o.details.purchaseDate).toLocaleDateString() : "—")}
                          </TableCell>
                          <TableCell className="font-medium">{o.type}</TableCell>
                          <TableCell>{o.productName}</TableCell>
                          <TableCell>
                            {Number(o.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 8 })} {o.currency}
                          </TableCell>
                          <TableCell>{o.status || o.details?.status || "—"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDetailsDialogOpen(false)}>
              Close
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
