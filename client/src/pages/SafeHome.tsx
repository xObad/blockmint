/**
 * Safe Home Screen (Compliance Mode)
 * 
 * This is the main dashboard for Safe Mode - displays as a "Server Management Utility"
 * with NO crypto references, prices, or wallet data.
 * 
 * Shows: System Health, Network Stats, Quick Stats (Latency, CPU Load)
 */

import { motion } from "framer-motion";
import { 
  Server, 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Shield, 
  Clock, 
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Zap,
  Globe,
  BarChart3
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

// Mock network traffic data
const networkTrafficData = [
  { time: "00:00", inbound: 45, outbound: 32 },
  { time: "04:00", inbound: 38, outbound: 28 },
  { time: "08:00", inbound: 62, outbound: 48 },
  { time: "12:00", inbound: 85, outbound: 72 },
  { time: "16:00", inbound: 78, outbound: 65 },
  { time: "20:00", inbound: 56, outbound: 42 },
  { time: "Now", inbound: 68, outbound: 55 },
];

// Mock node status
const nodeStatus = [
  { id: "node-1", name: "Primary Node", region: "US-East", status: "online", cpu: 45, memory: 62, latency: 12 },
  { id: "node-2", name: "Backup Node", region: "US-West", status: "online", cpu: 32, memory: 48, latency: 18 },
  { id: "node-3", name: "EU Gateway", region: "EU-Central", status: "online", cpu: 58, memory: 71, latency: 45 },
  { id: "node-4", name: "Asia Pacific", region: "AP-Tokyo", status: "online", cpu: 28, memory: 39, latency: 89 },
];

// Quick stats data
const quickStats = [
  { label: "Avg Latency", value: "41ms", icon: Zap, color: "text-emerald-400" },
  { label: "CPU Load", value: "41%", icon: Cpu, color: "text-blue-400" },
  { label: "Bandwidth", value: "2.4 Gbps", icon: Globe, color: "text-purple-400" },
  { label: "Requests/s", value: "12.4K", icon: BarChart3, color: "text-amber-400" },
];

export function SafeHome() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-5 pb-24"
    >
      {/* System Health Card - Replaces Total Balance */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <GlassCard className="p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">System Health</h2>
                <p className="text-sm text-muted-foreground">Infrastructure Status</p>
              </div>
            </div>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
              All Systems Online
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-background/50">
              <div className="text-2xl font-bold text-foreground">Online</div>
              <div className="text-xs text-muted-foreground mt-1">Status</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-background/50">
              <div className="text-2xl font-bold text-emerald-400">99.98%</div>
              <div className="text-xs text-muted-foreground mt-1">Uptime</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-background/50">
              <div className="text-2xl font-bold text-foreground">4/4</div>
              <div className="text-xs text-muted-foreground mt-1">Active Nodes</div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick Stats - Replaces Quick Actions (Deposit/Withdraw) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-2"
      >
        {quickStats.map((stat, index) => (
          <GlassCard key={index} className="p-3 text-center" variant="subtle">
            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
            <div className="text-sm font-bold text-foreground">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
          </GlassCard>
        ))}
      </motion.div>

      {/* Network Traffic Graph - Replaces Financial Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Network Traffic</h3>
            </div>
            <Badge variant="outline" className="text-xs">Last 24h</Badge>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={networkTrafficData}>
                <defs>
                  <linearGradient id="inboundGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outboundGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10, fill: '#888' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#888' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val} GB`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`${value} GB`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="inbound" 
                  stroke="#3b82f6" 
                  fill="url(#inboundGradient)"
                  strokeWidth={2}
                  name="Inbound"
                />
                <Area 
                  type="monotone" 
                  dataKey="outbound" 
                  stroke="#10b981" 
                  fill="url(#outboundGradient)"
                  strokeWidth={2}
                  name="Outbound"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-muted-foreground">Inbound</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">Outbound</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Active Nodes List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Server className="w-4 h-4" />
            Active Nodes
          </h3>
          <Badge variant="secondary" className="text-xs">4 Online</Badge>
        </div>

        <div className="space-y-3">
          {nodeStatus.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <GlassCard className="p-4" variant="subtle">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Server className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{node.name}</h4>
                      <p className="text-xs text-muted-foreground">{node.region}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="text-emerald-400 border-emerald-500/30"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {node.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">CPU</span>
                      <span className="font-medium">{node.cpu}%</span>
                    </div>
                    <Progress value={node.cpu} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Memory</span>
                      <span className="font-medium">{node.memory}%</span>
                    </div>
                    <Progress value={node.memory} className="h-1.5" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Latency</div>
                    <div className="text-sm font-semibold text-foreground">{node.latency}ms</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* System Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard className="p-4 border-emerald-500/20" variant="subtle">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="text-sm font-semibold text-foreground">No Active Alerts</h4>
              <p className="text-xs text-muted-foreground">
                All systems operating within normal parameters
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

export default SafeHome;
