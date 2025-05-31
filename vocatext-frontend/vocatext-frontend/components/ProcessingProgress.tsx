"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/lib/language-context";

interface ProcessingProgressProps {
  processingProgress: number;
}

export default function ProcessingProgress({ processingProgress }: ProcessingProgressProps) {
  const { t } = useLanguage();

  if (processingProgress === 0) {
    return null;
  }

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-emerald-200/60 dark:border-emerald-700/60 shadow-lg">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-emerald-700 dark:text-emerald-300">{t("transcribingAudio")}...</span>
            <span className="text-emerald-600 dark:text-emerald-400">{processingProgress}%</span>
          </div>
          <Progress
            value={processingProgress}
            className="h-2 bg-emerald-100 dark:bg-emerald-800/50 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-600"
          />
        </div>
      </CardContent>
    </Card>
  );
}
