// Firebase Admin SDK for server-side authentication verification
// Last updated: 2026-01-18 - Force redeploy after env var fix
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
    console.log("Firebase Admin SDK: Using existing app");
    return;
  }

  console.log("Firebase Admin SDK: Initializing...");
  console.log("FIREBASE_SERVICE_ACCOUNT env var length:", process.env.FIREBASE_SERVICE_ACCOUNT?.length || 0);
  console.log("VITE_FIREBASE_PROJECT_ID:", process.env.VITE_FIREBASE_PROJECT_ID || "not set");

  try {
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

    // Prefer explicit service account JSON if provided.
    if (serviceAccountEnv) {
      console.log("Firebase Admin SDK: Service account env var found, attempting to parse...");
      let serviceAccount: any = null;
      try {
        let trimmed = serviceAccountEnv.trim();
        console.log("Firebase Admin SDK: First 50 chars:", trimmed.substring(0, 50));

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

        if (looksTruncatedJson) {
          console.warn("Firebase Admin SDK: Service account JSON appears truncated");
        } else if (trimmed.startsWith("{")) {
          console.log("Firebase Admin SDK: Parsing as inline JSON");
          serviceAccount = JSON.parse(trimmed);
        } else {
          console.log("Firebase Admin SDK: Attempting to read as file path:", trimmed);
          serviceAccount = JSON.parse(fs.readFileSync(trimmed, "utf8"));
        }
      } catch (e) {
        console.error("Firebase Admin SDK: Failed to parse service account:", e instanceof Error ? e.message : e);
        serviceAccount = null;
      }

      if (serviceAccount) {
        console.log("Firebase Admin SDK: Service account parsed, project_id:", serviceAccount.project_id);
        adminApp = initializeApp({
          credential: cert(serviceAccount),
        });
        console.log("Firebase Admin SDK: Initialized with service account credentials");
      }
    } else {
      console.log("Firebase Admin SDK: No service account env var found");
    }

    // Fallback: use projectId only (relies on Application Default Credentials).
    if (!adminApp) {
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
      if (!projectId) {
        console.error("Firebase Admin SDK: CRITICAL - No project ID configured. Auth verification will be disabled!");
        return;
      }
      console.log("Firebase Admin SDK: Falling back to projectId-only mode (ADC)");
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
