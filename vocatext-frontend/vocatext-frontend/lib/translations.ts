"use client";

type TranslationType = {
  [key: string]: {
    appTitle: string;
    appDescription: string;
    uploadTitle: string;
    uploadDescription: string;
    chooseAudioFile: string;
    audioSupportText: string;
    supportedFormats: string;
    recordTitle: string;
    recordingInProgress: string;
    recordingCompleted: string;
    recordVoice: string;
    readyToRecord: string;
    clickToStart: string;
    recordingTips: string;
    tipsContent: string[];
    microphoneAccess: string;
    startRecording: string;
    stopRecording: string;
    recordAgain: string;
    playRecording: string;
    loading: string;
    audioPlayer: string;
    uploaded: string;
    recorded: string;
    transcribeAudio: string;
    processingAudio: string;
    transcriptionResults: string;
    corrected: string;
    raw: string;
    confidence: string;
    words: string;
    characters: string;
    clearAll: string;
    uploadCompleted: string;
    uploadCompletedDesc: string;
    recordingCompletedTitle: string;
    recordingCompletedDesc: string;
    recordingStarted: string;
    recordingStartedDesc: string;
    recordingFailed: string;
    recordingFailedDesc: string;
    readyForTranscription: string;
    invalidFileType: string;
    invalidFileTypeDesc: string;
    fileTooLarge: string;
    fileTooLargeDesc: string;
    fileUploadedSuccess: string;
    fileUploadedDesc: string;
    copiedToClipboard: string;
    copiedToClipboardDesc: string;
    downloadStarted: string;
    downloadStartedDesc: string;
    cleared: string;
    clearedDesc: string;
    grammarCorrected: string;
    rawTrancription: string;
    transcriptionCompleted: string;
    transcriptionCompletedDesc: string;
    transcriptionFailed: string;
    networkError: string;
    networkErrorDesc: string;
    fileTooLargeError: string;
    fileTooLargeErrorDesc: string;
    invalidFormatError: string;
    invalidFormatErrorDesc: string;
    serviceUnavailable: string;
    serviceUnavailableDesc: string;
    transcribingAudio: string;
    // Microphone Permission translations
    microphoneAccessDenied: string;
    microphoneAccessDeniedDesc: string;
    tryAgain: string;
    checking: string;
    microphonePermissionRequired: string;
    microphonePermissionRequiredDesc: string;
    requesting: string;
    allowMicrophoneAccess: string;
  };
};

