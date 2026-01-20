/**
 * Safe Metrics Screen (Compliance Mode)
 * 
 * Displays technical server metrics with NO financial data.
 * STRICTLY NO "$", "ROI", "Profit", or "Earnings" text.
 * 
 * Shows: Server Temperature, Memory Usage, CPU Performance
 * Includes "Request New Node" provisioning flow
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Thermometer, 
  HardDrive, 
  Cpu, 
  Activity,
  Server,
  Plus,
  CheckCircle2,
  Clock,
  Gauge,
  Database,
  Network,
  Shield,
  X
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
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
  AreaChart,
  Area,
} from "recharts";

// Mock temperature data (24h)
const temperatureData = [
  { time: "00:00", temp: 42 },
  { time: "04:00", temp: 38 },
  { time: "08:00", temp: 45 },
  { time: "12:00", temp: 52 },
  { time: "16:00", temp: 48 },
  { time: "20:00", temp: 44 },
  { time: "Now", temp: 46 },
];

// Mock memory usage data (24h)
const memoryData = [
  { time: "00:00", usage: 62 },
  { time: "04:00", usage: 58 },
  { time: "08:00", usage: 71 },
  { time: "12:00", usage: 78 },
  { time: "16:00", usage: 75 },
  { time: "20:00", usage: 68 },
  { time: "Now", temp: 72 },
];

// Mock CPU performance data
const cpuData = [
  { time: "00:00", load: 32 },
  { time: "04:00", load: 28 },
  { time: "08:00", load: 45 },
  { time: "12:00", load: 58 },
  { time: "16:00", load: 52 },
  { time: "20:00", load: 41 },
  { time: "Now", load: 47 },
];

// Server specs for provisioning (NO PRICES)
const serverSpecs = [
  {
    id: "standard",
    name: "Standard Compute",
    specs: "8 vCPUs • 16 GB RAM • 100 GB NVMe",
    availability: "In Stock",
    badge: null,
  },
  {
    id: "performance",
    name: "Performance Compute",
    specs: "16 vCPUs • 32 GB RAM • 250 GB NVMe",
    availability: "In Stock",
    badge: "Popular",
  },
  {
    id: "enterprise",
    name: "Enterprise Blade",
    specs: "32 vCPUs • 64 GB RAM • 500 GB NVMe",
    availability: "In Stock",
    badge: null,
  },
  {
    id: "dedicated",
    name: "Dedicated Server",
    specs: "64 vCPUs • 128 GB RAM • 1 TB NVMe",
    availability: "Limited",
    badge: "Enterprise",
  },
];

// Current metrics summary
const currentMetrics = [
  { label: "Avg Temperature", value: "46°C", icon: Thermometer, status: "normal" },
  { label: "Memory Usage", value: "72%", icon: HardDrive, status: "normal" },
  { label: "CPU Load", value: "47%", icon: Cpu, status: "normal" },
  { label: "Disk I/O", value: "1.2 GB/s", icon: Database, status: "normal" },
];

export function SafeMetrics() {
  const [showProvisioning, setShowProvisioning] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  const handleRequestAllocation = () => {
    if (selectedSpec) {
      setRequestSent(true);
      // Auto-close after 3 seconds
      setTimeout(() => {
        setShowProvisioning(false);
        setRequestSent(false);
        setSelectedSpec(null);
      }, 3000);
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
            <h1 className="text-2xl font-bold text-foreground">Metrics</h1>
            <p className="text-sm text-muted-foreground">Server Performance Analytics</p>
          </div>
          <Button 
            onClick={() => setShowProvisioning(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Request Node
          </Button>
        </div>
      </motion.div>

      {/* Current Metrics Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        {currentMetrics.map((metric, index) => (
          <GlassCard key={index} className="p-4" variant="subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <metric.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{metric.value}</div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </motion.div>

      {/* Temperature Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-orange-400" />
              <h3 className="font-semibold text-foreground">Server Temperature (°C)</h3>
            </div>
            <Badge 
              variant="outline" 
              className="text-emerald-400 border-emerald-500/30"
            >
              Normal
            </Badge>
          </div>

          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={temperatureData}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
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
                  domain={[30, 60]}
                  tick={{ fontSize: 10, fill: '#888' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}°`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`${value}°C`, 'Temperature']}
                />
                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#f97316" 
                  fill="url(#tempGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      {/* Memory Usage Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-foreground">Memory Usage (%)</h3>
            </div>
            <Badge 
              variant="outline" 
              className="text-emerald-400 border-emerald-500/30"
            >
              Optimal
            </Badge>
          </div>

          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memoryData}>
                <defs>
                  <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
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
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#888' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Memory']}
                />
                <Area 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="#a855f7" 
                  fill="url(#memoryGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      {/* CPU Load Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-foreground">CPU Performance (%)</h3>
            </div>
            <Badge 
              variant="outline" 
              className="text-emerald-400 border-emerald-500/30"
            >
              Healthy
            </Badge>
          </div>

          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuData}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#888' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`${value}%`, 'CPU Load']}
                />
                <Area 
                  type="monotone" 
                  dataKey="load" 
                  stroke="#3b82f6" 
                  fill="url(#cpuGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      {/* Provisioning Modal */}
      <AnimatePresence>
        {showProvisioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => !requestSent && setShowProvisioning(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-lg bg-background rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {!requestSent ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Request New Node</h2>
                      <p className="text-sm text-muted-foreground">Select a server configuration</p>
                    </div>
                    <button 
                      onClick={() => setShowProvisioning(false)}
                      className="p-2 rounded-full hover:bg-muted"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    {serverSpecs.map((spec) => (
                      <GlassCard
                        key={spec.id}
                        className={`p-4 cursor-pointer transition-all ${
                          selectedSpec === spec.id 
                            ? 'ring-2 ring-primary bg-primary/10' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedSpec(spec.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                              <Server className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-foreground">{spec.name}</h4>
                                {spec.badge && (
                                  <Badge variant="secondary" className="text-xs">{spec.badge}</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{spec.specs}</p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={spec.availability === "In Stock" 
                              ? "text-emerald-400 border-emerald-500/30" 
                              : "text-amber-400 border-amber-500/30"
                            }
                          >
                            {spec.availability}
                          </Badge>
                        </div>
                      </GlassCard>
                    ))}
                  </div>

                  <Button 
                    className="w-full h-12"
                    disabled={!selectedSpec}
                    onClick={handleRequestAllocation}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Request Allocation
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Allocation requests are reviewed by administrators
                  </p>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Request Submitted</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your request has been sent to our team for review.
                  </p>
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-left mb-4">
                    <p className="text-xs text-cyan-400">
                      💡 If you have sufficient balance in your account, the node will be launched manually by our team.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Typical response time: 10-30 minutes</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default SafeMetrics;
