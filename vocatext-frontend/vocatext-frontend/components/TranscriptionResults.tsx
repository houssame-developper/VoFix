"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Copy, Download, FileText, Clock } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { SupportedLanguage } from "@/lib/translations";

type TranscriptionState = "idle" | "processing" | "completed" | "error";

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

interface TranscriptionResultsProps {
  transcription: string;
  rawTranscription: string;
  transcriptionState: TranscriptionState;
  transcriptionConfidence: number | null;
  showRawTranscription: boolean;
  selectedLanguage: SupportedLanguage;
  onTranscriptionChange: (value: string) => void;
  onRawTranscriptionChange: (value: string) => void;
  onToggleRawTranscription: (show: boolean) => void;
  onCopyToClipboard: () => void;
  onDownloadTranscription: () => void;
  onDownloadAsDocx: () => void;
  onClearAll: () => void;
}

const languageOptions: LanguageOption[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

// Client-only time display component to prevent hydration mismatch
function ClientTimeDisplay() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date().toLocaleTimeString());
  }, []);

  if (!isClient) {
    return <span>--:--:--</span>;
  }

  return <span>{currentTime}</span>;
}

export default function TranscriptionResults({
  transcription,
  rawTranscription,
  transcriptionState,
  transcriptionConfidence,
  showRawTranscription,
  selectedLanguage,
  onTranscriptionChange,
  onRawTranscriptionChange,
  onToggleRawTranscription,
  onCopyToClipboard,
  onDownloadTranscription,
  onDownloadAsDocx,
}: TranscriptionResultsProps) {
  const { t } = useLanguage();

  if (!transcription) {
    return null;
  }

  // Ensure we always have a string value with proper fallbacks
  const currentText = String((showRawTranscription ? rawTranscription : transcription) || "");

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-emerald-200/60 dark:border-emerald-700/60 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            {transcriptionState === "completed" && (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            )}
            {transcriptionState === "error" && (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            {t("transcriptionResults")}
          </CardTitle>
          <div className="flex items-center gap-3">
            {/* Raw/Corrected Toggle */}
            {rawTranscription && rawTranscription !== transcription && (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-full p-1">
                <Button
                  size="sm"
                  variant={!showRawTranscription ? "default" : "ghost"}
                  onClick={() => onToggleRawTranscription(false)}
                  className={`rounded-full text-xs h-7 ${
                    !showRawTranscription
                      ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-white"
                      : "text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/50"
                  }`}
                >
                  {t("corrected")}
                </Button>
                <Button
                  size="sm"
                  variant={showRawTranscription ? "default" : "ghost"}
                  onClick={() => onToggleRawTranscription(true)}
                  className={`rounded-full text-xs h-7 ${
                    showRawTranscription
                      ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-white"
                      : "text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/50"
                  }`}
                >
                  {t("raw")}
                </Button>
              </div>
            )}

            {/* Confidence Indicator */}
            {transcriptionConfidence && (
              <div className="flex items-center gap-2">
                <div className="text-xs text-emerald-600 dark:text-emerald-400">{t("confidence")}:</div>
                <Badge
                  variant="outline"
                  className={`${
                    transcriptionConfidence >= 0.8
                      ? "border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30"
                      : transcriptionConfidence >= 0.6
                      ? "border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30"
                      : "border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30"
                  }`}
                >
                  {Math.round(transcriptionConfidence * 100)}%
                </Badge>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={onCopyToClipboard}
                size="sm"
                variant="outline"
                className="border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                onClick={onDownloadTranscription}
                size="sm"
                variant="outline"
                className="border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                title="Download as TXT"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                onClick={onDownloadAsDocx}
                size="sm"
                variant="outline"
                className="border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                title="Download as DOCX"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 mt-2">
          <Badge
            variant="secondary"
            className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
          >
            {languageOptions.find((l) => l.code === selectedLanguage)?.flag}{" "}
            {languageOptions.find((l) => l.code === selectedLanguage)?.name}
          </Badge>
          <Badge
            variant="secondary"
            className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
          >
            <Clock className="h-3 w-3 mr-1" />
            <ClientTimeDisplay />
          </Badge>
          <Badge
            variant="secondary"
            className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
          >
            {
              String(currentText)
                .split(" ")
                .filter((word) => word.length > 0).length
            }{" "}
            {t("words")}
          </Badge>
          {rawTranscription && rawTranscription !== transcription && (
            <Badge
              variant="secondary"
              className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700"
            >
              {showRawTranscription ? t("rawTrancription") : t("grammarCorrected")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            value={currentText}
            onChange={(e) => {
              if (showRawTranscription) {
                onRawTranscriptionChange(e.target.value);
              } else {
                onTranscriptionChange(e.target.value);
              }
            }}
            className="min-h-[200px] resize-none border-emerald-200 dark:border-emerald-700 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-emerald-400 dark:focus:ring-emerald-500 text-base leading-relaxed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Transcription will appear here..."
          />

          {/* Word count and character count */}
          <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
            <span>
              {
                String(currentText)
                  .split(" ")
                  .filter((word) => word.length > 0).length
              }{" "}
              {t("words")}
            </span>
            <span>
              {String(currentText).length} {t("characters")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
