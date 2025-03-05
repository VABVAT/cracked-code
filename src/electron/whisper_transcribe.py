import torch
import whisper
import sys
import sounddevice as sd
import numpy as np
import threading
import time
import tempfile
import wave
import os
from collections import deque

# Load Whisper Model (optimize device selection)
device = "cuda" if torch.cuda.is_available() else "cpu"
model = whisper.load_model("base", device=device)

# Audio buffer for real-time processing
buffer = deque(maxlen=10)
transcription_text = ""

# Find system audio device dynamically
def get_system_audio_device():
    devices = sd.query_devices()
    for i, device in enumerate(devices):
          # Debug: List all audio devices
        if "Stereo Mix" in device["name"] or "Loopback" in device["name"]:
            return i  # Return first match
    return None  # If not found

# Callback to store incoming audio data
def callback(indata, frames, time, status):
    if status:
        print(status, file=sys.stderr)
    buffer.append(indata.copy())  # Store audio data

# Convert buffer to WAV file for Whisper processing
def buffer_to_wav():
    temp_wav = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    with wave.open(temp_wav.name, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit PCM
        wf.setframerate(16000)
        wf.writeframes((np.concatenate(buffer) * 32767).astype(np.int16).tobytes())
    return temp_wav.name

# Process and transcribe audio in real-time
def process_audio():
    global transcription_text  # Access global transcript
    while True:
        if len(buffer) >= 3:  # Reduce latency by processing more often
            wav_file = buffer_to_wav()
            buffer.clear()  # Reset buffer

            # Transcribe with Whisper
            result = model.transcribe(wav_file, fp16=torch.cuda.is_available(), temperature=0)
            new_text = result["text"].strip()

            # Update global transcript
            if new_text:
                transcription_text += " " + new_text
                print(f"Live Transcript: {transcription_text}", flush=True)

            os.remove(wav_file)  # Clean up temp file

        time.sleep(0.05)  # Prevent CPU overuse

# Start real-time transcription
def transcribe():
    device_id = get_system_audio_device()
    if device_id is None:
        print("No system audio device found! Please enable 'Stereo Mix' or 'Loopback'.")
        sys.exit(1)

    with sd.InputStream(device=device_id, samplerate=16000, channels=1, dtype="float32",
                        callback=callback, blocksize=1024):

        processing_thread = threading.Thread(target=process_audio, daemon=True)
        processing_thread.start()

        while True:
            time.sleep(1)

if __name__ == "__main__":
    transcribe()
