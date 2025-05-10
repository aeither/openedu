import Groq from 'groq-sdk';
import type { Env } from '../worker';

interface TranscriptionOptions {
    path: string;
    languageCode: string | null;
}

export async function transcribeGroq(env: Env, { path, languageCode }: TranscriptionOptions) {
    const groq = new Groq({
        apiKey: env.GROQ_API_KEY,
    });

    const BOT_TOKEN = env.NODE_ENV === 'development' && env.BOT_TOKEN_DEV ? env.BOT_TOKEN_DEV : env.BOT_TOKEN;
    console.log(`Running in ${env.NODE_ENV} mode`);

    const audio_url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${path}`;
    console.log('audio_url', audio_url);

    try {
        // Fetch the audio file
        const response = await fetch(audio_url);
        const audioBlob = await response.blob();
        // Convert the Blob to an ArrayBuffer
        const audioArrayBuffer = await audioBlob.arrayBuffer();

        // Create a File object from the ArrayBuffer
        const audioFile = new File([audioArrayBuffer], 'audio.ogg', { type: 'audio/ogg' });

        // Transcribe the audio file
        const transcription = await groq.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-large-v3',
            language: languageCode || 'en',
            temperature: 0.0,
        });

        return {
            transcript: transcription.text,
        };
    } catch (error) {
        console.error('Error in convertAudioToText:', error);
        throw error;
    }
}