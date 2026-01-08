#!/usr/bin/env python3
import re

# Read the file
with open('client/src/pages/AuthPage.tsx', 'r') as f:
    content = f.read()

# Find and replace the error handling section
old_error_handling = r'''    } catch \(error: any\) \{
      console\.error\("Auth error:", error\);
      let message = "Please try again\.";
      if \(error\.code === "auth/email-already-in-use"\) \{
        message = "This email is already registered\. Try signing in instead\.";
      \} else if \(error\.code === "auth/invalid-email"\) \{
        message = "Please enter a valid email address\.";
      \} else if \(error\.code === "auth/wrong-password" \|\| error\.code === "auth/user-not-found"\) \{
        message = "Invalid email or password\.";
      \} else if \(error\.code === "auth/invalid-credential"\) \{
        message = "Invalid email or password\.";
      \}
      toast\(\{
        title: "Authentication Failed",
        description: message,
        variant: "destructive",
      \}\);'''

new_error_handling = '''    } catch (error: any) {
      console.error("Auth error:", error);
      let title = "Oops! Something Went Wrong";
      let message = "Please try again in a moment.";
      
      if (error.code === "auth/email-already-in-use") {
        title = "Email Already Registered";
        message = "This email is already in use. Try signing in or use a different email.";
      } else if (error.code === "auth/invalid-email") {
        title = "Invalid Email";
        message = "Please enter a valid email address.";
      } else if (error.code === "auth/wrong-password") {
        title = "Incorrect Password";
        message = "The password you entered is incorrect. Try again or reset your password.";
      } else if (error.code === "auth/user-not-found") {
        title = "Account Not Found";
        message = "No account exists with this email. Please sign up first.";
      } else if (error.code === "auth/invalid-credential") {
        title = "Invalid Login Details";
        message = "Your email or password is incorrect. Please check and try again.";
      } else if (error.code === "auth/too-many-requests") {
        title = "Too Many Attempts";
        message = "Please wait a few minutes before trying again.";
      } else if (error.code === "auth/network-request-failed") {
        title = "Connection Issue";
        message = "Please check your internet connection and try again.";
      } else if (error.code === "auth/weak-password") {
        title = "Weak Password";
        message = "Please choose a stronger password with at least 6 characters.";
      }
      
      toast({
        title,
        description: message,
        variant: "destructive",
      });'''

content = re.sub(old_error_handling, new_error_handling, content, flags=re.DOTALL)

# Write back
with open('client/src/pages/AuthPage.tsx', 'w') as f:
    f.write(content)

print("Error messages updated successfully")
