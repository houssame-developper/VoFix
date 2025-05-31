"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, CheckCircle, Play, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import MicrophonePermission from "./MicrophonePermission";

type RecordingState = "idle" | "recording" | "paused" | "stopped";

interface RecordingControlsProps {
  recordingState: RecordingState;
  recordingTime: number;
  microphonePermission: "granted" | "denied" | "prompt" | "unknown";
  isCheckingPermission: boolean;
  isAudioLoading: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onRequestPermission: () => void;
  onPlayRecording: () => void;
  formatTime: (time: number) => string;
}

export default function RecordingControls({
  recordingState,
  recordingTime,
  microphonePermission,
  isCheckingPermission,
  isAudioLoading,
  onStartRecording,
  onStopRecording,
  onRequestPermission,
  onPlayRecording,
  formatTime,
}: RecordingControlsProps) {
  const { t } = useLanguage();

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-emerald-200/60 dark:border-emerald-700/60 shadow-lg">
      <CardHeader>
        <CardTitle className="text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <Mic className="h-5 w-5" />
          {t("recordTitle")}
        </CardTitle>
        <CardDescription className="text-emerald-600 dark:text-emerald-400">
          {recordingState === "recording"
            ? t("recordingInProgress")
            : recordingState === "stopped"
            ? t("recordingCompleted")
            : t("recordVoice")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Display */}
        <div className="text-center space-y-4">
          {recordingState === "recording" && (
            <div className="space-y-4">
              {/* Animated Recording Indicator */}
              <div className="relative flex items-center justify-center h-40 w-40 mx-auto">
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center shadow-lg animate-pulse z-10">
                  <Mic className="h-8 w-8 text-white" />
                  <div className="absolute -inset-2 bg-red-500/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-4 border-red-300/60 recording-wave"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-3 border-red-200/50 recording-wave-delayed"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-2 border-red-100/40 recording-wave-delayed-2"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                  <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full animate-pulse"></div>
                  RECORDING
                </div>
                <div className="text-3xl font-mono text-emerald-800 dark:text-emerald-200 font-bold">
                  {formatTime(recordingTime)}
                </div>

                {/* Visual Audio Bars */}
                <div className="flex items-end justify-center gap-1 mt-4 h-8">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 bg-gradient-to-t from-red-400 to-red-600 rounded-full audio-bar audio-bar-${
                        i + 1
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {recordingState === "stopped" && (
            <div className="space-y-4">
              <div className="relative flex items-center justify-center h-40 w-40 mx-auto">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-green-600 dark:text-green-400 font-medium text-lg">
                  {t("recordingCompleted")}
                </div>
                <div className="text-emerald-700 dark:text-emerald-300">
                  Duration: {formatTime(recordingTime)}
                </div>
                <Badge
                  variant="outline"
                  className="border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30"
                >
                  {t("readyForTranscription")}
                </Badge>
              </div>
            </div>
          )}

          {recordingState === "idle" && (
            <div className="space-y-4">
              <div className="relative flex items-center justify-center h-40 w-40 mx-auto">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 flex items-center justify-center shadow-lg">
                  <Mic className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-emerald-600 dark:text-emerald-400 font-medium text-lg">
                  {t("readyToRecord")}
                </div>
                <div className="text-emerald-500 dark:text-emerald-400 text-sm">{t("clickToStart")}</div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          {/* Standard Recording Controls */}
          {microphonePermission === "granted" && recordingState === "idle" && (
            <Button
              onClick={onStartRecording}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Mic className="h-5 w-5 mr-2" />
              {t("startRecording")}
            </Button>
          )}

          {/* Show loading state when checking permission */}
          {microphonePermission === "unknown" && isCheckingPermission && recordingState === "idle" && (
            <Button disabled size="lg" variant="outline" className="opacity-50">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Checking microphone...
            </Button>
          )}

          {recordingState === "recording" && (
            <Button
              onClick={onStopRecording}
              size="lg"
              variant="destructive"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <MicOff className="h-5 w-5 mr-2" />
              {t("stopRecording")}
            </Button>
          )}

          {recordingState === "stopped" && (
            <div className="flex gap-2">
              <Button
                onClick={onStartRecording}
                variant="outline"
                className="border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300"
              >
                <Mic className="h-4 w-4 mr-2" />
                {t("recordAgain")}
              </Button>
              <Button
                onClick={onPlayRecording}
                disabled={isAudioLoading}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg disabled:opacity-50"
              >
                {isAudioLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isAudioLoading ? t("loading") : t("playRecording")}
              </Button>
            </div>
          )}
        </div>

        {/* Microphone Permission */}
        {(microphonePermission === "denied" ||
          microphonePermission === "prompt" ||
          microphonePermission === "unknown") &&
          recordingState === "idle" && (
            <MicrophonePermission
              microphonePermission={microphonePermission}
              isCheckingPermission={isCheckingPermission}
              onRequestPermission={onRequestPermission}
            />
          )}

        {/* Recording Tips */}
        {recordingState === "idle" && (
          <div className="bg-emerald-50/80 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4 space-y-2">
            <div className="text-emerald-800 dark:text-emerald-200 font-medium text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
              {t("recordingTips")}
            </div>
            <ul className="text-emerald-600 dark:text-emerald-400 text-xs space-y-1">
              {(() => {
                const tips = t("tipsContent");
                const tipsArray = Array.isArray(tips) ? tips : [tips];
                return tipsArray.map((tip: string, index: number) => <li key={index}>• {tip}</li>);
              })()}
            </ul>
          </div>
        )}

        {/* Browser Support Notice */}
        {recordingState === "idle" && (
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-500 dark:text-emerald-400">
            <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-pulse"></div>
            {t("microphoneAccess")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
