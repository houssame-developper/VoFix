"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileAudio, Loader2, Play, Pause, RotateCcw, Volume2, Zap } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  uploadedFile?: File | null;
  isTranscribing?: boolean;
  transcriptionState?: "idle" | "processing" | "completed" | "error";
  label?: string;
  onProcessAudio: () => void;
}

const formatTime = (seconds: number) => {
  if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  uploadedFile,
  isTranscribing,
  transcriptionState = "idle",
  label,
  onProcessAudio,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Reset play state and progress when audioUrl changes
    setCurrentTime(0);
    setIsPlaying(false);
  }, [audioUrl]);

  // Fix for blob duration Infinity bug
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let fallbackTimeout: NodeJS.Timeout | null = null;
    const onLoaded = () => {
      if (audio.duration === Infinity || isNaN(audio.duration)) {
        audio.currentTime = Number.MAX_SAFE_INTEGER;
        fallbackTimeout = setTimeout(() => {
          if (audio.duration && isFinite(audio.duration)) {
            setDuration(audio.duration);
            // Reset currentTime to 0 after duration is fixed
            audio.currentTime = 0;
            setCurrentTime(0);
          }
          setIsLoading(false);
          setIsReady(true);
        }, 500);
      } else {
        setDuration(audio.duration);
        setIsLoading(false);
        setIsReady(true);
      }
    };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);
    const onDurationChange = () => {
      if (audio.duration && isFinite(audio.duration)) setDuration(audio.duration);
    };
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("durationchange", onDurationChange);
    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("durationchange", onDurationChange);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  if (!audioUrl) return null;

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-emerald-200/60 dark:border-emerald-700/60 shadow-lg">
      <CardHeader>
        <CardTitle className="text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            {label || "Audio Player"}
            {!isReady && <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300"
            >
              {uploadedFile ? "Uploaded" : "Recorded"}
            </Badge>
            {!isReady && (
              <Badge
                variant="outline"
                className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300"
              >
                Loading...
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <audio ref={audioRef} src={audioUrl} preload="auto" />
        <div className="flex items-center gap-4">
          <Button
            onClick={togglePlay}
            size="lg"
            disabled={isLoading || !isReady}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg h-12 w-12 rounded-full p-0"
          >
            {isLoading || !isReady ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          <Button
            onClick={handleRestart}
            size="sm"
            variant="outline"
            disabled={!isReady}
            className="border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <div className="flex-1 space-y-2">
            <div
              className={`bg-emerald-100 dark:bg-emerald-800/50 rounded-full h-3 relative overflow-hidden group ${
                isReady ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              }`}
              onClick={isReady ? handleSeek : undefined}
            >
              <div
                className="bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-green-500 h-full transition-all duration-100 relative rounded-r-full"
                style={{ width: duration > 0 && isReady ? `${(currentTime / duration) * 100}%` : "0%" }}
              >
                {isReady && (
                  <div className="absolute -right-0.5 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-200 rounded-full shadow-lg border-2 border-emerald-500 dark:border-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-mono">
              <span>{isReady ? formatTime(currentTime) : "0:00"}</span>
              <span>{isReady ? formatTime(duration) : "Loading..."}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Volume2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-1" />
            <div className="relative w-20">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full slider"
              />
              <div className="text-xs text-right text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {Math.round(volume * 100)}%
              </div>
            </div>
          </div>
        </div>
        <Button
          onClick={onProcessAudio}
          disabled={isTranscribing || transcriptionState === "processing"}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg h-12 text-lg font-semibold"
        >
          {isTranscribing || transcriptionState === "processing" ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Transcribing...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2" />
              Transcribe
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;
