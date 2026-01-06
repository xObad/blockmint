// Firebase Admin SDK for server-side authentication verification
import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import fs from "fs";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

// Initialize Firebase Admin with service account or project ID
export function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    adminAuth = getAuth(adminApp);
    return;
  }

  try {
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

    // Prefer explicit service account JSON if provided.
    if (serviceAccountEnv) {
      let serviceAccount: any = null;
      try {
        let trimmed = serviceAccountEnv.trim();

        // Common .env pattern: wrap JSON in single quotes.
        // Also tolerate a leading quote without a matching trailing quote (misformatted multi-line values).
        if (trimmed.startsWith("'{") || trimmed.startsWith('"{')) {
          trimmed = trimmed.slice(1);
        } else if (
          (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
          (trimmed.startsWith('"') && trimmed.endsWith('"'))
        ) {
          trimmed = trimmed.slice(1, -1).trim();
        }

        // If the env var is accidentally multi-line in .env, dotenv usually only captures the first line
        // which can look like just "{" or "'{". Treat this as invalid and fall back.
        const looksTruncatedJson = trimmed === "{" || trimmed === "'{" || trimmed === '"{' || trimmed.length < 10;

        if (!looksTruncatedJson) {
          serviceAccount = trimmed.startsWith("{")
            ? JSON.parse(trimmed)
            : JSON.parse(fs.readFileSync(trimmed, "utf8"));
        }
      } catch (e) {
        // Keep dev experience smooth; production should provide a valid JSON blob or a file path.
        console.warn("FIREBASE_SERVICE_ACCOUNT present but unusable; falling back to projectId/ADC.");
        serviceAccount = null;
      }

      if (serviceAccount) {
        adminApp = initializeApp({
          credential: cert(serviceAccount),
        });
      }
    }

    // Fallback: use projectId only (relies on Application Default Credentials).
    if (!adminApp) {
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
      if (!projectId) {
        console.warn("Firebase project ID not configured. Auth verification will be disabled.");
        return;
      }
      adminApp = initializeApp({ projectId });
    }

    adminAuth = getAuth(adminApp);
    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

// Verify ID token from client
export async function verifyIdToken(idToken: string) {
  if (!adminAuth) {
    throw new Error("Firebase Admin not initialized");
  }
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Token verification failed:", error);
    throw error;
  }
}

// Get user by UID
export async function getUserByUid(uid: string) {
  if (!adminAuth) {
    throw new Error("Firebase Admin not initialized");
  }
  
  return await adminAuth.getUser(uid);
}

// Set custom claims (for admin role)
export async function setCustomClaims(uid: string, claims: { admin?: boolean; role?: string }) {
  if (!adminAuth) {
    throw new Error("Firebase Admin not initialized");
  }
  
  await adminAuth.setCustomUserClaims(uid, claims);
}

// Get auth instance
export function getAdminAuth() {
  return adminAuth;
}

// Delete user from Firebase
export async function deleteUser(uid: string) {
  if (!adminAuth) {
    throw new Error("Firebase Admin not initialized");
  }
  
  try {
    await adminAuth.deleteUser(uid);
  } catch (error) {
    console.error("Failed to delete Firebase user:", error);
    throw error;
  }
}
