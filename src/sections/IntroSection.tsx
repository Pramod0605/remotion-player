/**
 * IntroSection — Avatar bottom-right corner. Title with animated entrance.
 * Uses DevConfig for avatar positioning and text animation mode.
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

interface IntroSectionProps {
    section: Section;
    avatarGlobal: AvatarGlobal;
    avatarSrc: string;
    jobBasePath: string;
    segmentFrames: SegmentFrameRange[];
}

export const IntroSection: React.FC<IntroSectionProps> = ({
    section,
    avatarSrc,
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames, fps } = useVideoConfig();
    const { settings } = useDevConfig();

    // Spring animation for title entrance
    const titleSpring = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 80, mass: 0.8 },
    });

    // Accent line reveal
    const lineWidth = spring({
        frame: frame - 10,
        fps,
        config: { damping: 20, stiffness: 60 },
    });

    // Subtitle fade-in (delayed)
    const subtitleProgress = spring({
        frame: frame - 20,
        fps,
        config: { damping: 12, stiffness: 50 },
    });

    // Fade out over last second
    const fadeOut = interpolate(
        frame,
        [durationInFrames - fps, durationInFrames],
        [1, 0],
        { extrapolateLeft: 'clamp' },
    );

    // Floating particles
    const particles = Array.from({ length: 6 }, (_, i) => ({
        x: 10 + (i * 15) % 45,
        y: 20 + (i * 23) % 60,
        delay: i * 8,
        size: 2 + (i % 3),
    }));

    return (
        <AbsoluteFill style={{ backgroundColor: '#0a0a1a', overflow: 'hidden' }}>
            {/* Animated gradient background */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `
          radial-gradient(ellipse at 20% 50%, rgba(108, 99, 255, 0.12) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 80%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a1a 0%, #12121f 50%, #0a0a1a 100%)
        `,
            }} />

            {/* Floating particles */}
            {particles.map((p, i) => {
                const particleOpacity = interpolate(
                    frame - p.delay,
                    [0, 20, 40, 60],
                    [0, 0.6, 0.3, 0],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'extend' },
                );
                const particleY = interpolate(frame - p.delay, [0, 80], [p.y + 10, p.y - 20], {
                    extrapolateRight: 'extend',
                });
                return (
                    <div key={i} style={{
                        position: 'absolute',
                        left: `${p.x}%`, top: `${particleY}%`,
                        width: p.size, height: p.size,
                        borderRadius: '50%',
                        backgroundColor: '#6c63ff',
                        opacity: Math.abs(particleOpacity % 0.6) * fadeOut,
                        filter: 'blur(1px)',
                        boxShadow: '0 0 6px 2px rgba(108, 99, 255, 0.4)',
                    }} />
                );
            })}

            {/* Title block — left side, animated entrance */}
            <div style={{
                position: 'absolute', left: 60, top: '32%',
                width: `${Math.max(20, 95 - settings.avatarWidthPercent)}%`,
                zIndex: 2, opacity: fadeOut,
            }}>
                {/* Animated title text */}
                <div style={{
                    transform: `translateY(${(1 - titleSpring) * 60}px)`,
                    opacity: titleSpring,
                }}>
                    <AnimatedText
                        text={section.title}
                        startFrame={0}
                        mode={settings.textAnimation}
                        speed={settings.animationSpeed}
                        fontSize={Math.round(settings.fontSize * 2.2)}
                        fontWeight={700}
                        lineHeight={1.15}
                        color="#fff"
                        style={{
                            textShadow: '0 4px 30px rgba(108, 99, 255, 0.3)',
                            letterSpacing: '-0.02em',
                        }}
                    />
                </div>

                {/* Animated accent line */}
                <div style={{
                    width: `${lineWidth * 80}px`,
                    height: 3,
                    background: 'linear-gradient(90deg, #6c63ff, #a78bfa)',
                    marginTop: 20,
                    borderRadius: 2,
                    boxShadow: '0 0 12px rgba(108, 99, 255, 0.5)',
                }} />

                {/* Subtitle */}
                <p style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: 16,
                    fontFamily: "'Inter', sans-serif",
                    marginTop: 16,
                    opacity: subtitleProgress,
                    transform: `translateY(${(1 - subtitleProgress) * 20}px)`,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                }}>
                    Section {section.section_id} · Introduction
                </p>
            </div>

            {/* Avatar — positioned by DevConfig */}
            <div style={{
                position: 'absolute',
                right: settings.avatarRight,
                bottom: settings.avatarBottom,
                width: `${settings.avatarWidthPercent}%`,
                height: `${settings.avatarHeightPercent}%`,
                zIndex: 3,
                opacity: fadeOut,
            }}>
                <ChromaKeyVideo src={avatarSrc} />
            </div>
        </AbsoluteFill>
    );
};
