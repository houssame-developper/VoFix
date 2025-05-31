"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mic, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface MicrophonePermissionProps {
  microphonePermission: "granted" | "denied" | "prompt" | "unknown";
  isCheckingPermission: boolean;
  onRequestPermission: () => void;
}

export default function MicrophonePermission({
  microphonePermission,
  isCheckingPermission,
  onRequestPermission,
}: MicrophonePermissionProps) {
  const { t } = useLanguage();

  if (microphonePermission === "granted") {
    return null;
  }

  if (microphonePermission === "denied") {
    return (
      <div className="w-full space-y-3">
        <div className="bg-red-50/80 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 space-y-3">
          <div className="text-red-800 dark:text-red-200 font-medium text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {t("microphoneAccessDenied")}
          </div>
          <div className="text-red-600 dark:text-red-400 text-xs">{t("microphoneAccessDeniedDesc")}</div>
          <Button
            onClick={onRequestPermission}
            disabled={isCheckingPermission}
            size="sm"
            variant="outline"
            className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 w-full"
          >
            {isCheckingPermission ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("checking")}
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                {t("tryAgain")}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (microphonePermission === "prompt" || microphonePermission === "unknown") {
    return (
      <div className="w-full space-y-3">
        <div className="bg-amber-50/80 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-4 space-y-3">
          <div className="text-amber-800 dark:text-amber-200 font-medium text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {t("microphonePermissionRequired")}
          </div>
          <div className="text-amber-600 dark:text-amber-400 text-xs">
            {t("microphonePermissionRequiredDesc")}
          </div>
          <Button
            onClick={onRequestPermission}
            disabled={isCheckingPermission}
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white w-full"
          >
            {isCheckingPermission ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("requesting")}
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                {t("allowMicrophoneAccess")}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
