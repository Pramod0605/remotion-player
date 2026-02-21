/**
 * ChromaKeyVideo — Green screen removal using Remotion's <Video> + canvas chroma key.
 * 
 * The <Video> component plays the avatar and provides audio.
 * A canvas on top processes the video frames for green screen removal.
 */
import React, { useEffect, useRef, useCallback } from 'react';
import {
    useCurrentFrame,
    useVideoConfig,
    Video,
} from 'remotion';

interface ChromaKeyVideoProps {
    src: string;
    style?: React.CSSProperties;
    /** Audio volume 0-1. Default: 1 (full volume) */
    volume?: number;
    /** Chroma key similarity threshold 0-1. Higher = more aggressive. Default: 0.40 */
    similarity?: number;
    /** Smoothness of keying edge 0-1. Default: 0.12 */
    smoothness?: number;
    /** Spill suppression strength 0-1. Default: 0.5 */
    spillSuppression?: number;
}

export const ChromaKeyVideo: React.FC<ChromaKeyVideoProps> = ({
    src,
    style,
    volume = 1,
    similarity = 0.40,
    smoothness = 0.12,
    spillSuppression = 0.5,
}) => {
    const frame = useCurrentFrame();
    useVideoConfig();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const processFrame = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) return;

        const w = video.videoWidth;
        const h = video.videoHeight;
        if (w === 0 || h === 0) return;

        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        // Green screen key color (typical chroma green)
        const keyR = 0, keyG = 177, keyB = 64;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Compute color distance from green key
            const dr = (r - keyR) / 255;
            const dg = (g - keyG) / 255;
            const db = (b - keyB) / 255;
            const dist = Math.sqrt(dr * dr + dg * dg + db * db);

            // Also check if pixel is "green-ish" (g channel dominates)
            const greenDominance = g - Math.max(r, b);
            const isGreenish = greenDominance > 30;

            if (dist < similarity || (isGreenish && dist < similarity + 0.15)) {
                data[i + 3] = 0;
            } else if (dist < similarity + smoothness || (isGreenish && dist < similarity + smoothness + 0.1)) {
                const edgeDist = isGreenish ? similarity + smoothness + 0.1 : similarity + smoothness;
                const alpha = Math.min(1, (dist - similarity) / (edgeDist - similarity));
                data[i + 3] = Math.round(alpha * 255);

                if (spillSuppression > 0) {
                    const maxRB = Math.max(r, b);
                    data[i + 1] = Math.round(g - (g - maxRB) * spillSuppression * (1 - alpha));
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }, [similarity, smoothness, spillSuppression]);

    // Process on each frame change
    useEffect(() => {
        const timer = setTimeout(processFrame, 16);
        return () => clearTimeout(timer);
    }, [frame, processFrame]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const handler = () => processFrame();
        video.addEventListener('seeked', handler);
        video.addEventListener('loadeddata', handler);
        video.addEventListener('timeupdate', handler);
        return () => {
            video.removeEventListener('seeked', handler);
            video.removeEventListener('loadeddata', handler);
            video.removeEventListener('timeupdate', handler);
        };
    }, [processFrame]);

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                ...style,
            }}
        >
            {/* Remotion Video — handles audio playback + frame-accurate timing */}
            <Video
                ref={videoRef}
                src={src}
                style={{
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    opacity: 0,
                    pointerEvents: 'none',
                }}
                volume={volume}
            />

            {/* Canvas — shows the chromakeyed result */}
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                }}
            />
        </div>
    );
};
