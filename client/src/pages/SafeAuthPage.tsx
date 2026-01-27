/**
 * Safe Auth Page (Compliance Mode)
 * 
 * This is the sign-in page for Safe Mode - identical to main AuthPage design
 * but WITHOUT the signup option. Sign-in only for existing users.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, X } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScrollAwareStatusBar } from "@/components/ScrollAwareStatusBar";
import { 
  signInWithGoogle, 
  signInWithApple, 
  signInWithEmail, 
  resetPassword
} from "@/lib/firebase";
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

interface SafeAuthPageProps {
  onAuthSuccess: () => void;
  onBack?: () => void;
}

export function SafeAuthPage({ onAuthSuccess, onBack }: SafeAuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Safety timeout to prevent infinite loading
  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 30000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
      )
    ]);
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(email);
      toast({
        title: "Reset Email Sent",
        description: "Check your inbox for password reset instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.code === "auth/user-not-found" 
          ? "No account found with this email." 
          : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "google" | "apple") => {
    setIsLoading(true);
    try {
      let user;
      if (provider === "google") {
        if (Capacitor.getPlatform() === 'ios') {
          // Use Safari View Controller for Google sign-in
          await Browser.open({ url: 'https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin' });
          // After redirect, handle result in app (requires deep link handling)
          // You may need to implement a listener for Browser finished event and handle the auth result
          setIsLoading(false);
          return;
        } else {
          user = await withTimeout(signInWithGoogle(), 30000);
        }
      } else {
        if (Capacitor.getPlatform() === 'ios') {
          // Use Safari View Controller for Apple sign-in
          await Browser.open({ url: 'https://appleid.apple.com/auth/authorize' });
          setIsLoading(false);
          return;
        } else {
          user = await withTimeout(signInWithApple(), 3000);
        }
      }
      if (!user) {
        throw new Error('NO_USER');
      }
      toast({
        title: "Welcome!",
        description: "You have successfully signed in.",
      });
      onAuthSuccess();
    } catch (error: any) {
      console.error("Auth error:", error);
      let title = "Oops! Something Went Wrong";
      let message = "Please try again in a moment.";
      
      if (error.message === 'TIMEOUT') {
        title = "Connection Timeout";
        message = "The sign-in took too long. Please check your connection and try again.";
      } else if (error.message === 'NO_USER' || error.message === 'User cancelled Apple Sign-In') {
        title = "Sign-In Cancelled";
        message = "Sign-in was cancelled. Please try again.";
      } else if (error.code === "auth/popup-closed-by-user") {
        title = "Sign-In Cancelled";
        message = "You closed the sign-in window. Please try again.";
      } else if (error.code === "auth/cancelled-popup-request") {
        title = "Sign-In Cancelled";
        message = "Sign-in was cancelled. Please try again.";
      } else if (error.code === "auth/user-not-found") {
        title = "Account Not Found";
        message = "No account exists with this email. Please contact your administrator.";
      } else if (error.code === "auth/invalid-credential") {
        title = "Invalid Login Details";
        message = "Your email or password is incorrect. Please check and try again.";
      } else if (error.code === "auth/too-many-requests") {
        title = "Too Many Attempts";
        message = "Please wait a few minutes before trying again.";
      } else if (error.code === "auth/network-request-failed") {
        title = "Connection Issue";
        message = "Please check your internet connection and try again.";
      }
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const user = await withTimeout(signInWithEmail(email, password), 30000);
      
      if (!user) {
        throw new Error('NO_USER');
      }
      
      toast({
        title: "Welcome Back!",
        description: "You have successfully signed in.",
      });
      onAuthSuccess();
    } catch (error: any) {
      console.error("Auth error:", error);
      let title = "Oops! Something Went Wrong";
      let message = "Please try again in a moment.";
      
      if (error.message === 'TIMEOUT') {
        title = "Connection Timeout";
        message = "The sign-in took too long. Please check your connection and try again.";
      } else if (error.message === 'NO_USER') {
        title = "Sign-In Failed";
        message = "Could not sign in. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        title = "Invalid Email";
        message = "Please enter a valid email address.";
      } else if (error.code === "auth/wrong-password") {
        title = "Incorrect Password";
        message = "The password you entered is incorrect. Try again or reset your password.";
      } else if (error.code === "auth/user-not-found") {
        title = "Account Not Found";
        message = "No account exists with this email. Please contact your administrator.";
      } else if (error.code === "auth/invalid-credential") {
        title = "Invalid Login Details";
        message = "Your email or password is incorrect. Please check and try again.";
      } else if (error.code === "auth/too-many-requests") {
        title = "Too Many Attempts";
        message = "Please wait a few minutes before trying again.";
      } else if (error.code === "auth/network-request-failed") {
        title = "Connection Issue";
        message = "Please check your internet connection and try again.";
      }
      
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Scroll-aware background for system status bar */}
      <ScrollAwareStatusBar />
      
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] bg-primary/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-6 overflow-y-auto">
        {/* Spacer for system status bar - reduced spacing */}
        <div className="h-[max(calc(env(safe-area-inset-top,44px)*2-15px),73px)] shrink-0" />
        
        {/* Header with X button and theme toggle */}
        <div className="flex items-center justify-between mb-2">
          <motion.button
            onClick={onBack}
            className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center hover-elevate"
            whileTap={{ scale: 0.95 }}
            type="button"
            aria-label="Go back to onboarding"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </motion.button>
          <div className="flex-1"></div>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col"
        >
          <div className="text-center mb-2">
            <motion.div 
              className="w-full h-24 mx-auto mb-2 relative flex items-center justify-center"
              initial={{ y: -100, scale: 0.5, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 15,
                duration: 0.8
              }}
            >
              <img
                src="/attached_assets/App-Logo.png"
                alt="BlockMint"
                className="h-20 w-auto object-contain relative z-10"
                style={{
                  filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 15px rgba(16, 185, 129, 0.3)) contrast(1.1) saturate(1.2)',
                  imageRendering: '-webkit-optimize-contrast',
                }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </motion.div>
            <h1 className="font-display text-xl font-bold text-foreground mb-1">
              Welcome Back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to continue
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => handleSocialAuth("google")}
              variant="outline"
              className="w-full h-11 text-sm font-medium bg-white dark:bg-white/10 border-white/20 gap-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <SiGoogle className="w-5 h-5 text-[#4285F4]" />
              )}
              <span className="text-foreground">Continue With Google</span>
            </Button>

            {/* Apple Sign-In removed from Safe Mode to avoid review issues */}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 text-sm bg-white/5 dark:border-white/10 light:border-2 light:border-emerald-400/50 light:focus:border-emerald-500 light:shadow-[0_0_15px_rgba(16,185,129,0.2)] light:focus:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300"
                  disabled={isLoading}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 text-sm bg-white/5 dark:border-white/10 light:border-2 light:border-emerald-400/50 light:focus:border-emerald-500 light:shadow-[0_0_15px_rgba(16,185,129,0.2)] light:focus:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300"
                  disabled={isLoading}
                />
              </div>

              <button
                type="button"
                onClick={handleResetPassword}
                className="text-sm text-primary hover:underline"
                disabled={isLoading}
              >
                Forgot Password?
              </button>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  type="submit"
                  className="relative w-full h-11 text-base font-semibold bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 text-white shadow-lg shadow-emerald-400/30 hover:shadow-xl hover:shadow-emerald-400/50 active:shadow-md active:shadow-emerald-400/40 transition-all duration-300 overflow-hidden group"
                  disabled={isLoading}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Mail className="w-5 h-5 mr-2" />
                    )}
                    Sign In
                  </span>
                </Button>
              </motion.div>
            </form>

            {/* No signup option - authorized users only message */}
            <p className="text-center text-xs text-muted-foreground/80 pt-4 px-2">
              This application is for authorized users only. If you need access, please contact your system administrator.
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground/60 mt-6 pb-4">
            By Continuing, You Agree To Our{" "}
            <Link 
              href="/legal/terms" 
              className="text-primary/80 hover:text-primary underline"
            >
              Terms of Service
            </Link>
            {" "}and{" "}
            <Link 
              href="/legal/privacy" 
              className="text-primary/80 hover:text-primary underline"
            >
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default SafeAuthPage;
