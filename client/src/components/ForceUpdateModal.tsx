import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ForceUpdateConfig {
  enabled: boolean;
  minVersion: string;
  currentVersion: string;
  androidUrl: string;
  iosUrl: string;
  message: string;
}

function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isAndroidDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
}

function getAppVersion(): string {
  // Get version from environment variable (Vite uses import.meta.env)
  const version = import.meta.env.VITE_APP_VERSION || "1.8.0";
  return version;
}

function compareVersions(current: string, minimum: string): boolean {
  // Returns true if current < minimum (meaning update is needed)
  const [currMajor, currMinor, currPatch] = current.split('.').map(Number);
  const [minMajor, minMinor, minPatch] = minimum.split('.').map(Number);
  
  if (currMajor !== minMajor) return currMajor < minMajor;
  if (currMinor !== minMinor) return currMinor < minMinor;
  return currPatch < minPatch;
}

export function ForceUpdateModal() {
  const [updateConfig, setUpdateConfig] = useState<ForceUpdateConfig | null>(null);
  const [showModal, setShowModal] = useState(false);
  const currentVersion = getAppVersion();

  useEffect(() => {
    // Fetch force update configuration
    const fetchUpdateConfig = async () => {
      try {
        const res = await fetch("/api/admin/config");
        if (!res.ok) return;
        
        const configs = await res.json();
        const configMap = configs.reduce((acc: any, cfg: any) => {
          acc[cfg.key] = cfg.value;
          return acc;
        }, {});

        const config: ForceUpdateConfig = {
          enabled: configMap['update_enabled'] === 'true',
          minVersion: configMap['update_minimum_version'] || '1.0.0',
          currentVersion: configMap['update_current_version'] || '1.0.0',
          androidUrl: configMap['update_android_url'] || '',
          iosUrl: configMap['update_ios_url'] || '',
          message: configMap['update_message'] || 'A new version is available. Please update now!',
        };

        setUpdateConfig(config);

        // Check if update is needed
        if (config.enabled && compareVersions(currentVersion, config.minVersion)) {
          setShowModal(true);
        }
      } catch (error) {
        console.error("Failed to fetch update config:", error);
      }
    };

    fetchUpdateConfig();
  }, []);

  const handleUpdate = () => {
    if (!updateConfig) return;

    let updateUrl = '';
    if (isIOSDevice()) {
      updateUrl = updateConfig.iosUrl;
    } else if (isAndroidDevice()) {
      updateUrl = updateConfig.androidUrl;
    } else {
      // Web/fallback - show both
      updateUrl = updateConfig.androidUrl || updateConfig.iosUrl;
    }

    if (updateUrl) {
      window.location.href = updateUrl;
    }
  };

  if (!showModal || !updateConfig) return null;

  return (
    <Dialog open={showModal} onOpenChange={() => {}} modal>
      <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Update Required 🎉
          </DialogTitle>
          <DialogDescription className="text-base mt-4">
            {updateConfig.message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-muted/30 rounded-lg border border-white/10">
            <p className="text-xs text-muted-foreground">
              <strong>Current Version:</strong> {currentVersion}
              <br />
              <strong>Minimum Required:</strong> {updateConfig.minVersion}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleUpdate}
            className="flex-1 bg-primary hover:bg-primary/90 h-11"
          >
            <Download className="w-4 h-4 mr-2" />
            Update Now
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-2">
          You must update the app to continue using BlockMint
        </p>
      </DialogContent>
    </Dialog>
  );
}
