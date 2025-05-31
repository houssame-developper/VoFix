"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileAudio } from "lucide-react";

interface FileUploadZoneProps {
  uploadedFile: File | null;
  isDragOver: boolean;
  onFileUpload: (file: File) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  t: (key: string) => string | string[];
}

export default function FileUploadZone({
  uploadedFile,
  isDragOver,
  onFileUpload,
  onDragOver,
  onDragLeave,
  onDrop,
  fileInputRef,
  t,
}: FileUploadZoneProps) {
  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-emerald-200/60 dark:border-emerald-700/60 shadow-lg">
      <CardHeader>
        <CardTitle className="text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {t("uploadTitle")}
        </CardTitle>
        <CardDescription className="text-emerald-600 dark:text-emerald-400">
          {t("uploadDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            isDragOver
              ? "border-emerald-400 dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-900/30"
              : "border-emerald-200 dark:border-emerald-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20"
          }`}
        >
          {uploadedFile ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                <FileAudio className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="text-emerald-800 dark:text-emerald-200 font-medium">
                  {t("fileUploadedSuccess")}
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 text-sm mt-1">{uploadedFile.name}</div>
                <div className="text-emerald-500 dark:text-emerald-500 text-xs mt-1">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              >
                <Upload className="h-4 w-4 mr-2" />
                {t("chooseAudioFile")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-emerald-400 to-green-500 flex items-center justify-center">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="text-emerald-800 dark:text-emerald-200 font-medium">
                  {t("uploadDescription")}
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 text-sm mt-1">
                  {t("chooseAudioFile")}
                </div>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                {t("chooseAudioFile")}
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onFileUpload(file);
              }
            }}
            className="hidden"
          />
        </div>

        {/* Supported Formats */}
        <div className="mt-4 text-center">
          <div className="text-xs text-emerald-600 dark:text-emerald-400">
            {t("supportedFormats")}: MP3, WAV, M4A, OGG, FLAC
          </div>
          <div className="text-xs text-emerald-500 dark:text-emerald-500 mt-1">{t("audioSupportText")}</div>
        </div>
      </CardContent>
    </Card>
  );
}
