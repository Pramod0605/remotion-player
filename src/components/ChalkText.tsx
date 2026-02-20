/**
 * ChalkText — Remotion-compatible chalk handwriting animation.
 * 
 * Adapted from example.jsx: uses SVG stroke-dashoffset driven by
 * Remotion's useCurrentFrame() instead of requestAnimationFrame.
 * Each letter animates in sequence with configurable delay.
 */
import React, { useRef, useEffect, useState } from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

// ── SVG Letter Paths (hand-drawn style) ────────────────────
const LETTER_PATHS: Record<string, string> = {
    A: 'M 2 28 L 14 2 L 26 28 M 7 18 L 21 18',
    B: 'M 4 2 L 4 28 M 4 2 C 20 2, 22 14, 4 15 C 22 15, 24 28, 4 28',
    C: 'M 24 6 C 14 -2, -2 6, 4 15 C -2 24, 14 32, 24 24',
    D: 'M 4 2 L 4 28 M 4 2 C 28 2, 28 28, 4 28',
    E: 'M 22 2 L 4 2 L 4 28 L 22 28 M 4 15 L 18 15',
    F: 'M 22 2 L 4 2 L 4 28 M 4 15 L 18 15',
    G: 'M 24 6 C 14 -2, -2 6, 4 15 C -2 24, 14 32, 24 24 L 24 15 L 16 15',
    H: 'M 4 2 L 4 28 M 24 2 L 24 28 M 4 15 L 24 15',
    I: 'M 8 2 L 20 2 M 14 2 L 14 28 M 8 28 L 20 28',
    J: 'M 8 2 L 22 2 M 18 2 L 18 22 C 18 30, 4 30, 4 22',
    K: 'M 4 2 L 4 28 M 22 2 L 4 16 L 22 28',
    L: 'M 4 2 L 4 28 L 22 28',
    M: 'M 2 28 L 2 2 L 14 18 L 26 2 L 26 28',
    N: 'M 4 28 L 4 2 L 24 28 L 24 2',
    O: 'M 14 2 C -2 2, -2 28, 14 28 C 30 28, 30 2, 14 2',
    P: 'M 4 2 L 4 28 M 4 2 C 24 2, 24 16, 4 16',
    Q: 'M 14 2 C -2 2, -2 28, 14 28 C 30 28, 30 2, 14 2 M 18 22 L 26 30',
    R: 'M 4 2 L 4 28 M 4 2 C 24 2, 24 16, 4 16 L 22 28',
    S: 'M 22 6 C 18 -2, 2 2, 6 10 C 10 18, 26 14, 22 24 C 18 32, 2 28, 6 22',
    T: 'M 2 2 L 26 2 M 14 2 L 14 28',
    U: 'M 4 2 L 4 22 C 4 30, 24 30, 24 22 L 24 2',
    V: 'M 2 2 L 14 28 L 26 2',
    W: 'M 0 2 L 7 28 L 14 12 L 21 28 L 28 2',
    X: 'M 2 2 L 26 28 M 26 2 L 2 28',
    Y: 'M 2 2 L 14 16 L 26 2 M 14 16 L 14 28',
    Z: 'M 2 2 L 26 2 L 2 28 L 26 28',
    '0': 'M 14 2 C -2 2, -2 28, 14 28 C 30 28, 30 2, 14 2',
    '1': 'M 8 8 L 14 2 L 14 28 M 8 28 L 20 28',
    '2': 'M 4 8 C 4 -2, 24 -2, 24 8 C 24 14, 4 22, 4 28 L 24 28',
    '3': 'M 4 4 C 14 -2, 26 4, 14 14 C 26 14, 26 28, 14 28 C 4 28, 2 24, 4 22',
    '4': 'M 20 28 L 20 2 L 2 20 L 26 20',
    '5': 'M 22 2 L 6 2 L 4 14 C 20 10, 26 16, 22 24 C 18 30, 4 28, 4 24',
    '6': 'M 20 4 C 14 -2, 2 4, 4 14 C 2 24, 14 30, 22 24 C 28 18, 18 12, 4 14',
    '7': 'M 2 2 L 26 2 L 12 28',
    '8': 'M 14 14 C 2 8, 2 -2, 14 2 C 26 2, 26 10, 14 14 C 0 18, 0 30, 14 28 C 28 28, 28 18, 14 14',
    '9': 'M 8 26 C 14 32, 26 26, 24 16 C 26 6, 14 0, 6 6 C 0 12, 10 18, 24 16',
    ' ': '',
    '!': 'M 14 2 L 14 18 M 14 24 L 14 26',
    '.': 'M 14 26 L 14 28',
    ',': 'M 14 26 L 12 30',
    "'": 'M 14 2 L 14 8',
    '?': 'M 6 6 C 6 -2, 22 -2, 22 8 C 22 14, 14 14, 14 18 M 14 24 L 14 26',
    '-': 'M 6 15 L 22 15',
    ':': 'M 14 10 L 14 12 M 14 22 L 14 24',
    ';': 'M 14 10 L 14 12 M 14 22 L 12 26',
    '(': 'M 18 2 C 6 8, 6 22, 18 28',
    ')': 'M 10 2 C 22 8, 22 22, 10 28',
    '"': 'M 10 2 L 10 8 M 18 2 L 18 8',
};

