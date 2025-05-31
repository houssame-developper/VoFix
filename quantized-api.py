import os
import torch
import torchaudio
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import (
    WhisperProcessor,
    WhisperForConditionalGeneration,
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
    pipeline
)
from huggingface_hub import snapshot_download
from torch.quantization import quantize_dynamic
import logging
import ffmpeg  # Add this import at the top
import tempfile

# Silence all transformers and huggingface logging
logging.getLogger("transformers").setLevel(logging.ERROR)
logging.getLogger("urllib3").setLevel(logging.ERROR)
logging.getLogger("huggingface_hub").setLevel(logging.ERROR)

app = Flask(__name__)
CORS(app)

# ========== Load Whisper Model (quantized + small) ==========
def load_whisper_model(model_size="small", save_dir="./saved_models/whisper"):
    os.makedirs(save_dir, exist_ok=True)
    model_name = f"openai/whisper-{model_size}"
    processor = WhisperProcessor.from_pretrained(model_name, cache_dir=save_dir)
    model = WhisperForConditionalGeneration.from_pretrained(model_name, cache_dir=save_dir)

    model = quantize_dynamic(model, {torch.nn.Linear}, dtype=torch.qint8)
    model.to("cuda" if torch.cuda.is_available() else "cpu")
    return processor, model

# ========== Load Grammar Correction Model (quantized) ==========
def load_grammar_model(save_dir="./saved_models/grammar_corrector"):
    os.makedirs(save_dir, exist_ok=True)
    model_name = "prithivida/grammar_error_correcter_v1"
    tokenizer = AutoTokenizer.from_pretrained(model_name, cache_dir=save_dir)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name, cache_dir=save_dir)

    model = quantize_dynamic(model, {torch.nn.Linear}, dtype=torch.qint8)

    grammar_pipeline = pipeline(
        "text2text-generation",
        model=model,
        tokenizer=tokenizer,
        device=0 if torch.cuda.is_available() else -1
    )
    return grammar_pipeline

# ========== Optimized Audio Loader ==========
def load_audio(audio_path):
    # Use ffmpeg to convert any audio to 16kHz mono wav in a temp file
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_wav:
        tmp_wav_path = tmp_wav.name
    try:
        (
            ffmpeg
            .input(audio_path)
            .output(tmp_wav_path, format='wav', ac=1, ar='16k')
            .overwrite_output()
            .run(quiet=True)
        )
        waveform, sample_rate = torchaudio.load(tmp_wav_path)
        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
            waveform = resampler(waveform)
        return waveform.squeeze().numpy(), 16000
    finally:
        if os.path.exists(tmp_wav_path):
            os.remove(tmp_wav_path)

# ========== Audio Transcription ==========
def transcribe_audio(audio_file, processor, model):
    audio, _ = load_audio(audio_file)
    input_features = processor(audio, sampling_rate=16000, return_tensors="pt").input_features
    input_features = input_features.to(model.device)

    with torch.no_grad():
        generated_ids = model.generate(input_features)

    return processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

def transcribe_long_audio(audio_file, processor, model, chunk_length_s=30):
    audio, sample_rate = load_audio(audio_file)
    audio_length_s = len(audio) / sample_rate

    if audio_length_s <= chunk_length_s:
        return transcribe_audio(audio_file, processor, model)

    chunk_size = int(chunk_length_s * sample_rate)
    transcription_chunks = []

    for i in range(0, len(audio), chunk_size):
        chunk = audio[i:i + chunk_size]
        if len(chunk) < 0.5 * chunk_size:
            continue
        inputs = processor(chunk, sampling_rate=16000, return_tensors="pt")
        input_features = inputs.input_features.to(model.device)

        with torch.no_grad():
            generated_ids = model.generate(input_features)

        text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        transcription_chunks.append(text)

    return " ".join(transcription_chunks)

# ========== Grammar Correction ==========
def correct_grammar(text, grammar_pipeline):
    sentences = [s.strip() for s in text.split('.') if s.strip()]
    results = grammar_pipeline(sentences, batch_size=4)
    return '. '.join([r['generated_text'] for r in results])

# ========== Initialize Models ==========
processor, whisper_model = load_whisper_model("small")
grammar_pipeline = load_grammar_model()

# ========== Warm-Up Models ==========
def warm_up_models():
    dummy_audio = torch.zeros(1, 80, 3000).to(whisper_model.device)
    with torch.no_grad():
        whisper_model.generate(dummy_audio)
    _ = correct_grammar("This is a warm up test.", grammar_pipeline)

warm_up_models()

# ========== Flask Route ==========
@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided."}), 400

    audio_file = request.files['audio']
    os.makedirs("./temp", exist_ok=True)
    audio_path = f"./temp/{audio_file.filename}"
    audio_file.save(audio_path)

    try:
        transcription = transcribe_long_audio(audio_path, processor, whisper_model)
        corrected_text = correct_grammar(transcription, grammar_pipeline)

        return jsonify({
            "raw_transcription": transcription,
            "corrected_transcription": corrected_text
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)

# ========== Run App ==========
if __name__ == '__main__':
    import logging
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.WARNING)
    app.run(debug=False, port=5000)

