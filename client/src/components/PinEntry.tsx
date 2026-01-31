import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, ScanFace, Delete, Lock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface PinEntryProps {
  mode: "setup" | "verify" | "confirm";
  onSuccess: (pin: string) => void;
  onCancel?: () => void;
  onBiometricRequest?: () => Promise<boolean>;
  biometricType?: "face" | "fingerprint" | "none";
  title?: string;
  subtitle?: string;
  storedPinHash?: string;
}

export function PinEntry({
  mode,
  onSuccess,
  onCancel,
  onBiometricRequest,
  biometricType = "none",
  title,
  subtitle,
}: PinEntryProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const PIN_LENGTH = 6;

  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  const handleNumberPress = useCallback((num: string) => {
    triggerHaptic();
    setError("");
    
    if (mode === "setup" && isConfirming) {
      if (confirmPin.length < PIN_LENGTH) {
        const newConfirm = confirmPin + num;
        setConfirmPin(newConfirm);
        
        if (newConfirm.length === PIN_LENGTH) {
          if (newConfirm === pin) {
            onSuccess(pin);
          } else {
            setShake(true);
            setError("PINs don't match. Try again.");
            setTimeout(() => {
              setConfirmPin("");
              setShake(false);
            }, 500);
          }
        }
      }
    } else {
      if (pin.length < PIN_LENGTH) {
        const newPin = pin + num;
        setPin(newPin);
        
        if (mode === "setup" && newPin.length === PIN_LENGTH) {
          setTimeout(() => setIsConfirming(true), 300);
        } else if (mode === "verify" && newPin.length === PIN_LENGTH) {
          onSuccess(newPin);
        }
      }
    }
  }, [pin, confirmPin, mode, isConfirming, onSuccess, triggerHaptic]);

  const handleDelete = useCallback(() => {
    triggerHaptic();
    if (mode === "setup" && isConfirming) {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
    setError("");
  }, [mode, isConfirming, triggerHaptic]);

  const handleBiometric = async () => {
    if (onBiometricRequest) {
      triggerHaptic();
      console.log('[PinEntry] Biometric button pressed, calling onBiometricRequest...');
      const success = await onBiometricRequest();
      console.log('[PinEntry] Biometric request result:', success);
      if (success) {
        onSuccess("biometric");
      }
    }
  };

  // Reset if error is set from parent
  useEffect(() => {
    if (error) {
      setShake(true);
      setTimeout(() => {
        setPin("");
        setShake(false);
      }, 500);
    }
  }, [error]);

  const currentPin = (mode === "setup" && isConfirming) ? confirmPin : pin;
  const defaultTitle = mode === "setup" 
    ? (isConfirming ? "Confirm PIN" : "Create PIN")
    : "Enter PIN";
  const defaultSubtitle = mode === "setup"
    ? (isConfirming ? "Enter your PIN again to confirm" : "Choose a 6-digit PIN code")
    : "Enter your PIN to unlock";

  const BiometricIcon = biometricType === "face" ? ScanFace : Fingerprint;

  const numberKeys = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center bg-background",
        mode === "setup" ? "justify-start pt-[15vh]" : "justify-center"
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-8">
        {/* Header */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30"
        >
          {mode === "setup" ? (
            <Shield className="w-10 h-10 text-white" />
          ) : (
            <Lock className="w-10 h-10 text-white" />
          )}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-foreground mb-1"
        >
          {title || defaultTitle}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-sm text-muted-foreground mb-8 text-center"
        >
          {subtitle || defaultSubtitle}
        </motion.p>

        {/* PIN Dots */}
        <motion.div 
          className="flex gap-4 mb-6"
          animate={shake ? { x: [-12, 12, -12, 12, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-200",
                i < currentPin.length
                  ? "bg-primary border-primary"
                  : "border-muted-foreground/30 bg-transparent"
              )}
              animate={i === currentPin.length - 1 && currentPin.length > 0 ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.15 }}
            />
          ))}
        </motion.div>

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-400 text-sm mb-4 h-5"
            >
              {error}
            </motion.p>
          )}
          {!error && <div className="h-5 mb-4" />}
        </AnimatePresence>

        {/* Number Pad */}
        <div className="grid gap-4 w-full">
          {numberKeys.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-4">
              {row.map((num) => (
                <motion.button
                  key={num}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNumberPress(num.toString())}
                  className="w-20 h-20 rounded-2xl bg-muted/50 hover:bg-muted/70 flex items-center justify-center text-2xl font-semibold text-foreground transition-colors active:bg-primary/20"
                >
                  {num}
                </motion.button>
              ))}
            </div>
          ))}
          
          {/* Bottom Row: Biometric, 0, Delete */}
          <div className="flex justify-center gap-4">
            {/* Biometric Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBiometric}
              disabled={biometricType === "none" || mode === "setup"}
              className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center transition-colors",
                biometricType !== "none" && mode !== "setup"
                  ? "bg-primary/20 hover:bg-primary/30 active:bg-primary/40" 
                  : "opacity-0 pointer-events-none"
              )}
            >
              <BiometricIcon className="w-8 h-8 text-primary" />
            </motion.button>

            {/* Zero */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleNumberPress("0")}
              className="w-20 h-20 rounded-2xl bg-muted/50 hover:bg-muted/70 flex items-center justify-center text-2xl font-semibold text-foreground transition-colors active:bg-primary/20"
            >
              0
            </motion.button>

            {/* Delete */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
              className="w-20 h-20 rounded-2xl bg-muted/50 hover:bg-muted/70 flex items-center justify-center transition-colors active:bg-red-500/20"
            >
              <Delete className="w-6 h-6 text-muted-foreground" />
            </motion.button>
          </div>
        </div>

        {/* Cancel / Forgot PIN */}
        {(mode === "verify" || onCancel) && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onCancel}
            className="mt-8 text-sm text-primary hover:underline"
          >
            {mode === "verify" ? "Forgot PIN?" : "Cancel"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
