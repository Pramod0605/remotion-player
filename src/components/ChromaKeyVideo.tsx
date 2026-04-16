/**
 * ChromaKeyVideo — Green screen removal using Remotion's OffthreadVideo + canvas chroma key.
 *
 * The avatar clips are shot on a dark muted green (#216D3E), NOT standard bright green.
 * Detection: Sample pixel at coordinates (2, 2) from frame 0 of the avatar clip.
 * Check if green channel is dominant (G > R && G > B). This mirrors player_v3.html.
 *
 * Parameters (matching player_v3.html lines 1920-1933):
 * - similarity: 0.20 (increased to catch edge pixels)
 * - smoothness: 0.05 (added slight feathering)
 */
import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
    useCurrentFrame,
    useVideoConfig,
    OffthreadVideo,
} from 'remotion';

interface ChromaKeyVideoProps {
    src: string;
    style?: React.CSSProperties;
    /** Audio volume 0-1. Default: 1 (full volume) */
    volume?: number;
    /** Chroma key similarity threshold 0-1. Default: 0.20 */
    similarity?: number;
    /** Smoothness of keying edge 0-1. Default: 0.05 */
    smoothness?: number;
}

export const ChromaKeyVideo: React.FC<ChromaKeyVideoProps> = ({
    src,
    style,
    volume = 1,
    similarity = 0.20,
    smoothness = 0.05,
}) => {
    const frame = useCurrentFrame();
    useVideoConfig();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [keyColor, setKeyColor] = useState<{ r: number; g: number; b: number } | null>(null);

    const detectKeyColor = useCallback(() => {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);
        const pixel = ctx.getImageData(2, 2, 1, 1).data;
        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        if (g > r && g > b) {
            setKeyColor({ r, g, b });
        }
    }, []);

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

        const keyR = keyColor?.r ?? 33;
        const keyG = keyColor?.g ?? 109;
        const keyB = keyColor?.b ?? 62;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const dr = (r - keyR) / 255;
            const dg = (g - keyG) / 255;
            const db = (b - keyB) / 255;
            const dist = Math.sqrt(dr * dr + dg * dg + db * db);

            if (dist < similarity) {
                data[i + 3] = 0;
            } else if (dist < similarity + smoothness) {
                const alpha = Math.min(1, (dist - similarity) / (similarity + smoothness - similarity));
                data[i + 3] = Math.round(alpha * 255);
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }, [keyColor, similarity, smoothness]);

    useEffect(() => {
        if (frame === 0 && !keyColor) {
            detectKeyColor();
        }
    }, [frame, keyColor, detectKeyColor]);

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
            <OffthreadVideo
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