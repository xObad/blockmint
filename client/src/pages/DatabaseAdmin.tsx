import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  Lock,
  Database,
  DollarSign,
  Bell,
  Settings,
  Users,
  ArrowDownToLine,
  Eye,
  AlertTriangle,
} from "lucide-react";

// Admin password - in production, this should be environment variable
const ADMIN_PASSWORD = "MiningClub2024!";

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
}

interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

interface AppConfig {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  isActive: boolean;
}

export function DatabaseAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"deposits" | "users" | "config" | "notifications">("deposits");
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [newConfigKey, setNewConfigKey] = useState("");
  const [newConfigValue, setNewConfigValue] = useState("");
  const [newConfigCategory, setNewConfigCategory] = useState("wallet");
  const [newConfigDescription, setNewConfigDescription] = useState("");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if already authenticated from session
  useEffect(() => {
    const auth = sessionStorage.getItem("dbAdminAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("dbAdminAuth", "true");
      toast({ title: "Authenticated", description: "Welcome to the database admin panel." });
    } else {
      toast({ title: "Invalid Password", description: "Please try again.", variant: "destructive" });
    }
  };

  // Fetch pending deposits
  const { data: pendingDeposits = [], isLoading: loadingDeposits, refetch: refetchDeposits } = useQuery({
    queryKey: ["/api/admin/deposits/pending"],
    queryFn: async () => {
      const res = await fetch("/api/admin/deposits/pending");
      if (!res.ok) throw new Error("Failed to fetch deposits");
      return res.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Fetch all deposits
  const { data: allDeposits = [], isLoading: loadingAllDeposits } = useQuery({
    queryKey: ["/api/admin/deposits/all"],
    queryFn: async () => {
      const res = await fetch("/api/admin/deposits/all");
      if (!res.ok) throw new Error("Failed to fetch all deposits");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch users
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    enabled: isAuthenticated && activeTab === "users",
  });

  // Fetch config
  const { data: configs = [], isLoading: loadingConfig, refetch: refetchConfig } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const res = await fetch("/api/admin/config");
      if (!res.ok) throw new Error("Failed to fetch config");
      return res.json();
    },
    enabled: isAuthenticated && activeTab === "config",
  });

  // Confirm deposit mutation
  const confirmDepositMutation = useMutation({
    mutationFn: async (depositId: string) => {
      const res = await fetch(`/api/admin/deposits/${depositId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to confirm deposit");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits/all"] });
      toast({ title: "Deposit Confirmed", description: "User balance has been credited." });
      setConfirmDialogOpen(false);
      setSelectedDeposit(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Reject deposit mutation
  const rejectDepositMutation = useMutation({
    mutationFn: async ({ depositId, reason }: { depositId: string; reason: string }) => {
      const res = await fetch(`/api/admin/deposits/${depositId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reject deposit");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits/all"] });
      toast({ title: "Deposit Rejected", description: "User has been notified." });
      setRejectDialogOpen(false);
      setSelectedDeposit(null);
      setRejectionReason("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Add config mutation
  const addConfigMutation = useMutation({
    mutationFn: async (data: { key: string; value: string; category: string; description: string }) => {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add config");
      }
      return res.json();
    },
    onSuccess: () => {
      refetchConfig();
      toast({ title: "Config Added", description: "New configuration has been saved." });
      setNewConfigKey("");
      setNewConfigValue("");
      setNewConfigDescription("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Broadcast notification mutation
  const broadcastMutation = useMutation({
    mutationFn: async (data: { title: string; message: string }) => {
      const res = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send broadcast");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Broadcast Sent", description: `Notification sent to ${data.count} users.` });
      setBroadcastTitle("");
      setBroadcastMessage("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold">Database Admin</h1>
                <p className="text-sm text-muted-foreground">Enter password to continue</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Enter password"
                  className="liquid-glass border-white/10"
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                <Database className="w-4 h-4 mr-2" />
                Access Admin Panel
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Database className="w-6 h-6 text-primary" />
              Database Admin
            </h1>
            <p className="text-sm text-muted-foreground">Manage deposits, users, and app configuration</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400">
              {pendingDeposits.length} Pending
            </Badge>
            <Button variant="outline" size="sm" onClick={() => refetchDeposits()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                sessionStorage.removeItem("dbAdminAuth");
                setIsAuthenticated(false);
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-2">
          <Button
            variant={activeTab === "deposits" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("deposits")}
          >
            <ArrowDownToLine className="w-4 h-4 mr-2" />
            Deposits
            {pendingDeposits.length > 0 && (
              <Badge className="ml-2 bg-amber-500">{pendingDeposits.length}</Badge>
            )}
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("users")}
          >
            <Users className="w-4 h-4 mr-2" />
            Users
          </Button>
          <Button
            variant={activeTab === "config" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("config")}
          >
            <Settings className="w-4 h-4 mr-2" />
            Config
          </Button>
          <Button
            variant={activeTab === "notifications" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("notifications")}
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
        </div>

        {/* Deposits Tab */}
        {activeTab === "deposits" && (
          <div className="space-y-6">
            {/* Pending Deposits */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Pending Deposits
                </h2>
              </div>
              
              {loadingDeposits ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : pendingDeposits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-400/50" />
                  <p>No pending deposits</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Network</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingDeposits.map((deposit: DepositRequest) => (
                        <TableRow key={deposit.id}>
                          <TableCell className="font-mono text-xs">{deposit.userId.slice(0, 12)}...</TableCell>
                          <TableCell className="font-semibold">{deposit.amount} {deposit.currency}</TableCell>
                          <TableCell>{deposit.network}</TableCell>
                          <TableCell className="text-xs">{formatDate(deposit.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/30"
                                onClick={() => {
                                  setSelectedDeposit(deposit);
                                  setConfirmDialogOpen(true);
                                }}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
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
            </GlassCard>

            {/* All Deposits History */}
            <GlassCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Deposit History
              </h2>
              
              {loadingAllDeposits ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Network</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allDeposits.slice(0, 20).map((deposit: DepositRequest) => (
                        <TableRow key={deposit.id}>
                          <TableCell className="font-mono text-xs">{deposit.userId.slice(0, 12)}...</TableCell>
                          <TableCell className="font-semibold">{deposit.amount} {deposit.currency}</TableCell>
                          <TableCell>{deposit.network}</TableCell>
                          <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                          <TableCell className="text-xs">{formatDate(deposit.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <GlassCard>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              All Users
            </h2>
            
            {loadingUsers ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">{user.id.slice(0, 12)}...</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.displayName || "-"}</TableCell>
                        <TableCell className="text-xs">{formatDate(user.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
        )}

        {/* Config Tab */}
        {activeTab === "config" && (
          <div className="space-y-6">
            {/* Add New Config */}
            <GlassCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Add Wallet Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Key (e.g., wallet_btc_native)</Label>
                  <Input
                    value={newConfigKey}
                    onChange={(e) => setNewConfigKey(e.target.value)}
                    placeholder="wallet_btc_native"
                    className="liquid-glass border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Value (wallet address)</Label>
                  <Input
                    value={newConfigValue}
                    onChange={(e) => setNewConfigValue(e.target.value)}
                    placeholder="bc1q..."
                    className="liquid-glass border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newConfigCategory} onValueChange={setNewConfigCategory}>
                    <SelectTrigger className="liquid-glass border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wallet">Wallet</SelectItem>
                      <SelectItem value="pricing">Pricing</SelectItem>
                      <SelectItem value="settings">Settings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newConfigDescription}
                    onChange={(e) => setNewConfigDescription(e.target.value)}
                    placeholder="Bitcoin Native deposit address"
                    className="liquid-glass border-white/10"
                  />
                </div>
              </div>
              <Button
                className="mt-4"
                onClick={() => addConfigMutation.mutate({
                  key: newConfigKey,
                  value: newConfigValue,
                  category: newConfigCategory,
                  description: newConfigDescription,
                })}
                disabled={!newConfigKey || !newConfigValue || addConfigMutation.isPending}
              >
                Add Configuration
              </Button>
            </GlassCard>

            {/* Existing Config */}
            <GlassCard>
              <h2 className="text-lg font-semibold mb-4">Current Configuration</h2>
              {loadingConfig ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : configs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No configuration entries yet. Add wallet addresses above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {configs.map((config: AppConfig) => (
                        <TableRow key={config.id}>
                          <TableCell className="font-mono text-xs">{config.key}</TableCell>
                          <TableCell className="font-mono text-xs max-w-xs truncate">{config.value}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{config.category}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{config.description}</TableCell>
                          <TableCell>
                            {config.isActive ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <GlassCard>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Send Broadcast Notification
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="Announcement title"
                  className="liquid-glass border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Input
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Your message to all users..."
                  className="liquid-glass border-white/10"
                />
              </div>
              <Button
                onClick={() => broadcastMutation.mutate({ title: broadcastTitle, message: broadcastMessage })}
                disabled={!broadcastTitle || !broadcastMessage || broadcastMutation.isPending}
              >
                <Bell className="w-4 h-4 mr-2" />
                Send to All Users
              </Button>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Confirm Deposit
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to confirm this deposit? This will credit the user's balance.
            </DialogDescription>
          </DialogHeader>
          {selectedDeposit && (
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <p><strong>Amount:</strong> {selectedDeposit.amount} {selectedDeposit.currency}</p>
              <p><strong>Network:</strong> {selectedDeposit.network}</p>
              <p><strong>User ID:</strong> {selectedDeposit.userId}</p>
              <p className="text-xs text-muted-foreground"><strong>Wallet:</strong> {selectedDeposit.walletAddress}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => selectedDeposit && confirmDepositMutation.mutate(selectedDeposit.id)}
              disabled={confirmDepositMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {confirmDepositMutation.isPending ? "Processing..." : "Confirm & Credit Balance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Reject Deposit
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. The user will be notified.
            </DialogDescription>
          </DialogHeader>
          {selectedDeposit && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p><strong>Amount:</strong> {selectedDeposit.amount} {selectedDeposit.currency}</p>
                <p><strong>User ID:</strong> {selectedDeposit.userId}</p>
              </div>
              <div className="space-y-2">
                <Label>Rejection Reason</Label>
                <Input
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Transaction not found on blockchain"
                  className="liquid-glass border-white/10"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => selectedDeposit && rejectDepositMutation.mutate({
                depositId: selectedDeposit.id,
                reason: rejectionReason,
              })}
              disabled={!rejectionReason || rejectDepositMutation.isPending}
              variant="destructive"
            >
              {rejectDepositMutation.isPending ? "Processing..." : "Reject Deposit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DatabaseAdmin;
