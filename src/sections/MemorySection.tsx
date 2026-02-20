/**
 * MemorySection — 3D flip flashcards with DevConfig text and avatar.
 */
import React from 'react';
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    spring,
} from 'remotion';
import { ChromaKeyVideo } from '../components/ChromaKeyVideo';
import { AnimatedText } from '../components/AnimatedText';
import { useDevConfig } from '../components/DevConfig';
import type { Section, AvatarGlobal, SegmentFrameRange } from '../types';

interface MemorySectionProps {
    section: Section;
    avatarGlobal: AvatarGlobal;
    avatarSrc: string;
    jobBasePath: string;
    segmentFrames: SegmentFrameRange[];
}

export const MemorySection: React.FC<MemorySectionProps> = ({
    section,
    avatarSrc,
    segmentFrames,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { settings } = useDevConfig();
    const cards = section.flashcards || [];

    if (cards.length === 0) {
        return (
            <AbsoluteFill style={{
                backgroundColor: '#0d1117',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <p style={{ color: '#8b949e', fontSize: 24 }}>No flashcards available</p>
            </AbsoluteFill>
        );
    }

    // Map cards to segment frame ranges
    const cardFrameRanges = cards.map((_, idx) => segmentFrames[idx + 1] || null);
    const activeCardIdx = cardFrameRanges.findIndex(
        range => range && frame >= range.startFrame && frame < range.endFrame,
    );

    const titleSpring = spring({ frame, fps, config: { damping: 15, stiffness: 80 } });
    const contentWidth = `${Math.max(20, 95 - settings.avatarWidthPercent)}%`;

    return (
        <AbsoluteFill style={{ backgroundColor: '#0d1117', overflow: 'hidden' }}>
            {/* Background */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `
          radial-gradient(ellipse at 25% 50%, rgba(108, 99, 255, 0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 75% 80%, rgba(159, 122, 234, 0.05) 0%, transparent 40%),
          linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)
        `,
            }} />

            {/* Cards area */}
            <div style={{
                position: 'absolute', left: 0, top: 0,
                width: contentWidth,
                height: '100%', padding: '40px 20px 40px 50px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', zIndex: 2,
            }}>
                {/* Title */}
                <div style={{
                    opacity: titleSpring,
                    transform: `translateY(${(1 - titleSpring) * -20}px)`,
                    marginBottom: 8, alignSelf: 'flex-start',
                }}>
                    <span style={{
                        color: '#9f7aea', fontSize: 11, fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: 2,
                    }}>
                        Memory Reinforcement
                    </span>
                </div>

                <div style={{
                    opacity: titleSpring, marginBottom: 20, alignSelf: 'flex-start',
                    transform: `translateY(${(1 - titleSpring) * -20}px)`,
                }}>
                    <AnimatedText
                        text={section.title}
                        startFrame={0}
                        mode={settings.textAnimation}
                        speed={settings.animationSpeed}
                        fontSize={Math.round(settings.fontSize * 1.5)}
                        fontWeight={700}
                        lineHeight={1.2}
                        color="#e6edf3"
                    />
                </div>

                {/* Progress dots */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    {cards.map((_, idx) => (
                        <div key={idx} style={{
                            width: idx === activeCardIdx ? 28 : 10, height: 10, borderRadius: 5,
                            backgroundColor: idx < activeCardIdx ? '#9f7aea' : idx === activeCardIdx ? '#6c63ff' : '#30363d',
                            boxShadow: idx === activeCardIdx ? '0 0 10px rgba(108, 99, 255, 0.5)' : 'none',
                        }} />
                    ))}
                </div>

                {/* Flashcard */}
                {cards.map((card, idx) => {
                    const range = cardFrameRanges[idx];
                    if (!range || idx !== activeCardIdx) return null;

                    const cardSpring = spring({
                        frame: frame - range.startFrame,
                        fps,
                        config: { damping: 12, stiffness: 60 },
                    });
                    const midFrame = range.startFrame + Math.floor(range.durationFrames * 0.45);
                    const flipProgress = interpolate(
                        frame,
                        [midFrame - 10, midFrame + 10],
                        [0, 180],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
                    );

                    return (
                        <div key={idx} style={{
                            width: '100%', maxWidth: 400, perspective: '1000px',
                            opacity: cardSpring,
                            transform: `scale(${0.85 + cardSpring * 0.15}) translateY(${(1 - cardSpring) * 30}px)`,
                        }}>
                            <div style={{
                                position: 'relative', width: '100%', minHeight: 200,
                                transformStyle: 'preserve-3d',
                                transform: `rotateY(${flipProgress}deg)`,
                            }}>
                                {/* Front — Question */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    backfaceVisibility: 'hidden',
                                    background: 'linear-gradient(145deg, #1e1e3f, #1a1a3e, #2d1b4e)',
                                    borderRadius: 16, padding: '30px',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    border: '1px solid rgba(108, 99, 255, 0.25)',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                                    minHeight: 200,
                                }}>
                                    <span style={{
                                        color: '#9f7aea', fontSize: 11, fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: 3, marginBottom: 14,
                                    }}>
                                        ❓ Question {idx + 1} of {cards.length}
                                    </span>
                                    <AnimatedText
                                        text={card.front}
                                        startFrame={range.startFrame}
                                        mode={settings.textAnimation}
                                        speed={settings.animationSpeed}
                                        fontSize={settings.fontSize}
                                        fontWeight={500}
                                        lineHeight={1.6}
                                        color="#f0f0ff"
                                        style={{ textAlign: 'center' }}
                                    />
                                </div>

                                {/* Back — Answer */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)',
                                    background: 'linear-gradient(145deg, #0d2818, #1a3a1a, #0f3020)',
                                    borderRadius: 16, padding: '30px',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    border: '1px solid rgba(72, 187, 120, 0.25)',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                                    minHeight: 200,
                                }}>
                                    <span style={{
                                        color: '#48bb78', fontSize: 11, fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: 3, marginBottom: 14,
                                    }}>
                                        ✅ Answer
                                    </span>
                                    <AnimatedText
                                        text={card.back}
                                        startFrame={midFrame}
                                        mode={settings.textAnimation}
                                        speed={settings.animationSpeed}
                                        fontSize={Math.round(settings.fontSize * 0.9)}
                                        fontWeight={400}
                                        lineHeight={1.6}
                                        color="#e2e8f0"
                                        style={{ textAlign: 'center' }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Avatar — DevConfig positioning */}
            <div style={{
                position: 'absolute',
                right: settings.avatarRight,
                bottom: settings.avatarBottom,
                width: `${settings.avatarWidthPercent}%`,
                height: `${settings.avatarHeightPercent}%`,
                zIndex: 3,
            }}>
                <ChromaKeyVideo src={avatarSrc} />
            </div>
        </AbsoluteFill>
    );
};
