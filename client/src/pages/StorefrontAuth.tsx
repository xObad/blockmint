/**
 * Storefront Auth - Web Platform Authentication
 * 
 * Authentication page for web platform with FULL functionality:
 * - Sign in for existing users
 * - Sign up for NEW users (unlike mobile app in compliance mode)
 * - Same beautiful design as main app
 * 
 * This allows App Store reviewers to create accounts on the web platform.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, Server } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  signInWithGoogle, 
  signInWithEmail,
  registerWithEmail,
  resetPassword
} from "@/lib/firebase";

interface StorefrontAuthProps {
  onAuthSuccess: () => void;
  onBack?: () => void;
}

export function StorefrontAuth({ onAuthSuccess, onBack }: StorefrontAuthProps) {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const handleSocialAuth = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome!",
        description: "You have successfully signed in.",
      });
      onAuthSuccess();
    } catch (error: any) {
      console.error("Auth error:", error);
      let title = "Oops! Something Went Wrong";
      let message = "Please try again in a moment.";
      
      if (error.code === "auth/email-already-in-use") {
        title = "Email Already Registered";
        message = "This email is already in use. Try signing in instead.";
      } else if (error.code === "auth/invalid-email") {
        title = "Invalid Email";
        message = "Please enter a valid email address.";
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

    if (mode === "register" && !name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name.",
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

    if (mode === "register" && password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
        toast({
          title: "Welcome Back!",
          description: "You have successfully signed in.",
        });
      } else {
        await registerWithEmail(email, password, name.trim());
        toast({
          title: "Account Created! 🎉",
          description: "Welcome to BlockMint!",
        });
      }
      onAuthSuccess();
    } catch (error: any) {
      console.error("Auth error:", error);
      let title = "Oops! Something Went Wrong";
      let message = "Please try again in a moment.";
      
      if (error.code === "auth/email-already-in-use") {
        title = "Email Already Registered";
        message = "This email is already in use. Try signing in instead.";
      } else if (error.code === "auth/invalid-email") {
        title = "Invalid Email";
        message = "Please enter a valid email address.";
      } else if (error.code === "auth/wrong-password") {
        title = "Incorrect Password";
        message = "The password you entered is incorrect.";
      } else if (error.code === "auth/user-not-found") {
        title = "Account Not Found";
        message = "No account exists with this email. Please sign up first.";
      } else if (error.code === "auth/invalid-credential") {
        title = "Invalid Login Details";
        message = "Your email or password is incorrect.";
      } else if (error.code === "auth/too-many-requests") {
        title = "Too Many Attempts";
        message = "Please wait a few minutes before trying again.";
      } else if (error.code === "auth/weak-password") {
        title = "Weak Password";
        message = "Please choose a stronger password with at least 6 characters.";
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
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] bg-primary/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-6 pt-8 pb-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          {onBack ? (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
              type="button"
              aria-label="Go back"
              disabled={isLoading}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9 h-9" />
          )}
          <div className="flex-1"></div>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col"
        >
          <div className="text-center mb-6">
            <motion.div 
              className="w-full h-40 mx-auto mb-4 relative flex items-center justify-center"
              initial={{ y: -50, scale: 0.8, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
            >
              {/* Try to load the logo, fallback to icon */}
              <img
                src="/attached_assets/App-Logo.png"
                alt="BlockMint"
                className="h-36 w-auto object-contain relative z-10"
                style={{
                  filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 20px rgba(16, 185, 129, 0.3))',
                }}
                onError={(e) => { 
                  e.currentTarget.style.display = "none";
                  const fallback = document.getElementById('logo-fallback');
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div 
                id="logo-fallback" 
                className="hidden w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 items-center justify-center shadow-2xl"
              >
                <Server className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <h1 className="font-display text-xl font-bold text-foreground mb-1">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "signin" 
                ? "Sign in to manage your nodes" 
                : "Start with BlockMint today"}
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleSocialAuth}
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
                {mode === "register" && (
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 text-sm bg-white/5 border-white/10"
                    disabled={isLoading}
                  />
                )}
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 text-sm bg-white/5 border-white/10"
                  disabled={isLoading}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 text-sm bg-white/5 border-white/10"
                  disabled={isLoading}
                />
                {mode === "register" && (
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 text-sm bg-white/5 border-white/10"
                    disabled={isLoading}
                  />
                )}
              </div>

              {mode === "signin" && (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-sm text-primary hover:underline"
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>
              )}

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  type="submit"
                  className="relative w-full h-11 text-base font-semibold bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 text-white shadow-lg shadow-emerald-400/30 hover:shadow-xl hover:shadow-emerald-400/50 transition-all duration-300 overflow-hidden group"
                  disabled={isLoading}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Mail className="w-5 h-5 mr-2" />
                    )}
                    {mode === "signin" ? "Sign In" : "Create Account"}
                  </span>
                </Button>
              </motion.div>
            </form>

            {/* Toggle between sign in and sign up */}
            <p className="text-center text-sm text-muted-foreground pt-4">
              {mode === "signin" ? (
                <>
                  Don't Have An Account?{" "}
                  <button 
                    onClick={() => setMode("register")}
                    className="text-primary font-semibold hover:underline"
                    disabled={isLoading}
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already Have An Account?{" "}
                  <button 
                    onClick={() => setMode("signin")}
                    className="text-primary font-semibold hover:underline"
                    disabled={isLoading}
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground/60 mt-auto pt-8">
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

export default StorefrontAuth;
