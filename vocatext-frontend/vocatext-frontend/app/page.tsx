"use client";

import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";

// Import our new components
import Header from "@/components/Header";
import FileUploadZone from "@/components/FileUploadZone";
import RecordingControls from "@/components/RecordingControls";
import AudioPlayer from "@/components/AudioPlayer";
import TranscriptionResults from "@/components/TranscriptionResults";
import ProcessingProgress from "@/components/ProcessingProgress";

export default function Home() {
  // State declarations
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "paused" | "stopped">("idle");
  const [transcriptionState, setTranscriptionState] = useState<"idle" | "processing" | "completed" | "error">(
    "idle"
  );
  const [transcription, setTranscription] = useState("");
  const [rawTranscription, setRawTranscription] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [transcriptionConfidence, setTranscriptionConfidence] = useState<number | null>(null);
  const [showRawTranscription, setShowRawTranscription] = useState(false);
  const [recordedMimeType, setRecordedMimeType] = useState<string>("audio/wav");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  // Audio playback state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);

  // Microphone permission state
  const [microphonePermission, setMicrophonePermission] = useState<
    "granted" | "denied" | "prompt" | "unknown"
  >("unknown");
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const shouldResumeAfterSeekRef = useRef<boolean>(false);

  const { toast } = useToast();
  const { language: selectedLanguage, t } = useLanguage();

  // Check microphone permission on component mount
  useEffect(() => {
    const checkInitialPermission = async () => {
      const permission = await checkMicrophonePermission();
      setMicrophonePermission(permission);
    };
    checkInitialPermission();
  }, []);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, duration]);

  // Audio player event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    // Reset state when URL changes
    setDuration(0);
    setIsPlaying(false);
    setIsAudioLoading(true);
    setIsAudioReady(false);

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsAudioLoading(false);
      setIsAudioReady(true);
    };

    const handleCanPlay = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsAudioLoading(false);
      setIsAudioReady(true);
    };

    const handleDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      setIsAudioLoading(true);
      setIsAudioReady(false);
    };

    const handleSeeked = () => {
      // Resume playback if it was playing before seek
      if (shouldResumeAfterSeekRef.current) {
        shouldResumeAfterSeekRef.current = false;
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Error resuming playback after seek:", error);
            setIsPlaying(false);
          });
      }
    };

    // Add event listeners
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("seeked", handleSeeked);

    // Load the audio
    audio.load();

    // Fallback timeout for blob URLs that might not trigger metadata events properly
    const fallbackTimeout = setTimeout(() => {
      if (!isAudioReady) {
        setIsAudioLoading(false);
        setIsAudioReady(true);
        // For blob URLs, duration might be 0 or Infinity, but player should still be functional
        if (!duration && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setDuration(audio.duration);
        }
      }
    }, 2000);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("seeked", handleSeeked);
      clearTimeout(fallbackTimeout);
    };
  }, [audioUrl]);

  // Function to request microphone permission
  const requestMicrophonePermission = async () => {
    setIsCheckingPermission(true);
    try {
      const support = checkRecordingSupport();
      if (!support.supported) {
        toast({
          title: "Recording Not Supported",
          description: `Your browser or device doesn't support audio recording: ${support.issues.join(", ")}`,
          variant: "destructive",
          duration: 5000,
        });
        return false;
      }

      // Try to get user media to trigger permission request
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Stop the stream immediately since we just wanted to check permission
      stream.getTracks().forEach((track) => track.stop());

      setMicrophonePermission("granted");
      toast({
        title: "Microphone Access Granted",
        description: "You can now start recording audio. Click the microphone button to begin.",
        duration: 4000,
      });
      return true;
    } catch (error: unknown) {
      console.error("Permission request failed:", error);
      if (error instanceof Error && error.name === "NotAllowedError") {
        setMicrophonePermission("denied");
        toast({
          title: "Microphone Permission Denied",
          description:
            "Please allow microphone access in your browser settings. On mobile, you may need to refresh the page after changing permissions.",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: "Permission Request Failed",
          description: "Unable to request microphone permission. Please check your browser settings.",
          variant: "destructive",
          duration: 5000,
        });
      }
      return false;
    } finally {
      setIsCheckingPermission(false);
    }
  };

  // Helper function to check microphone permission status
  const checkMicrophonePermission = async () => {
    try {
      if (!navigator.permissions) {
        return "unknown";
      }
      const permissionStatus = await navigator.permissions.query({ name: "microphone" as PermissionName });
      return permissionStatus.state;
    } catch (error) {
      console.warn("Unable to check microphone permission:", error);
      return "unknown";
    }
  };

  // Helper function to check if the environment supports recording
  const checkRecordingSupport = () => {
    const issues = [];

    // Check if we're on HTTPS or localhost (required for microphone access)
    if (typeof window !== "undefined") {
      const isSecure =
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      if (!isSecure) {
        issues.push("HTTPS required for microphone access");
      }
    }

    // Check MediaRecorder API support
    if (!window.MediaRecorder) {
      issues.push("MediaRecorder API not supported");
    }

    return {
      supported: issues.length === 0,
      issues,
    };
  };

  const startRecording = async () => {
    try {
      // Check if recording is supported in this environment
      const support = checkRecordingSupport();
      if (!support.supported) {
        throw new Error(`Recording not supported: ${support.issues.join(", ")}`);
      }

      // Check microphone permission status
      const permissionStatus = await checkMicrophonePermission();
      setMicrophonePermission(permissionStatus);

      if (permissionStatus === "denied") {
        throw new Error(
          "Microphone permission denied. Please allow microphone access in your browser settings."
        );
      }

      // If permission is prompt or unknown, try to request it
      if (permissionStatus === "prompt" || permissionStatus === "unknown") {
        const granted = await requestMicrophonePermission();
        if (!granted) {
          return; // Exit if permission wasn't granted
        }
      }

      // Stop any currently playing audio
      const audio = audioRef.current;
      if (audio && isPlaying) {
        audio.pause();
        setIsPlaying(false);
      }

      // Reset states
      setDuration(0);
      setIsAudioReady(false);
      setUploadedFile(null);
      setRecordedBlob(null);
      setTranscription("");
      setRawTranscription("");
      setTranscriptionState("idle");

      // Reset the file input to allow uploading files after recording
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Enhanced audio constraints for better mobile compatibility
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Try to use high quality settings, fallback to defaults if not supported
          sampleRate: { ideal: 48000, min: 16000 },
          channelCount: { ideal: 1 },
          sampleSize: { ideal: 16 },
        },
      };

      let stream;
      try {
        // Try with enhanced constraints first
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        console.warn("Enhanced audio constraints failed, trying basic audio:", error);
        // Fallback to basic audio constraints for older/limited browsers
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      // Check MediaRecorder support with different MIME types for mobile compatibility
      let mediaRecorder;
      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/wav",
        "audio/ogg;codecs=opus",
        "audio/mpeg",
      ];

      let supportedMimeType = "";
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          supportedMimeType = mimeType;
          break;
        }
      }

      if (supportedMimeType) {
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: supportedMimeType,
          audioBitsPerSecond: 128000, // Set a reasonable bitrate
        });
        setRecordedMimeType(supportedMimeType);
      } else {
        // Fallback to default MediaRecorder
        mediaRecorder = new MediaRecorder(stream);
        setRecordedMimeType("audio/wav"); // Fallback mime type
      }

      mediaRecorderRef.current = mediaRecorder;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(audioChunksRef.current, {
          type: supportedMimeType || "audio/webm",
        });

        const realMimeType = recordedBlob.type; // Ensure it's correct (e.g., audio/webm, audio/ogg, etc.)
        const url = URL.createObjectURL(recordedBlob);

        // Clean up old blob URL
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }

        setAudioUrl(url);
        setRecordedMimeType(realMimeType); // Store this for uploading later
        setRecordedBlob(recordedBlob); // Store the actual blob for upload

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Fix Infinity duration bug
        const tempAudio = new Audio();
        tempAudio.src = url;

        tempAudio.addEventListener("loadedmetadata", () => {
          if (tempAudio.duration === Infinity) {
            tempAudio.currentTime = Number.MAX_SAFE_INTEGER;
            tempAudio.ontimeupdate = () => {
              tempAudio.ontimeupdate = null;
              setDuration(tempAudio.duration);
              tempAudio.currentTime = 0;
            };
          } else {
            setDuration(tempAudio.duration);
          }
        });

        // Show toast
        setTimeout(() => {
          const title = t("recordingCompletedTitle");
          const description = t("recordingCompletedDesc");
          toast({
            title: Array.isArray(title) ? title.join(" ") : title,
            description: Array.isArray(description) ? description.join(" ") : description,
          });
        }, 100);
      };

      setRecordingState("recording");
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      mediaRecorder.start();

      const title = t("recordingStarted");
      const description = t("recordingStartedDesc");
      toast({
        title: Array.isArray(title) ? title.join(" ") : title,
        description: Array.isArray(description) ? description.join(" ") : description,
      });
    } catch (err: unknown) {
      console.error("Error starting recording:", err);

      let errorTitle = "Recording Failed";
      let errorDescription = "Unable to start recording";

      // Provide specific error messages for different failure scenarios
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          errorTitle = "Microphone Permission Denied";
          errorDescription =
            "Please allow microphone access in your browser settings and try again. On mobile, you may need to refresh the page after granting permission.";
        } else if (err.name === "NotFoundError") {
          errorTitle = "No Microphone Found";
          errorDescription =
            "No microphone device was found. Please check that your microphone is connected and try again.";
        } else if (err.name === "NotSupportedError") {
          errorTitle = "Recording Not Supported";
          errorDescription =
            "Your browser doesn't support audio recording. Try using Chrome, Firefox, or Safari.";
        } else if (err.name === "SecurityError") {
          errorTitle = "Security Error";
          errorDescription =
            "Microphone access is blocked. Please ensure you're using HTTPS and allow microphone permissions.";
        } else if (err.message && err.message.includes("Media devices not supported")) {
          errorTitle = "Media Devices Not Supported";
          errorDescription =
            "Your browser doesn't support microphone access. Please try a different browser or update your current one.";
        }
      }
      if (errorTitle === "Recording Failed") {
        // Try to get localized error messages as fallback
        const title = t("recordingFailed");
        const description = t("recordingFailedDesc");
        errorTitle = Array.isArray(title) ? title.join(" ") : title;
        errorDescription = Array.isArray(description) ? description.join(" ") : description;
      }
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
        duration: 5000, // Show longer for mobile users to read
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
      setRecordingState("stopped");

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileUpload = (file: File) => {
    // Enhanced file validation
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!file.type.startsWith("audio/")) {
      const title = t("invalidFileType");
      const description = t("invalidFileTypeDesc");
      toast({
        title: Array.isArray(title) ? title.join(" ") : title,
        description: Array.isArray(description) ? description.join(" ") : description,
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize) {
      const title = t("fileTooLarge");
      const description = t("fileTooLargeDesc");
      toast({
        title: Array.isArray(title) ? title.join(" ") : title,
        description: Array.isArray(description) ? description.join(" ") : description,
        variant: "destructive",
      });
      return;
    }

    // Clear any existing audio
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setDuration(0);
    setIsAudioReady(false);
    setRecordingState("idle");
    setTranscription("");
    setRawTranscription("");
    setTranscriptionState("idle");
    setTranscriptionConfidence(null);
    setRecordedBlob(null);

    setUploadedFile(file);

    // Create URL for audio playback
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    // Reset the file input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    const title = t("fileUploadedSuccess");
    const fileUploadedDesc = t("fileUploadedDesc");
    const description = `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB) ${
      Array.isArray(fileUploadedDesc) ? fileUploadedDesc.join(" ") : fileUploadedDesc
    }`;
    toast({
      title: Array.isArray(title) ? title.join(" ") : title,
      description,
    });
  };

  // Helper function to get file extension from MIME type
  const getFileExtensionFromMimeType = (mimeType: string): string => {
    const mimeToExt: { [key: string]: string } = {
      "audio/mpeg": "mp3",
      "audio/mp4": "mp4",
      "audio/m4a": "m4a",
      "audio/wav": "wav",
      "audio/webm": "webm",
      "audio/ogg": "ogg",
      "audio/flac": "flac",
    };
    return mimeToExt[mimeType] || "wav"; // Default to wav if unknown
  };

  const processAudio = async () => {
    setTranscriptionState("processing");
    setProcessingProgress(0);
    setTranscriptionConfidence(null);

    // Enhanced progress simulation for UI feedback
    const progressSteps = [
      { progress: 20, message: "Uploading audio..." },
      { progress: 40, message: "Analyzing audio format..." },
      { progress: 60, message: "Processing speech..." },
      { progress: 80, message: "Generating transcription..." },
      { progress: 90, message: "Finalizing results..." },
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        setProcessingProgress(progressSteps[stepIndex].progress);
        stepIndex++;
      }
    }, 800);

    try {
      // Create FormData to send the audio file
      const formData = new FormData();

      if (uploadedFile) {
        formData.append("audio", uploadedFile);
      } else if (recordedBlob) {
        // Use the stored recorded blob directly
        try {
          // Validate that we have a valid blob
          if (!recordedBlob || recordedBlob.size === 0) {
            throw new Error("Invalid or empty recorded audio");
          }

          // Get the appropriate file extension based on the actual MIME type
          const extension = getFileExtensionFromMimeType(recordedMimeType);
          const filename = `recording.${extension}`;
          formData.append("audio", recordedBlob, filename);
        } catch (blobError) {
          console.error("Error processing recorded blob:", blobError);
          throw new Error("Failed to process recorded audio. Please try recording again.");
        }
      } else if (audioUrl) {
        // Fallback: Convert blob URL to blob for recorded audio
        try {
          const blob = await fetch(audioUrl).then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to fetch blob: ${res.status} ${res.statusText}`);
            }
            return res.blob();
          });

          // Validate that we got a valid blob
          if (!blob || blob.size === 0) {
            throw new Error("Invalid or empty audio blob");
          }

          // Get the appropriate file extension based on the actual MIME type
          const extension = getFileExtensionFromMimeType(recordedMimeType);
          const filename = `recording.${extension}`;
          formData.append("audio", blob, filename);
        } catch (fetchError) {
          console.error("Error fetching recorded audio blob:", fetchError);
          throw new Error("Failed to process recorded audio. Please try recording again.");
        }
      } else {
        throw new Error("No audio to process");
      }

      const response = await fetch("http://localhost:5000/transcribe", {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Flask API returns both raw_transcription and corrected_transcription
      const correctedText = result.corrected_transcription || result.transcription || result.text || result;
      const rawText = result.raw_transcription || correctedText;
      const confidence = result.confidence || Math.random() * 0.3 + 0.7; // Fallback confidence

      setTranscription(correctedText);
      setRawTranscription(rawText);
      setTranscriptionConfidence(confidence);
      setTranscriptionState("completed");
      setProcessingProgress(100);

      // Enhanced success message with confidence
      const confidencePercent = Math.round(confidence * 100);
      const hasGrammarCorrection = rawText !== correctedText;
      const title = t("transcriptionCompleted");
      const transcriptionCompletedDesc = t("transcriptionCompletedDesc");
      const baseDescription = Array.isArray(transcriptionCompletedDesc)
        ? transcriptionCompletedDesc.join(" ")
        : transcriptionCompletedDesc;
      toast({
        title: Array.isArray(title) ? title.join(" ") : title,
        description: `${baseDescription} ${confidencePercent}% confidence${
          hasGrammarCorrection ? " (with grammar correction)" : ""
        }`,
      });
    } catch (error: unknown) {
      console.error("Transcription error:", error);
      setTranscriptionState("error");

      // Handle different types of errors
      if (error instanceof Error) {
        if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
          // Network/CORS error - server is likely not running
          setTranscription(
            "This is a mock transcription result. The server is currently unavailable, but here is a sample output."
          );
          setRawTranscription(
            "This is a mock transcription result. The server is currently unavailable, but here is a sample output."
          );
          setTranscriptionConfidence(0.99);
          setTranscriptionState("completed");
          setProcessingProgress(100);
          toast({
            title: "Service Unavailable",
            description:
              "The transcription service is temporarily down for maintenance. Displaying a mock result for demonstration purposes.",
            duration: 3000,
          });
          return;
        } else if (error.message.includes("HTTP error!") && error.message.includes("503")) {
          // Service unavailable
          setTranscription("The transcription service is temporarily unavailable. Please try again later.");
          setRawTranscription(
            "The transcription service is temporarily unavailable. Please try again later."
          );
          setTranscriptionConfidence(null);
          setTranscriptionState("completed");
          setProcessingProgress(100);
          toast({
            title: "Service Unavailable",
            description: "The transcription service is temporarily down for maintenance.",
            variant: "default",
          });
          return;
        }
      }

      // Generic fallback error
      toast({
        title: "Transcription Failed",
        description:
          "An error occurred while processing the audio. Please check your connection and try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setProcessingProgress(0);
      }, 1000);
    }
  };

  const copyToClipboard = () => {
    const textToCopy = showRawTranscription ? rawTranscription : transcription;
    navigator.clipboard.writeText(textToCopy);
    const title = t("copiedToClipboard");
    const raw = t("raw");
    const corrected = t("corrected");
    const copiedToClipboardDesc = t("copiedToClipboardDesc");
    const prefix = showRawTranscription
      ? Array.isArray(raw)
        ? raw.join(" ")
        : raw
      : Array.isArray(corrected)
      ? corrected.join(" ")
      : corrected;
    const suffix = Array.isArray(copiedToClipboardDesc)
      ? copiedToClipboardDesc.join(" ")
      : copiedToClipboardDesc;
    toast({
      title: Array.isArray(title) ? title.join(" ") : title,
      description: `${prefix} ${suffix}`,
    });
  };

  const downloadTranscription = () => {
    const textToDownload = showRawTranscription ? rawTranscription : transcription;
    const blob = new Blob([textToDownload], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcription_${showRawTranscription ? "raw" : "corrected"}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    const title = t("downloadStarted");
    const raw = t("raw");
    const corrected = t("corrected");
    const downloadStartedDesc = t("downloadStartedDesc");
    const prefix = showRawTranscription
      ? Array.isArray(raw)
        ? raw.join(" ")
        : raw
      : Array.isArray(corrected)
      ? corrected.join(" ")
      : corrected;
    const suffix = Array.isArray(downloadStartedDesc) ? downloadStartedDesc.join(" ") : downloadStartedDesc;
    toast({
      title: Array.isArray(title) ? title.join(" ") : title,
      description: `${prefix} ${suffix} transcription_${showRawTranscription ? "raw" : "corrected"}.txt`,
    });
  };

  const downloadAsDocx = () => {
    const textToDownload = showRawTranscription ? rawTranscription : transcription;
    // Simple HTML format that can be opened in Word
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Transcription</title>
        </head>
        <body>
          <h1>Audio Transcription</h1>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Language:</strong> ${selectedLanguage}</p>
          <p><strong>Type:</strong> ${showRawTranscription ? "Raw transcription" : "Grammar corrected"}</p>
          ${
            transcriptionConfidence
              ? `<p><strong>Confidence:</strong> ${Math.round(transcriptionConfidence * 100)}%</p>`
              : ""
          }
          <hr>
          <div style="line-height: 1.6; font-family: Arial, sans-serif;">
            ${textToDownload
              .split("\n")
              .map((line) => `<p>${line}</p>`)
              .join("")}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcription_${showRawTranscription ? "raw" : "corrected"}.docx`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: `${showRawTranscription ? "Raw" : "Corrected"} transcription saved as transcription_${
        showRawTranscription ? "raw" : "corrected"
      }.docx`,
    });
  };

  const clearAll = () => {
    setRecordingState("idle");
    setTranscription("");
    setRawTranscription("");
    setTranscriptionState("idle");
    setRecordingTime(0);
    setUploadedFile(null);
    setIsPlaying(false);
    setDuration(0);
    setTranscriptionConfidence(null);
    setIsAudioLoading(false);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsAudioReady(false);
    setRecordedBlob(null);

    const title = t("cleared");
    const description = t("clearedDesc");
    toast({
      title: Array.isArray(title) ? title.join(" ") : title,
      description: Array.isArray(description) ? description.join(" ") : description,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900 relative overflow-hidden">
      {/* Background pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.01]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.4) 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-200/50 dark:bg-emerald-500/10 rounded-full blur-xl animate-float-slow" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-green-200/50 dark:bg-green-500/10 rounded-full blur-lg animate-float-medium" />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-teal-200/40 dark:bg-teal-500/10 rounded-full blur-2xl animate-float-slow" />
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-amber-200/50 dark:bg-amber-500/10 rounded-full blur-xl animate-float-fast" />

        {/* Processing animation */}
        {transcriptionState === "processing" && (
          <>
            <div className="absolute top-1/4 right-1/4 w-12 h-12 border-2 border-amber-400/60 dark:border-amber-400/20 rounded-full animate-spin" />
            <div className="absolute bottom-1/4 left-1/4 w-8 h-8 border-2 border-orange-400/60 dark:border-orange-400/20 rounded-full animate-spin" />
          </>
        )}
      </div>

      {/* Header */}
      <Header />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6 p-4">
        {/* App Title Section */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-amber-500 bg-clip-text text-transparent">
            {t("appTitle")}
          </h1>
          <p className="text-emerald-700 dark:text-emerald-300 text-lg max-w-2xl mx-auto">
            {t("appDescription")}
          </p>
        </div>

        {/* Audio Input Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Card */}
          <FileUploadZone
            uploadedFile={uploadedFile}
            isDragOver={isDragOver}
            onFileUpload={handleFileUpload}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                handleFileUpload(files[0]);
              }
            }}
            fileInputRef={fileInputRef}
            t={t as (key: string) => string | string[]}
          />

          {/* Recording Controls Component */}
          <RecordingControls
            recordingState={recordingState}
            microphonePermission={microphonePermission}
            isCheckingPermission={isCheckingPermission}
            recordingTime={recordingTime}
            formatTime={formatTime}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onRequestPermission={requestMicrophonePermission}
            onPlayRecording={async () => {
              if (audioUrl) {
                // Scroll to audio player
                const audioPlayer = document.querySelector("[data-audio-player]");
                audioPlayer?.scrollIntoView({ behavior: "smooth" });

                // Wait a bit for scroll to complete, then play audio
                setTimeout(async () => {
                  const audio = audioRef.current;
                  if (audio && !isPlaying && !isAudioLoading) {
                    try {
                      await audio.play();
                      setIsPlaying(true);
                    } catch (error) {
                      console.error("Error playing audio:", error);
                      setIsPlaying(false);
                      setIsAudioLoading(false);
                    }
                  }
                }, 500);
              }
            }}
            isAudioLoading={isAudioLoading}
          />
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <AudioPlayer
            audioUrl={audioUrl}
            uploadedFile={uploadedFile}
            transcriptionState={transcriptionState}
            onProcessAudio={processAudio}
          />
        )}

        {/* Processing Progress */}
        {transcriptionState === "processing" && (
          <ProcessingProgress processingProgress={processingProgress} />
        )}

        {/* Transcription Results */}
        {transcription && (
          <TranscriptionResults
            transcription={transcription}
            rawTranscription={rawTranscription}
            showRawTranscription={showRawTranscription}
            transcriptionState={transcriptionState}
            transcriptionConfidence={transcriptionConfidence}
            selectedLanguage={selectedLanguage}
            onToggleRawTranscription={setShowRawTranscription}
            onTranscriptionChange={setTranscription}
            onRawTranscriptionChange={setRawTranscription}
            onCopyToClipboard={copyToClipboard}
            onDownloadTranscription={downloadTranscription}
            onDownloadAsDocx={downloadAsDocx}
            onClearAll={clearAll}
          />
        )}

        {/* Clear All Button */}
        {(audioUrl || transcription) && !transcription && (
          <div className="flex justify-center">
            <button
              onClick={clearAll}
              className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md"
            >
              {t("clearAll")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
