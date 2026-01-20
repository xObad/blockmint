/**
 * Storefront Home - Cloud Node Dashboard
 * 
 * Main dashboard for the web storefront that shows:
 * - Active nodes/servers
 * - Node performance metrics
 * - Quick actions (add node, recharge balance)
 * - Uses server/infrastructure terminology (NO crypto mining references)
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Server,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Plus,
  CreditCard,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import type { User } from "firebase/auth";

interface StorefrontHomeProps {
  user: User | null;
  onNavigateToBalance: () => void;
}

// Mock data for nodes (in production, this would come from API)
const mockNodes = [
  {
    id: 1,
    name: "Node Alpha",
    region: "US East",
    status: "running",
    uptime: "99.9%",
    cpu: 45,
    memory: 62,
    storage: 38,
  },
  {
    id: 2,
    name: "Node Beta",
    region: "EU West",
    status: "running",
    uptime: "99.7%",
    cpu: 32,
    memory: 48,
    storage: 55,
  },
];

const nodeTypes = [
  {
    id: "basic",
    name: "Basic Node",
    description: "Entry-level compute power",
    specs: "2 vCPU • 4GB RAM • 50GB SSD",
    price: "$29.99/month",
    popular: false,
  },
  {
    id: "standard",
    name: "Standard Node",
    description: "Balanced performance",
    specs: "4 vCPU • 8GB RAM • 100GB SSD",
    price: "$59.99/month",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium Node",
    description: "High-performance computing",
    specs: "8 vCPU • 16GB RAM • 200GB SSD",
    price: "$119.99/month",
    popular: false,
  },
  {
    id: "enterprise",
    name: "Enterprise Node",
    description: "Maximum computational capacity",
    specs: "16 vCPU • 32GB RAM • 500GB SSD",
    price: "$249.99/month",
    popular: false,
  },
];

export function StorefrontHome({ user, onNavigateToBalance }: StorefrontHomeProps) {
  const [showAddNode, setShowAddNode] = useState(false);

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ["/api/user", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      const res = await fetch(`/api/user/firebase/${user.uid}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user?.uid,
  });

  // Fetch balance
  const { data: balanceData } = useQuery({
    queryKey: ["/api/user/balance", userData?.id],
    queryFn: async () => {
      if (!userData?.id) return { balances: [] };
      const res = await fetch(`/api/wallet/balances/${userData.id}`);
      if (!res.ok) return { balances: [] };
      return res.json();
    },
    enabled: !!userData?.id,
  });

  const usdtBalance = balanceData?.balances?.find((b: any) => b.symbol === "USDT")?.balance || 0;

  return (
    <div className="p-4 lg:p-0 space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Welcome, {user?.displayName?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your cloud infrastructure
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          icon={Server}
          label="Active Nodes"
          value="2"
          change="+1 this month"
          positive
        />
        <StatCard
          icon={Activity}
          label="Uptime"
          value="99.8%"
          change="Last 30 days"
        />
        <StatCard
          icon={Zap}
          label="Performance"
          value="Optimal"
          change="All systems normal"
          positive
        />
        <StatCard
          icon={CreditCard}
          label="Balance"
          value={`$${usdtBalance.toFixed(2)}`}
          change="USDT"
          onClick={onNavigateToBalance}
          clickable
        />
      </motion.div>

      {/* Active Nodes */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Your Nodes</h2>
          <Button
            size="sm"
            onClick={() => setShowAddNode(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Node
          </Button>
        </div>

        {mockNodes.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {mockNodes.map((node, index) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <NodeCard node={node} />
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard className="p-8 text-center">
            <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No Active Nodes</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Get started by deploying your first cloud node
            </p>
            <Button onClick={() => setShowAddNode(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Deploy Your First Node
            </Button>
          </GlassCard>
        )}
      </motion.div>

      {/* Node Plans */}
      {showAddNode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Choose a Node Plan</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddNode(false)}
            >
              Cancel
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {nodeTypes.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <NodePlanCard 
                  plan={plan} 
                  onSelect={() => onNavigateToBalance()}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
        <GlassCard className="divide-y divide-border">
          <ActivityItem
            icon={CheckCircle2}
            iconColor="text-emerald-400"
            title="Node Alpha - Health Check Passed"
            time="2 minutes ago"
          />
          <ActivityItem
            icon={Activity}
            iconColor="text-blue-400"
            title="Node Beta - Performance Optimized"
            time="1 hour ago"
          />
          <ActivityItem
            icon={CreditCard}
            iconColor="text-amber-400"
            title="Balance Recharged - $100.00"
            time="Yesterday"
          />
          <ActivityItem
            icon={Server}
            iconColor="text-purple-400"
            title="Node Alpha - Deployed Successfully"
            time="3 days ago"
          />
        </GlassCard>
      </motion.div>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  positive,
  onClick,
  clickable
}: { 
  icon: any; 
  label: string; 
  value: string; 
  change: string;
  positive?: boolean;
  onClick?: () => void;
  clickable?: boolean;
}) {
  return (
    <GlassCard 
      className={`p-4 ${clickable ? 'cursor-pointer hover:bg-white/10 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {clickable && <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      <p className={`text-xs mt-1 ${positive ? 'text-emerald-400' : 'text-muted-foreground'}`}>
        {change}
      </p>
    </GlassCard>
  );
}

// Node Card Component
function NodeCard({ node }: { node: typeof mockNodes[0] }) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Server className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{node.name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="w-3 h-3" />
              {node.region}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 capitalize">{node.status}</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <MetricBar label="CPU" value={node.cpu} />
        <MetricBar label="Memory" value={node.memory} />
        <MetricBar label="Storage" value={node.storage} />
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          Uptime: {node.uptime}
        </div>
        <Button variant="ghost" size="sm" className="text-xs">
          Manage
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </GlassCard>
  );
}

// Metric Bar Component
function MetricBar({ label, value }: { label: string; value: number }) {
  const getColor = (v: number) => {
    if (v < 50) return 'bg-emerald-500';
    if (v < 80) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor(value)} rounded-full transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// Node Plan Card
function NodePlanCard({ 
  plan, 
  onSelect 
}: { 
  plan: typeof nodeTypes[0];
  onSelect: () => void;
}) {
  return (
    <GlassCard className={`p-4 relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-0.5 rounded-full font-medium">
          Popular
        </div>
      )}
      <h3 className="font-semibold text-foreground mb-1">{plan.name}</h3>
      <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
      <p className="text-sm text-muted-foreground mb-3">{plan.specs}</p>
      <p className="text-xl font-bold text-primary mb-4">{plan.price}</p>
      <Button 
        className="w-full" 
        variant={plan.popular ? "default" : "outline"}
        onClick={onSelect}
      >
        Select Plan
      </Button>
    </GlassCard>
  );
}

// Activity Item
function ActivityItem({ 
  icon: Icon, 
  iconColor, 
  title, 
  time 
}: { 
  icon: any; 
  iconColor: string; 
  title: string; 
  time: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

export default StorefrontHome;
