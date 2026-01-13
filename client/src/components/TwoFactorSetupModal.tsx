import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Copy, CheckCircle2, Loader2, Smartphone, Key } from "lucide-react";
import { getCurrentUser } from "@/lib/firebase";

interface TwoFactorSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enabled: boolean;
}

export function TwoFactorSetupModal({ open, onOpenChange, enabled }: TwoFactorSetupModalProps) {
  const [step, setStep] = useState<"setup" | "verify" | "disable">(enabled ? "disable" : "setup");
  const [verificationCode, setVerificationCode] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const user = getCurrentUser();
  const userId = user?.uid;

  // Fetch 2FA setup data (secret & QR code)
  const setupMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to setup 2FA");
      return res.json();
    },
  });

  // Verify and enable 2FA
  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to verify 2FA");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/2fa/status"] });
      onOpenChange(false);
      setStep("setup");
      setVerificationCode("");
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Disable 2FA
  const disableMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to disable 2FA");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/2fa/status"] });
      onOpenChange(false);
      setStep("setup");
      setVerificationCode("");
    },
    onError: (error: Error) => {
      toast({
        title: "Disable Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSetup = async () => {
    await setupMutation.mutateAsync();
    setStep("verify");
  };

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

  const handleDisable = () => {
    if (verificationCode.length === 6) {
      disableMutation.mutate(verificationCode);
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, type: "secret" | "code") => {
    navigator.clipboard.writeText(text);
    if (type === "secret") {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
    toast({
      title: "Copied to Clipboard",
      description: `${type === "secret" ? "Secret key" : "Code"} copied successfully`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {/* Setup Step */}
        {step === "setup" && !enabled && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Enable Two-Factor Authentication
              </DialogTitle>
              <DialogDescription>
                Add an extra layer of security to your account with 2FA
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Smartphone className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-medium mb-1">Install an Authenticator App</p>
                  <p className="text-muted-foreground">
                    You'll need an app like Google Authenticator, Authy, or Microsoft Authenticator
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Key className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-medium mb-1">Scan QR Code or Enter Manual Code</p>
                  <p className="text-muted-foreground">
                    Use your authenticator app to scan the QR code or manually enter the secret key
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSetup} disabled={setupMutation.isPending}>
                {setupMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Verify Step */}
        {step === "verify" && setupMutation.data && (
          <>
            <DialogHeader>
              <DialogTitle>Scan QR Code</DialogTitle>
              <DialogDescription>
                Use your authenticator app to scan this QR code
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg">
                  <img
                    src={setupMutation.data.qrCode}
                    alt="2FA QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              {/* Manual Entry */}
              <div>
                <Label className="text-sm text-muted-foreground">
                  Can't scan? Enter this code manually:
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono break-all">
                    {setupMutation.data.secret}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(setupMutation.data.secret, "secret")}
                  >
                    {copiedSecret ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Verification Code Input */}
              <div>
                <Label>Enter 6-digit code from your app</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("setup");
                  setVerificationCode("");
                }}
              >
                Back
              </Button>
              <Button
                onClick={handleVerify}
                disabled={verificationCode.length !== 6 || verifyMutation.isPending}
              >
                {verifyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Enable"
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Disable Step */}
        {step === "disable" && enabled && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-destructive" />
                Disable Two-Factor Authentication
              </DialogTitle>
              <DialogDescription>
                Enter a code from your authenticator app to confirm
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Warning: Disabling 2FA will make your account less secure
                </p>
              </div>

              <div>
                <Label>Enter 6-digit code from your app</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisable}
                disabled={verificationCode.length !== 6 || disableMutation.isPending}
              >
                {disableMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  "Disable 2FA"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
