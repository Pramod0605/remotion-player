/**
 * AnimatedText — Multiple text animation modes driven by DevConfig.
 *
 * Modes:
 * - typewriter: character-by-character reveal with cursor
 * - word_bounce: spring-physics per-word entrance
 * - word_fade: opacity fade per word
 * - karaoke: highlighted active word
 * - slide_up: words slide up from below
 * - slide_left: words slide in from left
 * - scale_pop: words pop in with scale
 * - letter_cascade: letter-by-letter cascade down
 */
import React from 'react';
import {
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
} from 'remotion';
import type { TextAnimationMode } from './DevConfig';

interface AnimatedTextProps {
    text: string;
    startFrame: number;
    mode: TextAnimationMode;
    speed?: number;         // multiplier (from DevConfig)
    fontSize?: number;
    fontWeight?: number;
    lineHeight?: number;
    color?: string;
    style?: React.CSSProperties;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
    text,
    startFrame,
    mode,
    speed = 1.0,
    fontSize = 18,
    fontWeight = 400,
    lineHeight = 1.7,
    color = '#e2e8f0',
    style,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const elapsed = Math.max(0, frame - startFrame);

    const baseStyle: React.CSSProperties = {
        fontSize,
        fontWeight,
        lineHeight,
        color,
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        margin: 0,
        ...style,
    };

    switch (mode) {
        case 'typewriter':
            return <TypewriterMode text={text} elapsed={elapsed} speed={speed} style={baseStyle} frame={frame} />;
        case 'word_bounce':
            return <WordBounceMode text={text} elapsed={elapsed} speed={speed} style={baseStyle} fps={fps} startFrame={startFrame} frame={frame} />;
        case 'word_fade':
            return <WordFadeMode text={text} elapsed={elapsed} speed={speed} style={baseStyle} frame={frame} startFrame={startFrame} />;
        case 'karaoke':
            return <KaraokeMode text={text} elapsed={elapsed} speed={speed} style={baseStyle} frame={frame} startFrame={startFrame} />;
        case 'slide_up':
            return <SlideUpMode text={text} elapsed={elapsed} speed={speed} style={baseStyle} fps={fps} startFrame={startFrame} frame={frame} />;
        case 'slide_left':
            return <SlideLeftMode text={text} elapsed={elapsed} speed={speed} style={baseStyle} fps={fps} startFrame={startFrame} frame={frame} />;
        case 'scale_pop':
            return <ScalePopMode text={text} elapsed={elapsed} speed={speed} style={baseStyle} fps={fps} startFrame={startFrame} frame={frame} />;
        case 'letter_cascade':
            return <LetterCascadeMode text={text} elapsed={elapsed} speed={speed} style={baseStyle} fps={fps} startFrame={startFrame} frame={frame} />;
        default:
            return <p style={baseStyle}>{text}</p>;
    }
};

// ── TYPEWRITER ──────────────────────────────────────────
const TypewriterMode: React.FC<{
    text: string; elapsed: number; speed: number;
    style: React.CSSProperties; frame: number;
}> = ({ text, elapsed, speed, style, frame }) => {
    const charsPerFrame = 1.5 * speed;
    const charsToShow = Math.min(Math.floor(elapsed * charsPerFrame), text.length);
    const showCursor = charsToShow < text.length;

    return (
        <p style={style}>
            {text.slice(0, charsToShow)}
            {showCursor && (
                <span style={{
                    display: 'inline-block',
                    width: 2, height: '1.1em',
                    backgroundColor: '#6c63ff',
                    marginLeft: 2,
                    verticalAlign: 'text-bottom',
                    opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                }} />
            )}
        </p>
    );
};

// ── WORD BOUNCE (Spring) ────────────────────────────────
const WordBounceMode: React.FC<{
    text: string; elapsed: number; speed: number;
    style: React.CSSProperties; fps: number; startFrame: number; frame: number;
}> = ({ text, speed, style, fps, startFrame, frame }) => {
    const words = text.split(' ');
    const delay = Math.round(6 / speed);

    return (
        <p style={{ ...style, display: 'flex', flexWrap: 'wrap', gap: '0 7px' }}>
            {words.map((word, i) => {
                const wordFrame = frame - startFrame - i * delay;
                const scale = spring({
                    frame: wordFrame,
                    fps,
                    config: { damping: 8, stiffness: 150, mass: 0.6 },
                });
                const opacity = interpolate(wordFrame, [-2, 3], [0, 1], {
                    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                });

                return (
                    <span key={i} style={{
                        display: 'inline-block',
                        transform: `scale(${scale})`,
                        opacity,
                        transformOrigin: 'center bottom',
                    }}>
                        {word}
                    </span>
                );
            })}
        </p>
    );
};

// ── WORD FADE ───────────────────────────────────────────
const WordFadeMode: React.FC<{
    text: string; elapsed: number; speed: number;
    style: React.CSSProperties; frame: number; startFrame: number;
}> = ({ text, speed, style, frame, startFrame }) => {
    const words = text.split(' ');
    const delay = Math.round(4 / speed);

    return (
        <p style={{ ...style, display: 'flex', flexWrap: 'wrap', gap: '0 7px' }}>
            {words.map((word, i) => {
                const wordStart = startFrame + i * delay;
                const opacity = interpolate(frame, [wordStart, wordStart + 8], [0, 1], {
                    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                });
                const y = interpolate(frame, [wordStart, wordStart + 8], [12, 0], {
                    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                });

                return (
                    <span key={i} style={{
                        display: 'inline-block', opacity,
                        transform: `translateY(${y}px)`,
                    }}>
                        {word}
                    </span>
                );
            })}
        </p>
    );
};