export const translations: TranslationType = {
  en: {
    appTitle: "VocaText",
    appDescription:
      "Transform your voice into text with AI-powered speech recognition. Upload audio files or record directly for instant, accurate transcriptions.",
    uploadTitle: "Upload Audio File",
    uploadDescription: "Drag and drop or click to upload an audio file",
    chooseAudioFile: "Choose an audio file",
    audioSupportText: "Supports MP3, WAV, M4A, FLAC, and more (max 100MB)",
    supportedFormats: "Supported Formats",
    recordTitle: "Record Audio",
    recordingInProgress: "Recording in progress...",
    recordingCompleted: "Recording completed successfully",
    recordVoice: "Record your voice directly in the browser",
    readyToRecord: "Ready to Record",
    clickToStart: "Click the button below to start recording",
    recordingTips: "Recording Tips",
    tipsContent: [
      "Speak clearly and at a normal pace",
      "Ensure good microphone access",
      "Record in a quiet environment for best results",
    ],
    microphoneAccess: "Browser microphone access required",
    startRecording: "Start Recording",
    stopRecording: "Stop Recording",
    recordAgain: "Record Again",
    playRecording: "Play Recording",
    loading: "Loading...",
    audioPlayer: "Audio Player",
    uploaded: "Uploaded",
    recorded: "Recorded",
    transcribeAudio: "Transcribe Audio",
    transcribingAudio: "Transcribing audio",
    processingAudio: "Processing Audio...",
    transcriptionResults: "Transcription Results",
    corrected: "Corrected",
    raw: "Raw",
    confidence: "Confidence",
    words: "words",
    characters: "characters",
    clearAll: "Clear All",
    uploadCompleted: "Upload completed",
    uploadCompletedDesc: "Audio file uploaded successfully, processing...",
    recordingCompletedTitle: "Recording completed",
    recordingCompletedDesc: "You can now listen to your recording before processing",
    recordingStarted: "Recording started",
    recordingStartedDesc: "Speak clearly into your microphone",
    recordingFailed: "Recording failed",
    recordingFailedDesc: "Please check your microphone permissions",
    readyForTranscription: "Ready for transcription",
    invalidFileType: "Invalid file type",
    invalidFileTypeDesc: "Please upload an audio file (MP3, WAV, M4A, etc.)",
    fileTooLarge: "File too large",
    fileTooLargeDesc: "Please upload a file smaller than 100MB",
    fileUploadedSuccess: "File uploaded successfully",
    fileUploadedDesc: "is ready for transcription",
    copiedToClipboard: "Copied to clipboard",
    copiedToClipboardDesc: "transcription text has been copied",
    downloadStarted: "Download started",
    downloadStartedDesc: "transcription saved as",
    rawTrancription: "Raw transcription",
    grammarCorrected: "Grammar corrected",
    cleared: "Cleared",
    clearedDesc: "All data has been cleared",
    transcriptionCompleted: "Transcription completed",
    transcriptionCompletedDesc: "Your audio has been transcribed with",
    transcriptionFailed: "Failed to transcribe audio",
    networkError: "Cannot connect to transcription service",
    networkErrorDesc: "Please check your internet connection",
    fileTooLargeError: "Audio file is too large",
    fileTooLargeErrorDesc: "Please upload a file smaller than 100MB",
    invalidFormatError: "Invalid audio format",
    invalidFormatErrorDesc: "Please try a different audio file format",
    serviceUnavailable: "Service temporarily unavailable",
    serviceUnavailableDesc: "Please try again in a few minutes",
    // Microphone Permission translations
    microphoneAccessDenied: "Microphone Access Denied",
    microphoneAccessDeniedDesc:
      "To use voice recording, please allow microphone access in your browser settings. On mobile, you may need to refresh the page after changing permissions.",
    tryAgain: "Try Again",
    checking: "Checking...",
    microphonePermissionRequired: "Microphone Permission Required",
    microphonePermissionRequiredDesc:
      "This app needs access to your microphone to record audio. Click below to grant permission.",
    requesting: "Requesting...",
    allowMicrophoneAccess: "Allow Microphone Access",
  },
  fr: {
    appTitle: "VocaText",
    appDescription:
      "Transformez votre voix en texte grâce à la reconnaissance vocale alimentée par l'IA. Téléchargez des fichiers audio ou enregistrez directement pour des transcriptions instantanées et précises.",
    uploadTitle: "Télécharger un Fichier Audio",
    uploadDescription: "Glissez-déposez ou cliquez pour télécharger un fichier audio",
    chooseAudioFile: "Choisir un fichier audio",
    audioSupportText: "Supporte MP3, WAV, M4A, FLAC, et plus (max 100MB)",
    supportedFormats: "Formats Supportés",
    recordTitle: "Enregistrer Audio",
    recordingInProgress: "Enregistrement en cours...",
    recordingCompleted: "Enregistrement terminé avec succès",
    recordVoice: "Enregistrez votre voix directement dans le navigateur",
    readyToRecord: "Prêt à Enregistrer",
    clickToStart: "Cliquez sur le bouton ci-dessous pour commencer l'enregistrement",
    recordingTips: "Conseils d'Enregistrement",
    tipsContent: [
      "Parlez clairement et à un rythme normal",
      "Assurez un bon accès au microphone",
      "Enregistrez dans un environnement calme pour de meilleurs résultats",
    ],
    microphoneAccess: "Accès au microphone du navigateur requis",
    startRecording: "Commencer l'Enregistrement",
    stopRecording: "Arrêter l'Enregistrement",
    recordAgain: "Enregistrer à Nouveau",
    playRecording: "Lire l'Enregistrement",
    loading: "Chargement...",
    audioPlayer: "Lecteur Audio",
    uploaded: "Téléchargé",
    recorded: "Enregistré",
    transcribeAudio: "Transcrire l'Audio",
    processingAudio: "Traitement de l'Audio...",
    transcribingAudio: "Transcription audio",
    transcriptionResults: "Résultats de la Transcription",
    corrected: "Corrigé",
    raw: "Brut",
    confidence: "Confiance",
    words: "mots",
    characters: "caractères",
    rawTrancription: "Transcription brute",
    grammarCorrected: "Grammaire corrigée",
    clearAll: "Tout Effacer",
    uploadCompleted: "Téléchargement terminé",
    uploadCompletedDesc: "Fichier audio téléchargé avec succès, traitement en cours...",
    recordingCompletedTitle: "Enregistrement terminé",
    recordingCompletedDesc: "Vous pouvez maintenant écouter votre enregistrement avant de le traiter",
    recordingStarted: "Enregistrement démarré",
    recordingStartedDesc: "Parlez clairement dans votre microphone",
    recordingFailed: "Échec de l'enregistrement",
    recordingFailedDesc: "Veuillez vérifier les permissions de votre microphone",
    readyForTranscription: "Prêt pour la transcription",
    invalidFileType: "Type de fichier invalide",
    invalidFileTypeDesc: "Veuillez télécharger un fichier audio (MP3, WAV, M4A, etc.)",
    fileTooLarge: "Fichier trop volumineux",
    fileTooLargeDesc: "Veuillez télécharger un fichier inférieur à 100MB",
    fileUploadedSuccess: "Fichier téléchargé avec succès",
    fileUploadedDesc: "est prêt pour la transcription",
    copiedToClipboard: "Copié dans le presse-papiers",
    copiedToClipboardDesc: "texte de transcription a été copié",
    downloadStarted: "Téléchargement démarré",
    downloadStartedDesc: "transcription enregistrée sous",
    cleared: "Effacé",
    clearedDesc: "Toutes les données ont été effacées",
    transcriptionCompleted: "Transcription terminée",
    transcriptionCompletedDesc: "Votre audio a été transcrit avec",
    transcriptionFailed: "Échec de la transcription audio",
    networkError: "Impossible de se connecter au service de transcription",
    networkErrorDesc: "Veuillez vérifier votre connexion Internet",
    fileTooLargeError: "Fichier audio trop volumineux",
    fileTooLargeErrorDesc: "Veuillez télécharger un fichier inférieur à 100MB",
    invalidFormatError: "Format audio invalide",
    invalidFormatErrorDesc: "Veuillez essayer un format de fichier audio différent",
    serviceUnavailable: "Service temporairement indisponible",
    serviceUnavailableDesc: "Veuillez réessayer dans quelques minutes",
    // Microphone Permission translations
    microphoneAccessDenied: "Accès au Microphone Refusé",
    microphoneAccessDeniedDesc:
      "Pour utiliser l'enregistrement vocal, veuillez autoriser l'accès au microphone dans les paramètres de votre navigateur. Sur mobile, vous devrez peut-être actualiser la page après avoir modifié les permissions.",
    tryAgain: "Réessayer",
    checking: "Vérification...",
    microphonePermissionRequired: "Permission du Microphone Requise",
    microphonePermissionRequiredDesc:
      "Cette application a besoin d'accéder à votre microphone pour enregistrer l'audio. Cliquez ci-dessous pour accorder la permission.",
    requesting: "Demande en cours...",
    allowMicrophoneAccess: "Autoriser l'Accès au Microphone",
  },
};

export type SupportedLanguage = keyof typeof translations;
