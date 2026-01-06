# BlockMint Logo Integration Instructions

## Required Logo Files

Please upload the following logo files to this directory (`/workspaces/mining-club/attached_assets/`):

### 1. **BlockMint-for-All.png**
- **Purpose:** Footer logo that appears at the bottom of the app
- **Usage:** Shows across all pages in the footer section
- **Recommended Size:** 
  - Height: 32-64px
  - Format: PNG with transparent background
  - Works in both light and dark themes

### 2. **App-Icon.png**
- **Purpose:** Official app icon for app stores and browser favicon
- **Usage:** 
  - Browser favicon/tab icon
  - iOS/Android app icon
  - PWA (Progressive Web App) icon
  - Apple Touch Icon
- **Recommended Specs:**
  - Size: 512x512px or 1024x1024px (square)
  - Format: PNG
  - No transparency (solid background recommended)
  - Should work well when scaled down to 16x16px

## Current Integration Status

✅ Code is already integrated and ready
✅ Static file serving configured for `/attached_assets/` path
✅ Footer displays logo with automatic fallback if file missing
✅ PWA manifest configured
✅ All favicon and app icon links added to HTML

## What Happens When You Upload

Once you upload these files:
1. The footer logo will appear immediately at the bottom of all pages
2. The app icon will appear in browser tabs
3. When users add the app to their home screen, they'll see your icon
4. App stores will use the icon for your app listing

## Testing After Upload

1. Refresh the app to see the footer logo
2. Check browser tab for the favicon
3. Clear browser cache if icons don't update immediately
4. On mobile: Add to home screen to see the app icon

---

**Note:** The app will function normally even without these files. The footer has a fallback that hides the logo if the file is missing, and the browser will use a default icon.
