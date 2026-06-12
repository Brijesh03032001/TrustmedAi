#!/usr/bin/env python3
"""
ElevenLabs voice helpers for TrustMed-AI.

Keeps API keys on the backend and exposes small functions for FastAPI routes.
"""

import os
from typing import Optional

import httpx


ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1"
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")
ELEVENLABS_TTS_MODEL = os.environ.get("ELEVENLABS_TTS_MODEL", "eleven_multilingual_v2")
ELEVENLABS_STT_MODEL = os.environ.get("ELEVENLABS_STT_MODEL", "scribe_v2")
ELEVENLABS_OUTPUT_FORMAT = os.environ.get("ELEVENLABS_OUTPUT_FORMAT", "mp3_44100_128")


class VoiceServiceError(RuntimeError):
    """Raised when ElevenLabs voice processing fails."""


def ensure_configured() -> None:
    if not ELEVENLABS_API_KEY:
        raise VoiceServiceError("ELEVENLABS_API_KEY is not configured.")


async def text_to_speech(text: str, voice_id: Optional[str] = None) -> bytes:
    """Convert text to MP3 audio using ElevenLabs text-to-speech."""
    ensure_configured()
    clean_text = text.strip()
    if not clean_text:
        raise VoiceServiceError("Text is required for speech generation.")

    selected_voice = voice_id or ELEVENLABS_VOICE_ID
    url = f"{ELEVENLABS_API_BASE}/text-to-speech/{selected_voice}"
    params = {"output_format": ELEVENLABS_OUTPUT_FORMAT}
    payload = {
        "text": clean_text[:5000],
        "model_id": ELEVENLABS_TTS_MODEL,
    }
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, params=params, json=payload, headers=headers)

    if response.status_code >= 400:
        raise VoiceServiceError(f"ElevenLabs TTS failed: {response.status_code} {response.text[:300]}")

    return response.content


async def speech_to_text(audio_bytes: bytes, filename: str, content_type: str) -> str:
    """Transcribe uploaded audio using ElevenLabs Scribe."""
    ensure_configured()
    if not audio_bytes:
        raise VoiceServiceError("Audio file is required for transcription.")

    url = f"{ELEVENLABS_API_BASE}/speech-to-text"
    headers = {"xi-api-key": ELEVENLABS_API_KEY}
    files = {
        "file": (filename or "recording.webm", audio_bytes, content_type or "audio/webm"),
    }
    data = {
        "model_id": ELEVENLABS_STT_MODEL,
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(url, headers=headers, data=data, files=files)

    if response.status_code >= 400:
        raise VoiceServiceError(f"ElevenLabs STT failed: {response.status_code} {response.text[:300]}")

    payload = response.json()
    transcript = str(payload.get("text", "")).strip()
    if not transcript:
        raise VoiceServiceError("ElevenLabs returned an empty transcript.")

    return transcript

