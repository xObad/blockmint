import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowDownToLine, ArrowUpRight, Pickaxe, Repeat, ShoppingBag, Gift, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Transaction } from "@/lib/types";

interface TransactionItemProps {
  transaction: Transaction;
  index: number;
}

export function TransactionItem({ transaction, index }: TransactionItemProps) {
  const { format } = useCurrency();
  
  const type = transaction.type as string;
  
  const getIcon = () => {
    switch (type) {
      case 'earned': return Pickaxe;
      case 'withdrawn': 
      case 'withdrawal': return ArrowUpRight;
      case 'received': return ArrowDownLeft;
      case 'deposit': return ArrowDownToLine;
      case 'exchange': return Repeat;
      case 'purchase': return ShoppingBag;
      case 'promotion': return Gift;
      case 'balance': return Wallet;
      default: return ArrowDownLeft;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'earned': 
      case 'deposit':
      case 'balance': return "from-emerald-500/20 to-green-500/10 text-emerald-400";
      case 'withdrawn':
      case 'withdrawal':
      case 'purchase': return "from-orange-500/20 to-amber-500/10 text-orange-400";
      case 'received': return "from-blue-500/20 to-indigo-500/10 text-blue-400";
      case 'exchange': return "from-purple-500/20 to-fuchsia-500/10 text-purple-400";
      case 'promotion': return "from-pink-500/20 to-rose-500/10 text-pink-400";
      default: return "from-slate-500/20 to-gray-500/10 text-slate-400";
    }
  };

  const getLabel = () => {
    // For earned transactions, use description if available
    if (type === 'earned' && transaction.description) {
      return transaction.description;
    }
    switch (type) {
      case 'earned': return "Daily Yield";
      case 'withdrawn': 
      case 'withdrawal': return "Withdrawal";
      case 'received': return "Received";
      case 'deposit': return "Deposit";
      case 'exchange': return "Exchange";
      case 'purchase': return "Purchase";
      case 'promotion': return "Promotion";
      case 'balance': return "Balance Adjustment";
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const Icon = getIcon();
  const colorClass = getColor();
  const label = getLabel();

  const getDate = () => {
    const rawDate = transaction.createdAt || transaction.timestamp;
    if (!rawDate) return new Date();
    return new Date(rawDate);
  };
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isPositive = ['earned', 'received', 'deposit', 'promotion', 'balance'].includes(type);
  const symbol = transaction.symbol || transaction.currency || "USD";
  const amount = transaction.amount;
  const usdVal = transaction.usdValue || 0; 

  return (
    <motion.div
      data-testid={`transaction-${transaction.id}`}
      className={cn(
        "flex items-center gap-4 py-3",
        "border-b border-white/[0.04] last:border-0"
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl",
          "flex items-center justify-center",
          "bg-gradient-to-br",
          colorClass
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground">{label}</h4>
        <div className="flex items-center gap-2">
           <p className="text-sm text-muted-foreground">{formatDate(getDate())}</p>
           {transaction.status && (
             <span className={cn(
               "text-[10px] px-1.5 py-0.5 rounded-full capitalize",
                transaction.status === 'completed' || transaction.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-400" :
                transaction.status === 'pending' ? "bg-yellow-500/10 text-yellow-400" :
                "bg-red-500/10 text-red-400"
             )}>
               {transaction.status}
             </span>
           )}
        </div>
      </div>

      <div className="text-right">
        <p className={cn(
          "font-medium",
          isPositive ? "text-emerald-400" : "text-foreground"
        )}>
          {!isPositive && "-"}{isPositive && "+"}{amount.toFixed(2)} {symbol}
        </p>
        
        {usdVal > 0 ? (
          <p className="text-sm text-muted-foreground">
            {format(usdVal)}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground opacity-0">
            -
          </p>
        )}
      </div>
    </motion.div>
  );
}
