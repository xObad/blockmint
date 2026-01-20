import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, Mail } from "lucide-react";

interface TwoFactorPageProps {
  userId: string;
  onSuccess: () => void;
  onLogout: () => void;
}

export function TwoFactorPage({ userId, onSuccess, onLogout }: TwoFactorPageProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const { toast } = useToast();

  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch("/api/auth/2fa/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token }),
      });
      if (!res.ok) throw new Error("Invalid 2FA code");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "2FA verification completed",
      });
      setVerificationCode("");
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Invalid Code",
        description: "Please check your code and try again",
        variant: "destructive",
      });
      setVerificationCode("");
    },
  });

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      verifyMutation.mutate(verificationCode);
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-background dark:to-blue-950/30 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-background rounded-2xl shadow-xl p-8 border border-blue-200 dark:border-blue-900/30"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1 text-center">Two-Factor Authentication</h1>
          <p className="text-sm text-muted-foreground text-center">Enter the 6-digit code from your authenticator app to continue</p>
        </div>
        <div className="space-y-4">
          <Label htmlFor="2fa-code" className="text-sm font-medium">Authentication Code</Label>
          <Input
            id="2fa-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="text-center text-2xl tracking-widest font-mono"
            disabled={verifyMutation.isPending}
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
          />
          <Button
            onClick={handleVerify}
            disabled={verificationCode.length !== 6 || verifyMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {verifyMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Continue"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onLogout}
            disabled={verifyMutation.isPending}
            className="w-full"
          >
            Log Out
          </Button>
        </div>
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 mt-6">
          <p className="text-sm text-amber-900 dark:text-amber-200 mb-2">Lost access to your authenticator?</p>
          <a
            href="mailto:support@blockmint.io?subject=Reset%20My%20Two-Auth&body=I%20need%20help%20resetting%20my%20two-factor%20authentication%20for%20my%20BlockMint%20account."
            className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Contact Support
          </a>
        </div>
      </motion.div>
    </div>
  );
}