// ── Per-letter jitter (seeded pseudo-random) ───────────────
function getJitter(index: number) {
    const seed = index * 17 + 7;
    return {
        x: ((seed * 13) % 7 - 3) * 0.8,
        y: ((seed * 19) % 9 - 4) * 0.6,
        r: ((seed * 23) % 11 - 5) * 0.5,
    };
}

// ── Single chalk letter ────────────────────────────────────
interface ChalkLetterProps {
    char: string;
    startFrame: number;    // frame at which this letter starts drawing
    drawDuration: number;  // frames to fully draw this letter
    size: number;
    color: string;
}

const ChalkLetter: React.FC<ChalkLetterProps> = ({
    char,
    startFrame,
    drawDuration,
    size,
    color,
}) => {
    const frame = useCurrentFrame();
    const pathRef = useRef<SVGPathElement>(null);
    const [pathLength, setPathLength] = useState(0);

    const pathData = LETTER_PATHS[char.toUpperCase()] ?? '';
    const jitter = getJitter(startFrame);

    // Measure path length
    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, [pathData]);

    if (char === ' ') {
        return <div style={{ width: size * 0.35, flexShrink: 0 }} />;
    }
    if (!pathData) {
        return <div style={{ width: size * 0.5, flexShrink: 0 }} />;
    }

    // Draw progress: 0 → 1 over drawDuration frames
    const progress = interpolate(
        frame,
        [startFrame, startFrame + drawDuration],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );
    // Ease out
    const eased = 1 - Math.pow(1 - progress, 2.5);
    const offset = pathLength * (1 - eased);

    return (
        <svg
            width={size}
            height={size}
            viewBox="-2 -2 32 36"
            style={{
                overflow: 'visible',
                flexShrink: 0,
                transform: `translate(${jitter.x}px, ${jitter.y}px) rotate(${jitter.r}deg)`,
            }}
        >
            {/* Chalk dust glow */}
            <path
                d={pathData}
                fill="none"
                stroke={`${color}20`}
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={pathLength || undefined}
                strokeDashoffset={offset}
                style={{ filter: 'blur(4px)' }}
            />
            {/* Main chalk stroke */}
            <path
                ref={pathRef}
                d={pathData}
                fill="none"
                stroke={`${color}eb`}
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={pathLength || undefined}
                strokeDashoffset={offset}
            />
            {/* Inner bright line */}
            <path
                d={pathData}
                fill="none"
                stroke={`${color}80`}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={pathLength || undefined}
                strokeDashoffset={offset}
            />
        </svg>
    );
};

// ── ChalkText — full string rendered as chalk letters ──────
export interface ChalkTextProps {
    text: string;
    startFrame: number;
    /** Frames between each letter start. Default: 3 */
    charDelay?: number;
    /** Frames to draw each letter. Default: 12 */
    drawDuration?: number;
    /** Letter size in px. Default: 36 */
    fontSize?: number;
    /** Chalk color hex. Default: #fffefa (white chalk) */
    color?: string;
    style?: React.CSSProperties;
}

export const ChalkText: React.FC<ChalkTextProps> = ({
    text,
    startFrame,
    charDelay = 3,
    drawDuration = 12,
    fontSize = 36,
    color = '#fffefa',
    style,
}) => {
    const letters = text.split('');

    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: `${fontSize * 0.02}px`,
            ...style,
        }}>
            {letters.map((char, i) => (
                <ChalkLetter
                    key={`${i}-${char}`}
                    char={char}
                    startFrame={startFrame + i * charDelay}
                    drawDuration={drawDuration}
                    size={fontSize}
                    color={color}
                />
            ))}
        </div>
    );
};

// ── ChalkDust — floating particle overlay ──────────────────
export const ChalkDust: React.FC<{ count?: number }> = ({ count = 40 }) => {
    // Generate deterministic particles
    const particles = Array.from({ length: count }, (_, i) => ({
        x: ((i * 37 + 13) % 100),
        y: ((i * 53 + 29) % 100),
        size: (i % 5) * 0.4 + 0.5,
        opacity: (i % 7) * 0.02 + 0.03,
    }));

    return (
        <>
            {particles.map((d, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: `${d.x}%`,
                        top: `${d.y}%`,
                        width: d.size,
                        height: d.size,
                        borderRadius: '50%',
                        backgroundColor: `rgba(255,255,255,${d.opacity})`,
                        pointerEvents: 'none',
                    }}
                />
            ))}
        </>
    );
};
