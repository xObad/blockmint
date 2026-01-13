import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, Copy, CheckCircle2, Mail } from "lucide-react";

interface TwoFactorLoginModalProps {
  open: boolean;
  userId: string; // Firebase UID
  onSuccess: () => void;
  onCancel: () => void;
}

export function TwoFactorLoginModal({ open, userId, onSuccess, onCancel }: TwoFactorLoginModalProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && verificationCode.length === 6) {
      handleVerify();
    }
  };

  const copyToClipboard = async () => {
    const text = await navigator.clipboard.readText();
    if (text && /^\d{6}$/.test(text)) {
      setVerificationCode(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md border-2 border-blue-500/30 bg-gradient-to-br from-background via-background to-blue-950/10 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Verify Your Identity
            </DialogTitle>
            <DialogDescription className="text-center">
              Enter the 6-digit code from your authenticator app to continue
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Verification Code Input */}
            <div className="space-y-2">
              <Label htmlFor="2fa-code" className="text-sm font-medium">
                Authentication Code
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="2fa-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setVerificationCode(val);
                    // Auto-submit when 6 digits entered
                    if (val.length === 6) {
                      setTimeout(() => {
                        if (val.length === 6) {
                          verifyMutation.mutate(val);
                        }
                      }, 300);
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest font-mono"
                  disabled={verifyMutation.isPending}
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="shrink-0"
                  title="Paste code from clipboard"
                >
                  {copiedCode ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {verificationCode.length}/6 digits
              </p>
            </div>

            {/* Loading State */}
            {verifyMutation.isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 text-sm text-blue-500"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying code...
              </motion.div>
            )}

            {/* Support Link */}
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
              <p className="text-sm text-amber-900 dark:text-amber-200 mb-2">
                Lost access to your authenticator?
              </p>
              <a
                href="mailto:support@blockmint.io?subject=Reset%20My%20Two-Auth&body=I%20need%20help%20resetting%20my%20two-factor%20authentication%20for%20my%20BlockMint%20account."
                className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Contact Support
              </a>
            </div>

            {/* Verify Button */}
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
              onClick={onCancel}
              disabled={verifyMutation.isPending}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