// ── KARAOKE ─────────────────────────────────────────────
const KaraokeMode: React.FC<{
    text: string; elapsed: number; speed: number;
    style: React.CSSProperties; frame: number; startFrame: number;
}> = ({ text, speed, style, frame, startFrame }) => {
    const words = text.split(' ');
    const wordDuration = Math.round(8 / speed);
    const activeIdx = Math.floor((frame - startFrame) / wordDuration);

    return (
        <p style={{ ...style, display: 'flex', flexWrap: 'wrap', gap: '0 7px' }}>
            {words.map((word, i) => {
                const isActive = i === activeIdx;
                const isPast = i < activeIdx;

                return (
                    <span key={i} style={{
                        display: 'inline-block',
                        color: isActive ? '#FFD700' : isPast ? (style.color || '#e2e8f0') : 'rgba(255,255,255,0.3)',
                        textShadow: isActive ? '0 0 12px rgba(255, 215, 0, 0.5)' : 'none',
                        transform: isActive ? 'scale(1.08)' : 'scale(1)',
                        transition: 'color 0.15s, transform 0.15s',
                        transformOrigin: 'center bottom',
                    }}>
                        {word}
                    </span>
                );
            })}
        </p>
    );
};

// ── SLIDE UP ────────────────────────────────────────────
const SlideUpMode: React.FC<{
    text: string; elapsed: number; speed: number;
    style: React.CSSProperties; fps: number; startFrame: number; frame: number;
}> = ({ text, speed, style, fps, startFrame, frame }) => {
    const words = text.split(' ');
    const delay = Math.round(5 / speed);

    return (
        <p style={{ ...style, display: 'flex', flexWrap: 'wrap', gap: '0 7px', overflow: 'hidden' }}>
            {words.map((word, i) => {
                const wordFrame = frame - startFrame - i * delay;
                const progress = spring({
                    frame: wordFrame,
                    fps,
                    config: { damping: 15, stiffness: 100 },
                });
                const y = interpolate(progress, [0, 1], [40, 0]);

                return (
                    <span key={i} style={{
                        display: 'inline-block',
                        transform: `translateY(${y}px)`,
                        opacity: progress,
                    }}>
                        {word}
                    </span>
                );
            })}
        </p>
    );
};

// ── SLIDE LEFT ──────────────────────────────────────────
const SlideLeftMode: React.FC<{
    text: string; elapsed: number; speed: number;
    style: React.CSSProperties; fps: number; startFrame: number; frame: number;
}> = ({ text, speed, style, fps, startFrame, frame }) => {
    const words = text.split(' ');
    const delay = Math.round(4 / speed);

    return (
        <p style={{ ...style, display: 'flex', flexWrap: 'wrap', gap: '0 7px' }}>
            {words.map((word, i) => {
                const wordFrame = frame - startFrame - i * delay;
                const progress = spring({
                    frame: wordFrame,
                    fps,
                    config: { damping: 12, stiffness: 80 },
                });
                const x = interpolate(progress, [0, 1], [-60, 0]);

                return (
                    <span key={i} style={{
                        display: 'inline-block',
                        transform: `translateX(${x}px)`,
                        opacity: progress,
                    }}>
                        {word}
                    </span>
                );
            })}
        </p>
    );
};

// ── SCALE POP ───────────────────────────────────────────
const ScalePopMode: React.FC<{
    text: string; elapsed: number; speed: number;
    style: React.CSSProperties; fps: number; startFrame: number; frame: number;
}> = ({ text, speed, style, fps, startFrame, frame }) => {
    const words = text.split(' ');
    const delay = Math.round(5 / speed);

    return (
        <p style={{ ...style, display: 'flex', flexWrap: 'wrap', gap: '0 7px' }}>
            {words.map((word, i) => {
                const wordFrame = frame - startFrame - i * delay;
                const scale = spring({
                    frame: wordFrame,
                    fps,
                    config: { damping: 6, stiffness: 200, mass: 0.4 },
                });
                const opacity = interpolate(wordFrame, [-1, 2], [0, 1], {
                    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                });

                return (
                    <span key={i} style={{
                        display: 'inline-block',
                        transform: `scale(${scale})`,
                        opacity,
                        transformOrigin: 'center center',
                    }}>
                        {word}
                    </span>
                );
            })}
        </p>
    );
};

// ── LETTER CASCADE ──────────────────────────────────────
const LetterCascadeMode: React.FC<{
    text: string; elapsed: number; speed: number;
    style: React.CSSProperties; fps: number; startFrame: number; frame: number;
}> = ({ text, speed, style, fps, startFrame, frame }) => {
    const letters = text.split('');
    const delay = Math.round(2 / speed);

    return (
        <p style={{ ...style, display: 'flex', flexWrap: 'wrap' }}>
            {letters.map((letter, i) => {
                const letterFrame = frame - startFrame - i * delay;
                const progress = spring({
                    frame: letterFrame,
                    fps,
                    config: { damping: 10, stiffness: 120, mass: 0.3 },
                });
                const y = interpolate(progress, [0, 1], [-20, 0]);

                return (
                    <span key={i} style={{
                        display: letter === ' ' ? 'inline' : 'inline-block',
                        transform: letter === ' ' ? 'none' : `translateY(${y}px)`,
                        opacity: letter === ' ' ? 1 : progress,
                        whiteSpace: letter === ' ' ? 'pre' : 'normal',
                        width: letter === ' ' ? '0.3em' : 'auto',
                    }}>
                        {letter}
                    </span>
                );
            })}
        </p>
    );
};
